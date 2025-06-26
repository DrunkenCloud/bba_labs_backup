"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Database, Lock, CheckCircle, XCircle, ArrowRight } from "lucide-react"

interface UserInterface {
  id: number
  email: string
  hashedPassword: string
  createdAt: string
}

interface FlowStep {
  step: number
  title: string
  description: string
  active: boolean
}

export default function PasswordHashDemo() {
  const [users, setUsers] = useState<UserInterface[]>([])
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([])
  const [highlightedUser, setHighlightedUser] = useState<number | null>(null)

  // Simple hash function for demo (in real apps, use bcrypt)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + "salt_demo_2024")
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 4000)
  }

  const animateFlow = (steps: FlowStep[]) => {
    setFlowSteps(steps.map((step) => ({ ...step, active: false })))

    steps.forEach((step, index) => {
      setTimeout(() => {
        setFlowSteps((prev) => prev.map((s) => (s.step === step.step ? { ...s, active: true } : s)))
      }, index * 800)
    })

    setTimeout(
      () => {
        setFlowSteps([])
      },
      steps.length * 800 + 2000,
    )
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupEmail || !signupPassword) return

    setIsProcessing(true)

    // Check if user already exists
    const existingUser = users.find((user) => user.email === signupEmail)
    if (existingUser) {
      animateFlow([
        { step: 1, title: "Check Database", description: "Searching for existing user...", active: false },
        { step: 2, title: "User Found", description: "Account already exists!", active: false },
      ])

      setTimeout(() => {
        setHighlightedUser(existingUser.id)
        showMessage("Account already exists with this email!", "error")
        setIsProcessing(false)
        setTimeout(() => setHighlightedUser(null), 2000)
      }, 1600)
      return
    }

    // Animate signup flow
    animateFlow([
      { step: 1, title: "Validate Input", description: "Checking email and password...", active: false },
      { step: 2, title: "Hash Password", description: "Converting password to secure hash...", active: false },
      { step: 3, title: "Save to Database", description: "Creating new user record...", active: false },
      { step: 4, title: "Success", description: "Account created successfully!", active: false },
    ])

    setTimeout(async () => {
      const hashedPassword = await hashPassword(signupPassword)
      const newUser: UserInterface = {
        id: Date.now(),
        email: signupEmail,
        hashedPassword,
        createdAt: new Date().toLocaleString(),
      }

      setUsers((prev) => [...prev, newUser])
      setHighlightedUser(newUser.id)
      showMessage("Account created successfully!", "success")
      setSignupEmail("")
      setSignupPassword("")
      setIsProcessing(false)

      setTimeout(() => setHighlightedUser(null), 3000)
    }, 3200)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) return

    setIsProcessing(true)

    // Find user
    const user = users.find((u) => u.email === loginEmail)

    if (!user) {
      animateFlow([
        { step: 1, title: "Search Database", description: "Looking for user account...", active: false },
        { step: 2, title: "User Not Found", description: "No account with this email", active: false },
      ])

      setTimeout(() => {
        showMessage("No account found with this email!", "error")
        setIsProcessing(false)
      }, 1600)
      return
    }

    // Verify password
    const hashedInputPassword = await hashPassword(loginPassword)
    const isValidPassword = hashedInputPassword === user.hashedPassword

    if (isValidPassword) {
      animateFlow([
        { step: 1, title: "Find User", description: "Located user in database...", active: false },
        { step: 2, title: "Hash Input", description: "Hashing provided password...", active: false },
        { step: 3, title: "Compare Hashes", description: "Verifying password match...", active: false },
        { step: 4, title: "Login Success", description: "Authentication successful!", active: false },
      ])

      setTimeout(() => {
        setHighlightedUser(user.id)
        showMessage("Login successful! Welcome back.", "success")
        setLoginEmail("")
        setLoginPassword("")
        setIsProcessing(false)
        setTimeout(() => setHighlightedUser(null), 3000)
      }, 3200)
    } else {
      animateFlow([
        { step: 1, title: "Find User", description: "Located user in database...", active: false },
        { step: 2, title: "Hash Input", description: "Hashing provided password...", active: false },
        { step: 3, title: "Compare Hashes", description: "Password hashes do not match!", active: false },
      ])

      setTimeout(() => {
        setHighlightedUser(user.id)
        showMessage("Invalid password!", "error")
        setIsProcessing(false)
        setTimeout(() => setHighlightedUser(null), 2000)
      }, 2400)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple Auth Demo</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how passwords are securely stored as hashes in the database. Try signing up and logging in to watch the
            authentication flow in action.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Authentication Forms */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Authentication
                </CardTitle>
                <CardDescription>Sign up for a new account or log in to an existing one</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signup" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="login">Log In</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                          >
                            {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isProcessing}>
                        {isProcessing ? "Creating Account..." : "Sign Up"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isProcessing}>
                        {isProcessing ? "Logging In..." : "Log In"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {message && (
                  <Alert
                    className={`mt-4 ${messageType === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                  >
                    <div className="flex items-center gap-2">
                      {messageType === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={messageType === "success" ? "text-green-800" : "text-red-800"}>
                        {message}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Flow Animation */}
            {flowSteps.length > 0 && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <ArrowRight className="h-5 w-5" />
                    Processing Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {flowSteps.map((step) => (
                      <div
                        key={step.step}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                          step.active
                            ? "bg-blue-100 border-2 border-blue-300 scale-105"
                            : "bg-white border border-gray-200 opacity-50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            step.active ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {step.step}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{step.title}</div>
                          <div className="text-sm text-gray-600">{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Database Visualization */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database State
                </CardTitle>
                <CardDescription>Live view of user data stored in the database</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users in database yet</p>
                    <p className="text-sm">Sign up to create the first user!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-sm">
                        {users.length} user{users.length !== 1 ? "s" : ""} stored
                      </Badge>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={`p-4 border rounded-lg transition-all duration-500 ${
                            highlightedUser === user.id
                              ? "border-green-300 bg-green-50 scale-105 shadow-lg"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-900">{user.email}</span>
                            </div>

                            <div className="flex items-start gap-2">
                              <Lock className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-500 mb-1">Hashed Password:</div>
                                <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                                  {user.hashedPassword}
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-gray-500">Created: {user.createdAt}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Note
                </CardTitle>
              </CardHeader>
              <CardContent className="text-amber-800 text-sm space-y-2">
                <p>
                  <strong>Why hash passwords?</strong> Passwords are never stored in plain text. Instead, they're
                  converted to irreversible hashes using cryptographic functions.
                </p>
                <p>
                  <strong>How login works:</strong> When you log in, your password is hashed and compared to the stored
                  hash. If they match, authentication succeeds.
                </p>
                <p className="text-xs text-amber-700">
                  Note: This demo uses SHA-256 for simplicity. Production apps should use bcrypt or similar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
