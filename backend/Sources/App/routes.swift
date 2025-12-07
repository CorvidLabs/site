import Vapor

func routes(_ app: Application) throws {
    // Health check
    app.get { req in
        return ["status": "ok", "service": "corvid-backend"]
    }

    // API versioning
    let api = app.grouped("api", "v1")

    // Register controllers
    try api.register(collection: AuthController())
    try api.register(collection: LeaderboardController())
    try api.register(collection: NFTController())
}
