import React from 'react';
import UserDirectory from '../components/directory/UserDirectory';

const DirectoryPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Physician Directory</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find contact information for all medical staff
        </p>
      </div>
      
      <UserDirectory />
    </div>
  );
};

export default DirectoryPage;