import Vapor
import Fluent

struct LeaderboardController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        let leaderboard = routes.grouped("leaderboard")

        // Public routes
        leaderboard.get(use: getLeaderboard)
        leaderboard.get(":game", use: getGameLeaderboard)

        // Protected routes (require JWT)
        let protected = leaderboard.grouped(JWTAuthMiddleware())
        protected.post("submit", use: submitScore)
        protected.get("me", use: getMyScores)
    }

    /// Get global leaderboard (all games)
    func getLeaderboard(req: Request) async throws -> [GameLeaderboard] {
        let games = ["tetris", "snake", "memory_match", "pong", "minesweeper", "2048", "breakout", "flappy_raven"]

        var result: [GameLeaderboard] = []
        for game in games {
            let entries = try await LeaderboardEntry.query(on: req.db)
                .filter(\.$game == game)
                .sort(\.$score, .descending)
                .limit(10)
                .all()

            let dtos = entries.enumerated().map { index, entry in
                LeaderboardEntryDTO(from: entry, rank: index + 1)
            }

            result.append(GameLeaderboard(game: game, entries: dtos))
        }

        return result
    }

    /// Get leaderboard for a specific game
    func getGameLeaderboard(req: Request) async throws -> LeaderboardResponse {
        guard let game = req.parameters.get("game") else {
            throw Abort(.badRequest, reason: "Game parameter required")
        }

        let limit = req.query["limit"] ?? 50

        let entries = try await LeaderboardEntry.query(on: req.db)
            .filter(\.$game == game)
            .sort(\.$score, .descending)
            .limit(limit)
            .all()

        let dtos = entries.enumerated().map { index, entry in
            LeaderboardEntryDTO(from: entry, rank: index + 1)
        }

        // Get user's rank if authenticated
        var userRank: Int? = nil
        var userBestScore: Int? = nil

        if let walletAddress = req.headers.first(name: "X-Wallet-Address") {
            if let userEntry = try await LeaderboardEntry.query(on: req.db)
                .filter(\.$game == game)
                .filter(\.$walletAddress == walletAddress)
                .sort(\.$score, .descending)
                .first() {
                userBestScore = userEntry.score

                // Calculate rank
                let higherScores = try await LeaderboardEntry.query(on: req.db)
                    .filter(\.$game == game)
                    .filter(\.$score > userEntry.score)
                    .count()
                userRank = higherScores + 1
            }
        }

        return LeaderboardResponse(
            entries: dtos,
            userRank: userRank,
            userBestScore: userBestScore
        )
    }

    /// Submit a new score
    func submitScore(req: Request) async throws -> LeaderboardEntryDTO {
        let payload = try req.jwt.verify(as: WalletPayload.self)
        let walletAddress = payload.subject.value
        let submitRequest = try req.content.decode(SubmitScoreRequest.self)

        // Validate game name
        let validGames = ["tetris", "snake", "memory_match", "pong", "minesweeper", "2048", "breakout", "flappy_raven", "slot_machine"]
        guard validGames.contains(submitRequest.game) else {
            throw Abort(.badRequest, reason: "Invalid game name")
        }

        // Check if this beats the user's existing high score
        if let existingBest = try await LeaderboardEntry.query(on: req.db)
            .filter(\.$game == submitRequest.game)
            .filter(\.$walletAddress == walletAddress)
            .sort(\.$score, .descending)
            .first() {

            if submitRequest.score <= existingBest.score {
                // Return existing entry if new score doesn't beat it
                let rank = try await calculateRank(for: existingBest, on: req.db)
                return LeaderboardEntryDTO(from: existingBest, rank: rank)
            }
        }

        // Create new entry
        let entry = LeaderboardEntry(
            walletAddress: walletAddress,
            game: submitRequest.game,
            score: submitRequest.score,
            playerName: submitRequest.playerName
        )
        try await entry.save(on: req.db)

        // Update user's game count
        if let profile = try await UserProfile.query(on: req.db)
            .filter(\.$walletAddress == walletAddress)
            .first() {
            profile.totalGamesPlayed += 1
            try await profile.save(on: req.db)
        }

        let rank = try await calculateRank(for: entry, on: req.db)
        return LeaderboardEntryDTO(from: entry, rank: rank)
    }

    /// Get current user's scores across all games
    func getMyScores(req: Request) async throws -> [LeaderboardEntryDTO] {
        let payload = try req.jwt.verify(as: WalletPayload.self)
        let walletAddress = payload.subject.value

        let entries = try await LeaderboardEntry.query(on: req.db)
            .filter(\.$walletAddress == walletAddress)
            .sort(\.$game)
            .sort(\.$score, .descending)
            .all()

        return entries.map { LeaderboardEntryDTO(from: $0) }
    }

    // MARK: - Helpers

    private func calculateRank(for entry: LeaderboardEntry, on db: Database) async throws -> Int {
        let higherScores = try await LeaderboardEntry.query(on: db)
            .filter(\.$game == entry.game)
            .filter(\.$score > entry.score)
            .count()
        return higherScores + 1
    }
}

// MARK: - DTOs

struct GameLeaderboard: Content {
    var game: String
    var entries: [LeaderboardEntryDTO]
}

// MARK: - Middleware

struct JWTAuthMiddleware: AsyncMiddleware {
    func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response {
        // Verify JWT token
        _ = try request.jwt.verify(as: WalletPayload.self)
        return try await next.respond(to: request)
    }
}
