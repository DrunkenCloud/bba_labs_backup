"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Lock, Mail, RefreshCw } from "lucide-react"

interface AuthRequest {
  id: number
  type: "signin" | "signup"
  email: string
  password: string
  name?: string
}

const initialUsers: { id: number; email: string; password: string; name: string }[] = [
  { id: 1, email: "alice.brown@gmail.com", password: "alice2024", name: "Alice Brown" },
  { id: 2, email: "bob.johnson@yahoo.com", password: "mypass789", name: "Bob Johnson" },
  { id: 3, email: "jane.smith@gmail.com", password: "secret456", name: "Jane Smith" },
  { id: 4, email: "john.doe@yahoo.com", password: "password123", name: "John Doe" },
].sort((a, b) => a.name.localeCompare(b.name))

const generateRandomRequest = (
  existingUsers: { id: number; email: string; password: string; name: string }[],
): AuthRequest => {
  const requestTypes: ("signin" | "signup")[] = ["signin", "signup"]
  const type = requestTypes[Math.floor(Math.random() * requestTypes.length)]
  const domains = ["@gmail.com", "@yahoo.com"]

  if (type === "signin") {
    // 70% chance of using existing user, 30% chance of non-existing user
    if (Math.random() < 0.7 && existingUsers.length > 0) {
      const user = existingUsers[Math.floor(Math.random() * existingUsers.length)]
      // 80% chance of correct password, 20% chance of wrong password
      const password = Math.random() < 0.8 ? user.password : "wrongpassword"
      return {
        id: Date.now(),
        type: "signin",
        email: user.email,
        password: password,
      }
    } else {
      const domain = domains[Math.floor(Math.random() * domains.length)]
      return {
        id: Date.now(),
        type: "signin",
        email: `nonexistent${Math.floor(Math.random() * 1000)}${domain}`,
        password: "somepassword",
      }
    }
  } else {
    // Signup request
    // 30% chance of using existing email, 70% chance of new email
    if (Math.random() < 0.3 && existingUsers.length > 0) {
      const existingUser = existingUsers[Math.floor(Math.random() * existingUsers.length)]
      return {
        id: Date.now(),
        type: "signup",
        email: existingUser.email,
        password: "newpassword123",
        name: "New User",
      }
    } else {
      const domain = domains[Math.floor(Math.random() * domains.length)]
      return {
        id: Date.now(),
        type: "signup",
        email: `newuser${Math.floor(Math.random() * 1000)}${domain}`,
        password: "newpassword123",
        name: `User ${Math.floor(Math.random() * 1000)}`,
      }
    }
  }
}

export default function AuthLab() {
  const [users, setUsers] = useState<{ id: number; email: string; password: string; name: string }[]>(initialUsers)
  const [requestQueue, setRequestQueue] = useState<AuthRequest[]>([])
  const [currentRequest, setCurrentRequest] = useState<AuthRequest | null>(null)
  const [score, setScore] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)
  const [feedback, setFeedback] = useState<string>("")
  const [feedbackType, setFeedbackType] = useState<"correct" | "incorrect" | "">("")

  // Initialize with some requests
  useEffect(() => {
    const initialRequests = Array.from({ length: 5 }, () => generateRandomRequest(users))
    setRequestQueue(initialRequests)
    setCurrentRequest(initialRequests[0])
  }, [])

  const addNewRequest = () => {
    const newRequest = generateRandomRequest(users)
    setRequestQueue((prev) => [...prev, newRequest])
  }

  const processNextRequest = () => {
    setRequestQueue((prev) => prev.slice(1))
    if (requestQueue.length > 1) {
      setCurrentRequest(requestQueue[1])
    } else {
      addNewRequest()
      setCurrentRequest(null)
      setTimeout(() => {
        setCurrentRequest(requestQueue[0])
      }, 100)
    }
  }

  const isCorrectDecision = (request: AuthRequest, decision: "accept" | "deny"): boolean => {
    if (request.type === "signin") {
      const user = users.find((u) => u.email === request.email)
      if (!user) {
        // User doesn't exist, should deny
        return decision === "deny"
      } else {
        // User exists, check password
        return user.password === request.password ? decision === "accept" : decision === "deny"
      }
    } else {
      // Signup request
      const userExists = users.some((u) => u.email === request.email)
      if (userExists) {
        // User already exists, should deny signup
        return decision === "deny"
      } else {
        // New user, should accept signup
        return decision === "accept"
      }
    }
  }

  const handleDecision = (decision: "accept" | "deny") => {
    if (!currentRequest) return

    const isCorrect = isCorrectDecision(currentRequest, decision)
    setTotalRequests((prev) => prev + 1)

    if (isCorrect) {
      setScore((prev) => prev + 1)
      setFeedbackType("correct")

      if (currentRequest.type === "signup" && decision === "accept") {
        // Add new user to database
        const newUser: { id: number; email: string; password: string; name: string } = {
          id: users.length + 1,
          email: currentRequest.email,
          password: currentRequest.password,
          name: currentRequest.name || "Unknown",
        }
        setUsers((prev) => [...prev, newUser])
        setFeedback("✅ Correct! New user added to database.")
      } else if (currentRequest.type === "signin" && decision === "accept") {
        setFeedback("✅ Correct! User authenticated successfully.")
      } else {
        setFeedback("✅ Correct! Request properly denied.")
      }
    } else {
      setFeedbackType("incorrect")

      if (currentRequest.type === "signin") {
        const user = users.find((u) => u.email === currentRequest.email)
        if (!user) {
          setFeedback("❌ Wrong! User doesn't exist - should deny signin.")
        } else if (user.password !== currentRequest.password) {
          setFeedback("❌ Wrong! Password is incorrect - should deny signin.")
        } else {
          setFeedback("❌ Wrong! Valid credentials - should accept signin.")
        }
      } else {
        const userExists = users.some((u) => u.email === currentRequest.email)
        if (userExists) {
          setFeedback("❌ Wrong! Email already exists - should deny signup.")
        } else {
          setFeedback("❌ Wrong! New user with valid data - should accept signup.")
        }
      }
    }

    // Add new request to queue
    addNewRequest()

    // Process next request after a delay
    setTimeout(() => {
      processNextRequest()
      setFeedback("")
      setFeedbackType("")
    }, 2000)
  }

  const resetLab = () => {
    setUsers(initialUsers)
    setScore(0)
    setTotalRequests(0)
    setFeedback("")
    setFeedbackType("")
    const newRequests = Array.from({ length: 5 }, () => generateRandomRequest(initialUsers))
    setRequestQueue(newRequests)
    setCurrentRequest(newRequests[0])
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Authentication Server Lab
        </h1>
        <p className="text-muted-foreground text-lg">
          Act as a server and make decisions on authentication requests. Learn when to accept or deny signin/signup
          attempts.
        </p>
      </div>

      {/* Instructions - moved here */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <strong className="text-green-800">Signin Requests:</strong>
            <span className="text-green-700"> Accept if user exists and password matches, deny otherwise</span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <strong className="text-purple-800">Signup Requests:</strong>
            <span className="text-purple-700"> Accept if email is new, deny if user already exists</span>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <strong className="text-orange-800">Goal:</strong>
            <span className="text-orange-700">
              {" "}
              Make correct authentication decisions to improve your accuracy score
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Score and Stats */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-6">
            <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-green-700 font-medium">Correct</div>
            </div>
            <div className="text-center p-4 bg-blue-100 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{totalRequests}</div>
              <div className="text-sm text-blue-700 font-medium">Total</div>
            </div>
            <div className="text-center p-4 bg-purple-100 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {totalRequests > 0 ? Math.round((score / totalRequests) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-700 font-medium">Accuracy</div>
            </div>
          </div>
          <Button
            onClick={resetLab}
            variant="outline"
            size="lg"
            className="border-2 border-orange-300 hover:bg-orange-50 bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Lab
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Request */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Lock className="h-5 w-5" />
              Current Request
            </CardTitle>
            <CardDescription className="text-purple-600">Queue: {requestQueue.length} requests pending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {currentRequest ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700">Type:</span>
                    <Badge
                      variant={currentRequest.type === "signin" ? "default" : "secondary"}
                      className={currentRequest.type === "signin" ? "bg-blue-500" : "bg-purple-500"}
                    >
                      {currentRequest.type.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="font-mono text-sm bg-blue-50 px-2 py-1 rounded">{currentRequest.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-red-500" />
                      <span className="font-mono text-sm bg-red-50 px-2 py-1 rounded">{currentRequest.password}</span>
                    </div>
                    {currentRequest.name && (
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-green-500" />
                        <span className="font-mono text-sm bg-green-50 px-2 py-1 rounded">{currentRequest.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDecision("accept")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
                    size="lg"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button onClick={() => handleDecision("deny")} className="flex-1" variant="destructive" size="lg">
                    <Lock className="h-4 w-4 mr-2" />
                    Deny
                  </Button>
                </div>

                {feedback && (
                  <div
                    className={`p-3 rounded-lg text-sm font-medium ${
                      feedbackType === "correct"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {feedback}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Loading next request...</div>
            )}
          </CardContent>
        </Card>

        {/* User Database */}
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Lock className="h-5 w-5" />
              User Database
            </CardTitle>
            <CardDescription className="text-orange-600">
              Current users in the system (passwords visible for learning)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto p-6 space-y-3">
              {[...users]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border-2 border-orange-200 rounded-lg space-y-2 bg-white hover:bg-orange-25 transition-colors"
                  >
                    <div className="font-medium text-orange-800">{user.name}</div>
                    <div className="text-sm text-orange-600 font-mono bg-orange-50 px-2 py-1 rounded">{user.email}</div>
                    <div className="text-sm font-mono bg-red-50 px-2 py-1 rounded border border-red-200">
                      <span className="text-red-700">Password: {user.password}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Queue Preview */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardHeader className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-t-lg">
          <CardTitle className="text-indigo-800">Upcoming Requests</CardTitle>
          <CardDescription className="text-indigo-600">Preview of the next few requests in the queue</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {requestQueue.slice(1, 4).map((request, index) => (
              <div
                key={request.id}
                className="p-4 border-2 border-indigo-200 rounded-lg space-y-2 bg-white hover:bg-indigo-25 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant={request.type === "signin" ? "default" : "secondary"}
                    className={`text-xs ${request.type === "signin" ? "bg-blue-500" : "bg-purple-500"}`}
                  >
                    {request.type}
                  </Badge>
                  <span className="text-xs text-indigo-600 font-bold">#{index + 2}</span>
                </div>
                <div className="text-sm font-mono truncate bg-indigo-50 px-2 py-1 rounded">{request.email}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
