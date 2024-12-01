// src/components/NotificationSystem.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const NotificationIcon = {
  success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />
};

const NotificationSystem = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-[calc(100%-2rem)] max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-3 bg-white shadow-lg rounded-lg p-3 border w-full"
          >
            <div className="flex-shrink-0">
              {NotificationIcon[notification.type]}
            </div>
            <span className="text-sm text-slate-800 flex-grow truncate">
              {notification.message}
            </span>
            <button 
              onClick={() => onRemove(notification.id)} 
              className="ml-2 hover:bg-slate-100 rounded-full p-1 flex-shrink-0"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;