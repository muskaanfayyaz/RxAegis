import drapData from '@/data/drapDatabase.json';
import type { Medicine, PrescriptionAnalysis, VerificationResult, Alert } from '@/types/medicine';

export const findMedicineByName = (name: string): Medicine | null => {
  const normalizedName = name.toLowerCase().trim();
  
  const medicine = drapData.medicines.find(med => 
    med.name.toLowerCase() === normalizedName ||
    med.genericName.toLowerCase() === normalizedName ||
    med.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(med.name.toLowerCase())
  );

  return medicine as Medicine | null;
};

export const findMedicineByBarcode = (barcode: string): Medicine | null => {
  const medicine = drapData.medicines.find(med => med.barcode === barcode);
  return medicine as Medicine | null;
};

export const calculateAuthenticityScore = (medicine: Medicine | null): number => {
  if (!medicine) return 0;
  
  let score = 0;
  
  // WHO approval adds 30 points
  if (medicine.whoApproved) score += 30;
  
  // Valid registration adds 40 points
  if (medicine.registrationNumber && medicine.registrationNumber !== 'N/A' && !medicine.registrationNumber.includes('EXPIRED')) {
    score += 40;
  }
  
  // Verified status adds 30 points
  if (medicine.authenticityStatus === 'verified') {
    score += 30;
  } else if (medicine.authenticityStatus === 'unverified') {
    score += 10;
  }
  
  return score;
};

export const generateAlerts = (
  medicine: Medicine | null,
  analysis: PrescriptionAnalysis
): Alert[] => {
  const alerts: Alert[] = [];
  
  if (!medicine) {
    alerts.push({
      type: 'error',
      message: 'Medicine not found in DRAP database. Please verify authenticity with healthcare provider.',
      timestamp: new Date(),
    });
    return alerts;
  }
  
  // Authenticity alerts
  if (medicine.authenticityStatus === 'counterfeit') {
    alerts.push({
      type: 'error',
      message: `⚠️ COUNTERFEIT DETECTED: ${medicine.name} is flagged as counterfeit. DO NOT USE.`,
      timestamp: new Date(),
    });
  }
  
  if (medicine.authenticityStatus === 'unverified') {
    alerts.push({
      type: 'warning',
      message: `${medicine.name} is not verified. Registration may be expired or invalid.`,
      timestamp: new Date(),
    });
  }
  
  if (!medicine.whoApproved) {
    alerts.push({
      type: 'warning',
      message: `${medicine.name} is not WHO-approved. Use with caution.`,
      timestamp: new Date(),
    });
  }
  
  // Confidence alerts
  if (analysis.confidence < 0.5) {
    alerts.push({
      type: 'warning',
      message: 'Low confidence in prescription analysis. Please verify with pharmacist.',
      timestamp: new Date(),
    });
  }
  
  // Flags from AI analysis
  if (analysis.flags.length > 0) {
    analysis.flags.forEach(flag => {
      alerts.push({
        type: 'info',
        message: flag,
        timestamp: new Date(),
      });
    });
  }
  
  // Success message for verified medicines
  if (medicine.authenticityStatus === 'verified' && medicine.whoApproved) {
    alerts.push({
      type: 'success',
      message: `✓ ${medicine.name} is verified and WHO-approved.`,
      timestamp: new Date(),
    });
  }
  
  return alerts;
};

export const getSaferAlternatives = (medicine: Medicine | null): Medicine[] => {
  if (!medicine) return [];
  
  // If medicine is verified and safe, return empty array
  if (medicine.authenticityStatus === 'verified' && medicine.whoApproved) {
    return [];
  }
  
  // Find alternatives from the database
  const alternatives: Medicine[] = [];
  
  medicine.alternatives.forEach(altName => {
    const altMedicine = findMedicineByName(altName);
    if (altMedicine && 
        altMedicine.authenticityStatus === 'verified' && 
        altMedicine.whoApproved) {
      alternatives.push(altMedicine);
    }
  });
  
  return alternatives;
};

export const createVerificationResult = (
  medicine: Medicine | null,
  analysis: PrescriptionAnalysis
): VerificationResult => {
  const authenticityScore = calculateAuthenticityScore(medicine);
  const alerts = generateAlerts(medicine, analysis);
  const alternatives = getSaferAlternatives(medicine);
  
  return {
    medicine,
    analysis,
    authenticityScore,
    alerts,
    alternatives,
  };
};
