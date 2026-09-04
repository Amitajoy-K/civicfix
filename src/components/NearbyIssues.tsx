import React, { useState } from 'react';
import { 
  MapPin, 
  Users, 
  ThumbsUp, 
  ArrowRight, 
  Navigation, 
  Filter, 
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { CivicIssue, User } from '../types';
import { getPriorityColor, getStatusColor } from '../utils/civicEngine';
import { corroborateIssueApi } from '../services/api';

interface NearbyIssuesProps {
  currentUser: User;
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  onIssueUpdated: (updated: CivicIssue) => void;
  onStartReport: () => void;
}

export const NearbyIssues: React.FC<NearbyIssuesProps> = ({
  currentUser,
  issues,
  onSelectIssue,
  onIssueUpdated,
  onStartReport
}) => {
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [corroboratedIds, setCorroboratedIds] = useState<Record<string, boolean>>({});

  const handleCorroborate = async (e: React.MouseEvent, issue: CivicIssue) => {
    e.stopPropagation();
    try {
      const updated = await corroborateIssueApi(issue.id, {
        userId: currentUser.id,
        userName: currentUser.name,
        note: 'Corroborated from Nearby Issues feed.'
      });
      onIssueUpdated(updated);
      setCorroboratedIds(prev => ({ ...prev, [issue.id]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">Nearby Civic Issues</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
              Community Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complaints reported by neighbors within your municipal ward. Corroborate existing defects to expedite resolution without creating duplicate backlog.
          </p>
        </div>

        {/* Radius Filter */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span>Search Radius:</span>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={2}>Within 2 km</option>
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
          </select>
        </div>
      </div>

      {/* Duplicate Cluster Info Card */}
      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs text-slate-700 flex items-start gap-3">
        <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-900">Why Corroboration Matters:</span>
          <p className="mt-0.5 leading-relaxed text-slate-600">
            Instead of filing 10 separate tickets for the same pothole or broken streetlight, clicking <strong>“I observed this too”</strong> links your vote to the open ticket and immediately escalates the municipal priority score.
          </p>
        </div>
      </div>

      {/* Nearby Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {issues.map((issue, idx) => {
          const priorityStyle = getPriorityColor(issue.priority);
          const statusStyle = getStatusColor(issue.status);
          const isCorroborated = corroboratedIds[issue.id];
          const distApprox = (0.3 + (idx * 0.4)).toFixed(1);

          return (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between"
              id={`nearby-issue-card-${issue.id}`}
            >
              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700">{issue.id}</span>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      📍 ~{distApprox} km away
                    </span>
                  </div>
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

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{issue.reportCount} {issue.reportCount === 1 ? 'Citizen Report' : 'Citizen Reports'}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCorroborate(e, issue)}
                  disabled={isCorroborated || issue.status === 'Resolved'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isCorroborated
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                  }`}
                  id={`corroborate-btn-${issue.id}`}
                >
                  {isCorroborated ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Supported</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>I observed this</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
