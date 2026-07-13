interface SubscribePushPayload {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export default SubscribePushPayload
