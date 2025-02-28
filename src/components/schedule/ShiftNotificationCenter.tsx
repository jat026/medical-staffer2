import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { format, parseISO, addHours } from 'date-fns';
import { Bell, Calendar, RefreshCw, Check, X, Mail } from 'lucide-react';

const ShiftNotificationCenter: React.FC = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const shifts = useAppStore(state => state.shifts);
  const notifications = useAppStore(state => state.notifications);
  const sendShiftNotification = useAppStore(state => state.sendShiftNotification);
  const sendEmailNotification = useAppStore(state => state.sendEmailNotification);
  
  const [showSendTestNotification, setShowSendTestNotification] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  
  // Filter shifts for the current user
  const userShifts = shifts.filter(shift => 
    shift.userId === currentUser?.id || shift.backupUserId === currentUser?.id
  );
  
  // Sort shifts by date (ascending)
  const sortedShifts = [...userShifts].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Get upcoming shifts (next 7 days)
  const today = new Date();
  const nextWeek = addHours(today, 24 * 7);
  
  const upcomingShifts = sortedShifts.filter(shift => {
    const shiftDate = parseISO(shift.date);
    return shiftDate >= today && shiftDate <= nextWeek;
  });
  
  // Filter notifications related to shifts
  const shiftNotifications = notifications.filter(notification => 
    notification.userId === currentUser?.id && 
    (notification.type === 'shift' || notification.type === 'swap')
  );
  
  // Sort notifications by date (newest first)
  const sortedNotifications = [...shiftNotifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Send test notification
  const handleSendTestNotification = () => {
    if (!currentUser) return;
    
    // Send in-app notification
    sendShiftNotification({
      userId: currentUser.id,
      title: "Test Shift Notification",
      message: "This is a test shift notification. You would receive similar notifications before your actual shifts.",
      shiftId: upcomingShifts.length > 0 ? upcomingShifts[0].id : undefined
    });
    
    setTestNotificationSent(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setTestNotificationSent(false);
    }, 3000);
  };
  
  // Send test email
  const handleSendTestEmail = () => {
    if (!currentUser) return;
    
    // Send email notification
    sendEmailNotification({
      userId: currentUser.id,
      subject: "Test Shift Email Notification",
      message: "This is a test email notification. You would receive similar emails before your actual shifts.",
      shiftId: upcomingShifts.length > 0 ? upcomingShifts[0].id : undefined
    });
    
    setTestEmailSent(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setTestEmailSent(false);
    }, 3000);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Shift Notifications</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage notifications about your upcoming shifts
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => setShowSendTestNotification(!showSendTestNotification)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Bell className="h-4 w-4 mr-1" />
          Test Notifications
        </button>
      </div>
      
      {showSendTestNotification && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Send Test Notifications</h3>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Bell className="h-4 w-4 mr-1" />
              Send Test In-App Notification
            </button>
            
            <button
              type="button"
              onClick={handleSendTestEmail}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Mail className="h-4 w-4 mr-1" />
              Send Test Email
            </button>
          </div>
          
          {testNotificationSent && (
            <div className="mt-3 text-sm text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Test notification sent successfully! Check your notification center.
            </div>
          )}
          
          {testEmailSent && (
            <div className="mt-3 text-sm text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Test email sent successfully! Check your email inbox.
            </div>
          )}
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        <div className="px-6 py-4">
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming Shifts
          </h3>
          
          {upcomingShifts.length > 0 ? (
            <ul className="space-y-3">
              {upcomingShifts.map(shift => (
                <li key={shift.id} className="bg-blue-50 rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(shift.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {shift.startTime} - {shift.endTime}
                      </p>
                      {shift.backupUserId === currentUser?.id && (
                        <p className="text-xs text-blue-600 mt-1">
                          You are assigned as backup for this shift
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {shift.status === 'swapRequested' ? 'Swap Requested' : 
                       shift.status === 'swapApproved' ? 'Swap Approved' :
                       shift.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No upcoming shifts in the next 7 days.
            </p>
          )}
        </div>
        
        <div className="px-6 py-4">
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-500" />
            Recent Notifications
          </h3>
          
          {sortedNotifications.length > 0 ? (
            <ul className="space-y-3">
              {sortedNotifications.slice(0, 5).map(notification => (
                <li key={notification.id} className={`rounded-md p-3 ${notification.isRead ? 'bg-gray-50' : 'bg-yellow-50'}`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {notification.type === 'shift' ? (
                        <Calendar className="h-5 w-5 text-blue-500" />
                      ) : (
                        <RefreshCw className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      {notification.title && (
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                      )}
                      <p className="text-sm text-gray-700">
                        {notification.content}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No recent shift notifications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftNotificationCenter;