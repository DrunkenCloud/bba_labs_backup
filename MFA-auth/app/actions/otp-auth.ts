"use server"

import { users, otpEntries, type User } from "@/lib/database"

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOtp(formData: FormData) {
  const email = formData.get("email") as string
  const authType = formData.get("authType") as "login" | "signup"
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  const flowSteps: string[] = []
  let success = false
  let message = ""

  flowSteps.push(`Starting OTP ${authType} process...`)

  if (!email || !password) {
    message = "Email and password are required."
    flowSteps.push("Validation failed: Email and password are required.")
  } else {
    if (authType === "login") {
      flowSteps.push(`Checking if user with email '${email}' exists...`)
      const userFound = Array.from(users.values()).find((user) => user.email === email)

      if (!userFound) {
        message = "No account found with this email."
        flowSteps.push("User not found. OTP login failed.")
      } else {
        flowSteps.push("User found. Verifying password...")
        if (password !== userFound.password) {
          message = "Invalid password."
          flowSteps.push("Password incorrect. OTP login failed.")
        } else {
          flowSteps.push("Password correct. Generating OTP...")
          const otp = generateOtp()
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

          otpEntries.set(email, {
            email,
            otp,
            authType,
            expiresAt,
            createdAt: new Date(),
          })

          success = true
          message = `OTP sent to ${email}`
          flowSteps.push(`Generated OTP: ${otp}`)
          flowSteps.push("OTP stored in database with 5-minute expiry.")
          flowSteps.push("OTP sent to email (simulated).")
        }
      }
    } else if (authType === "signup") {
      if (!username) {
        message = "Username is required for signup."
        flowSteps.push("Validation failed: Username required.")
      } else {
        flowSteps.push(`Checking if username '${username}' already exists...`)
        if (users.has(username)) {
          message = "Username already exists."
          flowSteps.push("Username already exists. OTP signup failed.")
        } else {
          flowSteps.push("Username available.")
          flowSteps.push(`Checking if email '${email}' is already registered...`)
          if (Array.from(users.values()).some((user) => user.email === email)) {
            message = "Email already registered."
            flowSteps.push("Email already registered. OTP signup failed.")
          } else {
            flowSteps.push("Email available. Generating OTP...")
            const otp = generateOtp()
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

            otpEntries.set(email, {
              email,
              otp,
              authType,
              userData: { username, email, password },
              expiresAt,
              createdAt: new Date(),
            })

            success = true
            message = `OTP sent to ${email}`
            flowSteps.push(`Generated OTP: ${otp}`)
            flowSteps.push("OTP stored in database with user data and 5-minute expiry.")
            flowSteps.push("OTP sent to email (simulated).")
          }
        }
      }
    }
  }

  return {
    success,
    message,
    flowSteps,
    database: {
      users: Array.from(users.values()),
      otpEntries: Array.from(otpEntries.values()).map((entry) => ({
        ...entry,
        expiresAt: entry.expiresAt.toISOString(),
        createdAt: entry.createdAt.toISOString(),
      })),
    },
  }
}

export async function verifyOtp(formData: FormData) {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string
  const authType = formData.get("authType") as "login" | "signup"

  const flowSteps: string[] = []
  let success = false
  let message = ""

  flowSteps.push(`Starting OTP verification for ${authType}...`)

  if (!email || !otp) {
    message = "Email and OTP are required."
    flowSteps.push("Validation failed: Email and OTP required.")
  } else {
    flowSteps.push(`Looking up OTP entry for email '${email}'...`)
    const otpEntry = otpEntries.get(email)

    if (!otpEntry) {
      message = "No OTP found. Please request a new one."
      flowSteps.push("OTP entry not found.")
    } else if (otpEntry.authType !== authType) {
      message = "OTP type mismatch."
      flowSteps.push(`OTP was generated for ${otpEntry.authType}, but verifying for ${authType}.`)
    } else if (new Date() > otpEntry.expiresAt) {
      message = "OTP has expired. Please request a new one."
      flowSteps.push("OTP has expired.")
      otpEntries.delete(email) // Clean up expired OTP
    } else {
      flowSteps.push("OTP entry found. Verifying code...")
      if (otp === otpEntry.otp) {
        flowSteps.push("OTP code matches!")

        if (authType === "login") {
          success = true
          message = "Login successful!"
          flowSteps.push("User authenticated via OTP.")
        } else if (authType === "signup" && otpEntry.userData) {
          // Create the user account
          const newUser: User = {
            username: otpEntry.userData.username!,
            email: otpEntry.userData.email!,
            password: otpEntry.userData.password!,
          }
          users.set(newUser.username, newUser)
          success = true
          message = "Account created and login successful!"
          flowSteps.push(`Creating user account for '${newUser.username}'.`)
          flowSteps.push("User account created successfully.")
        }

        // Clean up OTP after successful verification
        otpEntries.delete(email)
        flowSteps.push("OTP entry removed from database.")
      } else {
        message = "Invalid OTP code."
        flowSteps.push("OTP code does not match.")
      }
    }
  }

  return {
    success,
    message,
    flowSteps,
    database: {
      users: Array.from(users.values()),
      otpEntries: Array.from(otpEntries.values()).map((entry) => ({
        ...entry,
        expiresAt: entry.expiresAt.toISOString(),
        createdAt: entry.createdAt.toISOString(),
      })),
    },
  }
}

export async function getOtpDatabaseState() {
  return {
    database: {
      users: Array.from(users.values()),
      otpEntries: Array.from(otpEntries.values()).map((entry) => ({
        ...entry,
        expiresAt: entry.expiresAt.toISOString(),
        createdAt: entry.createdAt.toISOString(),
      })),
    },
  }
}
