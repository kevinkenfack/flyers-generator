import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import { Download, Camera, Image, Crop } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);

  // Refs
  const canvasRef = useRef(null);
  const cropperImageRef = useRef(null);
  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const cropBtnRef = useRef(null);
  const downloadBtnRef = useRef(null);

  // Utility Functions
  const showMessage = (text, type = 'success') => {
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      info: '#3b82f6'
    };

    setMessage({ text, color: colors[type] });
    setTimeout(() => setMessage(null), 3000);
  };

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
    ctx.clearRect(0, 0, FLYER_WIDTH, FLYER_HEIGHT);
    ctx.drawImage(base, 0, 0, FLYER_WIDTH, FLYER_HEIGHT);

    if (user) {
      const { x, y, width, height } = IMAGE_ZONE;
      ctx.drawImage(user, x, y, width, height);
    }
  };

  // Image Upload Handlers
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showMessage('Format non supporté. Utilisez JPG, PNG ou WebP', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showMessage('Image trop volumineuse (max 10 Mo)', 'error');
      return;
    }

    setLoading(true);

    try {
      const compressedFile = await compressImage(file);
      const imageUrl = URL.createObjectURL(compressedFile);

      if (cropperImageRef.current) {
        cropperImageRef.current.src = imageUrl;

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
        });

        setCropper(newCropper);
        cropBtnRef.current.disabled = false;
        showMessage('Image chargée avec succès', 'success');
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur traitement image:', error);
      showMessage('Erreur lors du traitement de l\'image', 'error');
      setLoading(false);
    }
  };

  const cropImage = async () => {
    if (!cropper) {
      showMessage('Aucune image à recadrer', 'error');
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
      downloadBtnRef.current.disabled = false;
      showMessage('Image recadrée avec succès', 'success');
      setLoading(false);
    } catch (error) {
      console.error('Erreur recadrage:', error);
      showMessage('Erreur lors du recadrage', 'error');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!userImage) {
      showMessage('Aucune image à télécharger', 'error');
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
      setProgress(90);

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
      setProgress(100);
      showMessage('Flyer téléchargé avec succès', 'success');
      setLoading(false);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      showMessage('Erreur lors du téléchargement', 'error');
      setLoading(false);
    }
  };

  // Load base flyer on component mount
  useEffect(() => {
    const loadFlyerBase = async () => {
      try {
        const baseImage = await loadImage('https://raw.githubusercontent.com/kevinkenfack/forex-flyer/main/forex.jpg');
        setFlyerBase(baseImage);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = FLYER_WIDTH;
        canvas.height = FLYER_HEIGHT;

        renderFlyer(ctx, baseImage, null);
      } catch (error) {
        console.error('Erreur chargement base:', error);
        showMessage('Erreur lors du chargement du modèle', 'error');
      }
    };

    loadFlyerBase();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white/95 z-50 flex flex-col justify-center items-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <div className="progress-bar w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Message Overlay */}
        {message && (
          <div 
            className="fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white z-50 shadow-lg"
            style={{ backgroundColor: message.color }}
          >
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl p-6 text-center mb-6">
          <h1 className="text-2xl font-semibold mb-2">Créez votre Flyer Personnalisé</h1>
          <p className="opacity-90">Importez une photo ou prenez-en une nouvelle pour créer votre flyer unique</p>
        </div>

        {/* Image Upload Section */}
        <div className="bg-slate-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => imageInputRef.current.click()} 
              className="btn bg-blue-500 hover:bg-blue-600"
            >
              <Image className="mr-2" /> Choisir une image
            </button>
            <button 
              onClick={() => cameraInputRef.current.click()} 
              className="btn bg-blue-700 hover:bg-blue-800"
            >
              <Camera className="mr-2" /> Prendre une photo
            </button>
          </div>

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

          <div className="border-2 border-dashed border-slate-300 rounded-xl min-h-[300px] flex justify-center items-center">
            <img 
              ref={cropperImageRef} 
              alt="Image à recadrer" 
              className="max-w-full hidden" 
            />
            {!cropperImageRef.current?.src && (
              <div className="text-center text-slate-500">
                <Image className="mx-auto mb-4 w-12 h-12 text-slate-400" />
                <p>Votre image apparaîtra ici</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            ref={cropBtnRef}
            onClick={cropImage}
            className="btn bg-slate-500 hover:bg-slate-600" 
            disabled
          >
            <Crop className="mr-2" /> Recadrer
          </button>
          <button 
            ref={downloadBtnRef}
            onClick={handleDownload}
            className="btn bg-green-500 hover:bg-green-600" 
            disabled
          >
            <Download className="mr-2" /> Télécharger
          </button>
        </div>

        {/* Canvas for rendering */}
        <canvas 
          ref={canvasRef} 
          className="mt-6 max-w-full rounded-xl hidden" 
          style={{ 
            width: '100%', 
            height: 'auto',
            display: userImage ? 'block' : 'none'
          }}
        />
      </div>
    </div>
  );
};

export default ModernFlyerEditor;