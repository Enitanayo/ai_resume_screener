import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ToastContainer from './components/common/Toast';
import useThemeStore from './store/themeStore';
import useAuthStore from './store/authStore';
// Layout Components
import Navbar from './components/layout/Navbar';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import JobsManagement from './pages/recruiter/JobsManagement';
import CreateJob from './pages/recruiter/CreateJob';
import CandidatesView from './pages/recruiter/CandidatesView';
import Analytics from './pages/recruiter/Analytics';
import BatchUpload from './pages/recruiter/BatchUpload';

// Candidate Pages
import JobBrowse from './pages/candidate/JobBrowse';
import JobDetails from './pages/candidate/JobDetails';
import Apply from './pages/candidate/Apply';
import MyApplications from './pages/candidate/MyApplications';
import CandidateAnalytics from './pages/candidate/CandidateAnalytics';

// Shared Pages
import Profile from './pages/Profile';

// Error Pages
import NotFound from './pages/error/NotFound';

// Protected Route Components
import ProtectedRoute from './routes/ProtectedRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';

function App() {
  const { initializeTheme } = useThemeStore();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initializeTheme();
    initAuth(); // Check for existing Appwrite session
  }, [initializeTheme, initAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-dark-50 grain-overlay transition-colors duration-300">
        <Navbar />

        <main className="relative">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Recruiter Routes */}
            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                    <RecruiterDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                    <JobsManagement />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs/create"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                    <CreateJob />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs/:jobId/candidates"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                    <CandidatesView />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/analytics"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                    <Analytics />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/batch-upload"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['recruiter', 'admin']}>
                    <BatchUpload />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            {/* Candidate Routes */}
            <Route
              path="/candidate/browse"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['candidate']}>
                    <JobBrowse />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/jobs/:id"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['candidate']}>
                    <JobDetails />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/apply/:jobId"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['candidate']}>
                    <Apply />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/applications"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['candidate']}>
                    <MyApplications />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/analytics"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['candidate']}>
                    <CandidateAnalytics />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            {/* Profile (any authenticated user) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;