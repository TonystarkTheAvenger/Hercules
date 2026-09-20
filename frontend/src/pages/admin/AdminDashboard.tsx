import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/StatCard';
import { Shield, Users, Database, Trash2, Activity, Server } from 'lucide-react';
import { Badge } from '../../components/Badge';

export const AdminDashboard: React.FC = () => {
  const { allUsers, deleteUser, user } = useAuth();

  const studentsCount = allUsers.filter(u => u.role === 'student').length;
  const professorsCount = allUsers.filter(u => u.role === 'professor').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-app-border">
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-white" />
              System Administration
            </h1>
            <p className="text-sm text-[#A3A3A3] mt-1">
              Global overview and user management panel
            </p>
          </div>
          <Badge variant="warning">Superadmin Access</Badge>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            title="Total Users"
            value={`${allUsers.length}`}
            subtitle="Registered accounts"
            icon={<Users className="w-4 h-4 text-white" />}
            trend={{ value: '+1 today', positive: true }}
            highlight
          />
          <StatCard
            title="Students"
            value={`${studentsCount}`}
            subtitle="Active learners"
            icon={<Users className="w-4 h-4 text-[#A3A3A3]" />}
          />
          <StatCard
            title="Professors"
            value={`${professorsCount}`}
            subtitle="Content creators"
            icon={<Users className="w-4 h-4 text-[#A3A3A3]" />}
          />
          <StatCard
            title="System Status"
            value="Healthy"
            subtitle="All services operational"
            icon={<Activity className="w-4 h-4 text-[#A3A3A3]" />}
          />
        </div>

        {/* User Management Table */}
        <div className="liquid-panel overflow-hidden mt-8">
          <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#111111]">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#A3A3A3]" />
              User Database (Local Storage)
            </h4>
            <span className="text-xs text-[#737373]">
              {allUsers.length} records found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.01] text-[#A3A3A3] border-b border-white/[0.08]">
                <tr>
                  <th className="px-5 py-3 font-medium">User ID</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-[#737373]">
                      {u.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt="" className="w-6 h-6 rounded-full border border-[#262626]" />
                        <span className="font-medium text-white">{u.name}</span>
                        {user?.id === u.id && (
                          <span className="text-[10px] uppercase bg-white text-black px-1.5 py-0.5 rounded font-bold">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#A3A3A3]">
                      {u.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] uppercase px-2 py-1 rounded border ${
                        u.role === 'admin' 
                          ? 'border-white text-white bg-white/10' 
                          : u.role === 'professor' 
                            ? 'border-[#555555] text-[#E5E5E5] bg-[#262626]' 
                            : 'border-[#262626] text-[#A3A3A3] bg-[#111111]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => deleteUser(u.id)}
                        disabled={user?.id === u.id}
                        className="p-1.5 text-[#737373] hover:text-rose-400 hover:bg-rose-400/10 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#737373]"
                        title={user?.id === u.id ? "Cannot delete yourself" : "Delete user"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server Log / System Settings Mock */}
        <div className="liquid-panel overflow-hidden mt-6 mb-10">
          <div className="px-5 py-3 border-b border-white/[0.08] flex items-center gap-2 bg-[#111111]">
            <Server className="w-4 h-4 text-[#A3A3A3]" />
            <h4 className="text-sm font-semibold text-white">System Diagnostics</h4>
          </div>
          <div className="p-5 font-mono text-xs text-[#737373] space-y-1.5 overflow-hidden">
            <p className="flex gap-4">
              <span className="text-[#A3A3A3]">[{new Date().toISOString()}]</span>
              <span>SYSTEM_BOOT: Initialize Hercules Auth Context</span>
            </p>
            <p className="flex gap-4">
              <span className="text-[#A3A3A3]">[{new Date().toISOString()}]</span>
              <span className="text-white">DB_LOAD: Read LocalStorage 'hercules_users_db' ({allUsers.length} records)</span>
            </p>
            <p className="flex gap-4">
              <span className="text-[#A3A3A3]">[{new Date().toISOString()}]</span>
              <span>API_READY: Gemini Engine 3.6-flash Endpoint Verified</span>
            </p>
            <p className="flex gap-4 animate-pulse">
              <span className="text-[#A3A3A3]">[{new Date().toISOString()}]</span>
              <span className="text-white">Awaiting operations...</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
