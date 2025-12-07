import Vapor
import Algorand

struct NFTController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        let nft = routes.grouped("nft")

        nft.get("collection", ":creatorAddress", use: getCollection)
        nft.get("assets", ":walletAddress", use: getWalletAssets)
        nft.get("asset", ":assetId", use: getAssetDetails)
        nft.get("rarity", ":assetId", use: getRarityScore)
    }

    /// Get all NFTs from a collection (by creator address)
    func getCollection(req: Request) async throws -> NFTCollectionResponse {
        guard let creatorAddress = req.parameters.get("creatorAddress") else {
            throw Abort(.badRequest, reason: "Creator address required")
        }

        // Use Algorand Indexer to fetch assets
        let indexerURL = Environment.get("ALGORAND_INDEXER_URL") ?? "https://testnet-idx.algonode.cloud"
        let client = AlgorandClient(indexerURL: indexerURL)

        do {
            let assets = try await client.getAssetsByCreator(creatorAddress)
            return NFTCollectionResponse(
                creatorAddress: creatorAddress,
                assets: assets.map { NFTAssetDTO(from: $0) },
                totalCount: assets.count
            )
        } catch {
            throw Abort(.badGateway, reason: "Failed to fetch collection: \(error.localizedDescription)")
        }
    }

    /// Get NFTs held by a wallet
    func getWalletAssets(req: Request) async throws -> WalletAssetsResponse {
        guard let walletAddress = req.parameters.get("walletAddress") else {
            throw Abort(.badRequest, reason: "Wallet address required")
        }

        let indexerURL = Environment.get("ALGORAND_INDEXER_URL") ?? "https://testnet-idx.algonode.cloud"
        let client = AlgorandClient(indexerURL: indexerURL)

        // Optional filter by creator
        let creatorFilter = req.query[String.self, at: "creator"]

        do {
            var assets = try await client.getAssetsByAccount(walletAddress)

            // Filter by creator if specified
            if let creator = creatorFilter {
                assets = assets.filter { $0.creator == creator }
            }

            return WalletAssetsResponse(
                walletAddress: walletAddress,
                assets: assets.map { NFTAssetDTO(from: $0) },
                totalCount: assets.count
            )
        } catch {
            throw Abort(.badGateway, reason: "Failed to fetch wallet assets: \(error.localizedDescription)")
        }
    }

    /// Get details for a specific asset
    func getAssetDetails(req: Request) async throws -> NFTAssetDetailDTO {
        guard let assetIdString = req.parameters.get("assetId"),
              let assetId = UInt64(assetIdString) else {
            throw Abort(.badRequest, reason: "Valid asset ID required")
        }

        let indexerURL = Environment.get("ALGORAND_INDEXER_URL") ?? "https://testnet-idx.algonode.cloud"
        let client = AlgorandClient(indexerURL: indexerURL)

        do {
            let asset = try await client.getAsset(assetId)

            // Fetch metadata if IPFS URL exists
            var metadata: [String: String]? = nil
            if let metadataURL = asset.params.url, metadataURL.hasPrefix("ipfs://") {
                metadata = try? await fetchIPFSMetadata(metadataURL)
            }

            return NFTAssetDetailDTO(from: asset, metadata: metadata)
        } catch {
            throw Abort(.notFound, reason: "Asset not found")
        }
    }

    /// Calculate rarity score for an NFT
    func getRarityScore(req: Request) async throws -> RarityResponse {
        guard let assetIdString = req.parameters.get("assetId"),
              let assetId = UInt64(assetIdString) else {
            throw Abort(.badRequest, reason: "Valid asset ID required")
        }

        let indexerURL = Environment.get("ALGORAND_INDEXER_URL") ?? "https://testnet-idx.algonode.cloud"
        let client = AlgorandClient(indexerURL: indexerURL)

        do {
            let asset = try await client.getAsset(assetId)

            // Get all assets from the same creator for comparison
            guard let creator = asset.params.creator else {
                throw Abort(.badRequest, reason: "Asset has no creator")
            }

            let collectionAssets = try await client.getAssetsByCreator(creator)

            // Calculate rarity based on traits
            // This is a simplified implementation - in production you'd analyze actual trait data
            let rarityScore = calculateRarityScore(
                assetId: assetId,
                totalInCollection: collectionAssets.count
            )

            return RarityResponse(
                assetId: assetId,
                rarityScore: rarityScore,
                rarityRank: Int(rarityScore * Double(collectionAssets.count) / 100),
                totalInCollection: collectionAssets.count,
                rarityTier: getRarityTier(score: rarityScore)
            )
        } catch {
            throw Abort(.badGateway, reason: "Failed to calculate rarity: \(error.localizedDescription)")
        }
    }

    // MARK: - Helpers

    private func fetchIPFSMetadata(_ ipfsURL: String) async throws -> [String: String]? {
        // Convert IPFS URL to gateway URL
        let gatewayURL = ipfsURL.replacingOccurrences(of: "ipfs://", with: "https://ipfs.io/ipfs/")

        // Fetch metadata (simplified - would use proper HTTP client in production)
        return nil
    }

    private func calculateRarityScore(assetId: UInt64, totalInCollection: Int) -> Double {
        // Simplified rarity calculation
        // In production, this would analyze trait frequencies from metadata
        let baseScore = Double(assetId % 100)
        return min(99.9, max(0.1, baseScore))
    }

    private func getRarityTier(score: Double) -> String {
        switch score {
        case 90...100: return "Legendary"
        case 75..<90: return "Epic"
        case 50..<75: return "Rare"
        case 25..<50: return "Uncommon"
        default: return "Common"
        }
    }
}

// MARK: - Algorand Client Extension

class AlgorandClient {
    let indexerURL: String

    init(indexerURL: String) {
        self.indexerURL = indexerURL
    }

    func getAssetsByCreator(_ creator: String) async throws -> [AssetInfo] {
        // Use swift-algorand to query indexer
        // This is a placeholder - actual implementation would use the SDK
        return []
    }

    func getAssetsByAccount(_ account: String) async throws -> [AssetInfo] {
        // Use swift-algorand to query indexer
        return []
    }

    func getAsset(_ assetId: UInt64) async throws -> AssetDetailInfo {
        // Use swift-algorand to query indexer
        throw Abort(.notImplemented)
    }
}

// MARK: - DTOs

struct NFTCollectionResponse: Content {
    var creatorAddress: String
    var assets: [NFTAssetDTO]
    var totalCount: Int
}

struct WalletAssetsResponse: Content {
    var walletAddress: String
    var assets: [NFTAssetDTO]
    var totalCount: Int
}

struct NFTAssetDTO: Content {
    var assetId: UInt64
    var name: String?
    var unitName: String?
    var creator: String?
    var url: String?
    var total: UInt64

    init(from asset: AssetInfo) {
        self.assetId = asset.assetId
        self.name = asset.name
        self.unitName = asset.unitName
        self.creator = asset.creator
        self.url = asset.url
        self.total = asset.total
    }
}

struct NFTAssetDetailDTO: Content {
    var assetId: UInt64
    var name: String?
    var unitName: String?
    var creator: String?
    var url: String?
    var total: UInt64
    var metadata: [String: String]?

    init(from asset: AssetDetailInfo, metadata: [String: String]? = nil) {
        self.assetId = asset.index
        self.name = asset.params.name
        self.unitName = asset.params.unitName
        self.creator = asset.params.creator
        self.url = asset.params.url
        self.total = asset.params.total ?? 0
        self.metadata = metadata
    }
}

struct RarityResponse: Content {
    var assetId: UInt64
    var rarityScore: Double
    var rarityRank: Int
    var totalInCollection: Int
    var rarityTier: String
}

// MARK: - Asset Types (from swift-algorand)

struct AssetInfo {
    var assetId: UInt64
    var name: String?
    var unitName: String?
    var creator: String?
    var url: String?
    var total: UInt64
}

struct AssetDetailInfo {
    var index: UInt64
    var params: AssetParams
}

struct AssetParams {
    var name: String?
    var unitName: String?
    var creator: String?
    var url: String?
    var total: UInt64?
}
