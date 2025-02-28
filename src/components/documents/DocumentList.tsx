import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { format, parseISO } from 'date-fns';
import { FileText, Plus, Search, Filter, Download, BookOpen } from 'lucide-react';
import AddDocumentModal from './AddDocumentModal';

const DocumentList: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const documents = useAppStore(state => state.documents);
  const users = useAppStore(state => state.users);
  const lectures = useAppStore(state => state.lectures);
  const currentUser = useAppStore(state => state.currentUser);
  
  // Filter documents based on search term and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort documents by creation date (newest first)
  const sortedDocuments = [...filteredDocuments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };
  
  // Format category for display
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'procedure':
        return 'bg-blue-100 text-blue-800';
      case 'guideline':
        return 'bg-green-100 text-green-800';
      case 'protocol':
        return 'bg-purple-100 text-purple-800';
      case 'lecture':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get lecture title for lecture materials
  const getLectureTitle = (lectureId?: string) => {
    if (!lectureId) return null;
    
    const lecture = lectures.find(l => l.id === lectureId);
    return lecture ? lecture.title : null;
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Medical Documents</h2>
        {currentUser && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Document
          </button>
        )}
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
              placeholder="Search documents..."
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="procedure">Procedures</option>
              <option value="guideline">Guidelines</option>
              <option value="protocol">Protocols</option>
              <option value="lecture">Lecture Materials</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Document list */}
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {sortedDocuments.length > 0 ? (
            sortedDocuments.map((document) => (
              <li key={document.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {document.category === 'lecture' ? (
                        <BookOpen className="h-10 w-10 text-indigo-400" />
                      ) : (
                        <FileText className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {document.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {document.description}
                      </p>
                      <div className="mt-2 flex items-center flex-wrap gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(document.category)}`}>
                          {formatCategory(document.category)}
                        </span>
                        {document.lectureId && (
                          <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">
                            Lecture: {getLectureTitle(document.lectureId)}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Uploaded by {getUserName(document.uploadedById)} on {format(parseISO(document.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding a new document.'}
              </p>
              {currentUser && !searchTerm && categoryFilter === 'all' && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Document
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
      
      {/* Add document modal */}
      {isAddModalOpen && (
        <AddDocumentModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};

export default DocumentList;