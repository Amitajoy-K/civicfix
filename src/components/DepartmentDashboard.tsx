import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Eye, 
  Check, 
  FileText, 
  Upload, 
  Camera, 
  Search, 
  Filter,
  X,
  RefreshCw,
  MapPin,
  Flame
} from 'lucide-react';
import { CivicIssue, User, Department, IssueStatus } from '../types';
import { getPriorityColor, getStatusColor } from '../utils/civicEngine';
import { updateIssueStatusApi } from '../services/api';

interface DepartmentDashboardProps {
  currentUser: User;
  issues: CivicIssue[];
  departments: Department[];
  onIssueUpdated: (updated: CivicIssue) => void;
  onOpenIssueDetail: (issue: CivicIssue) => void;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  currentUser,
  issues,
  departments,
  onIssueUpdated,
  onOpenIssueDetail
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(currentUser.departmentId || 'dept-road');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status Action Modal
  const [actionIssue, setActionIssue] = useState<CivicIssue | null>(null);
  const [newStatus, setNewStatus] = useState<IssueStatus>('In Progress');
  const [statusNote, setStatusNote] = useState<string>('');
  const [resolutionProof, setResolutionProof] = useState<string>(
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  );
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  const currentDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  // Filter issues assigned to this department
  const deptIssues = useMemo(() => {
    return issues.filter(i => i.departmentId === selectedDeptId);
  }, [issues, selectedDeptId]);

  // Metric counts
  const totalAssigned = deptIssues.length;
  const pendingCount = deptIssues.filter(i => i.status === 'Reported').length;
  const inProgressCount = deptIssues.filter(i => i.status === 'In Progress' || i.status === 'Assigned').length;
  const highPriorityCount = deptIssues.filter(i => i.priority === 'High').length;
  const criticalCount = deptIssues.filter(i => i.priority === 'Critical').length;
  const resolvedCount = deptIssues.filter(i => i.status === 'Resolved').length;

  // Filter table rows
  const tableIssues = useMemo(() => {
    return deptIssues.filter(i => {
      if (statusFilter !== 'All' && i.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && i.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [deptIssues, statusFilter, priorityFilter, searchQuery]);

  const handleOpenActionModal = (issue: CivicIssue) => {
    setActionIssue(issue);
    setNewStatus(issue.status === 'Reported' ? 'Assigned' : issue.status === 'Assigned' ? 'In Progress' : 'Resolved');
    setStatusNote('');
    setResolutionNotes('');
  };

  const handleApplyStatusUpdate = async () => {
    if (!actionIssue) return;
    setUpdating(true);
    try {
      const updated = await updateIssueStatusApi(actionIssue.id, {
        status: newStatus,
        note: statusNote || `Status changed to ${newStatus} by ${currentUser.name}`,
        actor: currentUser.name,
        actorRole: currentUser.role,
        resolutionProof: newStatus === 'Resolved' ? resolutionProof : undefined,
        resolutionNotes: newStatus === 'Resolved' ? resolutionNotes || 'Repairs certified by municipal field inspector.' : undefined
      });
      onIssueUpdated(updated);
      setActionIssue(null);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Department Header & Switcher */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 font-display">
                  {currentDept?.name || 'Department Staff Workspace'}
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  Staff View
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentDept?.description}</p>
            </div>
          </div>
        </div>

        {/* Department Switcher Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider">Switch Dept:</span>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            id="dept-switcher-select"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards (Section 15: Total Assigned, Pending, In Progress, High Priority, Critical, Resolved) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Assigned */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Assigned</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{totalAssigned}</p>
          <span className="text-[10px] text-slate-400">Total in queue</span>
        </div>

        {/* Pending */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pending</span>
          <p className="text-2xl font-bold text-slate-700 mt-1 font-display">{pendingCount}</p>
          <span className="text-[10px] text-slate-400">Awaiting acceptance</span>
        </div>

        {/* In Progress */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">In Progress</span>
          <p className="text-2xl font-bold text-blue-600 mt-1 font-display">{inProgressCount}</p>
          <span className="text-[10px] text-blue-400">Under active repair</span>
        </div>

        {/* High Priority */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">High Priority</span>
          <p className="text-2xl font-bold text-amber-700 mt-1 font-display">{highPriorityCount}</p>
          <span className="text-[10px] text-amber-600">Urgent SLA</span>
        </div>

        {/* Critical */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">Critical</span>
          <p className="text-2xl font-bold text-red-600 mt-1 font-display">{criticalCount}</p>
          <span className="text-[10px] text-red-400">Safety emergency</span>
        </div>

        {/* Resolved */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Resolved</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-display">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-500">Certified fixes</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, title, or address..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none font-medium text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Issue Table (Section 15: Issue ID, Category, Location, Priority, Status, Reported Date, Action) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Issue ID</th>
                <th className="px-4 py-3.5">Category & Title</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Reports</th>
                <th className="px-4 py-3.5">Reported Date</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tableIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No tickets match the selected filters.
                  </td>
                </tr>
              ) : (
                tableIssues.map((issue) => {
                  const priorityStyle = getPriorityColor(issue.priority);
                  const statusStyle = getStatusColor(issue.status);

                  return (
                    <tr key={issue.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-slate-900">{issue.id}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={issue.imageUrl}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {issue.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{issue.category}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                        {issue.address}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${priorityStyle.badge}`}>
                          {issue.priority}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {issue.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-slate-700">
                          {issue.reportCount > 1 && <Flame className="w-3 h-3 text-amber-500" />}
                          <span>{issue.reportCount}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-400">
                        {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenIssueDetail(issue)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Open Ticket"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenActionModal(issue)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded-lg transition-colors"
                            id={`manage-issue-btn-${issue.id}`}
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action / Status Transition Modal */}
      {actionIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Update Ticket Status
                </span>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  {actionIssue.id}: {actionIssue.title}
                </h2>
              </div>
              <button
                onClick={() => setActionIssue(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Resolution Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Assigned', 'In Progress', 'Resolved'] as IssueStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      newStatus === st
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Operational Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Inspection / Operational Notes
              </label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Patching crew deployed on-site; work initiated at 08:30 AM."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Resolution Proof & Notes (When marking as Resolved) */}
            {newStatus === 'Resolved' && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resolution Proof Verification (Required for Closeout)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                    Resolution Notes
                  </label>
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g. Road surface patched, rolled, and asphalt sealed. Full traffic clearance restored."
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                    Resolution Proof Photo (Preview)
                  </label>
                  <div className="rounded-xl overflow-hidden border border-emerald-300 h-28 bg-slate-100 relative">
                    <img
                      src={resolutionProof}
                      alt="Resolution Proof"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 right-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                      Cleaned & Restored
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionIssue(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyStatusUpdate}
                disabled={updating}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                id="save-status-update-btn"
              >
                {updating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Confirm Status Update</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
