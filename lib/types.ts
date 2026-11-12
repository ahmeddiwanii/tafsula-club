export interface UserSession {
  id: string
  name: string
  email: string
  role: string
  organizationId: string | null
}

// DISC test types
export interface QuestionOption {
  id: string
  text: string
}

export interface DiscMapping {
  [optionId: string]: {
    d: number
    i: number
    s: number
    c: number
  }
}

export interface Question {
  id: string
  questionText: string
  options: QuestionOption[]
  discMapping: DiscMapping
}

export interface Answer {
  questionId: string
  selectedOption: string
}

export interface DiscResult {
  dScore: number
  iScore: number
  sScore: number
  cScore: number
  dominantType: string
}

// Team compatibility types
export interface TeamMember {
  id: string
  name: string
  dominantType: string
  dScore: number
  iScore: number
  sScore: number
  cScore: number
}

export interface TeamCompatibility {
  balance: number // 0-100
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

// Dashboard types
export interface OrganizationData {
  id: string
  name: string
  memberCount: number
  hrCount: number
}

export interface MemberData {
  id: string
  name: string
  email: string
  dominantType: string | null
  testCompleted: boolean
  memberStatus?: string
}
