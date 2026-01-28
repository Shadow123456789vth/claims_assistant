export interface Claim {
  sys_id: string
  number: string
  short_description: string
  description: string
  state: string
  priority: string
  claimant_name: string
  claimant_email: string
  claim_amount: number
  incident_date: string
  created_on: string
  updated_on: string
}

export interface ClaimFormData {
  short_description: string
  description: string
  claimant_name: string
  claimant_email: string
  claim_amount: number
  incident_date: string
}

export type ClaimState = 'new' | 'in_progress' | 'pending_review' | 'approved' | 'rejected' | 'closed'
export type ClaimPriority = 'low' | 'medium' | 'high' | 'critical'
