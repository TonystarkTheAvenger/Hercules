import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
}) => {
  return (
    <div
      className={`p-5 liquid-panel transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl hover:bg-[#1A1A1A] ${
        highlight
          ? 'bg-black'
          : 'bg-[#0A0A0A]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-white uppercase tracking-wider">{title}</p>
          <h3 className="text-xl font-semibold text-white mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-white mt-0.5">{subtitle}</p>}
        </div>
        <div className="text-white p-1.5 rounded-none bg-black border border-white/20">
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={`font-medium ${
              trend.positive ? 'text-white' : 'text-rose-400'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-white">vs last session</span>
        </div>
      )}
    </div>
  );
};
