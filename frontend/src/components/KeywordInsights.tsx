import React, { useState, useEffect } from 'react';
import { fetchProfessorAnalytics } from '../api/client';
import type { TopicInsight } from '../types';
import { Badge } from '../components/Badge';

export const KeywordInsights: React.FC = () => {
  const [insights, setInsights] = useState<TopicInsight[]>([]);

  useEffect(() => {
    fetchProfessorAnalytics().then(data => {
      setInsights(data.insights);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Topic Breakdown */}
      <div className="bg-app-bg border border-app-border rounded-lg p-5 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-app-text-primary uppercase tracking-wider">
            Inquiry Volume by Topic
          </h4>
          <p className="text-xs text-app-text-primary mt-0.5">
            Aggregated questions asked by students during Herculean dialogue
          </p>
        </div>

        <div className="space-y-3.5 pt-1">
          {insights.map((item, idx) => {
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-app-text-primary">{item.topic}</span>
                    {item.isBottleneck && (
                      <Badge variant="warning" size="sm">
                        Bottleneck
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-app-text-primary text-[11px]">
                    <span>{item.studentCount} students</span>
                    <span>·</span>
                    <span>{item.questionCount} queries</span>
                    <span>·</span>
                    <span className={item.avgFollowUps >= 3.5 ? 'text-app-text-primary' : 'text-app-text-primary'}>
                      {item.avgFollowUps} turns avg
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-lg bg-app-bg overflow-hidden">
                  <div
                    className={`h-full rounded-lg ${
                      item.isBottleneck ? 'bg-white' : 'bg-white'
                    }`}
                    style={{ width: `${item.percentage * 2}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keywords and Insights */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-app-bg border border-app-border rounded-lg p-5">
          <h4 className="text-xs font-semibold text-app-text-primary uppercase tracking-wider mb-2.5">
            Frequent Problem Keywords
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-app-text-primary opacity-50">Not enough data yet</span>
          </div>
        </div>

        <div className="bg-app-bg border border-app-border rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-app-text-primary uppercase tracking-wider mb-1">
              Pedagogical Effectiveness
            </h4>
            <p className="text-xs text-app-text-primary leading-relaxed opacity-50">
              Check back after students interact with the material.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-app-border flex items-center justify-between text-xs">
            <span className="text-app-text-primary">Self-Discovery Completion Rate:</span>
            <span className="font-semibold text-app-text-primary text-sm opacity-50">--%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
