interface User {
  username: string
  email: string
  password: string
}

interface OtpEntry {
  email: string
  otp: string
  authType: "login" | "signup"
  userData?: Partial<User>
  expiresAt: Date
  createdAt: Date
}

// In-memory database (resets on server restart/page refresh)
// IMPORTANT: This is for demonstration purposes only and is NOT secure or persistent for production.
export const users = new Map<string, User>() // Key by username
export const otpEntries = new Map<string, OtpEntry>() // Key by email

export type { User, OtpEntry }
