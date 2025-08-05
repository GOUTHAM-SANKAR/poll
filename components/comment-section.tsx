"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Send, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createComment, getComments, type Comment } from "@/lib/firestore"

interface CommentSectionProps {
  postId: string
  postTitle: string
}

export function CommentSection({ postId, postTitle }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [commenterName, setCommenterName] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadComments()
    // Load commenter name from localStorage
    const savedName = localStorage.getItem("commenterName")
    if (savedName) {
      setCommenterName(savedName)
    }
  }, [postId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const result = await getComments(postId)
      if (result.error) {
        toast({
          title: "Error loading comments",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setComments(result.comments)
      }
    } catch (error) {
      toast({
        title: "Error loading comments",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      toast({
        title: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    if (!commenterName.trim()) {
      toast({
        title: "Please enter your name",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const result = await createComment({
        postId,
        author: commenterName.trim(),
        content: newComment.trim(),
      })

      if (result.error) {
        toast({
          title: "Error submitting comment",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Comment submitted successfully",
          description: "Your comment has been added",
        })
        setNewComment("")
        // Save commenter name to localStorage
        localStorage.setItem("commenterName", commenterName.trim())
        await loadComments() // Refresh comments
      }
    } catch (error) {
      toast({
        title: "Error submitting comment",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="mt-4 glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg font-heading">
          <MessageCircle className="h-5 w-5" />
          <span>Comments ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4 p-4 rounded-lg border bg-muted/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commenterName">Your Name *</Label>
              <Input
                id="commenterName"
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="newComment">Your Comment *</Label>
            <Textarea
              id="newComment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Share your thoughts on "${postTitle}"...`}
              rows={3}
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={submitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {submitting ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-pulse" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </>
            )}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-4 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      {comment.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{comment.author}</p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground mt-1 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
