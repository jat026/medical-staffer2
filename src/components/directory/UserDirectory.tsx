import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Search, Phone, Mail, AlertTriangle, Shield, Calendar } from 'lucide-react';

const UserDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [backupFilter, setBackupFilter] = useState<string>('all');
  const [shieldedFilter, setShieldedFilter] = useState<string>('all');
  
  const users = useAppStore(state => state.users);
  const currentUser = useAppStore(state => state.currentUser);
  
  // Get unique specialties
  const specialties = Array.from(
    new Set(users.filter(user => user.specialty).map(user => user.specialty))
  );
  
  // Filter users based on search term, specialty, backup status, and shielded status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.specialty && user.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = specialtyFilter === 'all' || user.specialty === specialtyFilter;
    
    const matchesBackupFilter = 
      backupFilter === 'all' || 
      (backupFilter === 'requires' && user.requiresBackup) ||
      (backupFilter === 'provides' && user.isBackup) ||
      (backupFilter === 'none' && !user.requiresBackup && !user.isBackup);
    
    const matchesShieldedFilter =
      shieldedFilter === 'all' ||
      (shieldedFilter === 'shielded' && user.isShielded) ||
      (shieldedFilter === 'active' && !user.isShielded);
    
    return matchesSearch && matchesSpecialty && matchesBackupFilter && matchesShieldedFilter;
  });
  
  // Sort users by name
  const sortedUsers = [...filteredUsers].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Physician Directory</h2>
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
              placeholder="Search physicians..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sm:w-48">
            <select
              className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="all">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sm:w-48">
            <select
              className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={backupFilter}
              onChange={(e) => setBackupFilter(e.target.value)}
            >
              <option value="all">All Backup Status</option>
              <option value="requires">Requires Backup</option>
              <option value="provides">Provides Backup</option>
              <option value="none">No Backup Status</option>
            </select>
          </div>
          
          <div className="sm:w-48">
            <select
              className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={shieldedFilter}
              onChange={(e) => setShieldedFilter(e.target.value)}
            >
              <option value="all">All Availability</option>
              <option value="active">Active Physicians</option>
              <option value="shielded">Shielded Physicians</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* User list */}
      <ul className="divide-y divide-gray-200">
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user) => (
            <li key={user.id} className={`px-6 py-4 hover:bg-gray-50 ${
              user.requiresBackup ? 'bg-yellow-50' : user.isShielded ? 'bg-purple-50' : ''
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0 relative">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                    alt=""
                  />
                  {user.requiresBackup && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1" title="Requires backup">
                      <AlertTriangle className="h-3 w-3 text-white" />
                    </span>
                  )}
                  {user.isBackup && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1" title="Provides backup">
                      <Shield className="h-3 w-3 text-white" />
                    </span>
                  )}
                  {user.isShielded && (
                    <span className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-1" title={`Shielded: ${user.shieldReason || 'Medical reasons'}`}>
                      <Calendar className="h-3 w-3 text-white" />
                    </span>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500">
                          {user.specialty || user.role}
                        </p>
                        {user.requiresBackup && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Requires Backup
                          </span>
                        )}
                        {user.isBackup && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                            Backup Physician
                          </span>
                        )}
                        {user.isShielded && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                            {user.shieldReason || 'Shielded'}
                            {user.shieldEndDate && ` until ${user.shieldEndDate}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`tel:${user.phone}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </a>
                      <a
                        href={`mailto:${user.email}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </a>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Phone className="h-4 w-4 mr-1" />
                      {user.phone}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Mail className="h-4 w-4 mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
           <li className="px-6 py-12 text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No physicians found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default UserDirectory;