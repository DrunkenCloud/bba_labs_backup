"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sendOtp, verifyOtp } from "@/app/actions/otp-auth"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, User, ArrowLeft, KeyRound } from "lucide-react"

interface OtpAuthProps {
  onAuthAction: (flowSteps: string[], database: any[], message: string, success: boolean) => void
}

export function OtpAuth({ onAuthAction }: OtpAuthProps) {
  const [otpMode, setOtpMode] = useState("send") // "send" or "verify"
  const [email, setEmail] = useState("")
  const [authType, setAuthType] = useState<"login" | "signup">("login")
  const { toast } = useToast()

  const handleSendOtp = async (formData: FormData) => {
    const result = await sendOtp(formData)
    onAuthAction(result.flowSteps, result.database, result.message, result.success)
    toast({
      title: result.success ? "OTP Sent!" : "Error!",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
    if (result.success) {
      setEmail(formData.get("email") as string)
      setOtpMode("verify")
    }
  }

  const handleVerifyOtp = async (formData: FormData) => {
    // Add email and authType to formData
    formData.append("email", email)
    formData.append("authType", authType)

    const result = await verifyOtp(formData)
    onAuthAction(result.flowSteps, result.database, result.message, result.success)
    toast({
      title: result.success ? "Success!" : "Error!",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
    if (result.success || !result.success) {
      // Reset form after verification attempt
      setOtpMode("send")
      setEmail("")
    }
  }

  const resetForm = () => {
    setOtpMode("send")
    setEmail("")
  }

  if (otpMode === "verify") {
    return (
      <div className="space-y-6">
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border">
          <KeyRound className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <p className="font-medium text-sm">
            OTP sent to: <span className="text-blue-600 dark:text-blue-400">{email}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Check the database panel to see the generated OTP code</p>
        </div>

        <form action={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Enter OTP Code
            </Label>
            <Input
              id="otp"
              name="otp"
              placeholder="123456"
              maxLength={6}
              className="h-11 text-center text-lg font-mono tracking-widest"
              required
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              Verify OTP
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <Tabs value={authType} onValueChange={(value) => setAuthType(value as "login" | "signup")}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">OTP Login</TabsTrigger>
        <TabsTrigger value="signup">OTP Signup</TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="space-y-4">
        <form action={handleSendOtp} className="space-y-4">
          <input type="hidden" name="authType" value="login" />
          <div className="space-y-2">
            <Label htmlFor="email-login" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email-login"
              name="email"
              type="email"
              placeholder="john@example.com"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-otp-login" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password-otp-login"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="h-11"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Send Login OTP
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup" className="space-y-4">
        <form action={handleSendOtp} className="space-y-4">
          <input type="hidden" name="authType" value="signup" />
          <div className="space-y-2">
            <Label htmlFor="username-otp" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </Label>
            <Input id="username-otp" name="username" placeholder="john.doe" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-signup" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email-signup"
              name="email"
              type="email"
              placeholder="john@example.com"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-otp" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input id="password-otp" name="password" type="password" className="h-11" required />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            Send Signup OTP
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
