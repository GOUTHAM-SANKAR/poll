"use client"

import { useEffect } from "react"
import { analytics } from "@/lib/firebase"

export function FirebaseSetup() {
  useEffect(() => {
    // Initialize analytics on client side
    if (analytics) {
      console.log("Firebase Analytics initialized")
    }
  }, [])

  return null
}
