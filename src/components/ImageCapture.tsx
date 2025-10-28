import { useRef, useState } from 'react';
import { Camera, Upload, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImageCaptureProps {
  onImageCapture: (file: File, type: 'prescription' | 'barcode' | 'product') => void;
  isProcessing: boolean;
}

export const ImageCapture = ({ onImageCapture, isProcessing }: ImageCaptureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [captureType, setCaptureType] = useState<'prescription' | 'barcode' | 'product'>('prescription');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageCapture(file, captureType);
    }
  };

  const triggerFileInput = (type: 'prescription' | 'barcode' | 'product') => {
    setCaptureType(type);
    fileInputRef.current?.click();
  };

  const triggerCamera = (type: 'prescription' | 'barcode' | 'product') => {
    setCaptureType(type);
    cameraInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Medicine Verification System</h1>
        <p className="text-muted-foreground text-lg">
          Upload or scan prescriptions, barcodes, or medicine images for authenticity verification
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Prescription Card */}
        <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileImage className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Prescription</h3>
            <p className="text-sm text-muted-foreground">
              Upload or scan a prescription to verify medicines
            </p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => triggerFileInput('prescription')}
              disabled={isProcessing}
              className="w-full"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              onClick={() => triggerCamera('prescription')}
              disabled={isProcessing}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </Card>

        {/* Barcode Card */}
        <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">Barcode</h3>
            <p className="text-sm text-muted-foreground">
              Scan a medicine barcode for instant verification
            </p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => triggerFileInput('barcode')}
              disabled={isProcessing}
              className="w-full"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              onClick={() => triggerCamera('barcode')}
              disabled={isProcessing}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan Barcode
            </Button>
          </div>
        </Card>

        {/* Product Image Card */}
        <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <FileImage className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-semibold text-lg">Product Image</h3>
            <p className="text-sm text-muted-foreground">
              Upload a photo of the medicine packaging
            </p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => triggerFileInput('product')}
              disabled={isProcessing}
              className="w-full"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              onClick={() => triggerCamera('product')}
              disabled={isProcessing}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </Card>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
