import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';

export const detectBarcode = async (imageData: string): Promise<string | null> => {
  try {
    const codeReader = new BrowserMultiFormatReader();
    
    // Set hints for better barcode detection
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, []);
    
    // Convert data URL to an img element
    const img = new Image();
    img.src = imageData;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // Detect barcode from image element
    const result = await codeReader.decodeFromImageElement(img);
    
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
