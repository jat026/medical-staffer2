import React from 'react';
import LectureList from '../components/lectures/LectureList';

const LecturesPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teaching Lectures</h1>
        <p className="mt-1 text-sm text-gray-500">
          Schedule and manage educational lectures for medical staff
        </p>
      </div>
      
      <LectureList />
    </div>
  );
};

export default LecturesPage;