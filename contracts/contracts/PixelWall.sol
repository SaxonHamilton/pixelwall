// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title PixelWall – collaborative encrypted pixel art wall
/// @notice Demonstrates how to build a rich FHE-enabled dApp with both local mock and relayer-based flows.
/// @dev The contract stores encrypted pixel colors using FHEVM primitives and exposes aggregated encrypted statistics.
contract PixelWall is ZamaEthereumConfig, ERC721URIStorage {

    struct PixelSlot {
        euint32 encryptedColor;
        address painter;
        uint64 updatedAt;
    }

    struct CanvasMeta {
        uint16 width;
        uint16 height;
        bool isLocked;
        uint64 createdAt;
        uint64 lockedAt;
        euint32 encryptedStrokeCount;
        string lastMetadataCID;
    }

    struct PixelView {
        bytes32 encryptedColor;
        address painter;
        uint64 updatedAt;
    }

    /// @dev Cooldown in seconds between two strokes made by the same address.
    uint256 public constant STROKE_COOLDOWN = 60;
    /// @dev Hard limit on canvas dimensions to prevent excessive gas usage.
    uint16 public constant MAX_DIMENSION = 256;

    uint256 private _nextCanvasId = 1;
    uint256 private _nextTokenId = 1;

    mapping(uint256 => CanvasMeta) private _canvases;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => PixelSlot))) private _pixels;
    mapping(address => uint256) public lastStrokeAt;
    mapping(address => euint32) private _encryptedContributionCount;
    mapping(uint256 => uint256) private _canvasToTokenId;

    event CanvasCreated(uint256 indexed canvasId, uint16 width, uint16 height, address indexed creator);
    event CanvasLocked(uint256 indexed canvasId, address indexed locker);
    event PixelUpdated(
        uint256 indexed canvasId,
        uint256 x,
        uint256 y,
        address indexed painter,
        bytes32 encryptedColorHandle
    );
    event CanvasMinted(uint256 indexed canvasId, uint256 tokenId, address indexed minter, string metadataCID);

    error CanvasNotFound(uint256 canvasId);
    error CanvasLockedAlready(uint256 canvasId);
    error CanvasNotLocked(uint256 canvasId);
    error PixelOutOfBounds(uint256 canvasId, uint256 x, uint256 y);
    error StrokeCooldownActive(address painter, uint256 secondsRemaining);
    error CanvasAlreadyMinted(uint256 canvasId);

    constructor() ERC721("PixelWallCanvas", "PXC") {}

    /// @notice Creates a new collaborative encrypted canvas.
    /// @param width Canvas width (defaults to 128 if value equals zero).
    /// @param height Canvas height (defaults to 128 if value equals zero).
    /// @dev Initializes encrypted counters with FHE zero handles for deterministic access.
    function createCanvas(uint16 width, uint16 height) external returns (uint256 canvasId) {
        if (width == 0) {
            width = 128;
        }
        if (height == 0) {
            height = 128;
        }
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            revert PixelOutOfBounds(0, width, height);
        }

        canvasId = _nextCanvasId++;
        CanvasMeta storage canvas = _canvases[canvasId];
        canvas.width = width;
        canvas.height = height;
        canvas.createdAt = uint64(block.timestamp);
        canvas.encryptedStrokeCount = FHE.asEuint32(0);

        FHE.allowThis(canvas.encryptedStrokeCount);

        emit CanvasCreated(canvasId, width, height, msg.sender);
    }

    /// @notice Sets the encrypted color of a pixel within a canvas.
    /// @param canvasId Target canvas identifier.
    /// @param x Column index (0-based).
    /// @param y Row index (0-based).
    /// @param encryptedColorExt Encrypted color payload (external handle).
    /// @param inputProof Proof required to convert external handle to internal handle.
    function setPixel(
        uint256 canvasId,
        uint256 x,
        uint256 y,
        externalEuint32 encryptedColorExt,
        bytes calldata inputProof
    ) external {
        CanvasMeta storage canvas = _canvases[canvasId];
        if (canvas.width == 0) {
            revert CanvasNotFound(canvasId);
        }
        if (canvas.isLocked) {
            revert CanvasLockedAlready(canvasId);
        }
        if (x >= canvas.width || y >= canvas.height) {
            revert PixelOutOfBounds(canvasId, x, y);
        }

        uint256 lastStroke = lastStrokeAt[msg.sender];
        if (lastStroke != 0 && block.timestamp < lastStroke + STROKE_COOLDOWN) {
            revert StrokeCooldownActive(msg.sender, lastStroke + STROKE_COOLDOWN - block.timestamp);
        }
        lastStrokeAt[msg.sender] = block.timestamp;

        euint32 encryptedColor = FHE.fromExternal(encryptedColorExt, inputProof);

        PixelSlot storage slot = _pixels[canvasId][x][y];
        slot.encryptedColor = encryptedColor;
        slot.painter = msg.sender;
        slot.updatedAt = uint64(block.timestamp);

        FHE.allow(slot.encryptedColor, msg.sender);
        FHE.allowThis(slot.encryptedColor);

        // Increment encrypted stroke counters.
        canvas.encryptedStrokeCount = FHE.add(canvas.encryptedStrokeCount, FHE.asEuint32(1));
        FHE.allow(canvas.encryptedStrokeCount, msg.sender);
        FHE.allowThis(canvas.encryptedStrokeCount);

        if (!FHE.isInitialized(_encryptedContributionCount[msg.sender])) {
            _encryptedContributionCount[msg.sender] = FHE.asEuint32(0);
            FHE.allowThis(_encryptedContributionCount[msg.sender]);
        }
        _encryptedContributionCount[msg.sender] =
            FHE.add(_encryptedContributionCount[msg.sender], FHE.asEuint32(1));
        FHE.allow(_encryptedContributionCount[msg.sender], msg.sender);
        FHE.allowThis(_encryptedContributionCount[msg.sender]);

        emit PixelUpdated(canvasId, x, y, msg.sender, euint32.unwrap(encryptedColor));
    }

    /// @notice Locks a canvas to freeze further modifications.
    /// @param canvasId Target canvas identifier.
    function lockCanvas(uint256 canvasId) external {
        CanvasMeta storage canvas = _canvases[canvasId];
        if (canvas.width == 0) {
            revert CanvasNotFound(canvasId);
        }
        if (canvas.isLocked) {
            revert CanvasLockedAlready(canvasId);
        }

        canvas.isLocked = true;
        canvas.lockedAt = uint64(block.timestamp);

        emit CanvasLocked(canvasId, msg.sender);
    }

    /// @notice Mints an NFT snapshot for a locked canvas.
    /// @param canvasId Target canvas identifier.
    /// @param metadataCID IPFS CID pointing to the rendered canvas and metadata payload.
    function mintCanvasNFT(uint256 canvasId, string calldata metadataCID) external returns (uint256 tokenId) {
        CanvasMeta storage canvas = _canvases[canvasId];
        if (canvas.width == 0) {
            revert CanvasNotFound(canvasId);
        }
        if (!canvas.isLocked) {
            revert CanvasNotLocked(canvasId);
        }
        if (_canvasToTokenId[canvasId] != 0) {
            revert CanvasAlreadyMinted(canvasId);
        }

        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        string memory tokenUri = string.concat("ipfs://", metadataCID);
        _setTokenURI(tokenId, tokenUri);

        canvas.lastMetadataCID = metadataCID;
        _canvasToTokenId[canvasId] = tokenId;

        emit CanvasMinted(canvasId, tokenId, msg.sender, metadataCID);
    }

    /// @notice Returns summary metadata for a canvas.
    function getCanvasMeta(uint256 canvasId)
        external
        view
        returns (CanvasMeta memory meta, uint256 tokenId)
    {
        meta = _canvases[canvasId];
        if (meta.width == 0) {
            revert CanvasNotFound(canvasId);
        }
        tokenId = _canvasToTokenId[canvasId];
    }

    /// @notice Fetches the encrypted color handle and painter metadata for a pixel.
    function getPixelView(uint256 canvasId, uint256 x, uint256 y) external view returns (PixelView memory) {
        CanvasMeta storage canvas = _canvases[canvasId];
        if (canvas.width == 0) {
            revert CanvasNotFound(canvasId);
        }
        if (x >= canvas.width || y >= canvas.height) {
            revert PixelOutOfBounds(canvasId, x, y);
        }

        PixelSlot storage slot = _pixels[canvasId][x][y];
        return PixelView({encryptedColor: euint32.unwrap(slot.encryptedColor), painter: slot.painter, updatedAt: slot.updatedAt});
    }

    /// @notice Returns the encrypted color handle stored for a pixel.
    function getPixelColor(uint256 canvasId, uint256 x, uint256 y) external view returns (euint32) {
        CanvasMeta storage canvas = _canvases[canvasId];
        if (canvas.width == 0) {
            revert CanvasNotFound(canvasId);
        }
        if (x >= canvas.width || y >= canvas.height) {
            revert PixelOutOfBounds(canvasId, x, y);
        }

        return _pixels[canvasId][x][y].encryptedColor;
    }

    /// @notice Returns the encrypted total number of strokes applied to a canvas.
    function getCanvasStrokeCount(uint256 canvasId) external view returns (euint32) {
        CanvasMeta storage canvas = _canvases[canvasId];
        if (canvas.width == 0) {
            revert CanvasNotFound(canvasId);
        }
        return canvas.encryptedStrokeCount;
    }

    /// @notice Returns the encrypted contribution counter for a painter address.
    function getPainterContribution(address painter) external view returns (euint32) {
        return _encryptedContributionCount[painter];
    }

    /// @notice Utility helper returning the token id minted for a canvas (if any).
    function getCanvasTokenId(uint256 canvasId) external view returns (uint256) {
        return _canvasToTokenId[canvasId];
    }

}

