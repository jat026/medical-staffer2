import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { User, Mail, Phone, Stethoscope, Calendar, Shield, AlertTriangle, Check } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addUser = useAppStore(state => state.addUser);
  
  // Parse invite token from URL if present
  const queryParams = new URLSearchParams(location.search);
  const inviteToken = queryParams.get('token');
  const inviteEmail = queryParams.get('email');
  
  const [formData, setFormData] = useState({
    name: '',
    email: inviteEmail || '',
    phone: '',
    specialty: '',
    password: '',
    confirmPassword: '',
    isBackup: false,
    requiresBackup: false,
    isShielded: false,
    shieldReason: '',
    shieldEndDate: '',
    hasShieldEndDate: true,
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    qualifications: '',
    yearsOfExperience: '',
    preferredShiftTypes: [] as string[],
    acceptedTerms: false
  });
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Validate token (in a real app, this would verify with the backend)
  useEffect(() => {
    if (inviteToken) {
      // In a real app, verify the token with the backend
      // For demo purposes, we'll just accept any token
      console.log(`Invite token: ${inviteToken}`);
    }
  }, [inviteToken]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (name.includes('.')) {
      // Handle nested objects (e.g., emergencyContact.name)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handlePreferredShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      preferredShiftTypes: checked
        ? [...prev.preferredShiftTypes, value]
        : prev.preferredShiftTypes.filter(type => type !== value)
    }));
  };
  
  const validateStep = () => {
    setError('');
    
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.specialty) {
        setError('Please fill in all required fields');
        return false;
      }
      
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
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
    } else if (step === 2) {
      if (formData.isShielded && !formData.shieldReason) {
        setError('Please provide a reason for shielding');
        return false;
      }
      
      if (formData.isShielded && formData.hasShieldEndDate && !formData.shieldEndDate) {
        setError('Please provide an end date for shielding');
        return false;
      }
    } else if (step === 3) {
      if (!formData.emergencyContact.name || !formData.emergencyContact.phone || !formData.emergencyContact.relationship) {
        setError('Please provide complete emergency contact information');
        return false;
      }
    }
    
    return true;
  };
  
  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    if (!formData.acceptedTerms) {
      setError('You must accept the terms and conditions');
      return;
    }
    
    try {
      // Add the new user
      addUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialty: formData.specialty,
        role: 'physician',
        isBackup: formData.isBackup,
        requiresBackup: formData.requiresBackup,
        isShielded: formData.isShielded,
        shieldReason: formData.isShielded ? formData.shieldReason : undefined,
        shieldEndDate: formData.isShielded && formData.hasShieldEndDate ? formData.shieldEndDate : undefined,
        twoFactorEnabled: false,
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
      
      setSuccess(true);
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError('An error occurred during registration');
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
  
  const shieldReasons = [
    'Pregnancy',
    'Sick Leave',
    'Medical Condition',
    'Family Leave',
    'Administrative',
    'Other'
  ];
  
  const relationships = [
    'Spouse',
    'Partner',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Other'
  ];
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
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
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={!!inviteEmail}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                Medical Specialty <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Stethoscope className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="specialty"
                  name="specialty"
                  required
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Work Preferences</h2>
            
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
                <label htmlFor="isBackup" className="ml-2 block text-sm text-gray-900">
                  I am willing to serve as a backup physician
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
                <label htmlFor="requiresBackup" className="ml-2 block text-sm text-gray-900">
                  I require a backup physician for my shifts
                </label>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center">
                <input
                  id="isShielded"
                  name="isShielded"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.isShielded}
                  onChange={handleChange}
                />
                <label htmlFor="isShielded" className="ml-2 block text-sm text-gray-900">
                  I need to be shielded from shifts temporarily
                </label>
              </div>
              
              {formData.isShielded && (
                <div className="mt-3 ml-6 space-y-3">
                  <div>
                    <label htmlFor="shieldReason" className="block text-sm font-medium text-gray-700">
                      Reason for Shielding <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="shieldReason"
                      name="shieldReason"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.shieldReason}
                      onChange={handleChange}
                    >
                      <option value="">Select a reason</option>
                      {shieldReasons.map(reason => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                    
                    {formData.shieldReason === 'Other' && (
                      <input
                        type="text"
                        placeholder="Specify reason"
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.shieldReason === 'Other' ? '' : formData.shieldReason}
                        onChange={(e) => setFormData(prev => ({ ...prev, shieldReason: e.target.value }))}
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="hasShieldEndDate"
                      name="hasShieldEndDate"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.hasShieldEndDate}
                      onChange={handleChange}
                    />
                    <label htmlFor="hasShieldEndDate" className="ml-2 block text-sm text-gray-900">
                      Set end date for shielding period
                    </label>
                  </div>
                  
                  {formData.hasShieldEndDate && (
                    <div>
                      <label htmlFor="shieldEndDate" className="block text-sm font-medium text-gray-700">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="shieldEndDate"
                          name="shieldEndDate"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          value={formData.shieldEndDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700">
                Preferred Shift Types
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="morning"
                    name="preferredShiftTypes"
                    type="checkbox"
                    value="morning"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.preferredShiftTypes.includes('morning')}
                    onChange={handlePreferredShiftChange}
                  />
                  <label htmlFor="morning" className="ml-2 block text-sm text-gray-900">
                    Morning (8:00 AM - 4:00 PM)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="evening"
                    name="preferredShiftTypes"
                    type="checkbox"
                    value="evening"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.preferredShiftTypes.includes('evening')}
                    onChange={handlePreferredShiftChange}
                  />
                  <label htmlFor="evening" className="ml-2 block text-sm text-gray-900">
                    Evening (4:00 PM - 12:00 AM)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="night"
                    name="preferredShiftTypes"
                    type="checkbox"
                    value="night"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.preferredShiftTypes.includes('night')}
                    onChange={handlePreferredShiftChange}
                  />
                  <label htmlFor="night" className="ml-2 block text-sm text-gray-900">
                    Night (12:00 AM - 8:00 AM)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="weekend"
                    name="preferredShiftTypes"
                    type="checkbox"
                    value="weekend"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.preferredShiftTypes.includes('weekend')}
                    onChange={handlePreferredShiftChange}
                  />
                  <label htmlFor="weekend" className="ml-2 block text-sm text-gray-900">
                    Weekend Shifts
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                type="number"
                id="yearsOfExperience"
                name="yearsOfExperience"
                min="0"
                max="50"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={formData.yearsOfExperience}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Emergency Contact Information
              </label>
              <div className="mt-2 space-y-3 p-4 bg-gray-50 rounded-md">
                <div>
                  <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="emergencyContact.relationship"
                    name="emergencyContact.relationship"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.emergencyContact.relationship}
                    onChange={handleChange}
                  >
                    <option value="">Select Relationship</option>
                    {relationships.map(relationship => (
                      <option key={relationship} value={relationship}>
                        {relationship}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
                Additional Qualifications
              </label>
              <textarea
                id="qualifications"
                name="qualifications"
                rows={3}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="List any additional certifications, specializations, or qualifications"
                value={formData.qualifications}
                onChange={handleChange}
              />
            </div>
            
            <div className="pt-4">
              <div className="flex items-center">
                <input
                  id="acceptedTerms"
                  name="acceptedTerms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.acceptedTerms}
                  onChange={handleChange}
                />
                <label htmlFor="acceptedTerms" className="ml-2 block text-sm text-gray-900">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                </label>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Registration Complete</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Thank you for registering with MedStaff Scheduler. Your account has been created and is pending approval by an administrator.
            </p>
            <p className="mt-4 text-center text-sm text-gray-600">
              You will be redirected to the login page in a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            MedStaff Onboarding
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete your profile to join the medical staff
          </p>
          
          {/* Progress indicator */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">1</span>
                </div>
                <div className={`ml-2 text-sm ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Basic</div>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">2</span>
                </div>
                <div className={`ml-2 text-sm ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Preferences</div>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className="text-white text-sm font-medium">3</span>
                </div>
                <div className={`ml-2 text-sm ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Complete</div>
              </div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          {renderStep()}
          
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Previous
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Complete Registration
              </button>
            )}
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;