// src/hooks/useNotification.js
import { useState, useCallback } from 'react';
import { NOTIFICATION_TYPES } from '../utils/flyerConstants';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.SUCCESS) => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => removeNotification(id), 3000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return { 
    notifications, 
    addNotification, 
    removeNotification 
  };
};