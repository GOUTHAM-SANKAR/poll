"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, Users, Shield, Loader2 } from "lucide-react"
import type { Poll } from "@/lib/firestore"

interface OptimizedPollCardProps {
  poll: Poll
  hasVoted: boolean
  isLoggedIn: boolean
  onVote: (pollId: string, optionId: string) => Promise<void>
  submittingVote: boolean
}

export const OptimizedPollCard = React.memo(function OptimizedPollCard({
  poll,
  hasVoted,
  isLoggedIn,
  onVote,
  submittingVote,
}: OptimizedPollCardProps) {
  const [selectedOption, setSelectedOption] = React.useState("")

  const formatDate = React.useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }, [])

  const handleVote = React.useCallback(async () => {
    if (selectedOption) {
      await onVote(poll.id, selectedOption)
      setSelectedOption("")
    }
  }, [selectedOption, poll.id, onVote])

  const pollOptions = React.useMemo(() => {
    return poll.options.map((option) => ({
      ...option,
      percentage: poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0,
    }))
  }, [poll.options, poll.totalVotes])

  return (
    <Card className="glass-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-heading">{poll.title}</CardTitle>
            <CardDescription>{poll.description}</CardDescription>
          </div>
          <Badge variant={poll.isActive ? "default" : "secondary"} className="shrink-0">
            {poll.isActive ? "Active" : "Closed"}
          </Badge>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Ends {formatDate(poll.endDate)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{poll.totalVotes} votes</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasVoted ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>You have already voted</span>
            </p>
            {pollOptions.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{option.text}</span>
                  <span className="font-semibold">
                    {option.votes} ({option.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={option.percentage} className="h-3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {isLoggedIn ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Vote Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle className="font-heading">{poll.title}</DialogTitle>
                    <DialogDescription>{poll.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                      {poll.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button
                      onClick={handleVote}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={!selectedOption || submittingVote}
                    >
                      {submittingVote ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Vote"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button disabled className="w-full">
                Login to Vote
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})
