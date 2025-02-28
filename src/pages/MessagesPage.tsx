import React from 'react';
import MessageList from '../components/messaging/MessageList';

const MessagesPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Communicate securely with other medical staff
        </p>
      </div>
      
      <MessageList />
    </div>
  );
};

export default MessagesPage;