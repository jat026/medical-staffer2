import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { format, parseISO } from 'date-fns';
import { X, Calendar, Clock, MapPin, User, FileText, Plus, Download, BookOpen, UserPlus, Check } from 'lucide-react';
import AddLectureMaterialModal from './AddLectureMaterialModal';

interface LectureDetailsProps {
  lectureId: string;
  onClose: () => void;
}

const LectureDetails: React.FC<LectureDetailsProps> = ({ lectureId, onClose }) => {
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isAddingAttendees, setIsAddingAttendees] = useState(false);
  
  const lectures = useAppStore(state => state.lectures);
  const users = useAppStore(state => state.users);
  const documents = useAppStore(state => state.documents);
  const currentUser = useAppStore(state => state.currentUser);
  const updateLecture = useAppStore(state => state.updateLecture);
  
  const lecture = lectures.find(l => l.id === lectureId);
  
  if (!lecture) return null;
  
  const presenter = users.find(u => u.id === lecture.presenterId);
  const isPresenter = currentUser?.id === lecture.presenterId;
  const isAdmin = currentUser?.role === 'admin';
  
  // Get lecture materials
  const lectureMaterials = documents.filter(doc => 
    doc.lectureId === lectureId
  );
  
  // Format date and time
  const formattedDate = format(parseISO(lecture.date), 'EEEE, MMMM d, yyyy');
  
  // Get potential attendees (users who aren't already attending and aren't the presenter)
  const potentialAttendees = users.filter(user => 
    user.id !== lecture.presenterId && 
    !lecture.attendees.includes(user.id) &&
    user.role === 'physician' &&
    user.isApproved
  );
  
  // Handle adding an attendee
  const handleAddAttendee = (userId: string) => {
    const updatedAttendees = [...lecture.attendees, userId];
    updateLecture(lectureId, { attendees: updatedAttendees });
  };
  
  // Handle removing an attendee
  const handleRemoveAttendee = (userId: string) => {
    const updatedAttendees = lecture.attendees.filter(id => id !== userId);
    updateLecture(lectureId, { attendees: updatedAttendees });
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Lecture Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{lecture.title}</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700">{lecture.description}</p>
            
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <span>{lecture.startTime} - {lecture.endTime}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <MapPin className="h-5 w-5 text-gray-500 mr-2" />
              <span>{lecture.location}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <span>Presenter: {presenter?.name || 'Not assigned'}</span>
            </div>
            
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${
                lecture.status === 'scheduled' 
                  ? 'bg-blue-100 text-blue-800' 
                  : lecture.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
              </span>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <BookOpen className="h-4 w-4 mr-1 text-indigo-500" />
                  Lecture Materials
                </h4>
                
                {(isPresenter || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => setIsAddMaterialModalOpen(true)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Material
                  </button>
                )}
              </div>
              
              {lectureMaterials.length > 0 ? (
                <ul className="space-y-2">
                  {lectureMaterials.map(material => (
                    <li key={material.id} className="bg-gray-50 p-2 rounded flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-indigo-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{material.title}</p>
                          <p className="text-xs text-gray-500">{material.description}</p>
                        </div>
                      </div>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No materials have been added yet.</p>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <User className="h-4 w-4 mr-1 text-blue-500" />
                  Attendees
                </h4>
                
                {/* All users can now add attendees */}
                <button
                  type="button"
                  onClick={() => setIsAddingAttendees(!isAddingAttendees)}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isAddingAttendees ? (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" />
                      Manage Attendees
                    </>
                  )}
                </button>
              </div>
              
              {isAddingAttendees ? (
                <div className="space-y-4">
                  {/* Current attendees with remove option */}
                  {lecture.attendees.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Current Attendees</h5>
                      <div className="flex flex-wrap gap-2">
                        {lecture.attendees.map(attendeeId => {
                          const attendee = users.find(u => u.id === attendeeId);
                          return attendee ? (
                            <div key={attendee.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {attendee.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveAttendee(attendee.id)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Add new attendees */}
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Add Attendees</h5>
                    {potentialAttendees.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {potentialAttendees.map(user => (
                            <li key={user.id} className="px-3 py-2 hover:bg-gray-50 flex justify-between items-center">
                              <div className="flex items-center">
                                <img
                                  className="h-6 w-6 rounded-full"
                                  src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                  alt=""
                                />
                                <span className="ml-2 text-sm text-gray-700">{user.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddAttendee(user.id)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No more users available to add.</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {lecture.attendees.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {lecture.attendees.map(attendeeId => {
                        const attendee = users.find(u => u.id === attendeeId);
                        return attendee ? (
                          <span key={attendee.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {attendee.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No attendees assigned.</p>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {isAddMaterialModalOpen && (
        <AddLectureMaterialModal 
          lectureId={lectureId} 
          onClose={() => setIsAddMaterialModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default LectureDetails;