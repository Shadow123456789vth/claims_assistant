import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DxcHeading,
  DxcButton,
  DxcTextInput,
  DxcTextarea,
  DxcFlex,
  DxcInset,
  DxcCard,
} from '@dxc-technology/halstack-react'
import serviceNowAPI from '@services/serviceNowAPI'
import { ClaimFormData } from '@types/claim'

function NewClaim() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ClaimFormData>({
    short_description: '',
    description: '',
    claimant_name: '',
    claimant_email: '',
    claim_amount: 0,
    incident_date: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: keyof ClaimFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await serviceNowAPI.createClaim(formData)
      navigate('/')
    } catch (error) {
      console.error('Error creating claim:', error)
      alert('Failed to create claim. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DxcInset space="2rem">
      <DxcFlex direction="column" gap="1.5rem">
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcHeading level={1} text="New Claim" />
          <DxcButton
            label="Cancel"
            mode="secondary"
            onClick={() => navigate('/')}
          />
        </DxcFlex>

        <DxcCard>
          <DxcInset space="1.5rem">
            <form onSubmit={handleSubmit}>
              <DxcFlex direction="column" gap="1rem">
                <DxcTextInput
                  label="Claimant Name"
                  value={formData.claimant_name}
                  onChange={(value) => handleChange('claimant_name', value)}
                  required
                />

                <DxcTextInput
                  label="Claimant Email"
                  value={formData.claimant_email}
                  onChange={(value) => handleChange('claimant_email', value)}
                  required
                />

                <DxcTextInput
                  label="Short Description"
                  value={formData.short_description}
                  onChange={(value) => handleChange('short_description', value)}
                  required
                />

                <DxcTextarea
                  label="Full Description"
                  value={formData.description}
                  onChange={(value) => handleChange('description', value)}
                  required
                />

                <DxcTextInput
                  label="Claim Amount"
                  type="number"
                  value={formData.claim_amount.toString()}
                  onChange={(value) => handleChange('claim_amount', parseFloat(value))}
                  required
                />

                <DxcTextInput
                  label="Incident Date"
                  type="date"
                  value={formData.incident_date}
                  onChange={(value) => handleChange('incident_date', value)}
                  required
                />

                <DxcFlex gap="1rem" justifyContent="flex-end">
                  <DxcButton
                    label="Submit Claim"
                    mode="primary"
                    type="submit"
                    disabled={submitting}
                  />
                </DxcFlex>
              </DxcFlex>
            </form>
          </DxcInset>
        </DxcCard>
      </DxcFlex>
    </DxcInset>
  )
}

export default NewClaim
