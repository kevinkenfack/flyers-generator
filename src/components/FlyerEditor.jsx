import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import { Download, Camera, Image as ImageIcon, Crop, CheckCircle2, XCircle, Info, ArrowUpRight } from 'lucide-react';

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

  // Utility Functions (keep existing utility functions from previous implementation)
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

  // Improved Preview Rendering
  const updatePreview = (base, user) => {
    if (previewCanvasRef.current && base) {
      const previewCtx = previewCanvasRef.current.getContext('2d');
      
      // Calculate scale based on container width
      const containerWidth = previewCanvasRef.current.parentElement.clientWidth;
      const scale = containerWidth / FLYER_WIDTH;
      
      // Set canvas dimensions with scaled width and height
      previewCanvasRef.current.width = FLYER_WIDTH * scale;
      previewCanvasRef.current.height = FLYER_HEIGHT * scale;
      
      // Clear and render with scaling
      previewCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
      previewCtx.drawImage(base, 0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);

      if (user) {
        const { x, y, width, height } = IMAGE_ZONE;
        const scaledX = x * scale;
        const scaledY = y * scale;
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        previewCtx.drawImage(user, scaledX, scaledY, scaledWidth, scaledHeight);
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className="flex items-center space-x-3 bg-white/5 backdrop-blur-lg rounded-xl p-3 border border-white/10 transition-all duration-300 ease-in-out animate-slide-in"
          >
            {NotificationIcon[notification.type]}
            <span className="text-sm text-white/80">{notification.message}</span>
            <button 
              onClick={() => removeNotification(notification.id)} 
              className="ml-2 hover:bg-white/10 rounded-full p-1"
            >
              <XCircle className="w-4 h-4 text-white/50 hover:text-white/80" />
            </button>
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-950/90 z-50 flex flex-col justify-center items-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <div className="progress-bar w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative pt-24 px-4 sm:px-6 pb-12 max-w-4xl mx-auto">
        <div className="group mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-900/50 p-[1px] transition-all duration-300 hover:from-purple-600/50 hover:via-blue-600/50 hover:to-purple-600/50">
            <div className="relative bg-gray-950/95 rounded-3xl p-6 backdrop-blur-xl overflow-hidden">
              {/* Decorative Blob Background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 -left-4 w-24 h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
                <div className="absolute top-0 -right-4 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-24 h-24 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
              </div>

              {/* Image Upload Section */}
              <div className="relative z-10 grid sm:grid-cols-2 gap-6 items-center">
                {/* Image Selection Buttons */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 px-4 py-1 rounded-full text-sm backdrop-blur-sm border border-white/10">
                      Créateur de Flyers
                    </div>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>

                  <button 
                    onClick={() => imageInputRef.current.click()} 
                    className="w-full p-3 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors rounded-xl border border-white/10"
                  >
                    <ImageIcon className="mr-2 w-5 h-5" /> Choisir une image
                  </button>
                  <button 
                    onClick={() => cameraInputRef.current.click()} 
                    className="w-full p-3 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors rounded-xl border border-white/10"
                  >
                    <Camera className="mr-2 w-5 h-5" /> Prendre une photo
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
                <div className="border-2 border-dashed border-white/20 rounded-xl min-h-[250px] sm:min-h-[300px] flex justify-center items-center overflow-hidden relative">
                  <img 
                    ref={cropperImageRef} 
                    src={imagePreview} 
                    alt="Image à recadrer" 
                    className={imagePreview ? 'block max-w-full h-auto' : 'hidden'}
                  />
                  {!imagePreview && (
                    <div className="text-center text-white/50">
                      <ImageIcon className="mx-auto mb-4 w-10 h-10 text-white/30" />
                      <p className="text-sm">Votre image apparaîtra ici</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <button 
                  ref={cropBtnRef}
                  onClick={cropImage}
                  className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition-all bg-blue-500/10 rounded-xl hover:bg-blue-500/20 group border border-blue-500/20" 
                  disabled={!imagePreview}
                >
                  <span className="w-48 h-48 rounded rotate-[-40deg] bg-white/10 absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
                  <span className="relative w-full text-left flex items-center justify-between">
                    <Crop className="w-5 h-5 mr-2" /> Recadrer
                    <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>

                <button 
                  ref={downloadBtnRef}
                  onClick={handleDownload}
                  className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition-all bg-green-500/10 rounded-xl hover:bg-green-500/20 group border border-green-500/20" 
                  disabled={!userImage}
                >
                  <span className="w-48 h-48 rounded rotate-[-40deg] bg-white/10 absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
                  <span className="relative w-full text-left flex items-center justify-between">
                    <Download className="w-5 h-5 mr-2" /> Télécharger
                    <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-400 tracking-wider">PRÉVISUALISATION DU FLYER</h4>
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 p-4">
            <canvas 
              ref={previewCanvasRef}
              className="w-full h-auto rounded-xl" 
              style={{ 
                maxWidth: '100%',
                aspectRatio: `${FLYER_WIDTH}/${FLYER_HEIGHT}`,
                display: 'block'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernFlyerEditor;