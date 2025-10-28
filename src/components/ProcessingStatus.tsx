import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps {
  stage: string;
  progress: number;
  message: string;
}

export const ProcessingStatus = ({ stage, progress, message }: ProcessingStatusProps) => {
  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{stage}</h3>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <Progress value={progress} className="w-full" />
        
        <p className="text-center text-sm text-muted-foreground">
          {Math.round(progress)}% Complete
        </p>
      </div>
    </Card>
  );
};
