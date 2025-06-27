import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, X, User, LogOut, Calendar, Home } from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    setIsNotificationsOpen(false);
    if (link) navigate(link);
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { label: 'Events', path: '/events', icon: <Calendar className="h-5 w-5" /> },
  ];

  const profileMenuItems = [
    { label: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> },
    { label: 'My Events', path: '/my-events', icon: <Calendar className="h-5 w-5" /> },
  ];

  if (user?.role === 'organizer') {
    profileMenuItems.push({ label: 'Dashboard', path: '/organizer-dashboard', icon: <Calendar className="h-5 w-5" /> });
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold">EventHub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    className="text-gray-500 hover:text-indigo-600 p-1.5 rounded-full"
                    onClick={toggleNotifications}
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <div className="px-4 py-3 border-b">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                              <button
                                className="text-xs text-indigo-600 hover:text-indigo-800"
                                onClick={() => markAllAsRead()}
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                              {notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                    !notification.read ? 'bg-indigo-50' : ''
                                  }`}
                                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                                >
                                  <h4 className="text-sm font-medium">{notification.title}</h4>
                                  <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{notification.createdAt}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No notifications
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center space-x-2"
                    onClick={toggleProfileMenu}
                  >
                    <div className="relative h-8 w-8 rounded-full bg-indigo-600 overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <div className="py-1">
                          <div className="px-4 py-2 border-b">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          {profileMenuItems.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <span className="mr-2">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                          <button
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={handleLogout}
                          >
                            <LogOut className="mr-2 h-5 w-5" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                className="text-gray-500 hover:text-indigo-600 p-1.5 rounded-full"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <Link to="/login" className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" fullWidth>Login</Button>
                  </Link>
                  <div className="mt-3">
                    <Link to="/register" className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button fullWidth>Sign Up</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <button
                    className="flex items-center w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;