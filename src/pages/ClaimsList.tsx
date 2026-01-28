import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  DxcTable, 
  DxcButton, 
  DxcHeading,
  DxcFlex,
  DxcInset
} from '@dxc-technology/halstack-react'
import serviceNowAPI from '@services/serviceNowAPI'
import { Claim } from '@types/claim'

function ClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    try {
      const data = await serviceNowAPI.getClaims()
      setClaims(data.result || [])
    } catch (error) {
      console.error('Error loading claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (claimId: string) => {
    navigate(`/claims/${claimId}`)
  }

  const columns = [
    { label: 'Claim Number', value: 'number' },
    { label: 'Claimant', value: 'claimant_name' },
    { label: 'Description', value: 'short_description' },
    { label: 'State', value: 'state' },
    { label: 'Priority', value: 'priority' },
    { label: 'Amount', value: 'claim_amount' },
  ]

  return (
    <DxcInset space="2rem">
      <DxcFlex direction="column" gap="1.5rem">
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcHeading level={1} text="Claims" />
          <DxcButton
            label="New Claim"
            mode="primary"
            onClick={() => navigate('/claims/new')}
          />
        </DxcFlex>

        {loading ? (
          <p>Loading claims...</p>
        ) : (
          <DxcTable>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.value}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr
                  key={claim.sys_id}
                  onClick={() => handleRowClick(claim.sys_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{claim.number}</td>
                  <td>{claim.claimant_name}</td>
                  <td>{claim.short_description}</td>
                  <td>{claim.state}</td>
                  <td>{claim.priority}</td>
                  <td>${claim.claim_amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </DxcTable>
        )}
      </DxcFlex>
    </DxcInset>
  )
}

export default ClaimsList
