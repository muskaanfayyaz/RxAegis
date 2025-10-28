import type { PrescriptionAnalysis } from '@/types/medicine';

export const analyzePrescriptionText = async (text: string): Promise<PrescriptionAnalysis[]> => {
  // For prototype: parse text using simple logic
  // In production, this would call Lovable AI via edge function
  
  const analyses: PrescriptionAnalysis[] = [];
  
  // Simple parsing logic - focus on medicine lines only
  const lines = text.split('\n').filter(l => {
    const trimmed = l.trim();
    // Filter out non-medicine text more aggressively
    if (trimmed.length < 3) return false;
    if (/^(dr|doctor|patient|name|age|date|address|phone|signature|hospital|clinic|rx)/i.test(trimmed)) return false;
    return true;
  });
  
  for (const line of lines) {
    const analysis: PrescriptionAnalysis = {
      medicationName: '',
      strength: undefined,
      dosage: undefined,
      frequency: undefined,
      confidence: 0.7,
      flags: [],
    };
    
    // Extract medicine name (first word or capitalized phrase)
    const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    if (nameMatch) {
      analysis.medicationName = nameMatch[1];
    } else {
      // Try to extract any word that looks like a medicine name
      const words = line.split(/\s+/);
      const possibleName = words.find(w => w.length > 3 && /^[A-Z]/.test(w));
      analysis.medicationName = possibleName || words[0];
    }
    
    // Extract strength
    const strengthMatch = line.match(/(\d+\.?\d*)\s*(mg|ml|g|mcg)/i);
    if (strengthMatch) {
      analysis.strength = `${strengthMatch[1]}${strengthMatch[2]}`;
    }
    
    // Extract frequency
    const freqPatterns = [
      { pattern: /once\s+(?:a\s+)?day|OD|QD/i, value: 'Once daily' },
      { pattern: /twice\s+(?:a\s+)?day|BD|BID/i, value: 'Twice daily' },
      { pattern: /thrice\s+(?:a\s+)?day|TD|TID/i, value: 'Three times daily' },
      { pattern: /four\s+times\s+(?:a\s+)?day|QID/i, value: 'Four times daily' },
      { pattern: /every\s+(\d+)\s+hours/i, value: 'Every $1 hours' },
    ];
    
    for (const { pattern, value } of freqPatterns) {
      const match = line.match(pattern);
      if (match) {
        analysis.frequency = value.replace('$1', match[1] || '');
        break;
      }
    }
    
    // Extract dosage
    const dosageMatch = line.match(/(\d+)\s*(?:tab|tablet|cap|capsule|ml|teaspoon)/i);
    if (dosageMatch) {
      analysis.dosage = dosageMatch[0];
    }
    
    // Add flags for ambiguous or missing information
    if (!analysis.strength) {
      analysis.flags.push('Strength not clearly specified');
      analysis.confidence -= 0.1;
    }
    
    if (!analysis.frequency) {
      analysis.flags.push('Dosage frequency unclear');
      analysis.confidence -= 0.1;
    }
    
    if (!analysis.dosage) {
      analysis.flags.push('Dosage amount not specified');
      analysis.confidence -= 0.1;
    }
    
    if (analysis.medicationName) {
      analyses.push(analysis);
    }
  }
  
  return analyses;
};

export const analyzeWithAI = async (
  text: string,
  imageData?: string
): Promise<PrescriptionAnalysis[]> => {
  // This is a simplified version for the prototype
  // In production, this would make an API call to an edge function
  // that uses Lovable AI to analyze the prescription
  
  try {
    const analyses = await analyzePrescriptionText(text);
    
    if (analyses.length === 0) {
      // If no medicines found, create a generic analysis
      return [{
        medicationName: 'Unknown',
        confidence: 0.3,
        flags: ['Could not identify medication from text'],
      }];
    }
    
    return analyses;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze prescription');
  }
};
