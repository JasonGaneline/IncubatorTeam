import { Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from './pages/HomePage.jsx'
import { LoginPage } from './pages/auth/LoginPage.jsx'
import { SignupPage } from './pages/auth/SignupPage.jsx'
import { MentalHealthCheckInPage } from './pages/checkin/MentalHealthCheckInPage.jsx'
import { CommunityForumPage } from './pages/community/CommunityForumPage.jsx'
import { ProfilePage } from './pages/profile/ProfilePage.jsx'
import { SupabaseTodosDemoPage } from './pages/SupabaseTodosDemoPage.jsx'

/**
 * App — top-level route table.
 * Add new pages here as features grow (check-in, community, profile, emergency).
 * Private routes can wrap components in a guard once JWT logic exists.
 */

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/check-in" element={<MentalHealthCheckInPage />} />
      <Route path="/community" element={<CommunityForumPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dev/supabase" element={<SupabaseTodosDemoPage />} />
      {/* Unknown paths bounce home for now — swap for a 404 page later */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
