import React from 'react';
import { RECENT_STUDENT_QUERIES } from '../api/mockData';
import { Clock } from 'lucide-react';
import { Badge } from '../components/Badge';

export const StudentFeed: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-app-text-primary uppercase tracking-wider">
            Live Dialogue Stream
          </h4>
          <p className="text-xs text-app-text-primary mt-0.5">
            Real-time student inquiries processed by the Herculean tutor
          </p>
        </div>
        <span className="text-[11px] text-app-text-primary flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-lg bg-white" />
          Active Telemetry
        </span>
      </div>

      <div className="space-y-2">
        {RECENT_STUDENT_QUERIES.length === 0 ? (
          <div className="p-8 border border-app-border border-dashed text-center text-app-text-primary/50 text-xs">
            No recent student activity.
          </div>
        ) : (
          RECENT_STUDENT_QUERIES.map((log) => {
          let statusBadge = <Badge variant="default">In Progress</Badge>;
          if (log.status === 'resolved') {
            statusBadge = <Badge variant="success">Resolved</Badge>;
          } else if (log.status === 'struggling') {
            statusBadge = <Badge variant="danger">High Turns</Badge>;
          }

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-lg bg-app-bg border border-app-border hover:border-app-border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <img
                  src={log.studentAvatar}
                  alt={log.studentName}
                  className="w-7 h-7 rounded-lg border border-app-border object-cover shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-app-text-primary">{log.studentName}</span>
                    <span className="text-app-text-primary">·</span>
                    <span className="text-[11px] text-app-text-primary flex items-center gap-1">
                      <Clock className="w-3 h-3 text-app-text-primary" />
                      {log.timestamp}
                    </span>
                    <span className="text-app-text-primary">·</span>
                    <span className="text-app-text-primary font-medium">{log.topic}</span>
                  </div>
                  <p className="text-app-text-primary italic text-xs leading-relaxed truncate">
                    "{log.queryText}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-app-border">
                <span className="text-app-text-primary text-[11px]">
                  {log.exchanges} turns
                </span>
                {statusBadge}
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
