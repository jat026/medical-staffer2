import React from 'react';
import { useAppStore } from '../../store';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteUserConfirmModalProps {
  userId: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUserConfirmModal: React.FC<DeleteUserConfirmModalProps> = ({ userId, onClose, onConfirm }) => {
  const users = useAppStore(state => state.users);
  const shifts = useAppStore(state => state.shifts);
  
  const user = users.find(u => u.id === userId);
  
  // Check if user has any assigned shifts
  const userShifts = shifts.filter(shift => 
    shift.userId === userId || shift.backupUserId === userId
  );
  
  const hasShifts = userShifts.length > 0;
  
  if (!user) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="flex items-center mb-4 text-yellow-600">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span className="text-lg font-medium">Warning</span>
          </div>
          
          <p className="mb-4">
            Are you sure you want to delete the user <strong>{user.name}</strong>?
          </p>
          
          {hasShifts && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                This user has {userShifts.length} assigned shifts. Deleting this user will remove them from these shifts.
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. All data associated with this user will be permanently removed from the system.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserConfirmModal;