import { type Roles } from './role'

export interface AuthUser {
  sub: string
  role: Roles
  email: string
  type: string
  [key: string]: string
}
