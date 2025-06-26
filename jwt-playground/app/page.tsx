"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SignJWT, jwtVerify } from "jose"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Key, Shield, Clock, User, Mail, Lock, Trash2, Database, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JWTData {
  id: string
  token: string
  createdAt: Date
  expiresAt: Date
  userData: {
    email: string
    name: string
    userId: string
    bio: string
  }
}

interface DecodedJWT {
  header: any
  payload: any
  isValid: boolean
  isExpired: boolean
}

export default function JWTPlayground() {
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", bio: "" })
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [jwts, setJwts] = useState<JWTData[]>([])
  const [jwtInput, setJwtInput] = useState("")
  const [decodedJWT, setDecodedJWT] = useState<DecodedJWT | null>(null)
  const [userDataJWT, setUserDataJWT] = useState("")
  const [retrievedUserData, setRetrievedUserData] = useState<any>(null)
  const { toast } = useToast()

  const secretKey = new TextEncoder().encode("your-secret-key-here-make-it-long-and-secure")

  const generateJWT = async (userData: { email: string; name: string; bio?: string }) => {
    const userId = Math.random().toString(36).substr(2, 9)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 60 * 1000) // 1 minute from now

    try {
      const token = await new SignJWT({
        email: userData.email,
        name: userData.name,
        userId: userId,
        bio: userData.bio || "",
        iat: Math.floor(now.getTime() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1m")
        .sign(secretKey)

      const newJWT: JWTData = {
        id: Math.random().toString(36).substr(2, 9),
        token,
        createdAt: now,
        expiresAt,
        userData: { email: userData.email, name: userData.name, userId, bio: userData.bio || "" },
      }

      setJwts((prev) => [newJWT, ...prev]) // Removed the limit

      toast({
        title: "JWT Generated!",
        description: "Your JWT token has been created and is valid for 1 minute.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate JWT token.",
        variant: "destructive",
      })
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupData.name || !signupData.email || !signupData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    generateJWT({ email: signupData.email, name: signupData.name, bio: signupData.bio })
    setSignupData({ name: "", email: "", password: "", bio: "" })
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    generateJWT({ email: loginData.email, name: "User" })
    setLoginData({ email: "", password: "" })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "JWT token copied to clipboard.",
    })
  }

  const decodeJWT = async () => {
    if (!jwtInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a JWT token.",
        variant: "destructive",
      })
      return
    }

    try {
      // Split the JWT to get header and payload
      const parts = jwtInput.split(".")
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format")
      }

      const header = JSON.parse(atob(parts[0]))

      // Try to verify the JWT
      let isValid = false
      let payload: any = null
      let isExpired = false

      try {
        const { payload: verifiedPayload } = await jwtVerify(jwtInput, secretKey)
        payload = verifiedPayload
        isValid = true
        isExpired = false
      } catch (error: any) {
        // If verification fails, still try to decode the payload
        try {
          payload = JSON.parse(atob(parts[1]))
          isExpired = payload.exp && payload.exp < Math.floor(Date.now() / 1000)
        } catch {
          payload = { error: "Could not decode payload" }
        }
        isValid = false
      }

      setDecodedJWT({
        header,
        payload,
        isValid,
        isExpired,
      })

      toast({
        title: "JWT Decoded",
        description: isValid ? "JWT is valid!" : "JWT is invalid or expired.",
        variant: isValid ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decode JWT token.",
        variant: "destructive",
      })
    }
  }

  const retrieveUserData = async () => {
    if (!userDataJWT.trim()) {
      toast({
        title: "Error",
        description: "Please enter a JWT token.",
        variant: "destructive",
      })
      return
    }

    try {
      const { payload } = await jwtVerify(userDataJWT, secretKey)

      setRetrievedUserData({
        name: payload.name,
        email: payload.email,
        userId: payload.userId,
        bio: payload.bio,
        issuedAt: new Date((payload.iat as number) * 1000).toLocaleString(),
        expiresAt: new Date((payload.exp as number) * 1000).toLocaleString(),
      })

      toast({
        title: "User Data Retrieved!",
        description: "Successfully extracted user information from JWT.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid or expired JWT token.",
        variant: "destructive",
      })
      setRetrievedUserData(null)
    }
  }

  const deleteJWT = (id: string) => {
    setJwts((prev) => prev.filter((jwt) => jwt.id !== id))
    toast({
      title: "Deleted",
      description: "JWT token removed.",
    })
  }

  const isExpired = (expiresAt: Date) => {
    return new Date() > expiresAt
  }

  // Clean up expired JWTs every second
  useEffect(() => {
    const interval = setInterval(() => {
      setJwts((prev) => prev.filter((jwt) => !isExpired(jwt.expiresAt)))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">JWT Playground</h1>
          </div>
          <p className="text-gray-600 text-lg">Generate, manage, and decode JWT tokens with 1-minute expiration</p>
        </div>

        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="decode" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              JWT Decoder
            </TabsTrigger>
            <TabsTrigger value="userdata" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              User Data Retrieval
            </TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="auth">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Auth Forms */}
              <div>
                <Tabs defaultValue="signup" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="login">Login</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signup">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Create Account
                        </CardTitle>
                        <CardDescription>Sign up to generate your first JWT token</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-name">Full Name *</Label>
                            <Input
                              id="signup-name"
                              type="text"
                              placeholder="John Doe"
                              value={signupData.name}
                              onChange={(e) => setSignupData((prev) => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email *</Label>
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="john@example.com"
                              value={signupData.email}
                              onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password *</Label>
                            <Input
                              id="signup-password"
                              type="password"
                              placeholder="••••••••"
                              value={signupData.password}
                              onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-bio">Bio</Label>
                            <Textarea
                              id="signup-bio"
                              placeholder="Tell us about yourself..."
                              value={signupData.bio}
                              onChange={(e) => setSignupData((prev) => ({ ...prev, bio: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            <User className="h-4 w-4 mr-2" />
                            Sign Up & Generate JWT
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="login">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Login
                        </CardTitle>
                        <CardDescription>Login to generate a new JWT token</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="login-email">Email</Label>
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="john@example.com"
                              value={loginData.email}
                              onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="login-password">Password</Label>
                            <Input
                              id="login-password"
                              type="password"
                              placeholder="••••••••"
                              value={loginData.password}
                              onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            <Lock className="h-4 w-4 mr-2" />
                            Login & Generate JWT
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* JWT List */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Your JWT Tokens ({jwts.length})
                    </CardTitle>
                    <CardDescription>Generated tokens expire after 1 minute</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {jwts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No JWT tokens generated yet.</p>
                        <p className="text-sm">Sign up or login to create your first token!</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {jwts.map((jwt) => (
                          <div
                            key={jwt.id}
                            className={`border rounded-lg p-4 ${
                              isExpired(jwt.expiresAt) ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span className="font-medium text-sm">{jwt.userData.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={isExpired(jwt.expiresAt) ? "destructive" : "default"}>
                                  {isExpired(jwt.expiresAt) ? "Expired" : "Active"}
                                </Badge>
                                <Button variant="ghost" size="sm" onClick={() => deleteJWT(jwt.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="text-xs text-gray-600 mb-2">
                              Created: {jwt.createdAt.toLocaleTimeString()} | Expires:{" "}
                              {jwt.expiresAt.toLocaleTimeString()}
                            </div>

                            <div className="bg-white border rounded p-2 mb-2">
                              <code className="text-xs break-all text-gray-800">{jwt.token}</code>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(jwt.token)}
                                className="flex-1"
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* JWT Decoder Tab */}
          <TabsContent value="decode">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    JWT Decoder & Validator
                  </CardTitle>
                  <CardDescription>Paste a JWT token to decode and validate it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jwt-input">JWT Token</Label>
                    <Textarea
                      id="jwt-input"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={jwtInput}
                      onChange={(e) => setJwtInput(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button onClick={decodeJWT} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Decode & Validate JWT
                  </Button>

                  {decodedJWT && (
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center gap-2">
                        <Badge variant={decodedJWT.isValid ? "default" : "destructive"}>
                          {decodedJWT.isValid ? "Valid" : decodedJWT.isExpired ? "Expired" : "Invalid"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Header</Label>
                          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-40">
                            {JSON.stringify(decodedJWT.header, null, 2)}
                          </pre>
                        </div>

                        <div className="space-y-2">
                          <Label>Payload</Label>
                          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-40">
                            {JSON.stringify(decodedJWT.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Data Retrieval Tab */}
          <TabsContent value="userdata">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    User Data Retrieval
                  </CardTitle>
                  <CardDescription>Submit a valid JWT token to extract user information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userdata-jwt">JWT Token</Label>
                    <Textarea
                      id="userdata-jwt"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={userDataJWT}
                      onChange={(e) => setUserDataJWT(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button onClick={retrieveUserData} className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Retrieve User Data
                  </Button>

                  {retrievedUserData && (
                    <div className="mt-6">
                      <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-green-800 flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            User Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Name</Label>
                              <p className="text-lg font-semibold">{retrievedUserData.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Email</Label>
                              <p className="text-lg">{retrievedUserData.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">User ID</Label>
                              <p className="font-mono text-sm">{retrievedUserData.userId}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Token Status</Label>
                              <Badge variant="default">Active</Badge>
                            </div>
                          </div>

                          {retrievedUserData.bio && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Bio</Label>
                              <p className="text-gray-800 bg-white p-3 rounded border">{retrievedUserData.bio}</p>
                            </div>
                          )}

                          <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Issued At</Label>
                              <p className="text-sm">{retrievedUserData.issuedAt}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Expires At</Label>
                              <p className="text-sm">{retrievedUserData.expiresAt}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
