import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { format, parseISO } from 'date-fns';
import { Search, Users, UserPlus, Info } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';
import GroupInfoModal from './GroupInfoModal';

const MessageList: React.FC = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const users = useAppStore(state => state.users);
  const messages = useAppStore(state => state.messages);
  const chatGroups = useAppStore(state => state.chatGroups);
  const groupMessages = useAppStore(state => state.groupMessages);
  const markMessageAsRead = useAppStore(state => state.markMessageAsRead);
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  
  const sendMessage = useAppStore(state => state.sendMessage);
  const sendGroupMessage = useAppStore(state => state.sendGroupMessage);
  
  // Reset selections when changing tabs
  useEffect(() => {
    setSelectedUserId(null);
    setSelectedGroupId(null);
  }, [activeTab]);
  
  // Filter users to exclude current user
  const otherUsers = users.filter(user => user.id !== currentUser?.id);
  
  // Filter users based on search term
  const filteredUsers = otherUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter groups based on search term
  const filteredGroups = chatGroups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (currentUser ? group.members.includes(currentUser.id) : false)
  );
  
  // Get conversations for the current user
  const getConversations = () => {
    if (!currentUser) return [];
    
    // Get all users the current user has exchanged messages with
    const conversationUserIds = new Set<string>();
    
    messages.forEach(message => {
      if (message.senderId === currentUser.id) {
        conversationUserIds.add(message.receiverId);
      } else if (message.receiverId === currentUser.id) {
        conversationUserIds.add(message.senderId);
      }
    });
    
    // Convert to array and filter by search term
    return Array.from(conversationUserIds)
      .map(userId => users.find(user => user.id === userId))
      .filter(user => user && (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )) as typeof users;
  };
  
  // Get messages between current user and selected user
  const getConversationMessages = () => {
    if (!currentUser || !selectedUserId) return [];
    
    return messages.filter(message => 
      (message.senderId === currentUser.id && message.receiverId === selectedUserId) ||
      (message.senderId === selectedUserId && message.receiverId === currentUser.id)
    ).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };
  
  // Get messages for selected group
  const getGroupMessages = () => {
    if (!selectedGroupId) return [];
    
    return groupMessages.filter(message => 
      message.groupId === selectedGroupId
    ).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };
  
  // Mark unread messages as read when conversation is selected
  useEffect(() => {
    if (!currentUser || !selectedUserId) return;
    
    const unreadMessages = messages.filter(message => 
      message.senderId === selectedUserId && 
      message.receiverId === currentUser.id && 
      !message.isRead
    );
    
    unreadMessages.forEach(message => {
      markMessageAsRead(message.id);
    });
  }, [selectedUserId, messages, currentUser, markMessageAsRead]);
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || (!selectedUserId && !selectedGroupId) || !messageText.trim()) return;
    
    if (selectedUserId) {
      // Send direct message
      sendMessage({
        senderId: currentUser.id,
        receiverId: selectedUserId,
        content: messageText.trim()
      });
    } else if (selectedGroupId) {
      // Send group message
      sendGroupMessage({
        groupId: selectedGroupId,
        senderId: currentUser.id,
        content: messageText.trim()
      });
    }
    
    setMessageText('');
  };
  
  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };
  
  // Get user avatar by ID
  const getUserAvatar = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  };
  
  // Get unread message count for a user
  const getUnreadCount = (userId: string) => {
    if (!currentUser) return 0;
    
    return messages.filter(message => 
      message.senderId === userId && 
      message.receiverId === currentUser.id && 
      !message.isRead
    ).length;
  };
  
  // Get unread message count for a group
  const getGroupUnreadCount = (groupId: string) => {
    if (!currentUser) return 0;
    
    // This is a simplified approach. In a real app, you'd track read status per user per message
    const lastReadTime = new Date(Date.now() - 86400000); // Assume messages older than 1 day are read
    
    return groupMessages.filter(message => 
      message.groupId === groupId && 
      message.senderId !== currentUser.id &&
      new Date(message.createdAt) > lastReadTime
    ).length;
  };
  
  // Get group members as a string
  const getGroupMembersString = (groupId: string) => {
    const group = chatGroups.find(g => g.id === groupId);
    if (!group) return '';
    
    const memberNames = group.members
      .map(id => getUserName(id))
      .slice(0, 3);
    
    if (group.members.length > 3) {
      return `${memberNames.join(', ')} +${group.members.length - 3} more`;
    }
    
    return memberNames.join(', ');
  };
  
  const conversations = getConversations();
  const conversationMessages = getConversationMessages();
  const currentGroupMessages = getGroupMessages();
  
  // Determine which messages to display based on selection
  const displayMessages = selectedUserId ? conversationMessages : currentGroupMessages;
  
  // Get the name of the current conversation
  const currentConversationName = selectedUserId 
    ? getUserName(selectedUserId)
    : selectedGroupId 
      ? chatGroups.find(g => g.id === selectedGroupId)?.name 
      : '';
  
  // Get the avatar of the current conversation
  const currentConversationAvatar = selectedUserId 
    ? getUserAvatar(selectedUserId)
    : selectedGroupId 
      ? chatGroups.find(g => g.id === selectedGroupId)?.avatar || "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      : "";
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'direct'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('direct')}
            >
              Direct Messages
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'groups'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('groups')}
            >
              Group Chats
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {activeTab === 'direct' ? (
              <>
                <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recent Conversations
                </h3>
                <ul className="divide-y divide-gray-200">
                  {conversations.length > 0 ? (
                    conversations.map(user => (
                      <li
                        key={user.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedUserId === user.id ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSelectedGroupId(null);
                        }}
                      >
                        <div className="flex items-center px-4 py-3 relative">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                            alt=""
                          />
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.specialty || user.role}
                            </p>
                          </div>
                          {getUnreadCount(user.id) > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                              {getUnreadCount(user.id)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-gray-500">
                      No conversations yet
                    </li>
                  )}
                </ul>
                
                <h3 className="px-4 pt-6 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  All Users
                </h3>
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <li
                        key={user.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedUserId === user.id ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSelectedGroupId(null);
                        }}
                      >
                        <div className="flex items-center px-4 py-3">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                            alt=""
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.specialty || user.role}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-gray-500">
                      No users found
                    </li>
                  )}
                </ul>
              </>
            ) : (
              <>
                <div className="px-4 pt-4 pb-2 flex justify-between items-center">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Your Groups
                  </h3>
                  <button
                    onClick={() => setIsCreateGroupModalOpen(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    New Group
                  </button>
                </div>
                <ul className="divide-y divide-gray-200">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map(group => (
                      <li
                        key={group.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedGroupId === group.id ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setSelectedUserId(null);
                        }}
                      >
                        <div className="flex items-center px-4 py-3 relative">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {group.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getGroupMembersString(group.id)}
                            </p>
                          </div>
                          {getGroupUnreadCount(group.id) > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                              {getGroupUnreadCount(group.id)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-gray-500">
                      No groups found
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="w-2/3 flex flex-col h-full">
          {selectedUserId || selectedGroupId ? (
            <>
              {/* Chat header */}
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center">
                  {selectedGroupId ? (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  ) : (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={currentConversationAvatar}
                      alt=""
                    />
                  )}
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {currentConversationName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedUserId 
                        ? users.find(u => u.id === selectedUserId)?.specialty || 
                          users.find(u => u.id === selectedUserId)?.role
                        : selectedGroupId
                          ? chatGroups.find(g => g.id === selectedGroupId)?.description || 
                            `${chatGroups.find(g => g.id === selectedGroupId)?.members.length} members`
                          : ''}
                    </p>
                  </div>
                </div>
                {selectedGroupId && (
                  <button
                    onClick={() => setIsGroupInfoModalOpen(true)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Group Info"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {displayMessages.length > 0 ? (
                  displayMessages.map(message => {
                    const isCurrentUser = message.senderId === currentUser?.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCurrentUser && (
                          <img
                            className="h-8 w-8 rounded-full mr-2"
                            src={getUserAvatar(message.senderId)}
                            alt=""
                          />
                        )}
                        <div
                          className={`rounded-lg px-4 py-2 max-w-xs ${
                            isCurrentUser
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {selectedGroupId && !isCurrentUser && (
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              {getUserName(message.senderId)}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(message.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-gray-500">
                      No messages yet. Start a conversation!
                    </p>
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="px-4 py-3 border-t">
                <form onSubmit={handleSendMessage}>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'direct' 
                    ? 'Choose a user from the list to start messaging'
                    : 'Select a group chat or create a new one'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Group Modal */}
      {isCreateGroupModalOpen && (
        <CreateGroupModal onClose={() => setIsCreateGroupModalOpen(false)} />
      )}
      
      {/* Group Info Modal */}
      {isGroupInfoModalOpen && selectedGroupId && (
        <GroupInfoModal 
          groupId={selectedGroupId} 
          onClose={() => setIsGroupInfoModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default MessageList;