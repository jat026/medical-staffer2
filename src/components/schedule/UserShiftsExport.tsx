import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { format, parseISO, addDays } from 'date-fns';
import { Calendar, Download, ChevronDown, ChevronUp, Filter } from 'lucide-react';

const UserShiftsExport: React.FC = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const shifts = useAppStore(state => state.shifts);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [expanded, setExpanded] = useState(true);
  
  if (!currentUser) return null;
  
  // Filter shifts for the current user
  const userShifts = shifts.filter(shift => 
    shift.userId === currentUser.id || shift.backupUserId === currentUser.id
  );
  
  // Filter shifts based on time range
  const filteredShifts = userShifts.filter(shift => {
    const shiftDate = parseISO(shift.date);
    const today = new Date();
    
    switch (timeRange) {
      case 'week':
        const oneWeekLater = addDays(today, 7);
        return shiftDate >= today && shiftDate <= oneWeekLater;
      case 'month':
        const oneMonthLater = addDays(today, 30);
        return shiftDate >= today && shiftDate <= oneMonthLater;
      case 'all':
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
  
  // Generate iCalendar file content
  const generateICalContent = () => {
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MedStaff//Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    
    sortedShifts.forEach(shift => {
      const shiftDate = parseISO(shift.date);
      const startDateTime = new Date(shiftDate);
      const [startHour, startMinute] = shift.startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0);
      
      const endDateTime = new Date(shiftDate);
      const [endHour, endMinute] = shift.endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0);
      
      // Format dates for iCal
      const formatICalDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      const isBackup = shift.backupUserId === currentUser.id;
      const summary = isBackup ? `[BACKUP] Medical Shift` : `Medical Shift`;
      const description = isBackup 
        ? `You are assigned as backup for this shift.` 
        : `Regular scheduled shift.`;
      
      icalContent = [
        ...icalContent,
        'BEGIN:VEVENT',
        `UID:shift-${shift.id}@medstaff.org`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${formatICalDate(startDateTime)}`,
        `DTEND:${formatICalDate(endDateTime)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:Medical Center`,
        'END:VEVENT'
      ];
    });
    
    icalContent.push('END:VCALENDAR');
    return icalContent.join('\r\n');
  };
  
  // Handle export to iCal
  const handleExport = () => {
    const icalContent = generateICalContent();
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `medstaff-shifts-${format(new Date(), 'yyyy-MM-dd')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Generate Google Calendar URL
  const generateGoogleCalendarUrl = (shift: typeof sortedShifts[0]) => {
    const shiftDate = parseISO(shift.date);
    
    // Set start and end times
    const startDateTime = new Date(shiftDate);
    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0);
    
    const endDateTime = new Date(shiftDate);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute, 0);
    
    // Format dates for Google Calendar
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
    };
    
    const isBackup = shift.backupUserId === currentUser.id;
    const title = isBackup ? `[BACKUP] Medical Shift` : `Medical Shift`;
    const details = isBackup 
      ? `You are assigned as backup for this shift.` 
      : `Regular scheduled shift.`;
    
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: details,
      location: 'Medical Center',
      dates: `${formatGoogleDate(startDateTime)}/${formatGoogleDate(endDateTime)}`
    });
    
    return `${baseUrl}?${params.toString()}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          My Upcoming Shifts
        </h2>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-500"
        >
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      
      {expanded && (
        <>
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700 mr-2">Show:</span>
              <select
                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
              >
                <option value="week">Next 7 days</option>
                <option value="month">Next 30 days</option>
                <option value="all">All shifts</option>
              </select>
            </div>
            
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={sortedShifts.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export All to Calendar
            </button>
          </div>
          
          <div className="overflow-hidden">
            {sortedShifts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {sortedShifts.map((shift) => (
                  <li key={shift.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(parseISO(shift.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {shift.startTime} - {shift.endTime}
                        </p>
                        {shift.backupUserId === currentUser.id && (
                          <p className="text-xs text-blue-600 mt-1">
                            You are assigned as backup for this shift
                          </p>
                        )}
                      </div>
                      <a
                        href={generateGoogleCalendarUrl(shift)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Add to Google Calendar
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-500">
                  No upcoming shifts found for the selected time range.
                </p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Export all shifts to your calendar app by clicking the "Export All to Calendar" button, or add individual shifts to Google Calendar using the links.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default UserShiftsExport;