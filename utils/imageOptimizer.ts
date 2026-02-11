/**
 * Compresses an image file and converts it to WebP format.
 * Resizes images wider than 1200px to 1200px while maintaining aspect ratio.
 * 
 * @param file - The input image file
 * @param quality - Quality of the output WebP image (0 to 1, default 0.75)
 * @returns Promise<string> - The Data URL of the optimized WebP image
 */
export const compressImage = async (file: File, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        
        let width = img.width;
        let height = img.height;

        // Resize if wider than MAX_WIDTH
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP
        // This browser API automatically handles the conversion
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
