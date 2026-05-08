interface WasteTransactionDetailPayload {
  wasteId: string
  transactionId: string
  weight?: number
  points?: number
  pointsPerWeight?: number
}

export default WasteTransactionDetailPayload
