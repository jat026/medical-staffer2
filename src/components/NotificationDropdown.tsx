import React from 'react';
import { useAppStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageSquare, Calendar, ClipboardList, RefreshCw, Check, X, BookOpen } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const currentUser = useAppStore(state => state.currentUser);
  const notifications = useAppStore(state => 
    state.notifications.filter(n => n.userId === currentUser?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );
  const markNotificationAsRead = useAppStore(state => state.markNotificationAsRead);
  const clearNotifications = useAppStore(state => state.clearNotifications);
  
  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    // In a real app, we would navigate to the relevant page
    onClose();
  };
  
  const handleClearAll = () => {
    if (currentUser) {
      clearNotifications(currentUser.id);
    }
    onClose();
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'shift':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'announcement':
        return <ClipboardList className="h-5 w-5 text-purple-500" />;
      case 'swap':
        return <RefreshCw className="h-5 w-5 text-orange-500" />;
      case 'lecture':
        return <BookOpen className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <div 
      className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1 divide-y divide-gray-100">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={handleClearAll}
            >
              Clear all
            </button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    {notification.title && (
                      <p className={`text-sm ${!notification.isRead ? 'font-medium' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                    )}
                    <p className={`text-sm ${!notification.isRead ? 'font-medium' : 'text-gray-700'}`}>
                      {notification.content}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="ml-3 flex-shrink-0 flex">
                      <button
                        type="button"
                        className="bg-blue-100 rounded-full p-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notification.id);
                        }}
                      >
                        <span className="sr-only">Mark as read</span>
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;