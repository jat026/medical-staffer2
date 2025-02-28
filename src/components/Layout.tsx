import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users, 
  Bell, 
  Menu, 
  X, 
  LogOut,
  User,
  ClipboardList,
  Settings,
  BookOpen
} from 'lucide-react';
import { useAppStore } from '../store';
import NotificationDropdown from './NotificationDropdown';

const Layout: React.FC = () => {
  const { currentUser, logout, checkUpcomingLectures } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for upcoming lectures when component mounts
  useEffect(() => {
    if (currentUser) {
      checkUpcomingLectures();
      
      // Check periodically (every hour)
      const interval = setInterval(checkUpcomingLectures, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentUser, checkUpcomingLectures]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const unreadNotifications = useAppStore(state => 
    state.notifications.filter(n => n.userId === currentUser?.id && !n.isRead).length
  );
  
  const navigation = [
    { name: 'Schedule', href: '/', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Announcements', href: '/announcements', icon: ClipboardList },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Lectures', href: '/lectures', icon: BookOpen },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];
  
  // Add admin-only routes
  const adminNavigation = currentUser?.role === 'admin' ? [
    { name: 'User Management', href: '/admin/users', icon: User },
  ] : [];
  
  const allNavigation = [...navigation, ...adminNavigation];
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-xl font-bold text-blue-600">MedStaff</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {allNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        location.pathname === item.href
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`${
                          location.pathname === item.href
                            ? 'text-blue-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                        } mr-4 h-6 w-6`}
                      />
                      {item.name}
                      {item.name === 'Notifications' && unreadNotifications > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex-shrink-0 group block">
                  <div className="flex items-center">
                    <div>
                      <img
                        className="inline-block h-10 w-10 rounded-full"
                        src={currentUser?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                        {currentUser?.name}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-gray-500 group-hover:text-gray-700 flex items-center"
                      >
                        <LogOut className="mr-1 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-blue-600">MedStaff</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {allNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      location.pathname === item.href
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    } mr-4 h-6 w-6`}
                  />
                  {item.name}
                  {item.name === 'Notifications' && unreadNotifications > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {currentUser?.name}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-gray-500 group-hover:text-gray-700 flex items-center"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Top navigation bar */}
        <div className="flex-1 relative z-0 flex overflow-hidden">
          <header className="w-full">
            <div className="relative z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 shadow-sm flex">
              <div className="flex-1 flex justify-between px-4 sm:px-6">
                <div className="flex-1 flex"></div>
                <div className="ml-2 flex items-center space-x-4 sm:ml-6 sm:space-x-6">
                  {/* Profile dropdown */}
                  <div className="relative flex-shrink-0">
                    {/* Notification button */}
                    <div className="relative">
                      <button
                        type="button"
                        className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                      >
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6" />
                        {unreadNotifications > 0 && (
                          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                        )}
                      </button>
                      {notificationsOpen && (
                        <NotificationDropdown 
                          onClose={() => setNotificationsOpen(false)} 
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Settings link */}
                  <Link
                    to="/notifications"
                    className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Settings</span>
                    <Settings className="h-6 w-6" />
                  </Link>
                </div>
              </div>
            </div>
          </header>
        </div>

        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;