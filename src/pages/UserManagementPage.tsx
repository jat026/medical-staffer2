import React from 'react';
import UserManagement from '../components/admin/UserManagement';
import { useAppStore } from '../store';
import { Navigate } from 'react-router-dom';

const UserManagementPage: React.FC = () => {
  const currentUser = useAppStore(state => state.currentUser);
  
  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage user accounts, roles, and permissions
        </p>
      </div>
      
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;