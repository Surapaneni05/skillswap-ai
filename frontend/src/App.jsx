import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import ErrorBoundary from './components/ErrorBoundary'

// ALL pages are lazy-loaded — a broken import only kills that page, not the whole app
const Landing        = lazy(() => import('./pages/Landing'))
const Login          = lazy(() => import('./pages/Auth/Login'))
const Register       = lazy(() => import('./pages/Auth/Register'))
const DashboardLayout= lazy(() => import('./components/DashboardLayout'))
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const Profile        = lazy(() => import('./pages/Profile'))
const UserProfile    = lazy(() => import('./pages/UserProfile'))
const Skills         = lazy(() => import('./pages/Skills'))
const Matches        = lazy(() => import('./pages/Matches'))
const Chat           = lazy(() => import('./pages/Chat'))
const Sessions       = lazy(() => import('./pages/Sessions'))
const Roadmap        = lazy(() => import('./pages/Roadmap'))
const Reviews        = lazy(() => import('./pages/Reviews'))
const Notifications  = lazy(() => import('./pages/Notifications'))
const Leaderboard    = lazy(() => import('./pages/Leaderboard'))
const AdminDashboard = lazy(() => import('./pages/Admin'))

const Spinner = () => (
  <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 40, height: 40, border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
)

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/profile"       element={<Profile />} />
          <Route path="/users/:id"     element={<UserProfile />} />
          <Route path="/skills"        element={<Skills />} />
          <Route path="/matches"       element={<Matches />} />
          <Route path="/chat"          element={<Chat />} />
          <Route path="/chat/:userId"  element={<Chat />} />
          <Route path="/sessions"      element={<Sessions />} />
          <Route path="/roadmap"       element={<Roadmap />} />
          <Route path="/reviews"       element={<Reviews />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="/admin" element={
          <PrivateRoute><AdminRoute><AdminDashboard /></AdminRoute></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>
            <AppRoutes />
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}