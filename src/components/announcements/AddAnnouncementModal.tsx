import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X } from 'lucide-react';

interface AddAnnouncementModalProps {
  onClose: () => void;
}

const AddAnnouncementModal: React.FC<AddAnnouncementModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false
  });
  
  const currentUser = useAppStore(state => state.currentUser);
  const addAnnouncement = useAppStore(state => state.addAnnouncement);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    addAnnouncement({
      ...formData,
      authorId: currentUser.id
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">New Announcement</h3>
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
                Title
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
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={5}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.content}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="isPinned"
                name="isPinned"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.isPinned}
                onChange={handleChange}
              />
              <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-900">
                Pin this announcement
              </label>
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
              Post Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnnouncementModal;