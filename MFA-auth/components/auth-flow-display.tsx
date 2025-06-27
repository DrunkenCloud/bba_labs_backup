"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Activity, Database, Users, KeyRound } from "lucide-react"

interface AuthFlowDisplayProps {
  flowSteps: string[]
  database: any[] | { users: any[]; otpEntries: any[] }
}

export function AuthFlowDisplay({ flowSteps, database }: AuthFlowDisplayProps) {
  const getStepColorClass = (step: string) => {
    if (step.includes("successful") || step.includes("authenticated") || step.includes("completed")) {
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
    }
    if (
      step.includes("failed") ||
      step.includes("incorrect") ||
      step.includes("exists") ||
      step.includes("required") ||
      step.includes("expired")
    ) {
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
    }
    return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" // Default for ongoing steps
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-600" />
            Authentication Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] pr-4">
            {flowSteps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Perform an authentication action to see the flow</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {flowSteps.map((step, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-start p-3 rounded-lg transition-all duration-300 text-sm",
                      getStepColorClass(step),
                    )}
                  >
                    <span className="mr-3 mt-0.5 font-bold">→</span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5 text-purple-600" />
            In-Memory Database
          </CardTitle>
          <p className="text-xs text-muted-foreground">Resets on page refresh</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] pr-4">
            {Array.isArray(database) ? (
              // Original format for regular auth
              database.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No users in database yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {database.map((user, index) => (
                    <Card
                      key={index}
                      className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-l-blue-500"
                    >
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-semibold text-blue-700 dark:text-blue-300">Username:</span>{" "}
                          {user.username}
                        </p>
                        <p>
                          <span className="font-semibold text-purple-700 dark:text-purple-300">Email:</span>{" "}
                          {user.email}
                        </p>
                        <p>
                          <span className="font-semibold text-red-700 dark:text-red-300">Password:</span>{" "}
                          {user.password}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              // New format for OTP auth
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Users className="w-4 h-4" />
                    Users ({database.users.length})
                  </h4>
                  {database.users.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">No users registered yet</p>
                  ) : (
                    <div className="space-y-2">
                      {database.users.map((user, index) => (
                        <Card
                          key={index}
                          className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-l-blue-500"
                        >
                          <div className="space-y-1 text-xs">
                            <p>
                              <span className="font-semibold text-blue-700 dark:text-blue-300">Username:</span>{" "}
                              {user.username}
                            </p>
                            <p>
                              <span className="font-semibold text-purple-700 dark:text-purple-300">Email:</span>{" "}
                              {user.email}
                            </p>
                            <p>
                              <span className="font-semibold text-red-700 dark:text-red-300">Password:</span>{" "}
                              {user.password}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <KeyRound className="w-4 h-4" />
                    Active OTPs ({database.otpEntries.length})
                  </h4>
                  {database.otpEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">No active OTPs</p>
                  ) : (
                    <div className="space-y-2">
                      {database.otpEntries.map((entry, index) => (
                        <Card
                          key={index}
                          className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-l-yellow-500"
                        >
                          <div className="space-y-1 text-xs">
                            <p>
                              <span className="font-semibold text-yellow-700 dark:text-yellow-300">Email:</span>{" "}
                              {entry.email}
                            </p>
                            <p>
                              <span className="font-semibold text-red-700 dark:text-red-300">OTP:</span>
                              <span className="ml-1 font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded text-red-800 dark:text-red-200">
                                {entry.otp}
                              </span>
                            </p>
                            <p>
                              <span className="font-semibold text-blue-700 dark:text-blue-300">Type:</span>{" "}
                              {entry.authType}
                            </p>
                            <p>
                              <span className="font-semibold text-purple-700 dark:text-purple-300">Expires:</span>{" "}
                              {new Date(entry.expiresAt).toLocaleTimeString()}
                            </p>
                            {entry.userData && (
                              <p>
                                <span className="font-semibold text-green-700 dark:text-green-300">Pending User:</span>{" "}
                                {entry.userData.username}
                              </p>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
