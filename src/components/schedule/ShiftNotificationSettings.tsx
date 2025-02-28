import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Bell, Mail, Clock, Calendar, Check, X } from 'lucide-react';

const ShiftNotificationSettings: React.FC = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const updateUserNotificationSettings = useAppStore(state => state.updateUserNotificationSettings);
  
  const [settings, setSettings] = useState({
    emailNotifications: currentUser?.notificationSettings?.emailNotifications ?? true,
    pushNotifications: currentUser?.notificationSettings?.pushNotifications ?? true,
    notifyBeforeShift: currentUser?.notificationSettings?.notifyBeforeShift ?? true,
    notifyBeforeShiftHours: currentUser?.notificationSettings?.notifyBeforeShiftHours ?? 24,
    weeklyScheduleReminder: currentUser?.notificationSettings?.weeklyScheduleReminder ?? true,
    shiftSwapNotifications: currentUser?.notificationSettings?.shiftSwapNotifications ?? true,
    vacationApprovalNotifications: currentUser?.notificationSettings?.vacationApprovalNotifications ?? true
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Update user notification settings
    if (currentUser) {
      updateUserNotificationSettings(currentUser.id, settings);
      
      // Simulate API call
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }, 800);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize how you receive notifications about your shifts
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Your notification settings have been saved successfully.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-500" />
              Notification Methods
            </h3>
            
            <div className="ml-7 space-y-3">
              <div className="flex items-center">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                  Email notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="pushNotifications"
                  name="pushNotifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.pushNotifications}
                  onChange={handleChange}
                />
                <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
                  In-app notifications
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Shift Reminders
            </h3>
            
            <div className="ml-7 space-y-3">
              <div className="flex items-center">
                <input
                  id="notifyBeforeShift"
                  name="notifyBeforeShift"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifyBeforeShift}
                  onChange={handleChange}
                />
                <label htmlFor="notifyBeforeShift" className="ml-2 block text-sm text-gray-900">
                  Notify me before my shifts
                </label>
              </div>
              
              {settings.notifyBeforeShift && (
                <div className="flex items-center ml-6">
                  <label htmlFor="notifyBeforeShiftHours" className="block text-sm text-gray-700 mr-2">
                    Hours before shift:
                  </label>
                  <input
                    id="notifyBeforeShiftHours"
                    name="notifyBeforeShiftHours"
                    type="number"
                    min="1"
                    max="72"
                    className="w-16 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={settings.notifyBeforeShiftHours}
                    onChange={handleChange}
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  id="weeklyScheduleReminder"
                  name="weeklyScheduleReminder"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.weeklyScheduleReminder}
                  onChange={handleChange}
                />
                <label htmlFor="weeklyScheduleReminder" className="ml-2 block text-sm text-gray-900">
                  Send me a weekly schedule reminder
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-500" />
              Other Notifications
            </h3>
            
            <div className="ml-7 space-y-3">
              <div className="flex items-center">
                <input
                  id="shiftSwapNotifications"
                  name="shiftSwapNotifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.shiftSwapNotifications}
                  onChange={handleChange}
                />
                <label htmlFor="shiftSwapNotifications" className="ml-2 block text-sm text-gray-900">
                  Notify me about shift swap requests
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="vacationApprovalNotifications"
                  name="vacationApprovalNotifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.vacationApprovalNotifications}
                  onChange={handleChange}
                />
                <label htmlFor="vacationApprovalNotifications" className="ml-2 block text-sm text-gray-900">
                  Notify me about vacation request status changes
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShiftNotificationSettings;