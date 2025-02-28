import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { format, addDays, addMonths, startOfMonth, endOfMonth, isWeekend, parseISO } from 'date-fns';
import { Calendar, Users, AlertTriangle, Shield, RefreshCw, Check, X, Plane } from 'lucide-react';

const ShiftGenerator: React.FC = () => {
  const users = useAppStore(state => state.users);
  const addShift = useAppStore(state => state.addShift);
  const shifts = useAppStore(state => state.shifts);
  const vacations = useAppStore(state => state.vacations);
  const isUserOnVacation = useAppStore(state => state.isUserOnVacation);
  
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [numMonths, setNumMonths] = useState<number>(3);
  const [shiftStartTime, setShiftStartTime] = useState<string>('08:00');
  const [shiftEndTime, setShiftEndTime] = useState<string>('21:00');
  const [fridayEndTime, setFridayEndTime] = useState<string>('16:00');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewShifts, setPreviewShifts] = useState<any[]>([]);
  const [distributionStrategy, setDistributionStrategy] = useState<'equal' | 'weighted' | 'availability'>('equal');
  const [weekendShifts, setWeekendShifts] = useState<boolean>(false);
  const [respectVacations, setRespectVacations] = useState<boolean>(true);
  const [respectShielding, setRespectShielding] = useState<boolean>(true);
  
  // Filter doctors who are approved
  const availableDoctors = users.filter(user => 
    user.role === 'physician' && user.isApproved
  );
  
  // Filter backup doctors
  const backupDoctors = users.filter(user => 
    user.isBackup && user.isApproved
  );
  
  // Toggle doctor selection
  const toggleDoctorSelection = (doctorId: string) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };
  
  // Select all doctors
  const selectAllDoctors = () => {
    setSelectedDoctors(availableDoctors.map(doctor => doctor.id));
  };
  
  // Deselect all doctors
  const deselectAllDoctors = () => {
    setSelectedDoctors([]);
  };
  
  // Get doctor vacation status
  const getDoctorVacationStatus = (doctorId: string, date: string) => {
    return vacations.find(v => 
      v.userId === doctorId && 
      v.status === 'approved' &&
      parseISO(date) >= parseISO(v.startDate) &&
      parseISO(date) <= parseISO(v.endDate)
    );
  };
  
  // Check if doctor is shielded
  const isDoctorShielded = (doctorId: string, date: string) => {
    const doctor = users.find(u => u.id === doctorId);
    if (!doctor || !doctor.isShielded) return false;
    
    // If no end date, doctor is permanently shielded
    if (!doctor.shieldEndDate) return true;
    
    // Check if current date is before shield end date
    return parseISO(date) <= parseISO(doctor.shieldEndDate);
  };
  
  // Generate preview shifts
  const generatePreview = () => {
    if (selectedDoctors.length === 0) {
      setErrorMessage('Please select at least one doctor');
      return;
    }
    
    setErrorMessage('');
    
    try {
      const start = parseISO(startDate);
      const end = addMonths(start, numMonths);
      
      let currentDate = start;
      const generatedShifts = [];
      
      // Check for existing shifts in the date range
      const existingDates = shifts.map(shift => shift.date);
      
      // Create a map of doctors to their shift counts for weighted distribution
      const doctorShiftCounts: Record<string, number> = {};
      selectedDoctors.forEach(doctorId => {
        doctorShiftCounts[doctorId] = 0;
      });
      
      // Assign shifts
      while (currentDate < end) {
        const formattedDate = format(currentDate, 'yyyy-MM-dd');
        
        // Skip weekends if not enabled
        if (isWeekend(currentDate) && !weekendShifts) {
          currentDate = addDays(currentDate, 1);
          continue;
        }
        
        // Skip dates that already have shifts
        if (existingDates.includes(formattedDate)) {
          currentDate = addDays(currentDate, 1);
          continue;
        }
        
        // Determine end time based on day of week (Friday)
        const isFriday = format(currentDate, 'E') === '5';
        const endTime = isFriday ? fridayEndTime : shiftEndTime;
        
        // Get available doctors for this date (not on vacation or shielded)
        let availableDoctorsForDate = [...selectedDoctors];
        
        if (respectVacations) {
          availableDoctorsForDate = availableDoctorsForDate.filter(doctorId => 
            !isUserOnVacation(doctorId, formattedDate)
          );
        }
        
        if (respectShielding) {
          availableDoctorsForDate = availableDoctorsForDate.filter(doctorId => 
            !isDoctorShielded(doctorId, formattedDate)
          );
        }
        
        // If no doctors are available for this date, skip it
        if (availableDoctorsForDate.length === 0) {
          currentDate = addDays(currentDate, 1);
          continue;
        }
        
        // Select doctor based on distribution strategy
        let selectedDoctorId: string;
        
        if (distributionStrategy === 'equal') {
          // Simple round-robin among available doctors
          const availableIndex = generatedShifts.length % availableDoctorsForDate.length;
          selectedDoctorId = availableDoctorsForDate[availableIndex];
        } else if (distributionStrategy === 'weighted') {
          // Assign to doctor with fewest shifts
          const sortedDoctors = [...availableDoctorsForDate].sort(
            (a, b) => doctorShiftCounts[a] - doctorShiftCounts[b]
          );
          selectedDoctorId = sortedDoctors[0];
        } else {
          // For 'availability' we'd need actual availability data
          // For now, just use equal distribution
          const availableIndex = generatedShifts.length % availableDoctorsForDate.length;
          selectedDoctorId = availableDoctorsForDate[availableIndex];
        }
        
        // Increment shift count for the selected doctor
        doctorShiftCounts[selectedDoctorId] = (doctorShiftCounts[selectedDoctorId] || 0) + 1;
        
        // Find if doctor requires backup
        const doctor = users.find(u => u.id === selectedDoctorId);
        let backupDoctorId: string | undefined = undefined;
        
        if (doctor?.requiresBackup) {
          // Find an available backup doctor (not on vacation or shielded)
          let availableBackups = backupDoctors.filter(d => d.id !== selectedDoctorId);
          
          if (respectVacations) {
            availableBackups = availableBackups.filter(d => 
              !isUserOnVacation(d.id, formattedDate)
            );
          }
          
          if (respectShielding) {
            availableBackups = availableBackups.filter(d => 
              !isDoctorShielded(d.id, formattedDate)
            );
          }
          
          if (availableBackups.length > 0) {
            // Rotate through available backups
            const backupIndex = generatedShifts.length % availableBackups.length;
            backupDoctorId = availableBackups[backupIndex].id;
          }
        }
        
        generatedShifts.push({
          date: formattedDate,
          startTime: shiftStartTime,
          endTime: endTime,
          userId: selectedDoctorId,
          backupUserId: backupDoctorId,
          status: 'scheduled'
        });
        
        currentDate = addDays(currentDate, 1);
      }
      
      setPreviewShifts(generatedShifts);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating shifts:', error);
      setErrorMessage('Error generating shifts. Please check your inputs.');
    }
  };
  
  // Generate and save shifts
  const generateShifts = () => {
    setIsGenerating(true);
    setErrorMessage('');
    
    try {
      // Add each shift to the store
      previewShifts.forEach(shift => {
        addShift(shift);
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setShowPreview(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving shifts:', error);
      setErrorMessage('Error saving shifts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Get doctor name by ID
  const getDoctorName = (doctorId: string) => {
    const doctor = users.find(u => u.id === doctorId);
    return doctor ? doctor.name : 'Unknown';
  };
  
  // Check if doctor is on vacation for a specific date
  const isDoctorOnVacation = (doctorId: string, date: string) => {
    return isUserOnVacation(doctorId, date);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Shift Generator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Generate shifts for multiple months at once
        </p>
      </div>
      
      <div className="p-6">
        {isSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Generated {previewShifts.length} shifts successfully.</p>
                </div>
              </div>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        {!showPreview ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="numMonths" className="block text-sm font-medium text-gray-700">
                  Number of Months
                </label>
                <select
                  id="numMonths"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={numMonths}
                  onChange={(e) => setNumMonths(parseInt(e.target.value))}
                >
                  <option value={1}>1 Month</option>
                  <option value={2}>2 Months</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="shiftStartTime" className="block text-sm font-medium text-gray-700">
                  Shift Start Time
                </label>
                <input
                  type="time"
                  id="shiftStartTime"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={shiftStartTime}
                  onChange={(e) => setShiftStartTime(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="shiftEndTime" className="block text-sm font-medium text-gray-700">
                  Shift End Time (Mon-Thu)
                </label>
                <input
                  type="time"
                  id="shiftEndTime"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={shiftEndTime}
                  onChange={(e) => setShiftEndTime(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="fridayEndTime" className="block text-sm font-medium text-gray-700">
                  Friday End Time
                </label>
                <input
                  type="time"
                  id="fridayEndTime"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={fridayEndTime}
                  onChange={(e) => setFridayEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="distributionStrategy" className="block text-sm font-medium text-gray-700">
                Distribution Strategy
              </label>
              <select
                id="distributionStrategy"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={distributionStrategy}
                onChange={(e) => setDistributionStrategy(e.target.value as any)}
              >
                <option value="equal">Equal Distribution (Round Robin)</option>
                <option value="weighted">Weighted (Balance Total Shifts)</option>
                <option value="availability">Based on Availability</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {distributionStrategy === 'equal' && 'Distributes shifts equally among selected doctors in sequence.'}
                {distributionStrategy === 'weighted' && 'Assigns more shifts to doctors with fewer total shifts.'}
                {distributionStrategy === 'availability' && 'Assigns shifts based on doctor availability (requires availability data).'}
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <input
                  id="weekendShifts"
                  name="weekendShifts"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={weekendShifts}
                  onChange={(e) => setWeekendShifts(e.target.checked)}
                />
                <label htmlFor="weekendShifts" className="ml-2 block text-sm text-gray-900">
                  Include weekend shifts
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="respectVacations"
                  name="respectVacations"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={respectVacations}
                  onChange={(e) => setRespectVacations(e.target.checked)}
                />
                <label htmlFor="respectVacations" className="ml-2 block text-sm text-gray-900">
                  Respect vacation schedules (don't assign shifts to doctors on vacation)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="respectShielding"
                  name="respectShielding"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={respectShielding}
                  onChange={(e) => setRespectShielding(e.target.checked)}
                />
                <label htmlFor="respectShielding" className="ml-2 block text-sm text-gray-900">
                  Respect shielding status (don't assign shifts to shielded doctors)
                </label>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Doctors
                </label>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={selectAllDoctors}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllDoctors}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              <div className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {availableDoctors.map(doctor => {
                    // Check if doctor has any approved vacations
                    const hasVacations = vacations.some(v => 
                      v.userId === doctor.id && v.status === 'approved'
                    );
                    
                    return (
                      <li
                        key={doctor.id}
                        className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                          doctor.requiresBackup ? 'bg-yellow-50' : doctor.isShielded ? 'bg-purple-50' : ''
                        }`}
                        onClick={() => toggleDoctorSelection(doctor.id)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectedDoctors.includes(doctor.id)}
                            onChange={() => {}} // Handled by the li click
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="ml-3 flex items-center">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={doctor.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                              alt=""
                            />
                            <div className="ml-2">
                              <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
                              <p className="text-xs text-gray-500">{doctor.specialty || 'No specialty'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {doctor.requiresBackup && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Requires Backup
                            </span>
                          )}
                          {doctor.isBackup && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Backup Provider
                            </span>
                          )}
                          {doctor.isShielded && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              <Calendar className="h-3 w-3 mr-1" />
                              Shielded
                            </span>
                          )}
                          {hasVacations && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <Plane className="h-3 w-3 mr-1" />
                              Has Vacations
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={generatePreview}
                disabled={selectedDoctors.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Preview Shifts
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Preview Generated Shifts
              </h3>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Back to Settings
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Backup
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewShifts.length > 0 ? (
                      previewShifts.map((shift, index) => {
                        const shiftDate = parseISO(shift.date);
                        const doctor = users.find(u => u.id === shift.userId);
                        const requiresBackup = doctor?.requiresBackup;
                        
                        return (
                          <tr key={index} className={requiresBackup && !shift.backupUserId ? 'bg-yellow-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {format(shiftDate, 'EEE, MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {shift.startTime} - {shift.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">
                                  {getDoctorName(shift.userId)}
                                </div>
                                {requiresBackup && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Needs Backup
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {shift.backupUserId ? (
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {getDoctorName(shift.backupUserId)}
                                  </div>
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Backup
                                  </span>
                                </div>
                              ) : requiresBackup ? (
                                <span className="text-red-500 text-sm">No backup assigned!</span>
                              ) : (
                                <span className="text-gray-500 text-sm">Not required</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          No shifts generated
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total shifts: <span className="font-medium">{previewShifts.length}</span>
                </p>
                {previewShifts.some(shift => {
                  const doctor = users.find(u => u.id === shift.userId);
                  return doctor?.requiresBackup && !shift.backupUserId;
                }) && (
                  <p className="text-sm text-red-500 mt-1">
                    Warning: Some doctors requiring backup don't have a backup assigned.
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={generateShifts}
                  disabled={isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Confirm & Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftGenerator;