export interface Participant {
  user_id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
}
