export type User = {
  id: string;
  name: string;
  email: string;
  role: 'physician' | 'admin';
  phone: string;
  specialty?: string;
  isBackup?: boolean;
  requiresBackup?: boolean; // New field to indicate if doctor needs supervision
  isShielded?: boolean; // New field to indicate if doctor is shielded from shifts
  shieldReason?: string; // Reason for shielding (pregnancy, sick leave, etc.)
  shieldEndDate?: string; // Optional end date for shielding period
  avatar?: string;
  isApproved: boolean;
  twoFactorEnabled: boolean;
  notificationSettings?: NotificationSettings;
};

export type NotificationSettings = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyBeforeShift: boolean;
  notifyBeforeShiftHours: number;
  weeklyScheduleReminder: boolean;
  shiftSwapNotifications: boolean;
  vacationApprovalNotifications: boolean;
};

export type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
  backupUserId?: string;
  status: 'scheduled' | 'completed' | 'swapRequested' | 'swapApproved';
};

export type SwapRequest = {
  id: string;
  shiftId: string;
  requestedById: string;
  requestedToId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: Attachment[];
  isRead: boolean;
  createdAt: string;
  isGroupMessage?: boolean;
};

export type ChatGroup = {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  members: string[];
  createdAt: string;
  avatar?: string;
};

export type GroupMessage = {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  attachments?: Attachment[];
  createdAt: string;
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'image' | 'other';
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: string;
};

export type Document = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'procedure' | 'guideline' | 'protocol' | 'lecture';
  uploadedById: string;
  createdAt: string;
  lectureId?: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'shift' | 'message' | 'announcement' | 'swap' | 'lecture';
  title?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
};

export type Vacation = {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export type ShiftNotification = {
  userId: string;
  title: string;
  message: string;
  shiftId?: string;
};

export type EmailNotification = {
  userId: string;
  subject: string;
  message: string;
  shiftId?: string;
};

export type Lecture = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  presenterId: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  attendees: string[];
  createdAt: string;
  materials?: string[];
};