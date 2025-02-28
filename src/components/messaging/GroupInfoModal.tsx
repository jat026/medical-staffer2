import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { X, UserPlus, UserMinus, Settings } from 'lucide-react';

interface GroupInfoModalProps {
  groupId: string;
  onClose: () => void;
}

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({ groupId, onClose }) => {
  const chatGroups = useAppStore(state => state.chatGroups);
  const users = useAppStore(state => state.users);
  const currentUser = useAppStore(state => state.currentUser);
  const addUserToGroup = useAppStore(state => state.addUserToGroup);
  const removeUserFromGroup = useAppStore(state => state.removeUserFromGroup);
  
  const group = chatGroups.find(g => g.id === groupId);
  
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!group || !currentUser) return null;
  
  const isGroupCreator = group.createdById === currentUser.id;
  
  // Get group members
  const groupMembers = users.filter(user => group.members.includes(user.id));
  
  // Get users who are not in the group
  const nonGroupMembers = users.filter(user => 
    !group.members.includes(user.id) &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddMember = (userId: string) => {
    addUserToGroup(groupId, userId);
  };
  
  const handleRemoveMember = (userId: string) => {
    if (userId === currentUser.id) return; // Can't remove yourself
    removeUserFromGroup(groupId, userId);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Group Information</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-medium text-gray-900">{group.name}</h2>
              <p className="text-sm text-gray-500">
                {group.description || `Created by ${users.find(u => u.id === group.createdById)?.name}`}
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Members ({groupMembers.length})
              </h4>
              {isGroupCreator && (
                <button
                  type="button"
                  onClick={() => setShowAddMembers(!showAddMembers)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  {showAddMembers ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add Members
                    </>
                  )}
                </button>
              )}
            </div>
            
            {showAddMembers && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {nonGroupMembers.length > 0 ? (
                      nonGroupMembers.map(user => (
                        <li
                          key={user.id}
                          className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between"
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
                          <button
                            type="button"
                            onClick={() => handleAddMember(user.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <UserPlus className="h-5 w-5" />
                          </button>
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
            )}
            
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
              {groupMembers.map(member => (
                <li
                  key={member.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={member.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                      alt=""
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {member.name}
                        {member.id === group.createdById && (
                          <span className="ml-2 text-xs text-gray-500">(Creator)</span>
                        )}
                        {member.id === currentUser.id && (
                          <span className="ml-2 text-xs text-gray-500">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{member.specialty || member.role}</p>
                    </div>
                  </div>
                  {isGroupCreator && member.id !== currentUser.id && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <UserMinus className="h-5 w-5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;