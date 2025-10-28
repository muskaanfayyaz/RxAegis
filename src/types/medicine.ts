export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  strength: string[];
  manufacturer: string;
  registrationNumber: string;
  category: string;
  authenticityStatus: 'verified' | 'unverified' | 'counterfeit';
  whoApproved: boolean;
  sideEffects: string[];
  alternatives: string[];
  barcode?: string;
}

export interface PrescriptionAnalysis {
  medicationName: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  confidence: number;
  flags: string[];
}

export interface VerificationResult {
  medicine: Medicine | null;
  analysis: PrescriptionAnalysis;
  authenticityScore: number;
  alerts: Alert[];
  alternatives: Medicine[];
}

export interface Alert {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: Date;
  status: 'success' | 'error' | 'processing';
  details?: string;
}
