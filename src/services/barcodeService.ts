import { BrowserMultiFormatReader } from '@zxing/library';

export const detectBarcode = async (imageData: string): Promise<string | null> => {
  try {
    const codeReader = new BrowserMultiFormatReader();
    
    // Convert data URL to blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    
    // Create an image bitmap
    const imageBitmap = await createImageBitmap(blob);
    
    // Detect barcode
    const result = await codeReader.decodeFromImageElement(imageBitmap as any);
    
    if (result) {
      console.log('Barcode detected:', result.getText());
      return result.getText();
    }
    
    return null;
  } catch (error) {
    console.log('No barcode detected:', error);
    return null;
  }
};
