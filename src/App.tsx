import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import UserEventsPage from './pages/UserEventsPage';
import UserProfilePage from './pages/UserProfilePage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrganizer?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = false,
  requireOrganizer = false
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requireOrganizer && (!isAuthenticated || (user && user.role !== 'organizer' && user.role !== 'admin'))) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { user } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  
  React.useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [fetchNotifications, user]);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route 
          path="/my-events" 
          element={
            <ProtectedRoute requireAuth>
              <UserEventsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/:userId" 
          element={
            <ProtectedRoute requireAuth>
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/organizer-dashboard" 
          element={
            <ProtectedRoute requireAuth requireOrganizer>
              <OrganizerDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;