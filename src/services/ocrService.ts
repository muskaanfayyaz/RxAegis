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
  const lines = cleanText.split('\n').filter(line => line.trim().length > 2);
  
  // Medicine name patterns - more strict filtering
  const medicineLines: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip common non-medicine text
    if (/^(dr|doctor|patient|name|age|date|address|phone|signature|hospital|clinic)/i.test(trimmedLine)) {
      continue;
    }
    
    // Must have at least one medicine indicator
    const hasDosage = /\d+\s*(mg|ml|g|mcg|gm)/i.test(trimmedLine);
    const hasForm = /\b(tab|tablet|cap|capsule|syrup|injection|cream|ointment|drops|suspension)\b/i.test(trimmedLine);
    const hasFrequency = /\b(once|twice|thrice|daily|bd|td|qd|od|tid|qid|hs|prn)\b/i.test(trimmedLine);
    const hasCapitalizedDrugName = /^[A-Z][a-z]{2,}(?:[A-Z][a-z]+)?/i.test(trimmedLine);
    
    // Line must have at least 2 medicine indicators to qualify
    const indicators = [hasDosage, hasForm, hasFrequency, hasCapitalizedDrugName].filter(Boolean).length;
    
    if (indicators >= 2 || (hasDosage && hasCapitalizedDrugName)) {
      medicineLines.push(trimmedLine);
    }
  }

  return medicineLines.length > 0 ? medicineLines : [];
};
