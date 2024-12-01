// src/components/ImageCropper.jsx
import React, { useEffect, useRef } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import { motion } from 'framer-motion';
import { Crop } from 'lucide-react';

const ImageCropper = ({ 
  imagePreview, 
  onCrop, 
  disabled = false 
}) => {
  const cropperImageRef = useRef(null);
  const cropperRef = useRef(null);

  useEffect(() => {
    if (imagePreview && cropperImageRef.current) {
      // Destroy existing cropper if it exists
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }

      // Initialize new cropper
      cropperRef.current = new Cropper(cropperImageRef.current, {
        aspectRatio: 1,
        viewMode: 2,
        dragMode: 'move',
        autoCropArea: 0.8,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        minContainerWidth: 250,
        minContainerHeight: 250,
      });
    }

    // Cleanup
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
    };
  }, [imagePreview]);

  const handleCrop = () => {
    if (cropperRef.current) {
      onCrop(cropperRef.current);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {imagePreview && (
        <div className="w-full max-w-md mx-auto">
          <img 
            ref={cropperImageRef} 
            src={imagePreview} 
            alt="Image à recadrer" 
            className="max-w-full" 
          />
        </div>
      )}
      
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={handleCrop}
        disabled={disabled}
        className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base disabled:opacity-50"
      >
        <Crop className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
        Recadrer
      </motion.button>
    </div>
  );
};

export default ImageCropper;