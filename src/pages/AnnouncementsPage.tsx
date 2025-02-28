import React from 'react';
import AnnouncementList from '../components/announcements/AnnouncementList';

const AnnouncementsPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="mt-1 text-sm text-gray-500">
          Stay updated with important team announcements
        </p>
      </div>
      
      <AnnouncementList />
    </div>
  );
};

export default AnnouncementsPage;