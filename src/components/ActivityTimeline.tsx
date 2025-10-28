import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ActivityLog } from '@/types/medicine';

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-success bg-success/5';
      case 'error':
        return 'border-destructive bg-destructive/5';
      default:
        return 'border-primary bg-primary/5';
    }
  };

  if (activities.length === 0) return null;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Processing Timeline</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusColor(activity.status)}`}
          >
            <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{activity.action}</p>
              {activity.details && (
                <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {activity.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
