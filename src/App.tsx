import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { parseISO } from 'date-fns';

// Layout
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import SchedulePage from './pages/SchedulePage';
import MessagesPage from './pages/MessagesPage';
import DocumentsPage from './pages/DocumentsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import DirectoryPage from './pages/DirectoryPage';
import UserManagementPage from './pages/UserManagementPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import LecturesPage from './pages/LecturesPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  const currentUser = useAppStore(state => state.currentUser);
  const shifts = useAppStore(state => state.shifts);
  const sendShiftNotification = useAppStore(state => state.sendShiftNotification);
  const sendEmailNotification = useAppStore(state => state.sendEmailNotification);
  
  // Check for upcoming shifts and send notifications
  useEffect(() => {
    if (!currentUser) return;
    
    // Only run if user has notification settings enabled
    if (!currentUser.notificationSettings?.notifyBeforeShift) return;
    
    const checkUpcomingShifts = () => {
      const now = new Date();
      const notificationHours = currentUser.notificationSettings?.notifyBeforeShiftHours || 24;
      
      // Get user's shifts
      const userShifts = shifts.filter(shift => 
        shift.userId === currentUser.id || shift.backupUserId === currentUser.id
      );
      
      userShifts.forEach(shift => {
        const shiftDate = parseISO(shift.date);
        const shiftTime = shift.startTime.split(':');
        const shiftDateTime = new Date(
          shiftDate.getFullYear(),
          shiftDate.getMonth(),
          shiftDate.getDate(),
          parseInt(shiftTime[0]),
          parseInt(shiftTime[1])
        );
        
        // Calculate notification time (e.g., 24 hours before shift)
        const notificationTime = new Date(shiftDateTime.getTime() - (notificationHours * 60 * 60 * 1000));
        
        // If current time is within 5 minutes of notification time, send notification
        const timeDiff = Math.abs(now.getTime() - notificationTime.getTime());
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeDiff <= fiveMinutes) {
          // Send in-app notification
          if (currentUser.notificationSettings?.pushNotifications) {
            sendShiftNotification({
              userId: currentUser.id,
              title: "Upcoming Shift Reminder",
              message: `Reminder: You have a shift ${shift.backupUserId === currentUser.id ? '(as backup) ' : ''}tomorrow at ${shift.startTime}`,
              shiftId: shift.id
            });
          }
          
          // Send email notification
          if (currentUser.notificationSettings?.emailNotifications) {
            sendEmailNotification({
              userId: currentUser.id,
              subject: "Upcoming Shift Reminder",
              message: `This is a reminder that you have a shift ${shift.backupUserId === currentUser.id ? 'as backup ' : ''}scheduled for tomorrow, ${shift.date}, from ${shift.startTime} to ${shift.endTime}.`,
              shiftId: shift.id
            });
          }
        }
      });
    };
    
    // Check immediately on login
    checkUpcomingShifts();
    
    // Then check periodically (every 15 minutes)
    const interval = setInterval(checkUpcomingShifts, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentUser, shifts, sendShiftNotification, sendEmailNotification]);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<SchedulePage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="directory" element={<DirectoryPage />} />
          <Route path="lectures" element={<LecturesPage />} />
          <Route path="admin/users" element={<UserManagementPage />} />
          <Route path="notifications" element={<NotificationSettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;