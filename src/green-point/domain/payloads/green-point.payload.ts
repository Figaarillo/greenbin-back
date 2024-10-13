interface GreenPointPayload {
  name: string
  description: string
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export default GreenPointPayload
