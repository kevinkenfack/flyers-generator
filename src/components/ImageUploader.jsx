// src/components/ImageUploader.jsx
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ 
  onImageUpload, 
  imagePreview, 
  cropperImageRef 
}) => {
  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 items-center">
      {/* Image Selection Buttons */}
      <div className="space-y-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => imageInputRef.current.click()} 
          className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base"
        >
          <ImageIcon className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
          Choisir une image
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => cameraInputRef.current.click()} 
          className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base"
        >
          <Camera className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
          Prendre une photo
        </motion.button>

        {/* Hidden file inputs */}
        <input 
          type="file" 
          ref={imageInputRef}
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        <input 
          type="file" 
          ref={cameraInputRef}
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </div>

      {/* Image Preview Area */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl min-h-[250px] sm:min-h-[300px] flex justify-center items-center overflow-hidden">
        {imagePreview ? (
          <motion.img 
            ref={cropperImageRef} 
            src={imagePreview} 
            alt="Image à recadrer" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="block max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-center text-slate-500">
            <ImageIcon className="mx-auto mb-4 w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
            <p className="text-sm sm:text-base">Votre image apparaîtra ici</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;