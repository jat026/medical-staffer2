import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { X, User, Mail, Phone, Stethoscope, Shield, AlertTriangle, Upload } from 'lucide-react';

interface AddEditUserModalProps {
  userId: string | null;
  isEditing: boolean;
  onClose: () => void;
}

const AddEditUserModal: React.FC<AddEditUserModalProps> = ({ userId, isEditing, onClose }) => {
  const users = useAppStore(state => state.users);
  const addUser = useAppStore(state => state.addUser);
  const updateUser = useAppStore(state => state.updateUser);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    role: 'physician',
    isBackup: false,
    requiresBackup: false,
    isApproved: true,
    password: '',
    confirmPassword: '',
    avatar: ''
  });
  
  const [error, setError] = useState('');
  
  // If editing, populate form with user data
  useEffect(() => {
    if (isEditing && userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          specialty: user.specialty || '',
          role: user.role,
          isBackup: user.isBackup || false,
          requiresBackup: user.requiresBackup || false,
          isApproved: user.isApproved,
          password: '',
          confirmPassword: '',
          avatar: user.avatar || ''
        });
      }
    }
  }, [isEditing, userId, users]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateForm = () => {
    setError('');
    
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!isEditing) {
      if (!formData.password) {
        setError('Password is required for new users');
        return false;
      }
      
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditing && userId) {
        // Update existing user
        updateUser(userId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialty: formData.specialty,
          role: formData.role as 'physician' | 'admin',
          isBackup: formData.isBackup,
          requiresBackup: formData.requiresBackup,
          isApproved: formData.isApproved,
          avatar: formData.avatar
        });
      } else {
        // Add new user
        addUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialty: formData.specialty,
          role: formData.role as 'physician' | 'admin',
          isBackup: formData.isBackup,
          requiresBackup: formData.requiresBackup,
          twoFactorEnabled: false,
          avatar: formData.avatar,
          notificationSettings: {
            emailNotifications: true,
            pushNotifications: true,
            notifyBeforeShift: true,
            notifyBeforeShiftHours: 24,
            weeklyScheduleReminder: true,
            shiftSwapNotifications: true,
            vacationApprovalNotifications: true
          }
        });
      }
      
      onClose();
    } catch (err) {
      setError('An error occurred while saving the user');
      console.error(err);
    }
  };
  
  const specialties = [
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Obstetrics and Gynecology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Urology'
  ];
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h3>
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
            {/* Photo Upload */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <img
                  src={formData.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                  alt="User avatar"
                  className="h-24 w-24 rounded-full object-cover"
                />
              </div>
              <div className="mt-2">
                <label htmlFor="avatar" className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </label>
                <input
                  type="text"
                  id="avatar"
                  name="avatar"
                  placeholder="Enter photo URL"
                  className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.avatar}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a URL for the user's photo
                </p>
              </div>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                Medical Specialty
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Stethoscope className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="specialty"
                  name="specialty"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  value={formData.specialty}
                  onChange={handleChange}
                >
                  <option value="">Select Specialty</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="physician">Physician</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="isBackup"
                  name="isBackup"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.isBackup}
                  onChange={handleChange}
                />
                <label htmlFor="isBackup" className="ml-2 flex items-center text-sm text-gray-900">
                  <Shield className="h-4 w-4 mr-1 text-blue-500" />
                  Backup Provider
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="requiresBackup"
                  name="requiresBackup"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.requiresBackup}
                  onChange={handleChange}
                />
                <label htmlFor="requiresBackup" className="ml-2 flex items-center text-sm text-gray-900">
                  <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                  Requires Backup
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isApproved"
                  name="isApproved"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.isApproved}
                  onChange={handleChange}
                />
                <label htmlFor="isApproved" className="ml-2 text-sm text-gray-900">
                  Approved (can log in immediately)
                </label>
              </div>
            </div>
            
            {!isEditing && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>
          
          {error && (
            <div className="mt-4 text-sm text-red-600">
              {error}
            </div>
          )}
          
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
              {isEditing ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditUserModal;