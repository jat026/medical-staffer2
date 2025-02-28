import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { Calendar, Plane, Check, X, AlertTriangle } from 'lucide-react';

const VacationManager: React.FC = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const users = useAppStore(state => state.users);
  const vacations = useAppStore(state => state.vacations);
  const addVacation = useAppStore(state => state.addVacation);
  const updateVacationStatus = useAppStore(state => state.updateVacationStatus);
  const deleteVacation = useAppStore(state => state.deleteVacation);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: currentUser?.id || '',
    startDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 14), 'yyyy-MM-dd')
  });
  const [error, setError] = useState('');
  
  const isAdmin = currentUser?.role === 'admin';
  
  // Filter vacations based on user role
  const filteredVacations = isAdmin 
    ? vacations 
    : vacations.filter(v => v.userId === currentUser?.id);
  
  // Sort vacations by start date (newest first)
  const sortedVacations = [...filteredVacations].sort((a, b) => 
    parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
  );
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate dates
    const startDate = parseISO(formData.startDate);
    const endDate = parseISO(formData.endDate);
    const today = new Date();
    
    if (isBefore(startDate, today)) {
      setError('Start date cannot be in the past');
      return;
    }
    
    if (isBefore(endDate, startDate)) {
      setError('End date must be after start date');
      return;
    }
    
    // Submit vacation request
    addVacation({
      userId: formData.userId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'pending'
    });
    
    // Reset form
    setFormData({
      userId: currentUser?.id || '',
      startDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 14), 'yyyy-MM-dd')
    });
    
    setShowAddForm(false);
  };
  
  // Handle vacation approval
  const handleApprove = (vacationId: string) => {
    updateVacationStatus(vacationId, 'approved');
  };
  
  // Handle vacation rejection
  const handleReject = (vacationId: string) => {
    updateVacationStatus(vacationId, 'rejected');
  };
  
  // Handle vacation deletion
  const handleDelete = (vacationId: string) => {
    deleteVacation(vacationId);
  };
  
  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Vacation Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? 'Manage all staff vacation requests' : 'Request and view your vacation time'}
          </p>
        </div>
        
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plane className="h-4 w-4 mr-1" />
            {isAdmin ? 'Add Vacation' : 'Request Vacation'}
          </button>
        )}
      </div>
      
      {showAddForm && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-md font-medium text-gray-900 mb-3">
            {isAdmin ? 'Add Vacation Time' : 'Request Vacation Time'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isAdmin && (
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                    Staff Member
                  </label>
                  <select
                    id="userId"
                    name="userId"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.userId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a staff member</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="mt-3 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                {error}
              </div>
            )}
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isAdmin ? 'Add Vacation' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isAdmin && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedVacations.length > 0 ? (
              sortedVacations.map(vacation => {
                const startDate = parseISO(vacation.startDate);
                const endDate = parseISO(vacation.endDate);
                const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <tr key={vacation.id}>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {getUserName(vacation.userId)}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {durationDays} {durationDays === 1 ? 'day' : 'days'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(vacation.status)}`}>
                        {vacation.status.charAt(0).toUpperCase() + vacation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {isAdmin && vacation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(vacation.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReject(vacation.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {((currentUser?.id === vacation.userId && vacation.status === 'pending') || isAdmin) && (
                          <button
                            onClick={() => handleDelete(vacation.id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No vacation records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VacationManager;