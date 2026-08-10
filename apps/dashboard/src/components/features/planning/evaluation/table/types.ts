export type Evaluation = {
  id: string
  deliveryUnit: string
  rating: number
  status: 'Pending' | 'Returned' | 'Approved'
}

export type VerificationMethod = {
  id: string
  title: string
  description: string
  uploadedDate: string
  url: string
}

export type EvaluationDetails = Evaluation & {
  description: string
  companyName: string
  overallRating: number
  maxRating: number
  verificationMethods: Array<VerificationMethod>
}
