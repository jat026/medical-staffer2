import React from 'react';
import ShiftNotificationSettings from '../components/schedule/ShiftNotificationSettings';
import ShiftNotificationCenter from '../components/schedule/ShiftNotificationCenter';

const NotificationSettingsPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage how you receive notifications about your shifts and schedule
        </p>
      </div>
      
      <div className="space-y-6">
        <ShiftNotificationCenter />
        <ShiftNotificationSettings />
      </div>
    </div>
  );
};

export default NotificationSettingsPage;