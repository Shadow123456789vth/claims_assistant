import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DxcHeading,
  DxcButton,
  DxcFlex,
  DxcInset,
  DxcCard,
} from '@dxc-technology/halstack-react'
import serviceNowAPI from '@services/serviceNowAPI'
import { Claim } from '@types/claim'

function ClaimDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadClaim(id)
    }
  }, [id])

  const loadClaim = async (claimId: string) => {
    try {
      const data = await serviceNowAPI.getClaimById(claimId)
      setClaim(data.result)
    } catch (error) {
      console.error('Error loading claim:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DxcInset space="2rem"><p>Loading claim details...</p></DxcInset>
  }

  if (!claim) {
    return <DxcInset space="2rem"><p>Claim not found</p></DxcInset>
  }

  return (
    <DxcInset space="2rem">
      <DxcFlex direction="column" gap="1.5rem">
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcHeading level={1} text={`Claim ${claim.number}`} />
          <DxcButton
            label="Back to Claims"
            mode="secondary"
            onClick={() => navigate('/')}
          />
        </DxcFlex>

        <DxcCard>
          <DxcInset space="1.5rem">
            <DxcFlex direction="column" gap="1rem">
              <div>
                <strong>Claimant:</strong> {claim.claimant_name}
              </div>
              <div>
                <strong>Email:</strong> {claim.claimant_email}
              </div>
              <div>
                <strong>State:</strong> {claim.state}
              </div>
              <div>
                <strong>Priority:</strong> {claim.priority}
              </div>
              <div>
                <strong>Amount:</strong> ${claim.claim_amount?.toLocaleString()}
              </div>
              <div>
                <strong>Incident Date:</strong> {new Date(claim.incident_date).toLocaleDateString()}
              </div>
              <div>
                <strong>Description:</strong>
                <p>{claim.description}</p>
              </div>
            </DxcFlex>
          </DxcInset>
        </DxcCard>
      </DxcFlex>
    </DxcInset>
  )
}

export default ClaimDetail
