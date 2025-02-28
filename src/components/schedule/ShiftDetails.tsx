import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X, RefreshCw, AlertTriangle, Shield, Bell } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ShiftDetailsProps {
  shiftId: string;
  onClose: () => void;
}

const ShiftDetails: React.FC<ShiftDetailsProps> = ({ shiftId, onClose }) => {
  const shift = useAppStore(state => state.shifts.find(s => s.id === shiftId));
  const users = useAppStore(state => state.users);
  const currentUser = useAppStore(state => state.currentUser);
  const swapRequests = useAppStore(state => 
    state.swapRequests.filter(sr => sr.shiftId === shiftId)
  );
  const sendShiftNotification = useAppStore(state => state.sendShiftNotification);
  const sendEmailNotification = useAppStore(state => state.sendEmailNotification);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBackupId, setSelectedBackupId] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  
  const requestSwap = useAppStore(state => state.requestSwap);
  const approveSwap = useAppStore(state => state.approveSwap);
  const rejectSwap = useAppStore(state => state.rejectSwap);
  const updateShift = useAppStore(state => state.updateShift);
  
  if (!shift || !currentUser) return null;
  
  const assignedUser = users.find(u => u.id === shift.userId);
  const backupUser = shift.backupUserId ? users.find(u => u.id === shift.backupUserId) : null;
  
  const isUserAssigned = currentUser.id === shift.userId;
  const isUserBackup = currentUser.id === shift.backupUserId;
  const isAdmin = currentUser.role === 'admin';
  
  const pendingSwapRequest = swapRequests.find(sr => 
    sr.status === 'pending' && sr.shiftId === shiftId
  );
  
  const handleRequestSwap = () => {
    if (!selectedUserId || !currentUser) return;
    
    requestSwap(shiftId, currentUser.id, selectedUserId);
    onClose();
  };
  
  const handleApproveSwap = (swapRequestId: string) => {
    approveSwap(swapRequestId);
    onClose();
  };
  
  const handleRejectSwap = (swapRequestId: string) => {
    rejectSwap(swapRequestId);
    onClose();
  };
  
  const handleUpdateBackup = () => {
    if (!selectedBackupId) return;
    
    updateShift(shiftId, { backupUserId: selectedBackupId });
    onClose();
  };
  
  const handleSendReminder = () => {
    if (!assignedUser) return;
    
    // Send in-app notification
    sendShiftNotification({
      userId: assignedUser.id,
      title: "Shift Reminder",
      message: `Reminder: You have a shift scheduled on ${format(parseISO(shift.date), 'EEEE, MMMM d, yyyy')} from ${shift.startTime} to ${shift.endTime}`,
      shiftId: shift.id
    });
    
    // Send email notification
    sendEmailNotification({
      userId: assignedUser.id,
      subject: "Shift Reminder",
      message: `This is a reminder that you have a shift scheduled on ${format(parseISO(shift.date), 'EEEE, MMMM d, yyyy')} from ${shift.startTime} to ${shift.endTime}.`,
      shiftId: shift.id
    });
    
    // If there's a backup, notify them too
    if (backupUser) {
      sendShiftNotification({
        userId: backupUser.id,
        title: "Backup Shift Reminder",
        message: `Reminder: You are assigned as backup for Dr. ${assignedUser.name} on ${format(parseISO(shift.date), 'EEEE, MMMM d, yyyy')} from ${shift.startTime} to ${shift.endTime}`,
        shiftId: shift.id
      });
      
      sendEmailNotification({
        userId: backupUser.id,
        subject: "Backup Shift Reminder",
        message: `This is a reminder that you are assigned as backup for Dr. ${assignedUser.name} on ${format(parseISO(shift.date), 'EEEE, MMMM d, yyyy')} from ${shift.startTime} to ${shift.endTime}.`,
        shiftId: shift.id
      });
    }
    
    setNotificationSent(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setNotificationSent(false);
    }, 3000);
  };
  
  // Filter out the current user and already assigned users from the swap options
  const swapOptions = users.filter(user => 
    user.id !== currentUser.id && 
    user.id !== shift.userId && 
    user.id !== shift.backupUserId &&
    user.role === 'physician'
  );
  
  // Filter backup options to only include users marked as backup providers
  const backupOptions = users.filter(user => 
    user.isBackup && 
    user.id !== shift.userId &&
    user.role === 'physician'
  );
  
  // Check if the assigned user requires backup
  const userRequiresBackup = assignedUser?.requiresBackup;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Shift Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{format(parseISO(shift.date), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{shift.startTime} - {shift.endTime}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500">Assigned To</p>
            <div className="flex items-center">
              <p className="font-medium">{assignedUser?.name || 'Unassigned'}</p>
              {userRequiresBackup && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Requires Backup
                </span>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500">Backup</p>
            {backupUser ? (
              <div className="flex items-center">
                <p className="font-medium">{backupUser.name}</p>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Backup Provider
                </span>
              </div>
            ) : (
              <p className="font-medium text-gray-500">No backup assigned</p>
            )}
          </div>
          
          {(isAdmin || isUserAssigned || isUserBackup) && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={notificationSent}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Bell className="h-4 w-4 mr-1" />
                {notificationSent ? 'Notification Sent!' : 'Send Reminder'}
              </button>
            </div>
          )}
          
          {userRequiresBackup && !backupUser && isAdmin && (
            <div className="mb-6 p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-sm font-medium text-yellow-800">Backup Required</p>
              </div>
              <p className="text-sm mt-1">
                This physician requires a backup doctor. Please assign one.
              </p>
              
              <div className="mt-3">
                <label htmlFor="backupUser" className="block text-sm font-medium text-gray-700">
                  Select Backup Physician
                </label>
                <select
                  id="backupUser"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedBackupId}
                  onChange={(e) => setSelectedBackupId(e.target.value)}
                >
                  <option value="">Select a backup physician</option>
                  {backupOptions.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={handleUpdateBackup}
                  disabled={!selectedBackupId}
                  className="mt-2 w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Assign Backup
                </button>
              </div>
            </div>
          )}
          
          {pendingSwapRequest && (
            <div className="mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-sm font-medium text-yellow-800">Pending Swap Request</p>
              </div>
              <p className="text-sm mt-1">
                {users.find(u => u.id === pendingSwapRequest.requestedById)?.name} has requested to swap with {users.find(u => u.id === pendingSwapRequest.requestedToId)?.name}
              </p>
              
              {pendingSwapRequest.requestedToId === currentUser.id && (
                <div className="mt-3 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleApproveSwap(pendingSwapRequest.id)}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md hover:bg-green-200"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectSwap(pendingSwapRequest.id)}
                    className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-md hover:bg-red-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}
          
          {(isUserAssigned || isAdmin) && !pendingSwapRequest && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Request Shift Swap</h4>
              <div className="mb-3">
                <label htmlFor="swapUser" className="block text-sm font-medium text-gray-700">
                  Select Physician
                </label>
                <select
                  id="swapUser"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select a physician</option>
                  {swapOptions.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="button"
                onClick={handleRequestSwap}
                disabled={!selectedUserId}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Request Swap
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftDetails;