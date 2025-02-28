import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, isWithinInterval, addWeeks, addDays } from 'date-fns';
import { 
  User, 
  Shift, 
  SwapRequest, 
  Message, 
  ChatGroup, 
  GroupMessage, 
  Announcement, 
  Document, 
  Notification, 
  Vacation,
  ShiftNotification,
  EmailNotification,
  Lecture
} from '../types';

// Generate a unique ID
const generateId = () => uuidv4();

// Initial data for demo purposes
const initialUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@medical.org',
    role: 'physician',
    phone: '(555) 123-4567',
    specialty: 'Cardiology',
    isBackup: false,
    requiresBackup: false,
    isApproved: true,
    twoFactorEnabled: false,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      notifyBeforeShift: true,
      notifyBeforeShiftHours: 24,
      weeklyScheduleReminder: true,
      shiftSwapNotifications: true,
      vacationApprovalNotifications: true
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@medical.org',
    role: 'admin',
    phone: '(555) 987-6543',
    specialty: 'Neurology',
    isBackup: true,
    requiresBackup: false,
    isApproved: true,
    twoFactorEnabled: true,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      notifyBeforeShift: true,
      notifyBeforeShiftHours: 48,
      weeklyScheduleReminder: true,
      shiftSwapNotifications: true,
      vacationApprovalNotifications: true
    }
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@medical.org',
    role: 'physician',
    phone: '(555) 456-7890',
    specialty: 'Pediatrics',
    isBackup: false,
    requiresBackup: true,
    isApproved: true,
    twoFactorEnabled: false,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      notifyBeforeShift: true,
      notifyBeforeShiftHours: 24,
      weeklyScheduleReminder: true,
      shiftSwapNotifications: true,
      vacationApprovalNotifications: true
    }
  }
];

// Generate some initial shifts
const today = new Date();
const initialShifts: Shift[] = [
  {
    id: '1',
    date: format(today, 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '16:00',
    userId: '1',
    status: 'scheduled'
  },
  {
    id: '2',
    date: format(addDays(today, 1), 'yyyy-MM-dd'),
    startTime: '16:00',
    endTime: '00:00',
    userId: '2',
    status: 'scheduled'
  },
  {
    id: '3',
    date: format(addDays(today, 2), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '16:00',
    userId: '3',
    backupUserId: '2',
    status: 'scheduled'
  }
];

// Initial swap requests
const initialSwapRequests: SwapRequest[] = [];

// Initial messages
const initialMessages: Message[] = [];

// Initial chat groups
const initialChatGroups: ChatGroup[] = [
  {
    id: '1',
    name: 'Cardiology Team',
    description: 'Discussion group for cardiology department',
    createdById: '1',
    members: ['1', '2'],
    createdAt: new Date().toISOString()
  }
];

// Initial group messages
const initialGroupMessages: GroupMessage[] = [];

// Initial announcements
const initialAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New Scheduling System',
    content: 'We are pleased to announce the launch of our new staff scheduling system. This will streamline the process of managing shifts and requesting time off.',
    authorId: '2',
    isPinned: true,
    createdAt: new Date().toISOString()
  }
];

// Initial documents
const initialDocuments: Document[] = [
  {
    id: '1',
    title: 'COVID-19 Protocol',
    description: 'Updated guidelines for handling COVID-19 cases',
    url: 'https://example.com/covid-protocol.pdf',
    category: 'protocol',
    uploadedById: '2',
    createdAt: new Date().toISOString()
  }
];

// Initial notifications
const initialNotifications: Notification[] = [];

// Initial vacations
const initialVacations: Vacation[] = [];

// Initial lectures
const initialLectures: Lecture[] = [];

// Define the store
interface AppState {
  // User state
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Shift state
  shifts: Shift[];
  swapRequests: SwapRequest[];
  
  // Communication state
  messages: Message[];
  chatGroups: ChatGroup[];
  groupMessages: GroupMessage[];
  announcements: Announcement[];
  
  // Document state
  documents: Document[];
  
  // Notification state
  notifications: Notification[];
  
  // Vacation state
  vacations: Vacation[];
  
  // Lecture state
  lectures: Lecture[];
  
  // User actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => void;
  addUser: (userData: Partial<User>) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  approveUser: (userId: string) => void;
  updateUserNotificationSettings: (userId: string, settings: any) => void;
  
  // Shift actions
  addShift: (shiftData: Partial<Shift>) => void;
  updateShift: (shiftId: string, shiftData: Partial<Shift>) => void;
  deleteShift: (shiftId: string) => void;
  requestSwap: (shiftId: string, requestedById: string, requestedToId: string) => void;
  approveSwap: (swapRequestId: string) => void;
  rejectSwap: (swapRequestId: string) => void;
  
  // Communication actions
  sendMessage: (messageData: Partial<Message>) => void;
  markMessageAsRead: (messageId: string) => void;
  createChatGroup: (groupData: Partial<ChatGroup>) => void;
  addUserToGroup: (groupId: string, userId: string) => void;
  removeUserFromGroup: (groupId: string, userId: string) => void;
  sendGroupMessage: (messageData: Partial<GroupMessage>) => void;
  addAnnouncement: (announcementData: Partial<Announcement>) => void;
  updateAnnouncement: (announcementId: string, announcementData: Partial<Announcement>) => void;
  deleteAnnouncement: (announcementId: string) => void;
  
  // Document actions
  addDocument: (documentData: Partial<Document>) => void;
  updateDocument: (documentId: string, documentData: Partial<Document>) => void;
  deleteDocument: (documentId: string) => void;
  
  // Notification actions
  addNotification: (notificationData: Partial<Notification>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: (userId: string) => void;
  sendShiftNotification: (notificationData: ShiftNotification) => void;
  sendEmailNotification: (notificationData: EmailNotification) => void;
  
  // Vacation actions
  addVacation: (vacationData: Partial<Vacation>) => void;
  updateVacationStatus: (vacationId: string, status: string) => void;
  deleteVacation: (vacationId: string) => void;
  isUserOnVacation: (userId: string, date: string | Date) => boolean;
  
  // Lecture actions
  addLecture: (lectureData: Partial<Lecture>) => void;
  updateLecture: (lectureId: string, lectureData: Partial<Lecture>) => void;
  deleteLecture: (lectureId: string) => void;
  generateLectures: (startDate: string, count: number) => void;
  addLectureMaterial: (lectureId: string, documentData: Partial<Document>) => void;
  checkUpcomingLectures: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  users: initialUsers,
  currentUser: null,
  isAuthenticated: false,
  shifts: initialShifts,
  swapRequests: initialSwapRequests,
  messages: initialMessages,
  chatGroups: initialChatGroups,
  groupMessages: initialGroupMessages,
  announcements: initialAnnouncements,
  documents: initialDocuments,
  notifications: initialNotifications,
  vacations: initialVacations,
  lectures: initialLectures,
  
  // User actions
  login: async (email, password) => {
    // In a real app, this would make an API call
    const user = get().users.find(u => u.email === email);
    
    if (user && user.isApproved) {
      // For demo purposes, any password works
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }
    
    return false;
  },
  
  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },
  
  register: (userData) => {
    const newUser: User = {
      id: generateId(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'physician',
      phone: userData.phone || '',
      specialty: userData.specialty,
      isBackup: userData.isBackup || false,
      requiresBackup: userData.requiresBackup || false,
      isApproved: false, // New users need approval
      twoFactorEnabled: userData.twoFactorEnabled || false,
      notificationSettings: userData.notificationSettings || {
        emailNotifications: true,
        pushNotifications: true,
        notifyBeforeShift: true,
        notifyBeforeShiftHours: 24,
        weeklyScheduleReminder: true,
        shiftSwapNotifications: true,
        vacationApprovalNotifications: true
      }
    };
    
    set(state => ({
      users: [...state.users, newUser]
    }));
  },
  
  addUser: (userData) => {
    const newUser: User = {
      id: generateId(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'physician',
      phone: userData.phone || '',
      specialty: userData.specialty,
      isBackup: userData.isBackup || false,
      requiresBackup: userData.requiresBackup || false,
      isApproved: userData.isApproved !== undefined ? userData.isApproved : true,
      twoFactorEnabled: userData.twoFactorEnabled || false,
      avatar: userData.avatar,
      notificationSettings: userData.notificationSettings || {
        emailNotifications: true,
        pushNotifications: true,
        notifyBeforeShift: true,
        notifyBeforeShiftHours: 24,
        weeklyScheduleReminder: true,
        shiftSwapNotifications: true,
        vacationApprovalNotifications: true
      }
    };
    
    set(state => ({
      users: [...state.users, newUser]
    }));
  },
  
  updateUser: (userId, userData) => {
    set(state => ({
      users: state.users.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ),
      // Update currentUser if it's the same user
      currentUser: state.currentUser?.id === userId 
        ? { ...state.currentUser, ...userData }
        : state.currentUser
    }));
  },
  
  deleteUser: (userId) => {
    // Remove user from all groups
    const updatedGroups = get().chatGroups.map(group => ({
      ...group,
      members: group.members.filter(id => id !== userId)
    }));
    
    // Remove user's shifts
    const updatedShifts = get().shifts.filter(shift => 
      shift.userId !== userId && shift.backupUserId !== userId
    );
    
    // Remove user's messages
    const updatedMessages = get().messages.filter(message => 
      message.senderId !== userId && message.receiverId !== userId
    );
    
    // Remove user's group messages
    const updatedGroupMessages = get().groupMessages.filter(message => 
      message.senderId !== userId
    );
    
    // Remove user's announcements
    const updatedAnnouncements = get().announcements.filter(announcement => 
      announcement.authorId !== userId
    );
    
    // Remove user's documents
    const updatedDocuments = get().documents.filter(document => 
      document.uploadedById !== userId
    );
    
    // Remove user's notifications
    const updatedNotifications = get().notifications.filter(notification => 
      notification.userId !== userId
    );
    
    // Remove user's vacations
    const updatedVacations = get().vacations.filter(vacation => 
      vacation.userId !== userId
    );
    
    set(state => ({
      users: state.users.filter(user => user.id !== userId),
      chatGroups: updatedGroups,
      shifts: updatedShifts,
      messages: updatedMessages,
      groupMessages: updatedGroupMessages,
      announcements: updatedAnnouncements,
      documents: updatedDocuments,
      notifications: updatedNotifications,
      vacations: updatedVacations
    }));
  },
  
  approveUser: (userId) => {
    set(state => ({
      users: state.users.map(user => 
        user.id === userId ? { ...user, isApproved: true } : user
      )
    }));
  },
  
  updateUserNotificationSettings: (userId, settings) => {
    set(state => ({
      users: state.users.map(user => 
        user.id === userId ? { 
          ...user, 
          notificationSettings: {
            ...user.notificationSettings,
            ...settings
          }
        } : user
      ),
      // Update currentUser if it's the same user
      currentUser: state.currentUser?.id === userId 
        ? { 
            ...state.currentUser, 
            notificationSettings: {
              ...state.currentUser.notificationSettings,
              ...settings
            }
          }
        : state.currentUser
    }));
  },
  
  // Shift actions
  addShift: (shiftData) => {
    const newShift: Shift = {
      id: generateId(),
      date: shiftData.date || format(new Date(), 'yyyy-MM-dd'),
      startTime: shiftData.startTime || '08:00',
      endTime: shiftData.endTime || '16:00',
      userId: shiftData.userId || '',
      backupUserId: shiftData.backupUserId,
      status: shiftData.status || 'scheduled'
    };
    
    set(state => ({
      shifts: [...state.shifts, newShift]
    }));
    
    // Notify the assigned user
    if (newShift.userId) {
      const newNotification: Notification = {
        id: generateId(),
        userId: newShift.userId,
        type: 'shift',
        title: 'New Shift Assignment',
        content: `You have been assigned a shift on ${newShift.date} from ${newShift.startTime} to ${newShift.endTime}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: newShift.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    }
    
    // Notify the backup user if assigned
    if (newShift.backupUserId) {
      const newNotification: Notification = {
        id: generateId(),
        userId: newShift.backupUserId,
        type: 'shift',
        title: 'Backup Assignment',
        content: `You have been assigned as backup for a shift on ${newShift.date} from ${newShift.startTime} to ${newShift.endTime}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: newShift.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    }
  },
  
  updateShift: (shiftId, shiftData) => {
    const oldShift = get().shifts.find(s => s.id === shiftId);
    
    set(state => ({
      shifts: state.shifts.map(shift => 
        shift.id === shiftId ? { ...shift, ...shiftData } : shift
      )
    }));
    
    // If backup user changed, notify the new backup
    if (shiftData.backupUserId && oldShift && shiftData.backupUserId !== oldShift.backupUserId) {
      const shift = get().shifts.find(s => s.id === shiftId);
      
      if (shift) {
        const newNotification: Notification = {
          id: generateId(),
          userId: shiftData.backupUserId,
          type: 'shift',
          title: 'Backup Assignment',
          content: `You have been assigned as backup for a shift on ${shift.date} from ${shift.startTime} to ${shift.endTime}`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: shift.id
        };
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));
      }
    }
  },
  
  deleteShift: (shiftId) => {
    set(state => ({
      shifts: state.shifts.filter(shift => shift.id !== shiftId),
      // Also remove any swap requests for this shift
      swapRequests: state.swapRequests.filter(req => req.shiftId !== shiftId)
    }));
  },
  
  requestSwap: (shiftId, requestedById, requestedToId) => {
    const newSwapRequest: SwapRequest = {
      id: generateId(),
      shiftId,
      requestedById,
      requestedToId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      swapRequests: [...state.swapRequests, newSwapRequest]
    }));
    
    // Update shift status
    set(state => ({
      shifts: state.shifts.map(shift => 
        shift.id === shiftId ? { ...shift, status: 'swapRequested' } : shift
      )
    }));
    
    // Notify the requested user
    const shift = get().shifts.find(s => s.id === shiftId);
    
    if (shift) {
      const newNotification: Notification = {
        id: generateId(),
        userId: requestedToId,
        type: 'swap',
        title: 'Shift Swap Request',
        content: `You have received a request to swap shifts for ${shift.date} from ${shift.startTime} to ${shift.endTime}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: newSwapRequest.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    }
  },
  
  approveSwap: (swapRequestId) => {
    const swapRequest = get().swapRequests.find(req => req.id === swapRequestId);
    
    if (!swapRequest) return;
    
    // Update swap request status
    set(state => ({
      swapRequests: state.swapRequests.map(req => 
        req.id === swapRequestId ? { ...req, status: 'approved' } : req
      )
    }));
    
    // Get the shift
    const shift = get().shifts.find(s => s.id === swapRequest.shiftId);
    
    if (shift) {
      // Swap the users
      set(state => ({
        shifts: state.shifts.map(s => 
          s.id === shift.id ? { 
            ...s, 
            userId: swapRequest.requestedToId,
            status: 'swapApproved'
          } : s
        )
      }));
      
      // Notify the requester
      const newNotification: Notification = {
        id: generateId(),
        userId: swapRequest.requestedById,
        type: 'swap',
        title: 'Shift Swap Approved',
        content: `Your shift swap request for ${shift.date} has been approved`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: swapRequest.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    }
  },
  
  rejectSwap: (swapRequestId) => {
    const swapRequest = get().swapRequests.find(req => req.id === swapRequestId);
    
    if (!swapRequest) return;
    
    // Update swap request status
    set(state => ({
      swapRequests: state.swapRequests.map(req => 
        req.id === swapRequestId ? { ...req, status: 'rejected' } : req
      )
    }));
    
    // Reset shift status
    const shift = get().shifts.find(s => s.id === swapRequest.shiftId);
    
    if (shift) {
      set(state => ({
        shifts: state.shifts.map(s => 
          s.id === shift.id ? { ...s, status: 'scheduled' } : s
        )
      }));
      
      // Notify the requester
      const newNotification: Notification = {
        id: generateId(),
        userId: swapRequest.requestedById,
        type: 'swap',
        title: 'Shift Swap Rejected',
        content: `Your shift swap request for ${shift.date} has been rejected`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: swapRequest.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    }
  },
  
  // Communication actions
  sendMessage: (messageData) => {
    const newMessage: Message = {
      id: generateId(),
      senderId: messageData.senderId || '',
      receiverId: messageData.receiverId || '',
      content: messageData.content || '',
      attachments: messageData.attachments || [],
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      messages: [...state.messages, newMessage]
    }));
    
    // Create notification for receiver
    const newNotification: Notification = {
      id: generateId(),
      userId: newMessage.receiverId,
      type: 'message',
      content: `New message from ${get().users.find(u => u.id === newMessage.senderId)?.name}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: newMessage.id
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));
  },
  
  markMessageAsRead: (messageId) => {
    set(state => ({
      messages: state.messages.map(message => 
        message.id === messageId ? { ...message, isRead: true } : message
      )
    }));
  },
  
  createChatGroup: (groupData) => {
    const newGroup: ChatGroup = {
      id: generateId(),
      name: groupData.name || 'New Group',
      description: groupData.description,
      createdById: groupData.createdById || '',
      members: groupData.members || [],
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      chatGroups: [...state.chatGroups, newGroup]
    }));
    
    // Notify all members except creator
    const membersToNotify = newGroup.members.filter(id => id !== newGroup.createdById);
    
    membersToNotify.forEach(userId => {
      const newNotification: Notification = {
        id: generateId(),
        userId,
        type: 'message',
        content: `You have been added to the group "${newGroup.name}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: newGroup.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    });
  },
  
  addUserToGroup: (groupId, userId) => {
    set(state => ({
      chatGroups: state.chatGroups.map(group => 
        group.id === groupId ? { 
          ...group, 
          members: [...group.members, userId]
        } : group
      )
    }));
    
    // Notify the added user
    const group = get().chatGroups.find(g => g.id === groupId);
    
    if (group) {
      const newNotification: Notification = {
        id: generateId(),
        userId,
        type: 'message',
        content: `You have been added to the group "${group.name}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: group.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    }
  },
  
  removeUserFromGroup: (groupId, userId) => {
    set(state => ({
      chatGroups: state.chatGroups.map(group => 
        group.id === groupId ? { 
          ...group, 
          members: group.members.filter(id => id !== userId)
        } : group
      )
    }));
  },
  
  sendGroupMessage: (messageData) => {
    const newMessage: GroupMessage = {
      id: generateId(),
      groupId: messageData.groupId || '',
      senderId: messageData.senderId || '',
      content: messageData.content || '',
      attachments: messageData.attachments || [],
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      groupMessages: [...state.groupMessages, newMessage]
    }));
    
    // Get group members to notify
    const group = get().chatGroups.find(g => g.id === newMessage.groupId);
    
    if (group) {
      // Notify all members except sender
      const membersToNotify = group.members.filter(id => id !== newMessage.senderId);
      
      membersToNotify.forEach(userId => {
        const newNotification: Notification = {
          id: generateId(),
          userId,
          type: 'message',
          content: `New message in "${group.name}" from ${get().users.find(u => u.id === newMessage.senderId)?.name}`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: newMessage.id
        };
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));
      });
    }
  },
  
  addAnnouncement: (announcementData) => {
    const newAnnouncement: Announcement = {
      id: generateId(),
      title: announcementData.title || '',
      content: announcementData.content || '',
      authorId: announcementData.authorId || '',
      isPinned: announcementData.isPinned || false,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      announcements: [...state.announcements, newAnnouncement]
    }));
    
    // Notify all users
    const users = get().users;
    
    users.forEach(user => {
      // Don't notify the author
      if (user.id === newAnnouncement.authorId) return;
      
      const newNotification: Notification = {
        id: generateId(),
        userId: user.id,
        type: 'announcement',
        title: 'New Announcement',
        content: `New announcement: ${newAnnouncement.title}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: newAnnouncement.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    });
  },
  
  updateAnnouncement: (announcementId, announcementData) => {
    set(state => ({
      announcements: state.announcements.map(announcement => 
        announcement.id === announcementId ? { ...announcement, ...announcementData } : announcement
      )
    }));
  },
  
  deleteAnnouncement: (announcementId) => {
    set(state => ({
      announcements: state.announcements.filter(announcement => announcement.id !== announcementId)
    }));
  },
  
  // Document actions
  addDocument: (documentData) => {
    const newDocument: Document = {
      id: generateId(),
      title: documentData.title || '',
      description: documentData.description || '',
      url: documentData.url || '',
      category: documentData.category || 'procedure',
      uploadedById: documentData.uploadedById || '',
      createdAt: new Date().toISOString(),
      lectureId: documentData.lectureId
    };
    
    set(state => ({
      documents: [...state.documents, newDocument]
    }));
  },
  
  updateDocument: (documentId, documentData) => {
    set(state => ({
      documents: state.documents.map(document => 
        document.id === documentId ? { ...document, ...documentData } : document
      )
    }));
  },
  
  deleteDocument: (documentId) => {
    set(state => ({
      documents: state.documents.filter(document => document.id !== documentId)
    }));
  },
  
  // Notification actions
  addNotification: (notificationData) => {
    const newNotification: Notification = {
      id: generateId(),
      userId: notificationData.userId || '',
      type: notificationData.type || 'shift',
      title: notificationData.title,
      content: notificationData.content || '',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: notificationData.relatedId
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));
  },
  
  markNotificationAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(notification => 
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      )
    }));
  },
  
  clearNotifications: (userId) => {
    set(state => ({
      notifications: state.notifications.filter(notification => notification.userId !== userId)
    }));
  },
  
  sendShiftNotification: (notificationData) => {
    const newNotification: Notification = {
      id: generateId(),
      userId: notificationData.userId,
      type: 'shift',
      title: notificationData.title,
      content: notificationData.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: notificationData.shiftId
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));
  },
  
  sendEmailNotification: (notificationData) => {
    // In a real app, this would send an actual email
    console.log(`Email sent to ${notificationData.userId}:`, {
      subject: notificationData.subject,
      message: notificationData.message
    });
    
    // For demo purposes, we'll just add a notification
    const newNotification: Notification = {
      id: generateId(),
      userId: notificationData.userId,
      type: 'shift',
      title: `Email: ${notificationData.subject}`,
      content: notificationData.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: notificationData.shiftId
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));
  },
  
  // Vacation actions
  addVacation: (vacationData) => {
    const newVacation: Vacation = {
      id: generateId(),
      userId: vacationData.userId || '',
      startDate: vacationData.startDate || '',
      endDate: vacationData.endDate || '',
      status: vacationData.status || 'pending',
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      vacations: [...state.vacations, newVacation]
    }));
  },
  
  updateVacationStatus: (vacationId, status) => {
    set(state => ({
      vacations: state.vacations.map(vacation => 
        vacation.id === vacationId ? { ...vacation, status } : vacation
      )
    }));
    
    // Add notification for the user
    const vacation = get().vacations.find(v => v.id === vacationId);
    
    if (vacation) {
      const newNotification: Notification = {
        id: generateId(),
        userId: vacation.userId,
        type: 'shift',
        title: `Vacation Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        content: `Your vacation request from ${vacation.startDate} to ${vacation.endDate} has been ${status}`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    }
  },
  
  deleteVacation: (vacationId) => {
    set(state => ({
      vacations: state.vacations.filter(vacation => vacation.id !== vacationId)
    }));
  },
  
  isUserOnVacation: (userId, date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    return get().vacations.some(vacation => 
      vacation.userId === userId && 
      vacation.status === 'approved' &&
      isWithinInterval(dateObj, {
        start: parseISO(vacation.startDate),
        end: parseISO(vacation.endDate)
      })
    );
  },
  
  // Lecture actions
  addLecture: (lectureData) => {
    const newLecture: Lecture = {
      id: generateId(),
      title: lectureData.title || '',
      description: lectureData.description || '',
      date: lectureData.date || format(new Date(), 'yyyy-MM-dd'),
      startTime: lectureData.startTime || '12:00',
      endTime: lectureData.endTime || '13:00',
      presenterId: lectureData.presenterId || '',
      location: lectureData.location || 'Conference Room A',
      status: lectureData.status || 'scheduled',
      attendees: lectureData.attendees || [],
      createdAt: new Date().toISOString(),
      materials: lectureData.materials
    };
    
    set(state => ({
      lectures: [...state.lectures, newLecture]
    }));
    
    // Send notification to the presenter
    if (newLecture.presenterId) {
      const lectureDate = parseISO(newLecture.date);
      const formattedDate = format(lectureDate, 'EEEE, MMMM d, yyyy');
      
      const newNotification: Notification = {
        id: generateId(),
        userId: newLecture.presenterId,
        type: 'lecture',
        title: 'New Lecture Assignment',
        content: `You have been assigned to present a lecture on ${formattedDate} at ${newLecture.startTime}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: newLecture.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    }
  },
  
  updateLecture: (lectureId, lectureData) => {
    const oldLecture = get().lectures.find(l => l.id === lectureId);
    
    set(state => ({
      lectures: state.lectures.map(lecture => 
        lecture.id === lectureId ? { ...lecture, ...lectureData } : lecture
      )
    }));
    
    // If presenter changed, notify the new presenter
    if (lectureData.presenterId && oldLecture && lectureData.presenterId !== oldLecture.presenterId) {
      const lecture = get().lectures.find(l => l.id === lectureId);
      
      if (lecture) {
        const lectureDate = parseISO(lecture.date);
        const formattedDate = format(lectureDate, 'EEEE, MMMM d, yyyy');
        
        const newNotification: Notification = {
          id: generateId(),
          userId: lectureData.presenterId,
          type: 'lecture',
          title: 'New Lecture Assignment',
          content: `You have been assigned to present a lecture on ${formattedDate} at ${lecture.startTime}.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: lecture.id
        };
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));
      }
    }
  },
  
  deleteLecture: (lectureId) => {
    set(state => ({
      lectures: state.lectures.filter(lecture => lecture.id !== lectureId),
      // Remove associated documents
      documents: state.documents.filter(doc => doc.lectureId !== lectureId)
    }));
  },
  
  generateLectures: (startDate, count) => {
    const lectures: Lecture[] = [];
    const users = get().users.filter(user => user.role === 'physician' && user.isApproved);
    
    if (users.length === 0) return;
    
    let currentDate = parseISO(startDate);
    
    // Generate lectures, rotating presenters
    for (let i = 0; i < count; i++) {
      // Set to Wednesday (3) if not already
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 3) {
        const daysToAdd = (3 - dayOfWeek + 7) % 7;
        currentDate = addDays(currentDate, daysToAdd);
      }
      
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      
      // Select presenter (rotate through users)
      const presenterIndex = i % users.length;
      const presenter = users[presenterIndex];
      
      // All users except the presenter are attendees
      const attendees = users
        .filter(user => user.id !== presenter.id)
        .map(user => user.id);
      
      const newLecture: Lecture = {
        id: generateId(),
        title: '', // Leave title empty as requested
        description: `Educational lecture presented by ${presenter.name}`,
        date: formattedDate,
        startTime: '08:00', // Set to 08:00-09:00 as requested
        endTime: '09:00',
        presenterId: presenter.id,
        location: 'Conference Room A',
        status: 'scheduled',
        attendees,
        createdAt: new Date().toISOString()
      };
      
      lectures.push(newLecture);
      
      // Move to next week
      currentDate = addWeeks(currentDate, 1);
    }
    
    // Add all generated lectures
    set(state => ({
      lectures: [...state.lectures, ...lectures]
    }));
    
    // Send notifications to presenters
    lectures.forEach(lecture => {
      const lectureDate = parseISO(lecture.date);
      const formattedDate = format(lectureDate, 'EEEE, MMMM d, yyyy');
      
      const newNotification: Notification = {
        id: generateId(),
        userId: lecture.presenterId,
        type: 'lecture',
        title: 'New Lecture Assignment',
        content: `You have been assigned to present a lecture on ${formattedDate} at ${lecture.startTime}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedId: lecture.id
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));
    });
  },
  
  addLectureMaterial: (lectureId, documentData) => {
    // Add document
    const documentId = generateId();
    const newDocument: Document = {
      id: documentId,
      title: documentData.title || 'Lecture Material',
      description: documentData.description || '',
      url: documentData.url || '',
      category: 'lecture',
      uploadedById: documentData.uploadedById || '',
      createdAt: new Date().toISOString(),
      lectureId
    };
    
    set(state => ({
      documents: [...state.documents, newDocument]
    }));
    
    // Update lecture to reference the material
    set(state => ({
      lectures: state.lectures.map(lecture => {
        if (lecture.id === lectureId) {
          const materials = lecture.materials ? [...lecture.materials, documentId] : [documentId];
          return { ...lecture, materials };
        }
        return lecture;
      })
    }));
  },
  
  checkUpcomingLectures: () => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    
    const now = new Date();
    const lectures = get().lectures;
    
    // Check for lectures where the current user is the presenter
    lectures.forEach(lecture => {
      if (lecture.presenterId === currentUser.id && lecture.status === 'scheduled') {
        const lectureDate = parseISO(lecture.date);
        
        // Check if lecture is in 7 days
        const sevenDaysFromNow = addDays(now, 7);
        const isInSevenDays = 
          lectureDate > now && 
          lectureDate <= sevenDaysFromNow;
        
        if (isInSevenDays) {
          // Check if notification already exists
          const notificationExists = get().notifications.some(n => 
            n.userId === currentUser.id && 
            n.type === 'lecture' && 
            n.relatedId === lecture.id &&
            n.title === 'Upcoming Lecture Reminder'
          );
          
          if (!notificationExists) {
            // Send reminder notification
            const formattedDate = format(lectureDate, 'EEEE, MMMM d, yyyy');
            
            const newNotification: Notification = {
              id: generateId(),
              userId: currentUser.id,
              type: 'lecture',
              title: 'Upcoming Lecture Reminder',
              content: `Reminder: You are scheduled to present a lecture on ${formattedDate} at ${lecture.startTime}.`,
              isRead: false,
              createdAt: new Date().toISOString(),
              relatedId: lecture.id
            };
            
            set(state => ({
              notifications: [...state.notifications, newNotification]
            }));
            
            // In a real app, we would also send an email here
            console.log(`Email reminder sent to ${currentUser.email} about upcoming lecture`);
          }
        }
      }
    });
  }
}));