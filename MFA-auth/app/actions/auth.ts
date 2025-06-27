"use server"

import { users, type User } from "@/lib/database"

// In-memory database (resets on server restart/page refresh in Next.js)
// IMPORTANT: This is for demonstration purposes only and is NOT secure or persistent for production.
// Passwords are NOT hashed and stored in plain text as requested, which is EXTREMELY INSECURE.
// Passwords are NOT hashed and stored in plain text as requested, which is EXTREMELY INSECURE.

export async function signup(formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  const flowSteps: string[] = []
  let success = false
  let message = ""

  flowSteps.push("Starting signup process...")

  if (!username || !email || !password || !confirmPassword) {
    message = "All fields are required."
    flowSteps.push("Validation failed: All fields are required.")
  } else if (password !== confirmPassword) {
    message = "Passwords do not match."
    flowSteps.push("Validation failed: Passwords do not match.")
  } else {
    flowSteps.push(`Checking database for username '${username}'...`)
    if (users.has(username)) {
      message = "Username already exists."
      flowSteps.push("Username already exists. Signup failed.")
    } else {
      flowSteps.push("Username available.")
      flowSteps.push(`Checking database for email '${email}'...`)
      if (Array.from(users.values()).some((user) => user.email === email)) {
        message = "Email already registered."
        flowSteps.push("Email already registered. Signup failed.")
      } else {
        flowSteps.push("Email available.")
        const newUser: User = { username, email, password } // Storing plain password as requested
        users.set(username, newUser)
        success = true
        message = "Signup successful!"
        flowSteps.push(`Adding user '${username}' to database.`)
        flowSteps.push("Signup process completed successfully!")
      }
    }
  }

  return {
    success,
    message,
    flowSteps,
    database: Array.from(users.values()), // Return full user objects including plain password
  }
}

export async function login(formData: FormData) {
  const usernameOrEmail = formData.get("usernameOrEmail") as string
  const password = formData.get("password") as string

  const flowSteps: string[] = []
  let success = false
  let message = ""
  let userFound: User | undefined

  flowSteps.push("Starting login process...")

  if (!usernameOrEmail || !password) {
    message = "Both fields are required."
    flowSteps.push("Validation failed: Both fields are required.")
  } else {
    flowSteps.push(`Searching for user '${usernameOrEmail}' in database...`)
    userFound = users.get(usernameOrEmail) || Array.from(users.values()).find((user) => user.email === usernameOrEmail)

    if (!userFound) {
      message = "Invalid username/email or password."
      flowSteps.push("User not found.")
    } else {
      flowSteps.push("User found.")
      flowSteps.push("Verifying password...")
      if (password === userFound.password) {
        // Comparing plain passwords as requested
        success = true
        message = "Login successful!"
        flowSteps.push("Password correct. User authenticated!")
      } else {
        message = "Invalid username/email or password."
        flowSteps.push("Password incorrect. Login failed.")
      }
    }
  }

  return {
    success,
    message,
    flowSteps,
    database: Array.from(users.values()), // Return full user objects including plain password
  }
}

export async function getDatabaseState() {
  return {
    database: Array.from(users.values()), // Return full user objects including plain password
  }
}
