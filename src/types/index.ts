export interface User {
  id: number
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Situation {
  id: number
  user_id: number
  title: string
  description: string
  created_at: string
  updated_at: string
}

export interface Topic {
  id: number
  situation_id: number
  parent_id: number | null
  title: string
  description: string
  created_at: string
  updated_at: string
  questions?: Question[]
}

export interface Question {
  id: number
  topic_id: number
  parent_id: number | null
  linked_topic_id: number | null
  linked_question_id: number | null
  question: string
  answer: string
  created_at: string
  updated_at: string
}
