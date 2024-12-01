// src/components/LoadingOverlay.jsx
import React from 'react';
import { motion } from 'framer-motion';

const LoadingOverlay = ({ loading, progress = 0 }) => {
  if (!loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/90 z-50 flex flex-col justify-center items-center"
    >
      <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      
      <div className="w-64 sm:w-80 h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-blue-600"
        />
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-slate-700 text-sm sm:text-base"
      >
        Chargement en cours... {progress}%
      </motion.p>
    </motion.div>
  );
};

export default LoadingOverlay;