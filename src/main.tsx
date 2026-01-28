import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HalstackProvider } from '@dxc-technology/halstack-react'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HalstackProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HalstackProvider>
  </React.StrictMode>,
)
