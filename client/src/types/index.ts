export interface User {
  id: number
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
}

export interface UserStats {
  totalPredictions: number
  exactPredictions: number
  correctWinnerPredictions: number
  currentStreak: number
  maxStreak: number
  avgPoints: number
}

export interface Prediction {
  id: number
  matchId: number
  predictedHomeScore: number
  predictedAwayScore: number
  points: number
  match: Match
}

export interface Match {
  id: number
  phase: string
  round?: string
  date: string
  status: string
  homeTeam: Team | null
  awayTeam: Team | null
  homeScore: number | null
  awayScore: number | null
}

export interface Team {
  id: number
  name: string
  code: string
}
