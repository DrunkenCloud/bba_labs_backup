"use client"

import { useState, useEffect } from "react"
import { AuthTabs } from "@/components/auth-tabs"
import { AuthFlowDisplay } from "@/components/auth-flow-display"
import { getDatabaseState } from "@/app/actions/auth"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const [flowSteps, setFlowSteps] = useState<string[]>([])
  const [database, setDatabase] = useState<any[]>([])

  useEffect(() => {
    // Initialize database state on component mount
    const fetchInitialDbState = async () => {
      const { database: initialDb } = await getDatabaseState()
      setDatabase(initialDb)
    }
    fetchInitialDbState()
  }, [])

  const handleAuthAction = (newFlowSteps: string[], newDatabase: any[], message: string, success: boolean) => {
    setFlowSteps(newFlowSteps)
    setDatabase(newDatabase)
    // Message and success are handled by toast in AuthTabs
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Authentication Flow Demo
          </h1>
          <p className="text-muted-foreground">
            Explore how login and signup authentication works with real-time flow visualization
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="flex justify-center">
            <AuthTabs onAuthAction={handleAuthAction} />
          </div>
          <div className="flex justify-center">
            <AuthFlowDisplay flowSteps={flowSteps} database={database} />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
