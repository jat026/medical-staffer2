import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, isWeekend, addWeeks, subWeeks } from 'date-fns';
import { useAppStore } from '../../store';
import { ChevronLeft, ChevronRight, AlertTriangle, Shield } from 'lucide-react';
import ShiftDetails from './ShiftDetails';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  
  const shifts = useAppStore(state => state.shifts);
  const users = useAppStore(state => state.users);
  
  // Get the start of the current week
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  
  // Generate the days of the week
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  
  // Filter out weekend days (Saturday and Sunday) if needed
  const displayDays = weekDays;
  
  // Format the month and year for the header
  const monthYear = format(currentDate, 'MMMM yyyy');
  
  // Navigate to previous week
  const prevWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };
  
  // Navigate to next week
  const nextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };
  
  // Get shifts for a specific day
  const getShiftsForDay = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return shifts.filter(shift => shift.date === formattedDate);
  };
  
  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };
  
  // Check if user requires backup
  const userRequiresBackup = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.requiresBackup || false;
  };
  
  // Handle shift click
  const handleShiftClick = (shiftId: string) => {
    setSelectedShiftId(shiftId);
  };
  
  // Close shift details modal
  const closeShiftDetails = () => {
    setSelectedShiftId(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">{monthYear}</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={prevWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={nextWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-b">
        {/* Day headers */}
        {displayDays.map((day, i) => (
          <div
            key={i}
            className={`px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r last:border-r-0 ${
              isWeekend(day) ? 'bg-gray-50' : ''
            }`}
          >
            <div>{format(day, 'EEEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
        ))}
      </div>
      
      {/* Shift grid */}
      <div className="grid grid-cols-7 h-96 overflow-y-auto">
        {displayDays.map((day, i) => {
          const dayShifts = getShiftsForDay(day);
          return (
            <div
              key={i}
              className={`border-r last:border-r-0 p-2 min-h-full ${
                isWeekend(day) ? 'bg-gray-50' : ''
              }`}
            >
              {dayShifts.length > 0 ? (
                dayShifts.map(shift => {
                  const needsBackup = userRequiresBackup(shift.userId);
                  const hasBackup = !!shift.backupUserId;
                  const warningNeeded = needsBackup && !hasBackup;
                  
                  return (
                    <div
                      key={shift.id}
                      onClick={() => handleShiftClick(shift.id)}
                      className={`mb-2 p-2 rounded text-sm cursor-pointer ${
                        shift.status === 'swapRequested'
                          ? 'bg-yellow-100 border border-yellow-300'
                          : shift.status === 'swapApproved'
                          ? 'bg-green-100 border border-green-300'
                          : warningNeeded
                          ? 'bg-red-100 border border-red-300'
                          : 'bg-blue-100 border border-blue-300'
                      }`}
                    >
                      <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
                      <div className="flex items-center">
                        {getUserName(shift.userId)}
                        {needsBackup && (
                          <AlertTriangle className="h-3 w-3 ml-1 text-yellow-500" title="Requires backup" />
                        )}
                      </div>
                      {shift.backupUserId && (
                        <div className="text-xs text-gray-600 flex items-center">
                          <Shield className="h-3 w-3 mr-1 text-blue-500" />
                          Backup: {getUserName(shift.backupUserId)}
                        </div>
                      )}
                      {warningNeeded && (
                        <div className="text-xs text-red-600 mt-1">
                          Backup needed!
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  No shifts scheduled
                </div>
              )}
            </div>
          );
        })}
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

export default Calendar;