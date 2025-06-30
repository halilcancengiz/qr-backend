import fs from 'fs';
import path from 'path';

/**
 * Hata durumunda uploads klasöründen yüklenen görseli siler.
 * @param {string|null} relativeImagePath Örnek: 'uploads/filename.jpg'
 */


export const deleteImageWhileOnError = async (filePath) => {
  try {
    const fullPath = path.resolve(filePath); // Ana dizinde uploads içinde
    await fs.promises.unlink(fullPath); // Dosyayı sil
  } catch (error) {
    console.error('Error while deleting uploaded file after failure:', error);
  }
}