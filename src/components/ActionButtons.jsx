import React from 'react';
import { motion } from 'framer-motion';
import { Crop, Download, RefreshCw, Save } from 'lucide-react';

const ActionButtons = ({
  onCrop,
  onDownload,
  onReset,
  onSave,
  isCropDisabled = false,
  isDownloadDisabled = false,
  isResetDisabled = false,
  isSaveDisabled = false
}) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      <motion.button 
        whileHover={{ scale: isCropDisabled ? 1 : 1.05 }}
        whileTap={{ scale: isCropDisabled ? 1 : 0.95 }}
        onClick={onCrop}
        disabled={isCropDisabled}
        className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base disabled:opacity-50"
      >
        <Crop className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
        Recadrer
      </motion.button>

      <motion.button
        whileHover={{ scale: isDownloadDisabled ? 1 : 1.05 }}
        whileTap={{ scale: isDownloadDisabled ? 1 : 0.95 }}
        onClick={onDownload}
        disabled={isDownloadDisabled}
        className="p-3 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base disabled:opacity-50"
      >
        <Download className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
        Télécharger
      </motion.button>

      <motion.button
        whileHover={{ scale: isResetDisabled ? 1 : 1.05 }}
        whileTap={{ scale: isResetDisabled ? 1 : 0.95 }}
        onClick={onReset}
        disabled={isResetDisabled}
        className="p-3 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base disabled:opacity-50"
      >
        <RefreshCw className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
        Réinitialiser
      </motion.button>

      <motion.button
        whileHover={{ scale: isSaveDisabled ? 1 : 1.05 }}
        whileTap={{ scale: isSaveDisabled ? 1 : 0.95 }}
        onClick={onSave}
        disabled={isSaveDisabled}
        className="p-3 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base disabled:opacity-50"
      >
        <Save className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
        Enregistrer
      </motion.button>
    </div>
  );
};

export default ActionButtons;