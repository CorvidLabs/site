import Fluent
import Vapor

final class UserProfile: Model, Content {
    static let schema = "user_profiles"

    @ID(key: .id)
    var id: UUID?

    @Field(key: "wallet_address")
    var walletAddress: String

    @Field(key: "display_name")
    var displayName: String?

    @Field(key: "avatar_nft_id")
    var avatarNftId: String?

    @Field(key: "total_games_played")
    var totalGamesPlayed: Int

    @Timestamp(key: "created_at", on: .create)
    var createdAt: Date?

    @Timestamp(key: "updated_at", on: .update)
    var updatedAt: Date?

    init() {}

    init(
        id: UUID? = nil,
        walletAddress: String,
        displayName: String? = nil,
        avatarNftId: String? = nil,
        totalGamesPlayed: Int = 0
    ) {
        self.id = id
        self.walletAddress = walletAddress
        self.displayName = displayName
        self.avatarNftId = avatarNftId
        self.totalGamesPlayed = totalGamesPlayed
    }
}

// MARK: - DTOs

struct UserProfileDTO: Content {
    var id: UUID?
    var walletAddress: String
    var displayName: String?
    var avatarNftId: String?
    var totalGamesPlayed: Int
    var createdAt: Date?

    init(from profile: UserProfile) {
        self.id = profile.id
        self.walletAddress = profile.walletAddress
        self.displayName = profile.displayName
        self.avatarNftId = profile.avatarNftId
        self.totalGamesPlayed = profile.totalGamesPlayed
        self.createdAt = profile.createdAt
    }
}

struct UpdateProfileRequest: Content {
    var displayName: String?
    var avatarNftId: String?
}
