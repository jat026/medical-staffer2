import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { BookOpen, Plus, Search, Filter, Calendar, Clock, MapPin, User, FileText, Download } from 'lucide-react';
import AddLectureModal from './AddLectureModal';
import GenerateLecturesModal from './GenerateLecturesModal';
import LectureDetails from './LectureDetails';

const LectureList: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  
  const lectures = useAppStore(state => state.lectures);
  const users = useAppStore(state => state.users);
  const documents = useAppStore(state => state.documents);
  const currentUser = useAppStore(state => state.currentUser);
  
  const isAdmin = currentUser?.role === 'admin';
  
  // Filter lectures based on search term and status
  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = 
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users.find(u => u.id === lecture.presenterId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lecture.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort lectures by date (upcoming first, then past)
  const sortedLectures = [...filteredLectures].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    const now = new Date();
    
    // If one is in the future and one is in the past, future comes first
    if (isAfter(dateA, now) && isBefore(dateB, now)) return -1;
    if (isBefore(dateA, now) && isAfter(dateB, now)) return 1;
    
    // Otherwise sort by date (ascending for future, descending for past)
    if (isAfter(dateA, now) && isAfter(dateB, now)) {
      return dateA.getTime() - dateB.getTime();
    } else {
      return dateB.getTime() - dateA.getTime();
    }
  });
  
  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };
  
  // Get lecture materials count
  const getMaterialsCount = (lectureId: string) => {
    return documents.filter(doc => doc.lectureId === lectureId).length;
  };
  
  // Handle lecture click
  const handleLectureClick = (lectureId: string) => {
    setSelectedLectureId(lectureId);
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Teaching Lectures</h2>
        <div className="flex space-x-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Generate Schedule
            </button>
          )}
          {(isAdmin || currentUser?.role === 'physician') && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Lecture
            </button>
          )}
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
              placeholder="Search lectures..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sm:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Lectures</option>
              <option value="scheduled">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Lecture list */}
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {sortedLectures.length > 0 ? (
            sortedLectures.map((lecture) => {
              const lectureDate = parseISO(lecture.date);
              const isUpcoming = isAfter(lectureDate, new Date()) || isToday(lectureDate);
              const isUserPresenter = lecture.presenterId === currentUser?.id;
              const isUserAttendee = lecture.attendees.includes(currentUser?.id || '');
              
              return (
                <li 
                  key={lecture.id} 
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                    isUserPresenter ? 'bg-blue-50' : isUserAttendee ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => handleLectureClick(lecture.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        <BookOpen className={`h-6 w-6 ${isUpcoming ? 'text-indigo-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">
                            {lecture.title}
                          </h3>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(lecture.status)}`}>
                            {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
                          </span>
                          {isUserPresenter && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                              You're Presenting
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {lecture.description}
                        </p>
                        <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {format(lectureDate, 'EEEE, MMMM d, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {lecture.startTime} - {lecture.endTime}
                          </div>
                          <div className="flex items-center">
                            <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {getUserName(lecture.presenterId)}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            {getMaterialsCount(lecture.id)} materials
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {lecture.attendees.length} attendees
                      </span>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="px-6 py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No lectures found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding a new lecture.'}
              </p>
              {(isAdmin || currentUser?.role === 'physician') && !searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Lecture
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
      
      {/* Add lecture modal */}
      {isAddModalOpen && (
        <AddLectureModal onClose={() => setIsAddModalOpen(false)} />
      )}
      
      {/* Generate lectures modal */}
      {isGenerateModalOpen && (
        <GenerateLecturesModal onClose={() => setIsGenerateModalOpen(false)} />
      )}
      
      {/* Lecture details modal */}
      {selectedLectureId && (
        <LectureDetails 
          lectureId={selectedLectureId} 
          onClose={() => setSelectedLectureId(null)} 
        />
      )}
    </div>
  );
};

export default LectureList;