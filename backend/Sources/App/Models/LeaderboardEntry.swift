import Fluent
import Vapor

final class LeaderboardEntry: Model, Content {
    static let schema = "leaderboard_entries"

    @ID(key: .id)
    var id: UUID?

    @Field(key: "wallet_address")
    var walletAddress: String

    @Field(key: "game")
    var game: String

    @Field(key: "score")
    var score: Int

    @Field(key: "player_name")
    var playerName: String?

    @Timestamp(key: "created_at", on: .create)
    var createdAt: Date?

    init() {}

    init(
        id: UUID? = nil,
        walletAddress: String,
        game: String,
        score: Int,
        playerName: String? = nil
    ) {
        self.id = id
        self.walletAddress = walletAddress
        self.game = game
        self.score = score
        self.playerName = playerName
    }
}

// MARK: - DTOs

struct LeaderboardEntryDTO: Content {
    var id: UUID?
    var walletAddress: String
    var game: String
    var score: Int
    var playerName: String?
    var createdAt: Date?
    var rank: Int?

    init(from entry: LeaderboardEntry, rank: Int? = nil) {
        self.id = entry.id
        self.walletAddress = entry.walletAddress
        self.game = entry.game
        self.score = entry.score
        self.playerName = entry.playerName
        self.createdAt = entry.createdAt
        self.rank = rank
    }
}

struct SubmitScoreRequest: Content {
    var game: String
    var score: Int
    var playerName: String?
}

struct LeaderboardResponse: Content {
    var entries: [LeaderboardEntryDTO]
    var userRank: Int?
    var userBestScore: Int?
}
