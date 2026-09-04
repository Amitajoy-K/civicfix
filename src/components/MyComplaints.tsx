import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Plus, 
  Eye, 
  Calendar 
} from 'lucide-react';
import { CivicIssue, User } from '../types';
import { getPriorityColor, getStatusColor } from '../utils/civicEngine';

interface MyComplaintsProps {
  currentUser: User;
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  onStartReport: () => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({
  currentUser,
  issues,
  onSelectIssue,
  onStartReport
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (activeTab === 'my' && issue.userId !== currentUser.id) return false;
      if (statusFilter !== 'All' && issue.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          issue.id.toLowerCase().includes(q) ||
          issue.title.toLowerCase().includes(q) ||
          issue.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [issues, activeTab, currentUser.id, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">Civic Complaint Tracker</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              {filteredIssues.length} Complaints
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of civic hazards reported to municipal departments with full audit trails
          </p>
        </div>

        <button
          onClick={onStartReport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          id="complaints-report-new-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Defect</span>
        </button>
      </div>

      {/* Filter and Switcher Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Toggle between My Reports and All Reports */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'my'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-my-complaints"
          >
            My Reports ({issues.filter(i => i.userId === currentUser.id).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-all-complaints"
          >
            All Chennai Reports ({issues.length})
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search complaints..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

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
        </div>
      </div>

      {/* Complaints List */}
      {filteredIssues.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-display">No complaints found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {activeTab === 'my' 
              ? "You haven't reported any civic issues yet. Spot a pothole or streetlight out? Report it now!" 
              : "No issues match the search and filter criteria."}
          </p>
          <button
            onClick={onStartReport}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs"
          >
            Report an Issue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIssues.map((issue) => {
            const priorityStyle = getPriorityColor(issue.priority);
            const statusStyle = getStatusColor(issue.status);

            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between"
                id={`complaint-item-${issue.id}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-slate-700">{issue.id}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      {issue.status}
                    </span>
                  </div>

                  <div className="flex gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                      <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {issue.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{issue.address}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2 py-0.2 rounded-md font-bold text-[10px] border ${priorityStyle.badge}`}>
                          {issue.priority}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {issue.departmentName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                    {issue.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-1 text-blue-600 font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect Timeline</span>
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
