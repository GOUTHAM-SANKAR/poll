"use client"

import type React from "react"

import { useState, useEffect, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Users, Vote, Plus, Edit, Trash2, Eye, Settings, ArrowLeft, Loader2, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChange, signInAdmin, signOutAdmin } from "@/lib/auth"
import {
  getPolls,
  getPosts,
  createPoll,
  createPost,
  updatePoll,
  deletePoll,
  deletePost,
  type Poll,
  type Post,
} from "@/lib/firestore"
import type { User } from "firebase/auth"
import { trackPollCreate, trackPostCreate, trackAdminLogin } from "@/lib/analytics"

const AdminPanel = memo(() => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [polls, setPolls] = useState<Poll[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    options: ["", ""],
    endDate: "",
  })

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
  })

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        loadData()
      }
    })

    return () => unsubscribe()
  }, [])

  const loadData = async () => {
    setDataLoading(true)
    try {
      const [pollsResult, postsResult] = await Promise.all([getPolls(), getPosts()])

      if (pollsResult.error) {
        toast({
          title: "Error loading polls",
          description: pollsResult.error,
          variant: "destructive",
        })
      } else {
        setPolls(pollsResult.polls)
      }

      if (postsResult.error) {
        toast({
          title: "Error loading posts",
          description: postsResult.error,
          variant: "destructive",
        })
      } else {
        setPosts(postsResult.posts)
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setDataLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)

    const result = await signInAdmin(email, password)

    if (result.error) {
      toast({
        title: "Authentication failed",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in",
      })
      trackAdminLogin(email)
    }

    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    const result = await signOutAdmin()
    if (result.error) {
      toast({
        title: "Error signing out",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      })
      router.push("/")
    }
  }

  const addPollOption = () => {
    setNewPoll((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }))
  }

  const updatePollOption = (index: number, value: string) => {
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }))
  }

  const removePollOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }))
    }
  }

  const handleCreatePoll = async () => {
    if (!newPoll.title || !newPoll.description || !newPoll.endDate) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    const validOptions = newPoll.options.filter((option) => option.trim() !== "")
    if (validOptions.length < 2) {
      toast({
        title: "Please provide at least 2 options",
        variant: "destructive",
      })
      return
    }

    const pollData = {
      title: newPoll.title,
      description: newPoll.description,
      options: validOptions.map((text, index) => ({
        id: `option_${index + 1}`,
        text,
        votes: 0,
      })),
      endDate: newPoll.endDate,
      isActive: true,
      createdBy: user?.email || "admin",
    }

    const result = await createPoll(pollData)

    if (result.error) {
      toast({
        title: "Error creating poll",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Poll created successfully",
        description: "Your poll is now live for students to vote",
      })
      setNewPoll({ title: "", description: "", options: ["", ""], endDate: "" })
      await loadData()
      trackPollCreate(newPoll.title)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    const postData = {
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      author: user?.email || "Admin",
    }

    const result = await createPost(postData)

    if (result.error) {
      toast({
        title: "Error creating post",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Post created successfully",
        description: "Your announcement is now visible to students",
      })
      setNewPost({ title: "", content: "", category: "" })
      await loadData()
      trackPostCreate(newPost.title, newPost.category)
    }
  }

  const togglePollStatus = async (pollId: string, currentStatus: boolean) => {
    const result = await updatePoll(pollId, { isActive: !currentStatus })

    if (result.error) {
      toast({
        title: "Error updating poll",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Poll status updated",
        description: `Poll has been ${!currentStatus ? "activated" : "deactivated"}`,
      })
      await loadData()
    }
  }

  const handleDeletePoll = async (pollId: string) => {
    const result = await deletePoll(pollId)

    if (result.error) {
      toast({
        title: "Error deleting poll",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Poll deleted",
        description: "Poll has been removed successfully",
      })
      await loadData()
    }
  }

  const handleDeletePost = async (postId: string) => {
    const result = await deletePost(postId)

    if (result.error) {
      toast({
        title: "Error deleting post",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Post deleted",
        description: "Post has been removed successfully",
      })
      await loadData()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg w-fit mx-auto mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-heading">Admin Login</CardTitle>
            <CardDescription>Sign in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Site</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Site</span>
                </Button>
              </Link>
              <div className="flex items-center">
                <div>
                  <h1 className="text-xl font-heading font-bold text-gradient">CEMP VOICE Admin</h1>
                  <p className="text-sm text-muted-foreground">Manage polls and content</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Badge variant="secondary" className="glass-card">
                {user.email}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="glass-card bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading dashboard...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
                  <Vote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-heading">{polls.filter((p) => p.isActive).length}</div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-heading">
                    {polls.reduce((acc, poll) => acc + poll.totalVotes, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-heading">{posts.length}</div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Participation</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-heading">
                    {polls.length > 0
                      ? Math.round(polls.reduce((acc, poll) => acc + poll.totalVotes, 0) / polls.length)
                      : 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="polls" className="space-y-6">
              <TabsList className="glass-card">
                <TabsTrigger value="polls">Manage Polls</TabsTrigger>
                <TabsTrigger value="posts">Manage Posts</TabsTrigger>
              </TabsList>

              <TabsContent value="polls" className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-heading font-bold">Poll Management</h2>
                    <p className="text-muted-foreground">Create and manage student polls</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Plus className="h-4 w-4" />
                        <span>Create Poll</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl glass-card">
                      <DialogHeader>
                        <DialogTitle className="font-heading">Create New Poll</DialogTitle>
                        <DialogDescription>Create a new poll for students to vote on</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="pollTitle">Poll Title *</Label>
                          <Input
                            id="pollTitle"
                            value={newPoll.title}
                            onChange={(e) => setNewPoll((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter poll title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pollDescription">Description *</Label>
                          <Textarea
                            id="pollDescription"
                            value={newPoll.description}
                            onChange={(e) => setNewPoll((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what this poll is about"
                          />
                        </div>
                        <div>
                          <Label>Poll Options *</Label>
                          <div className="space-y-2">
                            {newPoll.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updatePollOption(index, e.target.value)}
                                  placeholder={`Option ${index + 1}`}
                                />
                                {newPoll.options.length > 2 && (
                                  <Button variant="outline" size="sm" onClick={() => removePollOption(index)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={addPollOption}
                              className="w-full glass-card bg-transparent"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date *</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={newPoll.endDate}
                            onChange={(e) => setNewPoll((prev) => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                        <Button
                          onClick={handleCreatePoll}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Create Poll
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="font-heading">All Polls</CardTitle>
                    <CardDescription>Manage your polls and view statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {polls.length === 0 ? (
                      <div className="text-center py-8">
                        <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No polls created yet. Create your first poll to get started.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Votes</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {polls.map((poll) => (
                            <TableRow key={poll.id}>
                              <TableCell className="font-medium">{poll.title}</TableCell>
                              <TableCell>
                                <Badge variant={poll.isActive ? "default" : "secondary"}>
                                  {poll.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold">{poll.totalVotes}</TableCell>
                              <TableCell>{formatDate(poll.endDate)}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => togglePollStatus(poll.id, poll.isActive)}
                                    className="glass-card"
                                  >
                                    {poll.isActive ? "Deactivate" : "Activate"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeletePoll(poll.id)}
                                    className="glass-card hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="posts" className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-heading font-bold">Content Management</h2>
                    <p className="text-muted-foreground">Create and manage announcements</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Plus className="h-4 w-4" />
                        <span>Create Post</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl glass-card">
                      <DialogHeader>
                        <DialogTitle className="font-heading">Create New Post</DialogTitle>
                        <DialogDescription>Create a new announcement or post for students</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="postTitle">Post Title *</Label>
                          <Input
                            id="postTitle"
                            value={newPost.title}
                            onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter post title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="postContent">Content *</Label>
                          <Textarea
                            id="postContent"
                            value={newPost.content}
                            onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                            placeholder="Write your post content here"
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="postCategory">Category *</Label>
                          <Select
                            value={newPost.category}
                            onValueChange={(value) => setNewPost((prev) => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Announcement">Announcement</SelectItem>
                              <SelectItem value="Elections">Elections</SelectItem>
                              <SelectItem value="Events">Events</SelectItem>
                              <SelectItem value="Academic">Academic</SelectItem>
                              <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleCreatePost}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Create Post
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="font-heading">All Posts</CardTitle>
                    <CardDescription>Manage your announcements and posts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {posts.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No posts created yet. Create your first post to get started.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {posts.map((post) => (
                            <TableRow key={post.id}>
                              <TableCell className="font-medium">{post.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="glass-card">
                                  {post.category}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(post.date)}</TableCell>
                              <TableCell>{post.author}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button variant="outline" size="sm" className="glass-card bg-transparent">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeletePost(post.id)}
                                    className="glass-card hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
})

export default AdminPanel
