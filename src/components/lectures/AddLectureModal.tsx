import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface AddLectureModalProps {
  onClose: () => void;
}

const AddLectureModal: React.FC<AddLectureModalProps> = ({ onClose }) => {
  const users = useAppStore(state => state.users);
  const currentUser = useAppStore(state => state.currentUser);
  const addLecture = useAppStore(state => state.addLecture);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    startTime: '12:00',
    endTime: '13:00',
    presenterId: '',
    location: 'Conference Room A',
    attendees: [] as string[]
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAttendeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        attendees: prev.attendees.filter(id => id !== value)
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    addLecture({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      presenterId: formData.presenterId,
      location: formData.location,
      attendees: formData.attendees,
      status: 'scheduled'
    });
    
    onClose();
  };
  
  // Filter users to only show physicians
  const physicians = users.filter(user => 
    user.role === 'physician' && user.isApproved
  );
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Schedule New Lecture</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Lecture Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="presenterId" className="block text-sm font-medium text-gray-700">
                Presenter
              </label>
              <select
                id="presenterId"
                name="presenterId"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.presenterId}
                onChange={handleChange}
              >
                <option value="">Select a presenter</option>
                {physicians.map(physician => (
                  <option key={physician.id} value={physician.id}>
                    {physician.name} ({physician.specialty || 'No specialty'})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendees
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                <div className="flex items-center mb-2">
                  <input
                    id="select-all"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Select all except presenter
                        const allExceptPresenter = physicians
                          .filter(p => p.id !== formData.presenterId)
                          .map(p => p.id);
                        setFormData(prev => ({ ...prev, attendees: allExceptPresenter }));
                      } else {
                        setFormData(prev => ({ ...prev, attendees: [] }));
                      }
                    }}
                    checked={formData.attendees.length === physicians.filter(p => p.id !== formData.presenterId).length}
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                    Select All
                  </label>
                </div>
                
                {physicians
                  .filter(physician => physician.id !== formData.presenterId)
                  .map(physician => (
                    <div key={physician.id} className="flex items-center py-1">
                      <input
                        id={`attendee-${physician.id}`}
                        name="attendees"
                        type="checkbox"
                        value={physician.id}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.attendees.includes(physician.id)}
                        onChange={handleAttendeeChange}
                      />
                      <label htmlFor={`attendee-${physician.id}`} className="ml-2 text-sm text-gray-700">
                        {physician.name}
                      </label>
                    </div>
                  ))}
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
              Schedule Lecture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLectureModal;