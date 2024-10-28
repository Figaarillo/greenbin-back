interface GreenPointPayload {
  name: string
  email: string
  phoneNumber: string
  description: string
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export default GreenPointPayload
