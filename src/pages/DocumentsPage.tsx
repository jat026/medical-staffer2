import React from 'react';
import DocumentList from '../components/documents/DocumentList';

const DocumentsPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Access medical procedures, guidelines, and protocols
        </p>
      </div>
      
      <DocumentList />
    </div>
  );
};

export default DocumentsPage;