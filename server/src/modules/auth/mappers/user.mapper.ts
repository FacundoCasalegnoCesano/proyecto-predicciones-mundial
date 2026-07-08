export interface UserDTO {
  id: number
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
}

export function mapUserToDTO(user: any): UserDTO {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  }
}
