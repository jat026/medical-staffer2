import React, { useState } from 'react';
import Calendar from '../components/schedule/Calendar';
import ShiftList from '../components/schedule/ShiftList';
import ShiftGenerator from '../components/schedule/ShiftGenerator';
import VacationManager from '../components/schedule/VacationManager';
import UserShiftsExport from '../components/schedule/UserShiftsExport';
import { CalendarDays, List, PlusCircle, Plane } from 'lucide-react';
import { useAppStore } from '../store';

const SchedulePage: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'list' | 'generator' | 'vacations'>('calendar');
  const currentUser = useAppStore(state => state.currentUser);
  const isAdmin = currentUser?.role === 'admin';
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Duty Roster</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage the medical staff schedule
        </p>
      </div>
      
      {/* User's shifts with export functionality */}
      <UserShiftsExport />
      
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
              view === 'calendar'
                ? 'bg-blue-50 text-blue-700 z-10'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="h-5 w-5 mr-2" />
            Calendar View
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${
              view === 'list'
                ? 'bg-blue-50 text-blue-700 z-10'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="h-5 w-5 mr-2" />
            List View
          </button>
          <button
            type="button"
            onClick={() => setView('vacations')}
            className={`relative inline-flex items-center px-4 py-2 border-t border-b border-r border-gray-300 text-sm font-medium ${
              view === 'vacations'
                ? 'bg-blue-50 text-blue-700 z-10'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plane className="h-5 w-5 mr-2" />
            Vacations
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setView('generator')}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                view === 'generator'
                  ? 'bg-blue-50 text-blue-700 z-10'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Generate Shifts
            </button>
          )}
        </div>
      </div>
      
      {view === 'calendar' && <Calendar />}
      {view === 'list' && <ShiftList />}
      {view === 'generator' && isAdmin && <ShiftGenerator />}
      {view === 'vacations' && <VacationManager />}
    </div>
  );
};

export default SchedulePage;