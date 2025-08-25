import { describe, it, expect, vi, beforeEach } from "vitest";
import { TwilioAuthProvider } from "@/services/auth/TwilioAuthProvider";

// Mock Twilio SDK
const mockVerifyService = {
  verifications: {
    create: vi.fn(),
  },
  verificationChecks: {
    create: vi.fn(),
  },
};

const mockVerify = {
  v2: {
    services: vi.fn(() => mockVerifyService),
  },
};

const mockTwilioClient = {
  verify: mockVerify,
};

vi.mock("twilio", () => ({
  default: vi.fn(() => mockTwilioClient),
}));

// Mock database client for user creation
const mockDatabaseClient = {
  saveUserService: vi.fn(),
  removeUserService: vi.fn(),
  getUserServices: vi.fn(),
  getServicesByCategory: vi.fn(),
  getAllCategories: vi.fn(),
  createUser: vi.fn(),
  getUserByPhone: vi.fn(),
};

describe("TwilioAuthProvider", () => {
  let authProvider: TwilioAuthProvider;

  const testPhone = "+1234567890";
  const testCode = "123456";
  const mockUser = {
    id: "user-1",
    phone: testPhone,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authProvider = new TwilioAuthProvider(
      "test-account-sid",
      "test-auth-token",
      "test-verify-service-sid",
      mockDatabaseClient as DatabaseClient
    );
  });

  describe("sendVerificationCode", () => {
    it("should send verification code successfully", async () => {
      mockVerifyService.verifications.create.mockResolvedValue({
        status: "pending",
        sid: "verification-sid",
      });

      await authProvider.sendVerificationCode(testPhone);

      expect(mockVerify.v2.services).toHaveBeenCalledWith(
        "test-verify-service-sid"
      );
      expect(mockVerifyService.verifications.create).toHaveBeenCalledWith({
        to: testPhone,
        channel: "sms",
      });
    });

    it("should handle Twilio API errors", async () => {
      mockVerifyService.verifications.create.mockRejectedValue(
        new Error("Invalid phone number")
      );

      await expect(
        authProvider.sendVerificationCode(testPhone)
      ).rejects.toThrow(
        "Failed to send verification code: Invalid phone number"
      );
    });

    it("should handle invalid verification status", async () => {
      mockVerifyService.verifications.create.mockResolvedValue({
        status: "failed",
        sid: "verification-sid",
      });

      await expect(
        authProvider.sendVerificationCode(testPhone)
      ).rejects.toThrow("Failed to initiate verification");
    });

    it("should validate phone number format", async () => {
      await expect(
        authProvider.sendVerificationCode("invalid-phone")
      ).rejects.toThrow("Invalid phone number format");

      expect(mockVerifyService.verifications.create).not.toHaveBeenCalled();
    });
  });

  describe("verifyCode", () => {
    it("should verify code and return existing user", async () => {
      mockVerifyService.verificationChecks.create.mockResolvedValue({
        status: "approved",
        valid: true,
      });

      mockDatabaseClient.getUserByPhone.mockResolvedValue(mockUser);

      const result = await authProvider.verifyCode(testPhone, testCode);

      expect(mockVerify.v2.services).toHaveBeenCalledWith(
        "test-verify-service-sid"
      );
      expect(mockVerifyService.verificationChecks.create).toHaveBeenCalledWith({
        to: testPhone,
        code: testCode,
      });
      expect(mockDatabaseClient.getUserByPhone).toHaveBeenCalledWith(testPhone);
      expect(result).toEqual(mockUser);
    });

    it("should verify code and create new user if not exists", async () => {
      mockVerifyService.verificationChecks.create.mockResolvedValue({
        status: "approved",
        valid: true,
      });

      mockDatabaseClient.getUserByPhone.mockResolvedValue(null); // User doesn't exist
      mockDatabaseClient.createUser.mockResolvedValue(mockUser);

      const result = await authProvider.verifyCode(testPhone, testCode);

      expect(mockDatabaseClient.getUserByPhone).toHaveBeenCalledWith(testPhone);
      expect(mockDatabaseClient.createUser).toHaveBeenCalledWith(testPhone);
      expect(result).toEqual(mockUser);
    });

    it("should handle invalid verification code", async () => {
      mockVerifyService.verificationChecks.create.mockResolvedValue({
        status: "expired",
        valid: false,
      });

      await expect(
        authProvider.verifyCode(testPhone, testCode)
      ).rejects.toThrow("Invalid verification code");

      expect(mockDatabaseClient.getUserByPhone).not.toHaveBeenCalled();
    });

    it("should handle Twilio API errors during verification", async () => {
      mockVerifyService.verificationChecks.create.mockRejectedValue(
        new Error("Service unavailable")
      );

      await expect(
        authProvider.verifyCode(testPhone, testCode)
      ).rejects.toThrow("Failed to verify code: Service unavailable");
    });

    it("should validate phone number format", async () => {
      await expect(
        authProvider.verifyCode("invalid-phone", testCode)
      ).rejects.toThrow("Invalid phone number format");

      expect(
        mockVerifyService.verificationChecks.create
      ).not.toHaveBeenCalled();
    });

    it("should validate code format", async () => {
      await expect(
        authProvider.verifyCode(testPhone, "invalid-code")
      ).rejects.toThrow("Invalid verification code format");

      expect(
        mockVerifyService.verificationChecks.create
      ).not.toHaveBeenCalled();
    });

    it("should handle user creation errors", async () => {
      mockVerifyService.verificationChecks.create.mockResolvedValue({
        status: "approved",
        valid: true,
      });

      mockDatabaseClient.getUserByPhone.mockResolvedValue(null);
      mockDatabaseClient.createUser.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        authProvider.verifyCode(testPhone, testCode)
      ).rejects.toThrow("Failed to create user: Database error");
    });
  });

  describe("isValidVerificationStatus", () => {
    it("should return true for approved status", () => {
      expect(authProvider.isValidVerificationStatus("approved")).toBe(true);
    });

    it("should return false for invalid statuses", () => {
      const invalidStatuses = ["pending", "expired", "failed", "canceled"];

      for (const status of invalidStatuses) {
        expect(authProvider.isValidVerificationStatus(status)).toBe(false);
      }
    });
  });
});
