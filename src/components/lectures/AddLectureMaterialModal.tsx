import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X } from 'lucide-react';

interface AddLectureMaterialModalProps {
  lectureId: string;
  onClose: () => void;
}

const AddLectureMaterialModal: React.FC<AddLectureMaterialModalProps> = ({ lectureId, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: ''
  });
  
  const currentUser = useAppStore(state => state.currentUser);
  const addLectureMaterial = useAppStore(state => state.addLectureMaterial);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    addLectureMaterial(lectureId, {
      title: formData.title,
      description: formData.description,
      url: formData.url,
      uploadedById: currentUser.id
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Add Lecture Material</h3>
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
                placeholder="Presentation Slides"
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
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Brief description of the material"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Document URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://docs.google.com/presentation/d/..."
                value={formData.url}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a URL where the material can be accessed (Google Docs, Slides, etc.)
              </p>
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
              Add Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLectureMaterialModal;