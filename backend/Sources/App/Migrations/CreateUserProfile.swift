import Fluent

struct CreateUserProfile: AsyncMigration {
    func prepare(on database: Database) async throws {
        try await database.schema("user_profiles")
            .id()
            .field("wallet_address", .string, .required)
            .field("display_name", .string)
            .field("avatar_nft_id", .string)
            .field("total_games_played", .int, .required, .custom("DEFAULT 0"))
            .field("created_at", .datetime)
            .field("updated_at", .datetime)
            .unique(on: "wallet_address")
            .create()
    }

    func revert(on database: Database) async throws {
        try await database.schema("user_profiles").delete()
    }
}
