import { Routes, Route } from 'react-router-dom'
import { DxcApplicationLayout } from '@dxc-technology/halstack-react'
import ClaimsList from '@pages/ClaimsList'
import ClaimDetail from '@pages/ClaimDetail'
import NewClaim from '@pages/NewClaim'

function App() {
  return (
    <DxcApplicationLayout>
      <DxcApplicationLayout.Main>
        <Routes>
          <Route path="/" element={<ClaimsList />} />
          <Route path="/claims/:id" element={<ClaimDetail />} />
          <Route path="/claims/new" element={<NewClaim />} />
        </Routes>
      </DxcApplicationLayout.Main>
    </DxcApplicationLayout>
  )
}

export default App
