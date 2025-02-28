import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Search, Check, X, User, Shield, AlertTriangle, Calendar, UserPlus, Edit, Trash2 } from 'lucide-react';
import ShieldUserModal from './ShieldUserModal';
import InviteUserModal from './InviteUserModal';
import AddEditUserModal from './AddEditUserModal';
import DeleteUserConfirmModal from './DeleteUserConfirmModal';

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [shieldModalOpen, setShieldModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const users = useAppStore(state => state.users);
  const approveUser = useAppStore(state => state.approveUser);
  const updateUser = useAppStore(state => state.updateUser);
  const deleteUser = useAppStore(state => state.deleteUser);
  
  // Filter users based on search term and approval status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.specialty && user.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && !user.isApproved) || 
      (filter === 'approved' && user.isApproved);
    
    return matchesSearch && matchesFilter;
  });
  
  // Sort users: pending first, then by name
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!a.isApproved && b.isApproved) return -1;
    if (a.isApproved && !b.isApproved) return 1;
    return a.name.localeCompare(b.name);
  });
  
  // Handle user approval
  const handleApproveUser = (userId: string) => {
    approveUser(userId);
  };
  
  // Toggle backup status
  const toggleBackupStatus = (userId: string, isBackup: boolean | undefined) => {
    updateUser(userId, { isBackup: !isBackup });
  };
  
  // Toggle requires backup status
  const toggleRequiresBackupStatus = (userId: string, requiresBackup: boolean | undefined) => {
    updateUser(userId, { requiresBackup: !requiresBackup });
  };
  
  // Toggle admin role
  const toggleAdminRole = (userId: string, currentRole: 'physician' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'physician' : 'admin';
    updateUser(userId, { role: newRole });
  };
  
  // Open shield modal
  const openShieldModal = (userId: string) => {
    setSelectedUserId(userId);
    setShieldModalOpen(true);
  };
  
  // Remove shielding
  const removeShielding = (userId: string) => {
    updateUser(userId, { 
      isShielded: false,
      shieldReason: undefined,
      shieldEndDate: undefined
    });
  };

  // Open edit user modal
  const openEditUserModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsEditing(true);
    setAddEditModalOpen(true);
  };

  // Open add user modal
  const openAddUserModal = () => {
    setSelectedUserId(null);
    setIsEditing(false);
    setAddEditModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteModalOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    if (selectedUserId) {
      deleteUser(selectedUserId);
      setDeleteModalOpen(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">User Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={openAddUserModal}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <User className="h-4 w-4 mr-1" />
            Add User
          </button>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Invite Doctor
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
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
          
          <div className="sm:w-64">
            <select
              className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'approved')}
            >
              <option value="all">All Users</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* User list */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Backup Provider
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requires Backup
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shielded
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <tr key={user.id} className={!user.isApproved ? 'bg-yellow-50' : user.isShielded ? 'bg-purple-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.specialty || 'No specialty'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAdminRole(user.id, user.role)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role === 'admin' ? 'Admin' : 'Physician'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleBackupStatus(user.id, user.isBackup)}
                      className={`p-1 rounded ${
                        user.isBackup
                          ? 'text-blue-600 hover:bg-blue-100'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={user.isBackup ? "Remove backup provider status" : "Set as backup provider"}
                    >
                      <Shield className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleRequiresBackupStatus(user.id, user.requiresBackup)}
                      className={`p-1 rounded ${
                        user.requiresBackup
                          ? 'text-yellow-600 hover:bg-yellow-100'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={user.requiresBackup ? "Remove requires backup status" : "Set as requiring backup"}
                    >
                      <AlertTriangle className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {user.isShielded ? (
                      <button
                        onClick={() => removeShielding(user.id)}
                        className="p-1 rounded text-purple-600 hover:bg-purple-100"
                        title={`Shielded: ${user.shieldReason || 'Medical reasons'}${user.shieldEndDate ? ` until ${user.shieldEndDate}` : ''}`}
                      >
                        <Calendar className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => openShieldModal(user.id)}
                        className="p-1 rounded text-gray-400 hover:bg-gray-100"
                        title="Shield from shifts"
                      >
                        <Calendar className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {!user.isApproved && (
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve user"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditUserModal(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit user"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete user"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">No users found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Shield User Modal */}
      {shieldModalOpen && selectedUserId && (
        <ShieldUserModal 
          userId={selectedUserId}
          onClose={() => setShieldModalOpen(false)}
        />
      )}
      
      {/* Invite User Modal */}
      {inviteModalOpen && (
        <InviteUserModal
          onClose={() => setInviteModalOpen(false)}
        />
      )}

      {/* Add/Edit User Modal */}
      {addEditModalOpen && (
        <AddEditUserModal
          userId={selectedUserId}
          isEditing={isEditing}
          onClose={() => setAddEditModalOpen(false)}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {deleteModalOpen && selectedUserId && (
        <DeleteUserConfirmModal
          userId={selectedUserId}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default UserManagement;