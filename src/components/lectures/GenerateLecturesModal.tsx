import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X, Calendar, Users, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface GenerateLecturesModalProps {
  onClose: () => void;
}

const GenerateLecturesModal: React.FC<GenerateLecturesModalProps> = ({ onClose }) => {
  const generateLectures = useAppStore(state => state.generateLectures);
  
  const [formData, setFormData] = useState({
    startDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    count: 10
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'count' ? parseInt(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    generateLectures(formData.startDate, formData.count);
    
    setIsSuccess(true);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Generate Lecture Schedule</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {isSuccess ? (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Lectures Generated Successfully</h3>
            <p className="mt-1 text-sm text-gray-500">
              {formData.count} lectures have been scheduled starting from {formData.startDate}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                This will automatically generate a series of weekly lectures, rotating through all physicians as presenters.
                Lectures will be scheduled on Wednesdays from 08:00-09:00.
              </p>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  The date will be adjusted to the next Wednesday if needed.
                </p>
              </div>
              
              <div>
                <label htmlFor="count" className="block text-sm font-medium text-gray-700">
                  Number of Lectures
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="count"
                    name="count"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    value={formData.count}
                    onChange={handleChange}
                  >
                    <option value="5">5 lectures</option>
                    <option value="10">10 lectures</option>
                    <option value="15">15 lectures</option>
                    <option value="20">20 lectures</option>
                    <option value="25">25 lectures</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This will generate {formData.count} weekly lectures and automatically notify the assigned presenters. Lecture titles will be left empty until added later.
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
                Generate Lectures
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GenerateLecturesModal;