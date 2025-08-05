"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Settings } from "lucide-react"

export function SetupInstructions() {
  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <CardTitle className="font-heading">Firebase Setup Complete</CardTitle>
        </div>
        <CardDescription>Your Firebase configuration has been integrated successfully</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Firebase App initialized</span>
            <Badge variant="secondary">✓ Done</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Authentication configured</span>
            <Badge variant="secondary">✓ Done</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Firestore database connected</span>
            <Badge variant="secondary">✓ Done</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Analytics tracking enabled</span>
            <Badge variant="secondary">✓ Done</Badge>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Create an admin user in Firebase Authentication</li>
                <li>Set up Firestore security rules (see firestore-rules.txt)</li>
                <li>Enable Analytics in Firebase Console</li>
                <li>Test the admin login functionality</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
