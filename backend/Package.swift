// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "corvid-backend",
    platforms: [
        .macOS(.v13)
    ],
    dependencies: [
        // Vapor web framework
        .package(url: "https://github.com/vapor/vapor.git", from: "4.89.0"),
        // Fluent ORM
        .package(url: "https://github.com/vapor/fluent.git", from: "4.9.0"),
        // SQLite driver for development
        .package(url: "https://github.com/vapor/fluent-sqlite-driver.git", from: "4.6.0"),
        // Postgres driver for production
        .package(url: "https://github.com/vapor/fluent-postgres-driver.git", from: "2.8.0"),
        // JWT for authentication
        .package(url: "https://github.com/vapor/jwt.git", from: "4.2.0"),
        // Algorand Swift SDK
        .package(url: "https://github.com/CorvidLabs/swift-algorand.git", branch: "main"),
    ],
    targets: [
        .executableTarget(
            name: "Run",
            dependencies: [
                .target(name: "App"),
            ]
        ),
        .target(
            name: "App",
            dependencies: [
                .product(name: "Vapor", package: "vapor"),
                .product(name: "Fluent", package: "fluent"),
                .product(name: "FluentSQLiteDriver", package: "fluent-sqlite-driver"),
                .product(name: "FluentPostgresDriver", package: "fluent-postgres-driver"),
                .product(name: "JWT", package: "jwt"),
                .product(name: "Algorand", package: "swift-algorand"),
            ]
        ),
        .testTarget(
            name: "AppTests",
            dependencies: [
                .target(name: "App"),
                .product(name: "XCTVapor", package: "vapor"),
            ]
        )
    ]
)
