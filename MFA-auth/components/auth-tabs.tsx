"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signup, login } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { OtpAuth } from "@/components/otp-auth"
import { Lock, Mail, User, Shield } from "lucide-react"

interface AuthTabsProps {
  onAuthAction: (flowSteps: string[], database: any[], message: string, success: boolean) => void
}

export function AuthTabs({ onAuthAction }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState("password")
  const [passwordAuthMode, setPasswordAuthMode] = useState("login")
  const { toast } = useToast()

  const handleSignup = async (formData: FormData) => {
    const result = await signup(formData)
    onAuthAction(result.flowSteps, result.database, result.message, result.success)
    toast({
      title: result.success ? "Success!" : "Error!",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
    if (result.success) {
      setPasswordAuthMode("login") // Switch to login after successful signup
    }
  }

  const handleLogin = async (formData: FormData) => {
    const result = await login(formData)
    onAuthAction(result.flowSteps, result.database, result.message, result.success)
    toast({
      title: result.success ? "Success!" : "Error!",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }

  return (
    <div className="w-full max-w-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password Auth
          </TabsTrigger>
          <TabsTrigger value="otp" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            OTP Auth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Password Authentication</CardTitle>
              <CardDescription>Traditional username/email and password login</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={passwordAuthMode} onValueChange={setPasswordAuthMode}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form action={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="usernameOrEmail" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username or Email
                      </Label>
                      <Input
                        id="usernameOrEmail"
                        name="usernameOrEmail"
                        placeholder="john.doe or john@example.com"
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </Label>
                      <Input id="password" name="password" type="password" className="h-11" required />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form action={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username
                      </Label>
                      <Input id="username" name="username" placeholder="john.doe" className="h-11" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </Label>
                      <Input id="password-signup" name="password" type="password" className="h-11" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Confirm Password
                      </Label>
                      <Input id="confirm-password" name="confirmPassword" type="password" className="h-11" required />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="otp">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">OTP Authentication</CardTitle>
              <CardDescription>Secure login with one-time password verification</CardDescription>
            </CardHeader>
            <CardContent>
              <OtpAuth onAuthAction={onAuthAction} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
