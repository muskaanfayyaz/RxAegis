import { useState } from 'react';
import { ImageCapture } from '@/components/ImageCapture';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { VerificationResults } from '@/components/VerificationResults';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { toast } from 'sonner';
import { preprocessImage } from '@/services/imagePreprocessing';
import { detectBarcode } from '@/services/barcodeService';
import { extractTextFromImage, parseTextForMedicines } from '@/services/ocrService';
import { analyzeWithAI } from '@/services/aiAnalysisService';
import {
  findMedicineByName,
  findMedicineByBarcode,
  createVerificationResult,
} from '@/services/drapValidation';
import type { VerificationResult, ActivityLog, PrescriptionAnalysis } from '@/types/medicine';

type ProcessingStage = 'idle' | 'preprocessing' | 'barcode' | 'ocr' | 'ai-analysis' | 'validation' | 'complete';

const Index = () => {
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const addActivity = (action: string, status: 'success' | 'error' | 'processing', details?: string) => {
    const activity: ActivityLog = {
      id: Date.now().toString(),
      action,
      status,
      timestamp: new Date(),
      details,
    };
    setActivities((prev) => [...prev, activity]);
  };

  const updateLastActivity = (status: 'success' | 'error', details?: string) => {
    setActivities((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          status,
          details,
        };
      }
      return updated;
    });
  };

  const handleImageCapture = async (
    file: File,
    type: 'prescription' | 'barcode' | 'product'
  ) => {
    try {
      setResults([]);
      setActivities([]);
      
      // Stage 1: Preprocessing
      setStage('preprocessing');
      setProgress(10);
      setMessage('Optimizing image for analysis...');
      addActivity('Image preprocessing', 'processing');

      const processedImage = await preprocessImage(file);
      setProgress(20);
      updateLastActivity('success', 'Image optimized successfully');

      // Stage 2: Barcode Detection
      setStage('barcode');
      setProgress(30);
      setMessage('Scanning for barcodes...');
      addActivity('Barcode detection', 'processing');

      const barcode = await detectBarcode(processedImage);
      
      if (barcode) {
        updateLastActivity('success', `Barcode detected: ${barcode}`);
        toast.success(`Barcode detected: ${barcode}`);

        // Check DRAP database by barcode
        const medicine = findMedicineByBarcode(barcode);
        if (medicine) {
          setProgress(90);
          addActivity('DRAP database validation', 'success', `Medicine found: ${medicine.name}`);
          
          const analysis: PrescriptionAnalysis = {
            medicationName: medicine.name,
            confidence: 0.95,
            flags: [],
          };
          
          const verificationResult = createVerificationResult(medicine, analysis);
          setResults([verificationResult]);
          setStage('complete');
          setProgress(100);
          toast.success('Verification complete!');
          return;
        } else {
          updateLastActivity('success', 'No medicine found for this barcode');
        }
      } else {
        updateLastActivity('success', 'No barcode detected, proceeding with OCR');
      }

      // Stage 3: OCR
      setStage('ocr');
      setProgress(40);
      setMessage('Extracting text from image...');
      addActivity('OCR text extraction', 'processing');

      const extractedText = await extractTextFromImage(
        processedImage,
        (ocrProgress) => setProgress(40 + ocrProgress * 0.3)
      );
      
      updateLastActivity('success', `Extracted ${extractedText.length} characters`);
      
      if (!extractedText || extractedText.trim().length < 5) {
        throw new Error('Could not extract meaningful text from image');
      }

      const medicineTexts = parseTextForMedicines(extractedText);
      addActivity('Text parsing', 'success', `Found ${medicineTexts.length} potential medicines`);

      // Stage 4: AI Analysis
      setStage('ai-analysis');
      setProgress(70);
      setMessage('Analyzing prescription with AI...');
      addActivity('AI-powered analysis', 'processing');

      const analyses = await analyzeWithAI(medicineTexts.join('\n'));
      updateLastActivity('success', `Analyzed ${analyses.length} medications`);

      // Stage 5: Validation
      setStage('validation');
      setProgress(85);
      setMessage('Validating against DRAP database...');
      addActivity('DRAP validation', 'processing');

      const verificationResults: VerificationResult[] = [];

      for (const analysis of analyses) {
        const medicine = findMedicineByName(analysis.medicationName);
        const result = createVerificationResult(medicine, analysis);
        verificationResults.push(result);
      }

      updateLastActivity('success', `Validated ${verificationResults.length} medicines`);
      
      setResults(verificationResults);
      setStage('complete');
      setProgress(100);
      setMessage('Verification complete!');
      addActivity('Verification complete', 'success', `Processed ${verificationResults.length} medicines`);
      
      toast.success('Verification complete!');

    } catch (error) {
      console.error('Processing error:', error);
      updateLastActivity('error', error instanceof Error ? error.message : 'Unknown error');
      toast.error(error instanceof Error ? error.message : 'Failed to process image');
      setStage('idle');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setStage('idle');
    setProgress(0);
    setMessage('');
    setResults([]);
    setActivities([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="container mx-auto space-y-8">
        {stage === 'idle' && (
          <ImageCapture onImageCapture={handleImageCapture} isProcessing={false} />
        )}

        {stage !== 'idle' && stage !== 'complete' && (
          <>
            <ProcessingStatus stage={message} progress={progress} message={message} />
            <ActivityTimeline activities={activities} />
          </>
        )}

        {stage === 'complete' && results.length > 0 && (
          <>
            <VerificationResults results={results} onReset={handleReset} />
            <ActivityTimeline activities={activities} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
