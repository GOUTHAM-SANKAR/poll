import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  increment,
  getDoc,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Poll {
  id: string
  title: string
  description: string
  options: { id: string; text: string; votes: number }[]
  totalVotes: number
  endDate: string
  isActive: boolean
  createdAt: Timestamp
  createdBy: string
}

export interface Post {
  id: string
  title: string
  content: string
  author: string
  date: string
  category: string
  createdAt: Timestamp
}

export interface Vote {
  pollId: string
  userId: string
  optionId: string
  timestamp: Timestamp
}

export interface Comment {
  id: string
  postId: string
  author: string
  content: string
  timestamp: Timestamp
  createdAt: string
}

// Poll operations
export const createPoll = async (pollData: Omit<Poll, "id" | "createdAt" | "totalVotes">) => {
  try {
    const docRef = await addDoc(collection(db, "polls"), {
      ...pollData,
      totalVotes: 0,
      createdAt: Timestamp.now(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const getPolls = async () => {
  try {
    const q = query(collection(db, "polls"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const polls: Poll[] = []
    querySnapshot.forEach((doc) => {
      polls.push({ id: doc.id, ...doc.data() } as Poll)
    })
    return { polls, error: null }
  } catch (error: any) {
    return { polls: [], error: error.message }
  }
}

export const updatePoll = async (pollId: string, updates: Partial<Poll>) => {
  try {
    await updateDoc(doc(db, "polls", pollId), updates)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const deletePoll = async (pollId: string) => {
  try {
    await deleteDoc(doc(db, "polls", pollId))
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Vote operations (simplified without duplicate checking)
export const submitVote = async (pollId: string, userId: string, optionId: string) => {
  try {
    // Add vote without checking for duplicates
    await addDoc(collection(db, "votes"), {
      pollId,
      userId,
      optionId,
      timestamp: Timestamp.now(),
    })

    // Update poll option vote count
    const pollDoc = await getDoc(doc(db, "polls", pollId))
    if (pollDoc.exists()) {
      const pollData = pollDoc.data() as Poll
      const updatedOptions = pollData.options.map((option) =>
        option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
      )

      await updateDoc(doc(db, "polls", pollId), {
        options: updatedOptions,
        totalVotes: increment(1),
      })
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Post operations
export const createPost = async (postData: Omit<Post, "id" | "createdAt" | "date">) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      ...postData,
      date: new Date().toISOString().split("T")[0],
      createdAt: Timestamp.now(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const getPosts = async () => {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const posts: Post[] = []
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post)
    })
    return { posts, error: null }
  } catch (error: any) {
    return { posts: [], error: error.message }
  }
}

export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, "posts", postId))
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Comment operations
export const createComment = async (commentData: Omit<Comment, "id" | "timestamp" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "comments"), {
      ...commentData,
      timestamp: Timestamp.now(),
      createdAt: new Date().toISOString(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const getComments = async (postId: string) => {
  try {
    const q = query(
      collection(db, "comments"),
      orderBy("timestamp", "asc")
    )
    const querySnapshot = await getDocs(q)
    const comments: Comment[] = []
    querySnapshot.forEach((doc) => {
      const commentData = doc.data() as Comment
      if (commentData.postId === postId) {
        comments.push({ id: doc.id, ...commentData })
      }
    })
    return { comments, error: null }
  } catch (error: any) {
    return { comments: [], error: error.message }
  }
}

export const deleteComment = async (commentId: string) => {
  try {
    await deleteDoc(doc(db, "comments", commentId))
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}
