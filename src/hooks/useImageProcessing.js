// src/hooks/useImageProcessing.js
import { useState, useCallback } from 'react';
import { 
  loadImage, 
  compressImage, 
  validateImageFile 
} from '../utils/imageUtils';
import { FLYER_DIMENSIONS } from '../utils/flyerConstants';

export const useImageProcessing = (onError, onSuccess) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const processImageUpload = useCallback(async (file) => {
    const validation = validateImageFile(file);
    
    if (!validation.valid) {
      onError(validation.message);
      return false;
    }

    setLoading(true);

    try {
      const compressedFile = await compressImage(file);
      const imageUrl = URL.createObjectURL(compressedFile);
      
      setImagePreview(imageUrl);
      onSuccess('Image chargée avec succès');
      
      return true;
    } catch (error) {
      console.error('Erreur de traitement d\'image:', error);
      onError('Erreur lors du traitement de l\'image');
      return false;
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  const cropImage = useCallback(async (cropper) => {
    if (!cropper) {
      onError('Aucune image à recadrer');
      return false;
    }

    setLoading(true);

    try {
      const { width, height } = FLYER_DIMENSIONS.IMAGE_ZONE;
      const croppedCanvas = cropper.getCroppedCanvas({
        width,
        height,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });

      const blob = await new Promise(resolve => 
        croppedCanvas.toBlob(resolve, 'image/jpeg', 0.9)
      );

      const croppedImage = await loadImage(URL.createObjectURL(blob));
      setUserImage(croppedImage);
      
      onSuccess('Image recadrée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur de recadrage:', error);
      onError('Erreur lors du recadrage');
      return false;
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  return {
    imagePreview,
    userImage,
    loading,
    processImageUpload,
    cropImage,
    setImagePreview,
    setUserImage
  };
};