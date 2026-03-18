interface EntityPayload {
  name: string
  email: string
  description: string
  password: string
  city: string
  province: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export default EntityPayload
