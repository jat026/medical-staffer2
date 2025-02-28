import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { format, parseISO, isToday, isTomorrow, isThisWeek, isAfter } from 'date-fns';
import ShiftDetails from './ShiftDetails';

const ShiftList: React.FC = () => {
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'future'>('all');
  
  const shifts = useAppStore(state => state.shifts);
  const users = useAppStore(state => state.users);
  const currentUser = useAppStore(state => state.currentUser);
  
  // Filter shifts based on the selected filter
  const filteredShifts = shifts.filter(shift => {
    const shiftDate = parseISO(shift.date);
    
    switch (filter) {
      case 'today':
        return isToday(shiftDate);
      case 'tomorrow':
        return isTomorrow(shiftDate);
      case 'week':
        return isThisWeek(shiftDate, { weekStartsOn: 1 });
      case 'future':
        return isAfter(shiftDate, new Date());
      default:
        return true;
    }
  });
  
  // Sort shifts by date (ascending)
  const sortedShifts = [...filteredShifts].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };
  
  // Handle shift click
  const handleShiftClick = (shiftId: string) => {
    setSelectedShiftId(shiftId);
  };
  
  // Close shift details modal
  const closeShiftDetails = () => {
    setSelectedShiftId(null);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'swapRequested':
        return 'bg-yellow-100 text-yellow-800';
      case 'swapApproved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filter tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { key: 'all', label: 'All Shifts' },
            { key: 'today', label: 'Today' },
            { key: 'tomorrow', label: 'Tomorrow' },
            { key: 'week', label: 'This Week' },
            { key: 'future', label: 'Future' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Shifts list */}
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {sortedShifts.length > 0 ? (
            sortedShifts.map((shift) => (
              <li
                key={shift.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleShiftClick(shift.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(parseISO(shift.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">
                      {getUserName(shift.userId)}
                    </span>
                    {shift.backupUserId && (
                      <span className="text-xs text-gray-500">
                        Backup: {getUserName(shift.backupUserId)}
                      </span>
                    )}
                    <span className={`mt-1 px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(shift.status)}`}>
                      {shift.status === 'swapRequested' ? 'Swap Requested' : 
                       shift.status === 'swapApproved' ? 'Swap Approved' :
                       shift.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">No shifts found for the selected filter.</p>
            </li>
          )}
        </ul>
      </div>
      
      {/* Shift details modal */}
      {selectedShiftId && (
        <ShiftDetails
          shiftId={selectedShiftId}
          onClose={closeShiftDetails}
        />
      )}
    </div>
  );
};

export default ShiftList;