import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import AuthWrapper from './AuthWrapper.jsx'
import SuccessPage from './SuccessPage.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key — add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file')
}

// Simple client-side routing — no router library needed
const isSuccessPage = window.location.pathname === '/success'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {isSuccessPage ? <SuccessPage /> : <AuthWrapper />}
    </ClerkProvider>
  </React.StrictMode>
)
