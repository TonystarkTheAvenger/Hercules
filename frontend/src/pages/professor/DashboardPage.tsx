import React, { useState } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { DocumentManagerPage } from '../../pages/professor/DocumentManagerPage';
import { KeywordInsights } from '../../components/KeywordInsights';
import { BottleneckAlerts } from '../../components/BottleneckAlerts';
import { StudentFeed } from '../../components/StudentFeed';
import { PromptConfigView } from '../../components/PromptConfigView';
import { StatCard } from '../../components/StatCard';
import {
  FileText,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Sliders,
  Compass,
} from 'lucide-react';

type TabType = 'documents' | 'analytics' | 'bottlenecks' | 'feed' | 'prompt';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('documents');
  const { documents } = useDocuments();

  const totalChunks = documents.reduce((acc, curr) => acc + curr.chunksCount, 0);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'documents', label: 'Documents & RAG', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Topic Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'bottlenecks', label: 'Bottlenecks', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'feed', label: 'Student Stream', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'prompt', label: 'Protocol Rules', icon: <Sliders className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            title="Indexed Documents"
            value={`${documents.length} Files`}
            subtitle={`${totalChunks} vector chunks in ChromaDB`}
            icon={<FileText className="w-4 h-4 text-app-text-primary" />}
            trend={{ value: '0 this week', positive: true }}
            highlight
          />
          <StatCard
            title="Student Inquiries"
            value="0"
            subtitle="Across 0 enrolled students"
            icon={<MessageSquare className="w-4 h-4 text-app-text-primary" />}
            trend={{ value: '0%', positive: true }}
          />
          <StatCard
            title="Average Herculean Turns"
            value="0.0 Turns"
            subtitle="Dialogue depth to self-discovery"
            icon={<Compass className="w-4 h-4 text-app-text-primary" />}
          />
          <StatCard
            title="Active Bottlenecks"
            value="0 Identified"
            subtitle="Requiring lecture intervention"
            icon={<AlertTriangle className="w-4 h-4 text-app-text-primary" />}
          />
        </div>

        {/* Tab Navigation: Clean Linear-style horizontal bar */}
        <div className="flex items-center gap-1 border-b border-app-border pb-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-app-bg text-app-text-primary border border-app-border'
                  : 'text-app-text-primary hover:text-app-text-primary hover:bg-app-bg'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 rounded-lg bg-white text-app-text-primary text-[10px] flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in pt-1">
          {activeTab === 'documents' && <DocumentManagerPage />}
          {activeTab === 'analytics' && <KeywordInsights />}
          {activeTab === 'bottlenecks' && <BottleneckAlerts />}
          {activeTab === 'feed' && <StudentFeed />}
          {activeTab === 'prompt' && <PromptConfigView />}
        </div>
      </div>
    </div>
  );
};
