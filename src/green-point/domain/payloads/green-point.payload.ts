interface GreenPointPayload {
  name: string
  mail: string
  phoneNumber: string
  description: string
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export default GreenPointPayload
