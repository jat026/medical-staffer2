import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X, BookOpen } from 'lucide-react';

interface AddDocumentModalProps {
  onClose: () => void;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    url: '',
    lectureId: ''
  });
  
  const currentUser = useAppStore(state => state.currentUser);
  const addDocument = useAppStore(state => state.addDocument);
  const lectures = useAppStore(state => state.lectures);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    addDocument({
      ...formData,
      uploadedById: currentUser.id,
      category: formData.category as 'procedure' | 'guideline' | 'protocol' | 'lecture',
      lectureId: formData.category === 'lecture' ? formData.lectureId : undefined
    });
    
    onClose();
  };
  
  // Get recent lectures (last 3 months)
  const recentLectures = lectures
    .filter(lecture => lecture.status !== 'cancelled')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Add New Document</h3>
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                <option value="procedure">Procedure</option>
                <option value="guideline">Guideline</option>
                <option value="protocol">Protocol</option>
                <option value="lecture">Lecture Material</option>
              </select>
            </div>
            
            {formData.category === 'lecture' && (
              <div>
                <label htmlFor="lectureId" className="block text-sm font-medium text-gray-700">
                  Associated Lecture
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="lectureId"
                    name="lectureId"
                    required
                    className="mt-1 block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.lectureId}
                    onChange={handleChange}
                  >
                    <option value="">Select a lecture</option>
                    {recentLectures.map(lecture => (
                      <option key={lecture.id} value={lecture.id}>
                        {lecture.title} ({lecture.date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
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
                placeholder="https://docs.google.com/document/d/..."
                value={formData.url}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a URL where the document can be accessed (Google Docs, Dropbox, etc.)
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
              Add Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDocumentModal;