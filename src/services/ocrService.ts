import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (
  imageData: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const result = await Tesseract.recognize(
      imageData,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(m.progress * 100);
          }
        },
      }
    );

    return result.data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
};

export const parseTextForMedicines = (text: string): string[] => {
  // Clean the text
  const cleanText = text.replace(/[^\w\s.-]/g, ' ').trim();
  
  // Common medicine patterns
  const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
  
  // Look for medicine-like patterns (capitalized words, dosage patterns)
  const medicinePatterns = lines.filter(line => {
    // Check if line contains typical medicine indicators
    return (
      /\d+\s*(mg|ml|g|mcg)/i.test(line) || // dosage
      /tab|cap|syrup|injection|cream/i.test(line) || // form
      /once|twice|thrice|daily|bd|td|qd/i.test(line) || // frequency
      /^[A-Z][a-z]+/.test(line.trim()) // Capitalized word
    );
  });

  return medicinePatterns.length > 0 ? medicinePatterns : lines.slice(0, 5);
};
