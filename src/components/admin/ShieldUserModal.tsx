import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X, Calendar } from 'lucide-react';
import { format, addMonths } from 'date-fns';

interface ShieldUserModalProps {
  userId: string;
  onClose: () => void;
}

const ShieldUserModal: React.FC<ShieldUserModalProps> = ({ userId, onClose }) => {
  const users = useAppStore(state => state.users);
  const updateUser = useAppStore(state => state.updateUser);
  
  const user = users.find(u => u.id === userId);
  
  const [formData, setFormData] = useState({
    shieldReason: '',
    shieldEndDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
    hasEndDate: true
  });
  
  if (!user) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateUser(userId, {
      isShielded: true,
      shieldReason: formData.shieldReason,
      shieldEndDate: formData.hasEndDate ? formData.shieldEndDate : undefined
    });
    
    onClose();
  };
  
  const shieldReasons = [
    'Pregnancy',
    'Sick Leave',
    'Medical Condition',
    'Family Leave',
    'Administrative',
    'Other'
  ];
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Shield User from Shifts</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">User</p>
            <p className="font-medium">{user.name}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="shieldReason" className="block text-sm font-medium text-gray-700">
                Reason for Shielding
              </label>
              <select
                id="shieldReason"
                name="shieldReason"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.shieldReason}
                onChange={handleChange}
              >
                <option value="">Select a reason</option>
                {shieldReasons.map(reason => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              
              {formData.shieldReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify reason"
                  className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.shieldReason === 'Other' ? '' : formData.shieldReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, shieldReason: e.target.value }))}
                />
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="hasEndDate"
                name="hasEndDate"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.hasEndDate}
                onChange={handleChange}
              />
              <label htmlFor="hasEndDate" className="ml-2 block text-sm text-gray-900">
                Set end date for shielding period
              </label>
            </div>
            
            {formData.hasEndDate && (
              <div>
                <label htmlFor="shieldEndDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="shieldEndDate"
                    name="shieldEndDate"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    value={formData.shieldEndDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Shielded users will not be assigned to any shifts during the shielding period.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Shield User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShieldUserModal;