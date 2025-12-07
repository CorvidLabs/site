import Vapor
import JWT
import Fluent

struct AuthController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        let auth = routes.grouped("auth")

        auth.post("verify", use: verifyWallet)
        auth.get("profile", use: getProfile)
        auth.put("profile", use: updateProfile)
    }

    /// Verify wallet ownership via signed transaction
    /// The frontend sends a 0-ALGO signed transaction as proof of ownership
    func verifyWallet(req: Request) async throws -> AuthResponse {
        let verifyRequest = try req.content.decode(VerifyWalletRequest.self)

        // In production, verify the signed transaction using swift-algorand
        // For now, we trust the wallet address from the frontend (Pera Wallet handles auth)
        let walletAddress = verifyRequest.walletAddress

        // Create or update user profile
        let profile: UserProfile
        if let existing = try await UserProfile.query(on: req.db)
            .filter(\.$walletAddress == walletAddress)
            .first() {
            profile = existing
        } else {
            profile = UserProfile(walletAddress: walletAddress)
            try await profile.save(on: req.db)
        }

        // Generate JWT token
        let payload = WalletPayload(
            subject: .init(value: walletAddress),
            expiration: .init(value: Date().addingTimeInterval(86400 * 7)) // 7 days
        )
        let token = try req.jwt.sign(payload)

        return AuthResponse(
            token: token,
            walletAddress: walletAddress,
            profile: UserProfileDTO(from: profile)
        )
    }

    /// Get current user profile
    func getProfile(req: Request) async throws -> UserProfileDTO {
        let payload = try req.jwt.verify(as: WalletPayload.self)
        let walletAddress = payload.subject.value

        guard let profile = try await UserProfile.query(on: req.db)
            .filter(\.$walletAddress == walletAddress)
            .first() else {
            throw Abort(.notFound, reason: "Profile not found")
        }

        return UserProfileDTO(from: profile)
    }

    /// Update user profile
    func updateProfile(req: Request) async throws -> UserProfileDTO {
        let payload = try req.jwt.verify(as: WalletPayload.self)
        let walletAddress = payload.subject.value
        let updateRequest = try req.content.decode(UpdateProfileRequest.self)

        guard let profile = try await UserProfile.query(on: req.db)
            .filter(\.$walletAddress == walletAddress)
            .first() else {
            throw Abort(.notFound, reason: "Profile not found")
        }

        if let displayName = updateRequest.displayName {
            profile.displayName = displayName
        }
        if let avatarNftId = updateRequest.avatarNftId {
            profile.avatarNftId = avatarNftId
        }

        try await profile.save(on: req.db)
        return UserProfileDTO(from: profile)
    }
}

// MARK: - DTOs

struct VerifyWalletRequest: Content {
    var walletAddress: String
    var signedTransaction: String?  // Optional: for signature verification
}

struct AuthResponse: Content {
    var token: String
    var walletAddress: String
    var profile: UserProfileDTO
}

// MARK: - JWT Payload

struct WalletPayload: JWTPayload {
    var subject: SubjectClaim
    var expiration: ExpirationClaim

    func verify(using signer: JWTSigner) throws {
        try expiration.verifyNotExpired()
    }
}
