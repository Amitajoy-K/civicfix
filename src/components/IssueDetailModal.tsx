import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Share2, 
  ThumbsUp, 
  Check, 
  FileCheck2,
  Image as ImageIcon
} from 'lucide-react';
import { CivicIssue, User } from '../types';
import { getPriorityColor, getStatusColor } from '../utils/civicEngine';
import { corroborateIssueApi } from '../services/api';

interface IssueDetailModalProps {
  issue: CivicIssue | null;
  currentUser: User;
  onClose: () => void;
  onIssueUpdated: (updated: CivicIssue) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  currentUser,
  onClose,
  onIssueUpdated
}) => {
  const [corroborating, setCorroborating] = useState(false);
  const [corroboratedSuccess, setCorroboratedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!issue) return null;

  const priorityStyle = getPriorityColor(issue.priority);
  const statusStyle = getStatusColor(issue.status);

  // Timeline Steps
  const steps = [
    { key: 'Reported', label: 'Reported', icon: AlertCircle },
    { key: 'Assigned', label: 'Assigned', icon: Building2 },
    { key: 'In Progress', label: 'In Progress', icon: Clock },
    { key: 'Resolved', label: 'Resolved', icon: CheckCircle2 }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Resolved': return 3;
      case 'In Progress': return 2;
      case 'Assigned': return 1;
      case 'Reported':
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(issue.status);

  const handleCorroborate = async () => {
    setCorroborating(true);
    try {
      const updated = await corroborateIssueApi(issue.id, {
        userId: currentUser.id,
        userName: currentUser.name,
        note: 'Corroborated by nearby citizen from portal.'
      });
      onIssueUpdated(updated);
      setCorroboratedSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setCorroborating(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden"
        id={`issue-modal-${issue.id}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-900 text-white tracking-wider">
              {issue.id}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {issue.status}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${priorityStyle.badge}`}>
              {issue.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Share Ticket"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Close"
              id="close-issue-detail-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Title & Address */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              {issue.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {issue.address}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Reported {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1 font-semibold text-blue-700">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                {issue.departmentName}
              </span>
            </div>
          </div>

          {/* Photo & Duplicate Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10 relative">
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span>Citizen Evidence Photo</span>
              </div>
            </div>

            {/* Duplicate Cluster Stats & Corroborate Action */}
            <div className="flex flex-col justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Duplicate Reports</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 font-display">
                  {issue.reportCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {issue.reportCount === 1 
                    ? '1 citizen reported this public issue.' 
                    : `${issue.reportCount} citizens corroborated this issue in this locality.`}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <button
                  onClick={handleCorroborate}
                  disabled={corroborating || corroboratedSuccess || issue.status === 'Resolved'}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                    corroboratedSuccess
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 active:scale-[0.98]'
                  }`}
                  id="corroborate-issue-btn"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{corroboratedSuccess ? 'Corroborated!' : 'I observed this too'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Issue Description & Reason */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
              <p className="text-sm text-slate-800 mt-1 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                {issue.description}
              </p>
            </div>

            {issue.priorityReason && (
              <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Priority Justification:</span>
                <p>{issue.priorityReason}</p>
              </div>
            )}
          </div>

          {/* VISUAL STATUS TIMELINE (Section 12) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Status Timeline
            </h3>

            {/* Horizontal Timeline Bar */}
            <div className="relative mb-6">
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />
              <div 
                className="absolute top-4 left-6 h-0.5 bg-blue-600 transition-all duration-500 z-0" 
                style={{ width: `${(currentStepIdx / 3) * 100}%` }}
              />

              <div className="relative z-10 grid grid-cols-4 text-center">
                {steps.map((s, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const Icon = s.icon;

                  return (
                    <div key={s.key} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm font-bold'
                          : isDone
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-semibold mt-2 ${
                        isDone ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Detailed Audit Entries */}
            <div className="space-y-3 pt-2">
              {issue.timeline.map((evt, idx) => (
                <div key={evt.id || idx} className="flex gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex-1 pb-2 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{evt.status} – {evt.actor}</span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{evt.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Proof Section (if Resolved) */}
          {issue.status === 'Resolved' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <span>Issue Successfully Resolved</span>
              </div>
              <p className="text-xs text-emerald-900 mb-3">
                {issue.resolutionNotes || 'Department crew completed repair inspection and certified clearance.'}
              </p>
              {issue.resolutionProof && (
                <div className="rounded-xl overflow-hidden border border-emerald-300 max-w-sm aspect-video">
                  <img
                    src={issue.resolutionProof}
                    alt="Resolution Proof"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Ticket ID: {issue.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
