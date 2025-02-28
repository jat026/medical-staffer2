import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X, Users, Search, Check } from 'lucide-react';

interface CreateGroupModalProps {
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose }) => {
  const currentUser = useAppStore(state => state.currentUser);
  const users = useAppStore(state => state.users);
  const createChatGroup = useAppStore(state => state.createChatGroup);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.id !== currentUser?.id && // Exclude current user
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !formData.name || selectedUserIds.length < 2) return;
    
    createChatGroup({
      name: formData.name,
      description: formData.description,
      createdById: currentUser.id,
      members: selectedUserIds,
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Create New Group</h3>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Members
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedUserIds.map(userId => {
                  const user = users.find(u => u.id === userId);
                  if (!user || user.id === currentUser?.id) return null;
                  
                  return (
                    <div 
                      key={user.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {user.name}
                      <button
                        type="button"
                        onClick={() => toggleUserSelection(user.id)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <li
                        key={user.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <div className="flex items-center">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                            alt=""
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.specialty || user.role}</p>
                          </div>
                        </div>
                        {selectedUserIds.includes(user.id) && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-gray-500">
                      No users found
                    </li>
                  )}
                </ul>
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
              disabled={!formData.name || selectedUserIds.length < 2}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;