import React, { useState } from 'react';
import { X, Mail, Copy, Check } from 'lucide-react';

interface InviteUserModalProps {
  onClose: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  const generateInviteLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Generate a random token (in a real app, this would be stored in the database)
    const token = Math.random().toString(36).substring(2, 15);
    
    // Create the invite link
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/onboarding?token=${token}&email=${encodeURIComponent(email)}`;
    
    setInviteLink(link);
    setError('');
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Invite New Doctor</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          {!inviteLink ? (
            <form onSubmit={generateInviteLink}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Doctor's Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="doctor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        An invitation link will be generated that you can share with the doctor. They will use this link to complete their registration.
                      </p>
                    </div>
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Generate Invite Link
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Invitation Link
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <input
                      type="text"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      value={inviteLink}
                      readOnly
                    />
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5 text-gray-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Invitation link generated successfully! Share this link with {email} to complete their registration.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  You can also send this link via email directly to the doctor. The link will allow them to register with their email pre-filled.
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setInviteLink('');
                    setEmail('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;