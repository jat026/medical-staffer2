import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { format, parseISO } from 'date-fns';
import { ClipboardList, Plus, Pin, Search } from 'lucide-react';
import AddAnnouncementModal from './AddAnnouncementModal';

const AnnouncementList: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const announcements = useAppStore(state => state.announcements);
  const users = useAppStore(state => state.users);
  const currentUser = useAppStore(state => state.currentUser);
  const updateAnnouncement = useAppStore(state => state.updateAnnouncement);
  
  // Filter announcements based on search term
  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort announcements: pinned first, then by creation date (newest first)
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };
  
  // Toggle pin status
  const togglePin = (announcementId: string, isPinned: boolean) => {
    updateAnnouncement(announcementId, { isPinned: !isPinned });
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Announcements</h2>
        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Announcement
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search announcements..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Announcement list */}
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {sortedAnnouncements.length > 0 ? (
            sortedAnnouncements.map((announcement) => (
              <li key={announcement.id} className={`px-6 py-4 hover:bg-gray-50 ${announcement.isPinned ? 'bg-yellow-50' : ''}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">
                    <ClipboardList className={`h-6 w-6 ${announcement.isPinned ? 'text-yellow-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {announcement.title}
                      </h3>
                      {currentUser?.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => togglePin(announcement.id, announcement.isPinned)}
                          className={`p-1 rounded-full ${
                            announcement.isPinned
                              ? 'text-yellow-500 hover:bg-yellow-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 whitespace-pre-line">
                      {announcement.content}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Posted by {getUserName(announcement.authorId)} on {format(parseISO(announcement.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by creating a new announcement.'}
              </p>
              {currentUser?.role === 'admin' && !searchTerm && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Announcement
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
      
      {/* Add announcement modal */}
      {isAddModalOpen && (
        <AddAnnouncementModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};

export default AnnouncementList;