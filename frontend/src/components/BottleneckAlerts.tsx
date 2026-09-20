import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '../components/Badge';
import { fetchBottlenecks } from '../api/client';

export const BottleneckAlerts: React.FC = () => {
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);

  useEffect(() => {
    fetchBottlenecks().then(setBottlenecks).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-app-text-primary uppercase tracking-wider">
          Identified Conceptual Bottlenecks
        </h4>
        <p className="text-xs text-app-text-primary mt-0.5">
          Topics where students require &ge; 3.5 dialogue exchanges to reach conceptual understanding
        </p>
      </div>

      <div className="space-y-3">
        {bottlenecks.length === 0 ? (
          <div className="p-8 border border-app-border border-dashed text-center text-app-text-primary/50 text-xs">
            No major bottlenecks identified yet.
          </div>
        ) : (
          bottlenecks.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border transition-colors ${
              item.resolved
                ? 'bg-app-bg border-app-border opacity-70'
                : 'bg-app-bg border-app-border'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-app-text-primary">{item.topic}</span>
                <Badge
                  variant={item.resolved ? 'default' : item.severity.includes('Critical') ? 'danger' : 'warning'}
                  size="sm"
                >
                  {item.severity}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-app-text-primary">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-app-text-primary" />
                  {item.avgTurns} turns avg
                </span>
                <span>·</span>
                <span>{item.affectedStudents} students impacted</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs mt-2">
              <div className="p-3 rounded bg-app-bg border border-app-border">
                <span className="font-medium text-app-text-primary block mb-1">Observed Confusion Pattern:</span>
                <p className="text-app-text-primary leading-relaxed">{item.rootCause}</p>
              </div>

              <div className="p-3 rounded bg-app-bg border border-app-border">
                <span className="font-medium text-app-text-primary block mb-1">Suggested Intervention:</span>
                <p className="text-app-text-primary leading-relaxed">{item.recommendation}</p>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};
