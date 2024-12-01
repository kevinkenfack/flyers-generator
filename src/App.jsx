import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageCropper from './components/ImageCropper';
import ActionButtons from './components/ActionButtons';
import LoadingOverlay from './components/LoadingOverlay';
import NotificationSystem from './components/NotificationSystem';
import FlyerPreview from './components/FlyerPreview';

function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showFlyerPreview, setShowFlyerPreview] = useState(false);

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      // Reset cropped image when new image is uploaded
      setCroppedImage(null);
      // Reset flyer preview
      setShowFlyerPreview(false);
      // Clear any previous notifications
      setNotifications([]);
    };
    reader.readAsDataURL(file);
  };

  const handleCrop = (cropper) => {
    const croppedImageData = cropper.getCroppedCanvas().toDataURL('image/jpeg');
    setCroppedImage(croppedImageData);
    
    // Add a success notification
    addNotification('success', 'Image recadrée avec succès');
  };

  const handleDownload = () => {
    if (croppedImage) {
      const link = document.createElement('a');
      link.href = croppedImage;
      link.download = 'cropped-image.jpg';
      link.click();
      
      addNotification('success', 'Image téléchargée');
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setCroppedImage(null);
    setShowFlyerPreview(false);
    addNotification('info', 'Réinitialisation effectuée');
  };

  const handleSave = () => {
    // Simulate saving process
    setLoading(true);
    setLoadingProgress(0);

    const simulateSave = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(simulateSave);
          setLoading(false);
          addNotification('success', 'Image enregistrée avec succès');
          setShowFlyerPreview(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const addNotification = (type, message) => {
    const newNotification = {
      id: Date.now(),
      type,
      message
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter(notification => notification.id !== id));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
          Traitement d'Image
        </h1>

        <ImageUploader 
          onImageUpload={handleImageUpload} 
          imagePreview={imagePreview}
        />

        {imagePreview && (
          <div className="mt-6">
            <ImageCropper 
              imagePreview={imagePreview} 
              onCrop={handleCrop} 
              disabled={!imagePreview}
            />
          </div>
        )}

        {croppedImage && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Image Recadrée</h2>
            <img 
              src={croppedImage} 
              alt="Image recadrée" 
              className="max-w-md mx-auto rounded-lg shadow-md"
            />
          </div>
        )}

        <ActionButtons 
          onCrop={() => {/* Placeholder */}}
          onDownload={handleDownload}
          onReset={handleReset}
          onSave={handleSave}
          isCropDisabled={!imagePreview}
          isDownloadDisabled={!croppedImage}
          isResetDisabled={!imagePreview}
          isSaveDisabled={!croppedImage}
        />

        {showFlyerPreview && croppedImage && (
          <div className="mt-6">
            <FlyerPreview 
              imagePreview={croppedImage}
              onCrop={() => {/* Optional: implement crop functionality */}}
              onDownload={handleDownload}
              onReset={handleReset}
              onSave={handleSave}
            />
          </div>
        )}
      </div>

      <LoadingOverlay 
        loading={loading} 
        progress={loadingProgress} 
      />

      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification} 
      />
    </div>
  );
}

export default App;