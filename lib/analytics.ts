import { analytics } from "./firebase"
import { logEvent } from "firebase/analytics"

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters)
  }
}

// Predefined tracking functions
export const trackPollVote = (pollId: string, pollTitle: string) => {
  trackEvent("poll_vote", {
    poll_id: pollId,
    poll_title: pollTitle,
  })
}

export const trackPollCreate = (pollTitle: string) => {
  trackEvent("poll_create", {
    poll_title: pollTitle,
  })
}

export const trackPostCreate = (postTitle: string, category: string) => {
  trackEvent("post_create", {
    post_title: postTitle,
    category: category,
  })
}

export const trackAdminLogin = (adminEmail: string) => {
  trackEvent("admin_login", {
    admin_email: adminEmail,
  })
}
