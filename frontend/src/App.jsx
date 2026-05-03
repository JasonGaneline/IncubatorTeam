import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { LoginPage } from './pages/auth/LoginPage.jsx'
import { SignupPage } from './pages/auth/SignupPage.jsx'
import { MentalHealthCheckInPage } from './pages/checkin/MentalHealthCheckInPage.jsx'
import { CommunityForumPage } from './pages/community/CommunityForumPage.jsx'
import { ProfilePage } from './pages/profile/ProfilePage.jsx'

/**
 * App - top-level route table wrapped with auth context.
 * Protected routes require authentication; public routes are accessible to anyone.
 */

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/check-in" element={<ProtectedRoute element={<MentalHealthCheckInPage />} />} />
      <Route path="/community" element={<ProtectedRoute element={<CommunityForumPage />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
