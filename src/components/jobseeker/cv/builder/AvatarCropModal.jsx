import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../../../contexts/NotificationContext';

export const AvatarCropModal = ({ imageUrl, onClose, onConfirm, onDelete }) => {
  const { warning, confirm } = useNotification();
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [crop, setCrop] = useState({ x: 20, y: 20, size: 60 });
  const [imageDimensions, setImageDimensions] = useState(null);
  const dragInfoRef = useRef({
    isDragging: false,
    type: null,
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    initSize: 0
  });

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const updateDimensions = () => {
    const img = imgRef.current;
    if (!img) return;
    
    const renderedWidth = img.offsetWidth;
    const renderedHeight = img.offsetHeight;
    
    if (img.naturalWidth && img.naturalHeight && renderedWidth && renderedHeight) {
      setImageDimensions({
        width: renderedWidth,
        height: renderedHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        left: img.offsetLeft,
        top: img.offsetTop
      });
    }
  };

  useEffect(() => {
    setCrop({ x: 20, y: 20, size: 60 });
    setImageDimensions(null);

    const img = imgRef.current;
    if (!img) return;

    let isMounted = true;

    const handleLoad = () => {
      if (isMounted) {
        updateDimensions();
      }
    };

    if (img.complete) {
      setTimeout(() => {
        if (isMounted) {
          updateDimensions();
        }
      }, 50);
    }

    img.addEventListener('load', handleLoad);
    return () => {
      isMounted = false;
      img.removeEventListener('load', handleLoad);
    };
  }, [currentImage]);

  const handleImageLoad = (e) => {
    updateDimensions();
  };

  useEffect(() => {
    if (!imageDimensions) return;
    const handleResize = () => {
      updateDimensions();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageDimensions]);

  useEffect(() => {
    if (!imageDimensions) return;
    const ratio = imageDimensions.width / imageDimensions.height;
    const cropSizePx = Math.min(imageDimensions.width, imageDimensions.height) * 0.8;
    const sizePct = (cropSizePx / imageDimensions.width) * 100;
    const heightPct = (cropSizePx / imageDimensions.height) * 100;
    
    setCrop({
      x: (100 - sizePct) / 2,
      y: (100 - heightPct) / 2,
      size: sizePct
    });
  }, [imageDimensions]);

  const handleDragStart = (e, type) => {
    e.preventDefault();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    dragInfoRef.current = {
      isDragging: true,
      type,
      startX: clientX,
      startY: clientY,
      initX: crop.x,
      initY: crop.y,
      initSize: crop.size
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const info = dragInfoRef.current;
      if (!info.isDragging || !imageDimensions) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      const dx = clientX - info.startX;
      const dy = clientY - info.startY;

      const pctDx = (dx / imageDimensions.width) * 100;
      const pctDy = (dy / imageDimensions.height) * 100;

      const ratio = imageDimensions.width / imageDimensions.height;
      const minSize = (50 / imageDimensions.width) * 100; // Min 50px

      setCrop(prev => {
        let nextCrop = { ...prev };

        if (info.type === 'move') {
          const sizeHeightPercent = prev.size * ratio;
          nextCrop.x = Math.max(0, Math.min(100 - prev.size, info.initX + pctDx));
          nextCrop.y = Math.max(0, Math.min(100 - sizeHeightPercent, info.initY + pctDy));
        } else if (info.type === 'resize-se') {
          // Bottom right corner
          const delta = pctDx;
          const maxScale = Math.min(100 - info.initX, (100 - info.initY) * (1 / ratio));
          nextCrop.size = Math.max(minSize, Math.min(maxScale, info.initSize + delta));
        } else if (info.type === 'resize-sw') {
          // Bottom left corner
          const delta = -pctDx;
          const maxScaleX = info.initX + info.initSize;
          const maxScaleY = (100 - info.initY) * (1 / ratio);
          const maxScale = Math.min(maxScaleX, maxScaleY);
          
          nextCrop.size = Math.max(minSize, Math.min(maxScale, info.initSize + delta));
          nextCrop.x = info.initX + info.initSize - nextCrop.size;
        } else if (info.type === 'resize-ne') {
          // Top right corner
          const delta = pctDx;
          const maxScaleX = 100 - info.initX;
          const maxScaleY = (info.initY + info.initSize * ratio) * (1 / ratio);
          const maxScale = Math.min(maxScaleX, maxScaleY);
          
          nextCrop.size = Math.max(minSize, Math.min(maxScale, info.initSize + delta));
          nextCrop.y = info.initY + (info.initSize - nextCrop.size) * ratio;
        } else if (info.type === 'resize-nw') {
          // Top left corner
          const delta = -pctDx;
          const maxScaleX = info.initX + info.initSize;
          const maxScaleY = (info.initY + info.initSize * ratio) * (1 / ratio);
          const maxScale = Math.min(maxScaleX, maxScaleY);
          
          nextCrop.size = Math.max(minSize, Math.min(maxScale, info.initSize + delta));
          nextCrop.x = info.initX + info.initSize - nextCrop.size;
          nextCrop.y = info.initY + (info.initSize - nextCrop.size) * ratio;
        }

        return nextCrop;
      });
    };

    const handleMouseUp = () => {
      dragInfoRef.current.isDragging = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [imageDimensions]);

  const handleDone = () => {
    if (!imageDimensions) return;

    const canvas = document.createElement('canvas');
    const size = 300; // Target resolution
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = imgRef.current;
    
    // Crop coordinates on natural image
    const sx = (crop.x / 100) * imageDimensions.naturalWidth;
    const sy = (crop.y / 100) * imageDimensions.naturalHeight;
    const sWidth = (crop.size / 100) * imageDimensions.naturalWidth;
    const sHeight = (crop.size / 100) * imageDimensions.naturalWidth; // Keep 1:1

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);
    
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    onConfirm(croppedBase64);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        warning('Vui lòng chọn tệp hình ảnh.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        warning('Dung lượng ảnh vượt quá 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileChange = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Dimensions in pixels for display
  const cropSizePx = imageDimensions ? (crop.size / 100) * imageDimensions.width : 0;
  
  // Natural cropped size
  const naturalCroppedWidth = imageDimensions ? (crop.size / 100) * imageDimensions.naturalWidth : 0;

  // CSS for preview
  const previewRatio = imageDimensions ? 112 / cropSizePx : 1; // Preview container is w-28 h-28 (112px)
  const previewImgStyle = imageDimensions ? {
    width: `${imageDimensions.width * previewRatio}px`,
    height: `${imageDimensions.height * previewRatio}px`,
    left: `${-((crop.x / 100) * imageDimensions.width) * previewRatio}px`,
    top: `${-((crop.y / 100) * imageDimensions.height) * previewRatio}px`,
    position: 'absolute',
    maxWidth: 'none',
    maxHeight: 'none',
  } : {};

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-scale">
        
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-slate-800">Cập nhật ảnh đại diện</h2>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center p-1 rounded-full hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
          
          {/* Left panel (Image Editor) */}
          <div className="flex-1 flex flex-col gap-3 w-full">
            <h3 className="text-sm font-semibold text-slate-500 text-center md:text-left">Ảnh gốc</h3>
            
            <div 
              className="relative w-full h-[320px] bg-slate-900 border rounded-lg overflow-hidden flex items-center justify-center select-none"
            >
              {/* Checkerboard background */}
              <div className="absolute inset-0 checkerboard-bg opacity-40"></div>
              
              {/* Image */}
              <img
                ref={imgRef}
                src={currentImage}
                alt="Crop Target"
                onLoad={handleImageLoad}
                className="max-w-full max-h-full object-contain pointer-events-none z-10"
              />

              {/* Overlay cropping square */}
              {imageDimensions && (
                <div
                  className="absolute border-2 border-[#00b14f] bg-black/20 shadow-[0_0_0_9999px_rgba(15,23,42,0.7)] cursor-grab active:cursor-grabbing z-20"
                  style={{
                    left: `${imageDimensions.left + (crop.x / 100) * imageDimensions.width}px`,
                    top: `${imageDimensions.top + (crop.y / 100) * imageDimensions.height}px`,
                    width: `${cropSizePx}px`,
                    height: `${cropSizePx}px`,
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'move')}
                  onTouchStart={(e) => handleDragStart(e, 'move')}
                >
                  {/* Size tag */}
                  <span className="absolute top-1 left-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold select-none z-30 pointer-events-none">
                    {Math.round(naturalCroppedWidth)} × {Math.round(naturalCroppedWidth)}
                  </span>

                  {/* Corners handles */}
                  <div 
                    className="absolute w-3 h-3 bg-[#00b14f] border border-white -top-1.5 -left-1.5 cursor-nwse-resize rounded-full z-30 shadow-sm"
                    onMouseDown={(e) => handleDragStart(e, 'resize-nw')}
                    onTouchStart={(e) => handleDragStart(e, 'resize-nw')}
                  />
                  <div 
                    className="absolute w-3 h-3 bg-[#00b14f] border border-white -top-1.5 -right-1.5 cursor-nesw-resize rounded-full z-30 shadow-sm"
                    onMouseDown={(e) => handleDragStart(e, 'resize-ne')}
                    onTouchStart={(e) => handleDragStart(e, 'resize-ne')}
                  />
                  <div 
                    className="absolute w-3 h-3 bg-[#00b14f] border border-white -bottom-1.5 -left-1.5 cursor-nesw-resize rounded-full z-30 shadow-sm"
                    onMouseDown={(e) => handleDragStart(e, 'resize-sw')}
                    onTouchStart={(e) => handleDragStart(e, 'resize-sw')}
                  />
                  <div 
                    className="absolute w-3 h-3 bg-[#00b14f] border border-white -bottom-1.5 -right-1.5 cursor-nwse-resize rounded-full z-30 shadow-sm"
                    onMouseDown={(e) => handleDragStart(e, 'resize-se')}
                    onTouchStart={(e) => handleDragStart(e, 'resize-se')}
                  />
                </div>
              )}
            </div>
            
            <p className="text-xs text-slate-400 leading-normal text-center md:text-left mt-1">
              Ảnh tải lên có dung lượng không quá 5 MB. Giảm dung lượng ảnh <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" className="text-[#00b14f] hover:underline font-semibold">tại đây</a>.
            </p>
          </div>

          {/* Right panel (Preview & Actions) */}
          <div className="w-full md:w-56 flex flex-col items-center gap-5 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6">
            <h3 className="text-sm font-semibold text-slate-500">Ảnh hiển thị trên CV</h3>
            
            {/* Round frame crop preview */}
            <div className="relative w-28 h-28 border rounded-full overflow-hidden checkerboard-bg shadow-inner">
              {imageDimensions && (
                <div className="w-full h-full relative">
                  <img
                    src={currentImage}
                    alt="Cropped Preview"
                    style={previewImgStyle}
                    className="pointer-events-none"
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={triggerFileChange}
                className="w-full py-2 px-4 bg-[#e6f4ea] hover:bg-[#d8edd3] text-[#137333] border border-[#a8dab5] rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">cached</span>
                Đổi ảnh
              </button>
              
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    confirm('Bạn có chắc chắn muốn xóa ảnh đại diện này?', () => {
                      onDelete();
                      onClose();
                    });
                  }}
                  className="w-full py-2 px-4 bg-[#fce8e6] hover:bg-[#fadad6] text-[#c5221f] border border-[#f5b4ad] rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Xóa ảnh
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-bold transition-all"
          >
            Đóng lại
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="px-5 py-2 rounded-lg bg-[#00b14f] hover:bg-[#009640] text-white text-sm font-bold transition-all shadow-sm"
          >
            Hoàn tất
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
