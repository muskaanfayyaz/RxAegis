import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { VerificationResult } from '@/types/medicine';

interface VerificationResultsProps {
  results: VerificationResult[];
  onReset: () => void;
}

export const VerificationResults = ({ results, onReset }: VerificationResultsProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'counterfeit':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertCircle className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-success/10 text-success border-success/20';
      case 'counterfeit':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Verification Results</h2>
        <Button onClick={onReset} variant="outline">
          Verify Another Medicine
        </Button>
      </div>

      {results.map((result, index) => (
        <Card key={index} className="p-6 space-y-6">
          {/* Medicine Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold">
                    {result.medicine?.name || result.analysis.medicationName || 'Unknown Medicine'}
                  </h3>
                  {result.medicine && (
                    <Badge className={getStatusColor(result.medicine.authenticityStatus)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(result.medicine.authenticityStatus)}
                        {result.medicine.authenticityStatus.toUpperCase()}
                      </span>
                    </Badge>
                  )}
                </div>
                
                {result.medicine && (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Generic: {result.medicine.genericName}</p>
                    <p>Manufacturer: {result.medicine.manufacturer}</p>
                    <p>Registration: {result.medicine.registrationNumber}</p>
                    <p>Category: {result.medicine.category}</p>
                  </div>
                )}
              </div>

              {/* Authenticity Score */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">
                  <span className={getScoreColor(result.authenticityScore)}>
                    {result.authenticityScore}
                  </span>
                  <span className="text-muted-foreground text-xl">/100</span>
                </div>
                <p className="text-sm text-muted-foreground">Authenticity Score</p>
              </div>
            </div>

            {/* Prescription Analysis */}
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Strength</p>
                <p className="font-semibold">{result.analysis.strength || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dosage</p>
                <p className="font-semibold">{result.analysis.dosage || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-semibold">{result.analysis.frequency || 'Not specified'}</p>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Analysis Confidence:</span>
              <span className="font-semibold">
                {Math.round(result.analysis.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Alerts */}
          {result.alerts.length > 0 && (
            <div className="space-y-2">
              {result.alerts.map((alert, alertIndex) => (
                <Alert
                  key={alertIndex}
                  variant={alert.type === 'error' ? 'destructive' : 'default'}
                  className={
                    alert.type === 'success' ? 'border-success bg-success/5' :
                    alert.type === 'warning' ? 'border-warning bg-warning/5' :
                    alert.type === 'info' ? 'border-info bg-info/5' : ''
                  }
                >
                  {alert.type === 'error' && <XCircle className="h-4 w-4" />}
                  {alert.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                  {alert.type === 'info' && <Info className="h-4 w-4" />}
                  {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Side Effects */}
          {result.medicine && result.medicine.sideEffects.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Possible Side Effects:</h4>
              <div className="flex flex-wrap gap-2">
                {result.medicine.sideEffects.map((effect, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives.length > 0 && (
            <div className="space-y-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-accent" />
                Recommended Safer Alternatives:
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="p-3 bg-background rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{alt.name}</p>
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alt.genericName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alt.manufacturer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
