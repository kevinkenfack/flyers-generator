// src/utils/imageUtils.js
export const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = 'Anonymous';
      img.src = src;
    });
  };
  
  export const compressImage = (file, maxSize = 2048) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
  
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
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
  
  export const renderFlyer = (ctx, base, user, dimensions) => {
    const { FLYER_WIDTH, FLYER_HEIGHT, IMAGE_ZONE } = dimensions;
    
    if (!ctx || !base) return;
    
    ctx.clearRect(0, 0, FLYER_WIDTH, FLYER_HEIGHT);
    ctx.drawImage(base, 0, 0, FLYER_WIDTH, FLYER_HEIGHT);
  
    if (user) {
      const { x, y, width, height } = IMAGE_ZONE;
      ctx.drawImage(user, x, y, width, height);
    }
  };
  
  export const downloadCanvasAsImage = async (canvas, filename = 'flyer.jpg') => {
    try {
      const blob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/jpeg', 0.85)
      );
  
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      return false;
    }
  };
  
  export const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10 Mo
  
    if (!validTypes.includes(file.type)) {
      return { valid: false, message: 'Format non supporté. Utilisez JPG, PNG ou WebP' };
    }
  
    if (file.size > maxSize) {
      return { valid: false, message: 'Image trop volumineuse (max 10 Mo)' };
    }
  
    return { valid: true, message: '' };
  };