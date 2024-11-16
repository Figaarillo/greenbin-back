interface RewardPartnerPayload {
  name: string
  username: string
  address: string
  cuit: string
  email: string
  password: string
  phoneNumber: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export default RewardPartnerPayload
