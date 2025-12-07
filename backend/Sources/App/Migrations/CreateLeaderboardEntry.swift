import Fluent

struct CreateLeaderboardEntry: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema("leaderboard_entries")
            .id()
            .field("wallet_address", .string, .required)
            .field("game", .string, .required)
            .field("score", .int, .required)
            .field("player_name", .string)
            .field("created_at", .datetime)
            .create()

        // Create indexes for common queries
        try await database.schema("leaderboard_entries")
            .index(on: "game")
            .index(on: "wallet_address")
            .index(on: "score")
            .update()
    }

    func revert(on database: Database) async throws {
        try await database.schema("leaderboard_entries").delete()
    }
}
