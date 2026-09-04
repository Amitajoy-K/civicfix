import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ArrowUpRight, 
  TrendingUp, 
  Users, 
  SlidersHorizontal,
  BarChart3,
  MapPin,
  RefreshCw,
  Eye,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { CivicIssue, Department, User } from '../types';
import { getPriorityColor, getStatusColor } from '../utils/civicEngine';
import { updateIssueDepartmentApi } from '../services/api';

interface AdminDashboardProps {
  currentUser: User;
  issues: CivicIssue[];
  departments: Department[];
  onIssueUpdated: (updated: CivicIssue) => void;
  onOpenIssueDetail: (issue: CivicIssue) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  issues,
  departments,
  onIssueUpdated,
  onOpenIssueDetail
}) => {
  const [reassignIssue, setReassignIssue] = useState<CivicIssue | null>(null);
  const [selectedNewDeptId, setSelectedNewDeptId] = useState<string>('');
  const [reassigning, setReassigning] = useState<boolean>(false);

  // Key Metrics
  const totalReports = issues.reduce((acc, curr) => acc + curr.reportCount, 0);
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const pendingCount = issues.filter(i => i.status !== 'Resolved').length;
  const criticalCount = issues.filter(i => i.priority === 'Critical').length;
  const avgResolutionDays = '2.4';

  // Category counts
  const categoryCounts: Record<string, number> = {};
  issues.forEach(i => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  // Department Performance Table Data
  const deptPerformance = departments.map((dept) => {
    const assigned = issues.filter(i => i.departmentId === dept.id);
    const resolved = assigned.filter(i => i.status === 'Resolved');
    const pending = assigned.filter(i => i.status !== 'Resolved');
    const resolutionRate = assigned.length > 0 
      ? Math.round((resolved.length / assigned.length) * 100)
      : 100;

    return {
      id: dept.id,
      name: dept.name,
      slaHours: dept.slaHours,
      assignedCount: assigned.length,
      resolvedCount: resolved.length,
      pendingCount: pending.length,
      resolutionRate,
      avgTime: dept.slaHours <= 24 ? '1.1 days' : dept.slaHours <= 48 ? '2.3 days' : '3.8 days'
    };
  });

  const handleOpenReassign = (issue: CivicIssue) => {
    setReassignIssue(issue);
    setSelectedNewDeptId(issue.departmentId);
  };

  const handleConfirmReassign = async () => {
    if (!reassignIssue || !selectedNewDeptId) return;
    setReassigning(true);
    try {
      const updated = await updateIssueDepartmentApi(
        reassignIssue.id, 
        selectedNewDeptId, 
        currentUser.name
      );
      onIssueUpdated(updated);
      setReassignIssue(null);
    } catch (e) {
      console.error(e);
    } finally {
      setReassigning(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 font-display">
                  Municipal City Administration
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Greater Chennai Corporation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                City-wide civic defect telemetry, SLA performance audit, and inter-department routing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Status: Fully Operational</span>
        </div>
      </div>

      {/* 4 Top KPI Cards (Section 16: Total Reports, Resolved, Pending, Avg Resolution Time) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2 font-display">{totalReports}</p>
          <p className="text-xs text-slate-400 mt-1">Across all 15 city zones</p>
        </div>

        {/* Resolved Reports */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600 mt-2 font-display">{resolvedCount}</p>
          <p className="text-xs text-emerald-700/80 mt-1">Verified with photo proof</p>
        </div>

        {/* Pending Reports */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Backlog</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-2 font-display">{pendingCount}</p>
          <p className="text-xs text-amber-700/80 mt-1">{criticalCount} critical safety defects</p>
        </div>

        {/* Avg Resolution Time */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Resolution Time</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2 font-display">{avgResolutionDays} <span className="text-lg font-normal text-slate-500">days</span></p>
          <p className="text-xs text-slate-400 mt-1">18% faster than national benchmark</p>
        </div>
      </div>

      {/* Category Breakdown & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Breakdown Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Issue Category Distribution</h2>
          <p className="text-xs text-slate-500 mb-4">Volume breakdown across major civic infrastructure vectors</p>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / issues.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat}</span>
                    <span className="font-mono text-slate-500">{count} reports ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* City Priority Index Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Priority Allocation</h2>
            <p className="text-xs text-slate-500 mb-4">SLA triage weight distribution</p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-xl border border-red-200 text-xs">
                <span className="font-bold text-red-900">Critical Priority</span>
                <span className="font-mono font-bold text-red-700">{issues.filter(i => i.priority === 'Critical').length} tickets</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900">High Priority</span>
                <span className="font-mono font-bold text-amber-700">{issues.filter(i => i.priority === 'High').length} tickets</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-xl border border-yellow-200 text-xs">
                <span className="font-bold text-yellow-900">Medium Priority</span>
                <span className="font-mono font-bold text-yellow-700">{issues.filter(i => i.priority === 'Medium').length} tickets</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900">Low Priority</span>
                <span className="font-mono font-bold text-emerald-700">{issues.filter(i => i.priority === 'Low').length} tickets</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 mt-4">
            <span className="font-semibold text-slate-700 block mb-0.5">Municipal SLA Target:</span>
            Critical incidents require on-site response within 12 hours.
          </div>
        </div>
      </div>

      {/* Department Performance Table (Section 16) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Department Performance & SLA Adherence</h2>
            <p className="text-xs text-slate-500">Live operational compliance and resolution speeds across all 6 departments</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Department Name</th>
                <th className="px-4 py-3.5">Target SLA</th>
                <th className="px-4 py-3.5">Total Assigned</th>
                <th className="px-4 py-3.5">Resolved</th>
                <th className="px-4 py-3.5">Pending</th>
                <th className="px-4 py-3.5">Avg Turnaround</th>
                <th className="px-4 py-3.5">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {deptPerformance.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{dept.name}</span>
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {dept.slaHours} hours
                  </td>

                  <td className="px-4 py-4 font-bold text-slate-900">
                    {dept.assignedCount}
                  </td>

                  <td className="px-4 py-4 text-emerald-600 font-bold">
                    {dept.resolvedCount}
                  </td>

                  <td className="px-4 py-4 text-amber-600 font-bold">
                    {dept.pendingCount}
                  </td>

                  <td className="px-4 py-4 text-slate-500">
                    {dept.avgTime}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${dept.resolutionRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{dept.resolutionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Quick Intervention Queue: Allows Re-assigning tickets */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Administrative Routing & Escalation Table</h2>
            <p className="text-xs text-slate-500">Reassign misrouted tickets or inspect municipal defect logs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Title & Locality</th>
                <th className="px-4 py-3.5">Current Department</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{issue.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 line-clamp-1">{issue.title}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{issue.address}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    {issue.departmentName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${getPriorityColor(issue.priority).badge}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(issue.status).bg} ${getStatusColor(issue.status).text} ${getStatusColor(issue.status).border}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenIssueDetail(issue)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenReassign(issue)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] rounded-lg border border-slate-300 transition-colors flex items-center gap-1"
                        id={`admin-reassign-${issue.id}`}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Re-assign</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Department Modal */}
      {reassignIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Re-route Civic Ticket #{reassignIssue.id}</h3>
              <button onClick={() => setReassignIssue(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Reassign <strong>{reassignIssue.title}</strong> to another municipal department:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Department</label>
              <select
                value={selectedNewDeptId}
                onChange={(e) => setSelectedNewDeptId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReassignIssue(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReassign}
                disabled={reassigning}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {reassigning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Confirm Re-route</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
