import Vapor
import Fluent
import FluentSQLiteDriver
import FluentPostgresDriver
import JWT

public func configure(_ app: Application) throws {
    // CORS middleware for Angular frontend
    let corsConfiguration = CORSMiddleware.Configuration(
        allowedOrigin: .all,
        allowedMethods: [.GET, .POST, .PUT, .DELETE, .OPTIONS, .PATCH],
        allowedHeaders: [
            .accept, .authorization, .contentType, .origin,
            .xRequestedWith, .init("X-Wallet-Address")
        ]
    )
    app.middleware.use(CORSMiddleware(configuration: corsConfiguration))

    // Database configuration
    if app.environment == .production {
        // Use PostgreSQL in production
        if let databaseURL = Environment.get("DATABASE_URL") {
            try app.databases.use(.postgres(url: databaseURL), as: .psql)
        }
    } else {
        // Use SQLite for development
        app.databases.use(.sqlite(.file("db.sqlite")), as: .sqlite)
    }

    // JWT configuration for wallet authentication
    if let jwtSecret = Environment.get("JWT_SECRET") {
        app.jwt.signers.use(.hs256(key: jwtSecret))
    } else {
        // Development secret (CHANGE IN PRODUCTION)
        app.jwt.signers.use(.hs256(key: "corvid-dev-secret-change-in-production"))
    }

    // Run migrations
    app.migrations.add(CreateLeaderboardEntry())
    app.migrations.add(CreateUserProfile())
    try app.autoMigrate().wait()

    // Register routes
    try routes(app)
}
