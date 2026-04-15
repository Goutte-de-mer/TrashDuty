export type UserProfile = {
  userId: string
  name: string
  email: string
  colocId: string | null
  isAvailable: boolean
  unavailableUntilDate: string | null
}
