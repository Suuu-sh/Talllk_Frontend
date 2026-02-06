export interface User {
  id: number
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Label {
  id: number
  name: string
  color: string
}

export interface Situation {
  id: number
  user_id: number
  title: string
  title_reading?: string
  description: string
  is_public: boolean
  is_favorite: boolean
  sort_order: number
  labels?: Label[]
  created_at: string
  updated_at: string
}

export interface Topic {
  id: number
  situation_id: number
  parent_id: number | null
  title: string
  description: string
  sort_order: number
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
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PublicSituation {
  id: number
  user_id: number
  title: string
  description: string
  is_public: boolean
  is_starred: boolean
  star_count: number
  created_at: string
  updated_at: string
  labels?: Label[]
  user?: {
    id: number
    name: string
    is_following?: boolean
    is_self?: boolean
  }
}

export interface PublicSituationDetail extends PublicSituation {
  topics: Topic[]
  questions: Question[]
}

export interface UserProfile {
  id: number
  name: string
  follower_count: number
  following_count: number
  is_following: boolean
  is_self: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  per_page: number
  total: number
  total_pages: number
}
