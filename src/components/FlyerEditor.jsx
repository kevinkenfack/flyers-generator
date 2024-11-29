import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import { Download, Camera, Image as ImageIcon, Crop, CheckCircle2, XCircle, Info } from 'lucide-react';

const ModernFlyerEditor = () => {
  // Constants for flyer dimensions and image zone
  const FLYER_WIDTH = 8334;
  const FLYER_HEIGHT = 10410;
  const IMAGE_ZONE = {
    x: 2750,
    y: 4500,
    width: 2830,
    height: 2830
  };

  // State variables
  const [flyerBase, setFlyerBase] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [cropper, setCropper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  // Refs
  const baseCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const cropperImageRef = useRef(null);
  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const cropBtnRef = useRef(null);
  const downloadBtnRef = useRef(null);

  // Enhanced Notification System
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => removeNotification(id), 3000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const NotificationIcon = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  // Utility Functions
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = 'Anonymous';
      img.src = src;
    });
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_SIZE = 2048;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = (height / width) * MAX_SIZE;
              width = MAX_SIZE;
            } else {
              width = (width / height) * MAX_SIZE;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.85
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const renderFlyer = (ctx, base, user) => {
    if (!ctx || !base) return;
    
    ctx.clearRect(0, 0, FLYER_WIDTH, FLYER_HEIGHT);
    ctx.drawImage(base, 0, 0, FLYER_WIDTH, FLYER_HEIGHT);

    if (user) {
      const { x, y, width, height } = IMAGE_ZONE;
      ctx.drawImage(user, x, y, width, height);
    }
  };

  const updatePreview = (base, user) => {
    if (previewCanvasRef.current && base) {
      const previewCtx = previewCanvasRef.current.getContext('2d');
      
      // Amélioration du rendu
      previewCtx.imageSmoothingEnabled = true;
      previewCtx.imageSmoothingQuality = 'high';
      
      // Calcul de l'échelle
      const containerWidth = previewCanvasRef.current.parentElement.clientWidth;
      const scale = containerWidth / FLYER_WIDTH;
      
      // Définition précise des dimensions
      previewCanvasRef.current.width = FLYER_WIDTH * scale;
      previewCanvasRef.current.height = FLYER_HEIGHT * scale;
      
      // Rendu avec paramètres de haute qualité
      previewCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
      previewCtx.drawImage(
        base, 
        0, 0, 
        FLYER_WIDTH, FLYER_HEIGHT,  // Taille source originale
        0, 0, 
        previewCanvasRef.current.width, previewCanvasRef.current.height  // Taille cible mise à l'échelle
      );
  
      if (user) {
        const { x, y, width, height } = IMAGE_ZONE;
        const scaledX = x * scale;
        const scaledY = y * scale;
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        
        previewCtx.drawImage(
          user, 
          0, 0, width, height,  // Taille source originale
          scaledX, scaledY, 
          scaledWidth, scaledHeight  // Taille cible mise à l'échelle
        );
      }
    }
  };

  // Image Upload Handlers
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addNotification('Format non supporté. Utilisez JPG, PNG ou WebP', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addNotification('Image trop volumineuse (max 10 Mo)', 'error');
      return;
    }

    setLoading(true);

    try {
      const compressedFile = await compressImage(file);
      const imageUrl = URL.createObjectURL(compressedFile);
      setImagePreview(imageUrl);

      if (cropperImageRef.current) {
        cropperImageRef.current.src = imageUrl;

        if (cropper) {
          cropper.destroy();
        }

        // Initialize new cropper
        const newCropper = new Cropper(cropperImageRef.current, {
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
          ready: function() {
            cropBtnRef.current.disabled = false;
            setLoading(false);
          }
        });

        setCropper(newCropper);
        addNotification('Image chargée avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur traitement image:', error);
      addNotification('Erreur lors du traitement de l\'image', 'error');
      setLoading(false);
    }
  };

  const cropImage = async () => {
    if (!cropper) {
      addNotification('Aucune image à recadrer', 'error');
      return;
    }

    setLoading(true);

    try {
      const croppedCanvas = cropper.getCroppedCanvas({
        width: IMAGE_ZONE.width,
        height: IMAGE_ZONE.height,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });

      const blob = await new Promise(resolve => 
        croppedCanvas.toBlob(resolve, 'image/jpeg', 0.9)
      );

      const croppedImage = await loadImage(URL.createObjectURL(blob));
      setUserImage(croppedImage);
      
      // Update preview with cropped image
      updatePreview(flyerBase, croppedImage);
      
      downloadBtnRef.current.disabled = false;
      addNotification('Image recadrée avec succès', 'success');
    } catch (error) {
      console.error('Erreur recadrage:', error);
      addNotification('Erreur lors du recadrage', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!userImage) {
      addNotification('Aucune image à télécharger', 'error');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = FLYER_WIDTH;
      tempCanvas.height = FLYER_HEIGHT;
      const tempCtx = tempCanvas.getContext('2d');

      renderFlyer(tempCtx, flyerBase, userImage);
      
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgress(i);
      }

      const blob = await new Promise(resolve => 
        tempCanvas.toBlob(resolve, 'image/jpeg', 0.85)
      );

      const url = URL.createObjectURL(blob);
      const filename = `flyer_${new Date().toISOString().slice(0,10)}.jpg`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      addNotification('Flyer téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      addNotification('Erreur lors du téléchargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load base flyer and initialize preview on component mount
  useEffect(() => {
    const loadFlyerBase = async () => {
      try {
        const baseImage = await loadImage('/forex.jpg');
        setFlyerBase(baseImage);
        updatePreview(baseImage, null);
      } catch (error) {
        console.error('Erreur chargement base:', error);
        addNotification('Erreur lors du chargement du modèle', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadFlyerBase();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex justify-center items-center">
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className="flex items-center space-x-3 bg-white shadow-lg rounded-lg p-3 border transition-all duration-300 ease-in-out animate-slide-in"
          >
            {NotificationIcon[notification.type]}
            <span className="text-sm text-slate-800">{notification.message}</span>
            <button 
              onClick={() => removeNotification(notification.id)} 
              className="ml-2 hover:bg-slate-100 rounded-full p-1"
            >
              <XCircle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/90 z-50 flex flex-col justify-center items-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <div className="progress-bar w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 tracking-tight">Créez votre Flyer Personnalisé</h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto">Transformez vos photos en flyers professionnels en quelques clics</p>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-8 space-y-6">
          {/* Image Upload Section */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 items-center">
            {/* Image Selection Buttons */}
            <div className="space-y-4">
              <button 
                onClick={() => imageInputRef.current.click()} 
                className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base"
              >
                <ImageIcon className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Choisir une image
              </button>
              <button 
                onClick={() => cameraInputRef.current.click()} 
                className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base"
              >
                <Camera className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Prendre une photo
              </button>

              {/* Hidden file inputs */}
              <input 
                type="file" 
                ref={imageInputRef}
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
              <input 
                type="file" 
                ref={cameraInputRef}
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>

            {/* Image Preview Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl min-h-[250px] sm:min-h-[300px] flex justify-center items-center overflow-hidden">
              <img 
                ref={cropperImageRef} 
                src={imagePreview} 
                alt="Image à recadrer" 
                className={imagePreview ? 'block max-w-full h-auto' : 'hidden'}
              />
              {!imagePreview && (
                <div className="text-center text-slate-500">
                  <ImageIcon className="mx-auto mb-4 w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
                  <p className="text-sm sm:text-base">Votre image apparaîtra ici</p>
                </div>
              )}
              </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              ref={cropBtnRef}
              onClick={cropImage}
              className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base disabled:opacity-50" 
              disabled={!imagePreview}
            >
              <Crop className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Recadrer
            </button>
            <button 
              ref={downloadBtnRef}
              onClick={handleDownload}
              className="p-3 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors rounded-xl shadow-md text-sm sm:text-base disabled:opacity-50" 
              disabled={!userImage}
            >
              <Download className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Télécharger
            </button>
          </div>
        </div>

        {/* Preview Section - Always visible */}
        <div className="mt-6 p-4 sm:p-8 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-center">Prévisualisation du Flyer</h2>
          <div className="rounded-xl overflow-hidden shadow-lg max-w-2xl mx-auto">
          <canvas 
            ref={previewCanvasRef}
            className="w-full h-auto" 
            style={{ 
              maxWidth: '100%',
              aspectRatio: `${FLYER_WIDTH}/${FLYER_HEIGHT}`,
              display: 'block' // Assure un affichage précis
            }}
          />
          </div>
          {!flyerBase && (
            <div className="text-center text-slate-500 py-4">
              <p>Chargement du modèle de flyer...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernFlyerEditor;