import React from 'react';
import { 
  Camera, 
  FileText, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { CivicIssue, User } from '../types';
import { getPriorityColor, getStatusColor } from '../utils/civicEngine';

interface CitizenHomeProps {
  currentUser: User;
  issues: CivicIssue[];
  onStartReport: () => void;
  onNavigate: (tab: string) => void;
  onSelectIssue: (issue: CivicIssue) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  currentUser,
  issues,
  onStartReport,
  onNavigate,
  onSelectIssue
}) => {
  // Statistics for this citizen or city-wide
  const userIssues = issues.filter(i => i.userId === currentUser.id);
  const relevantIssues = userIssues.length > 0 ? userIssues : issues;

  const reportedCount = relevantIssues.filter(i => i.status === 'Reported').length;
  const inProgressCount = relevantIssues.filter(i => i.status === 'In Progress' || i.status === 'Assigned').length;
  const resolvedCount = relevantIssues.filter(i => i.status === 'Resolved').length;

  // Recent 4 reports
  const recentReports = [...issues].slice(0, 4);

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-400/30">
            <span>Chennai Municipal Zone</span>
            <span>•</span>
            <span>Live Civic Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Hello, {currentUser.name} 👋
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            “Let's make our city a better place.” Report civic hazards in seconds, track real-time repairs, and corroborate nearby community issues.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98]"
              id="citizen-hero-report-btn"
            >
              <Camera className="w-4 h-4" />
              <span>Report an Issue</span>
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl backdrop-blur-xs transition-all"
              id="citizen-hero-map-btn"
            >
              <MapPin className="w-4 h-4 text-blue-300" />
              <span>Explore Live Map</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative vector mesh */}
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none translate-x-12 translate-y-6">
          <svg width="340" height="240" viewBox="0 0 340 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="120" r="110" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="200" cy="120" r="60" stroke="white" strokeWidth="2" />
            <path d="M90 120H310" stroke="white" strokeWidth="1.5" />
            <path d="M200 10V230" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Main Action Cards (4 Cards) */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Report an Issue */}
          <button
            onClick={onStartReport}
            className="flex flex-col text-left p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all group focus:outline-none"
            id="action-card-report"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Camera className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-900 text-sm sm:text-base">Report an Issue</span>
            <span className="text-xs text-slate-500 mt-1">Photo, location & AI-assisted routing</span>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>Start</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 2: My Complaints */}
          <button
            onClick={() => onNavigate('complaints')}
            className="flex flex-col text-left p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all group focus:outline-none"
            id="action-card-complaints"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-900 text-sm sm:text-base">My Complaints</span>
            <span className="text-xs text-slate-500 mt-1">Track status & view verified fixes</span>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              <span>Track ({userIssues.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 3: Live Map */}
          <button
            onClick={() => onNavigate('map')}
            className="flex flex-col text-left p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all group focus:outline-none"
            id="action-card-map"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-900 text-sm sm:text-base">Live Map</span>
            <span className="text-xs text-slate-500 mt-1">Interactive city GIS marker grid</span>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-sky-600 group-hover:translate-x-0.5 transition-transform">
              <span>View Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 4: Nearby Issues */}
          <button
            onClick={() => onNavigate('nearby')}
            className="flex flex-col text-left p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all group focus:outline-none"
            id="action-card-nearby"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-900 text-sm sm:text-base">Nearby Issues</span>
            <span className="text-xs text-slate-500 mt-1">Corroborate community reports</span>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:translate-x-0.5 transition-transform">
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Resolution Overview
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-slate-500">Reported</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-display">{reportedCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting inspection</p>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-slate-500">In Progress</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2 font-display">{inProgressCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Crews deployed</p>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-slate-500">Resolved</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 font-display">{resolvedCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">With photo proof</p>
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Recent Reports</h2>
            <p className="text-xs text-slate-500">Live civic defect logs and active repair statuses</p>
          </div>
          <button
            onClick={() => onNavigate('complaints')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            id="view-all-complaints-btn"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentReports.map((report) => {
            const priorityStyle = getPriorityColor(report.priority);
            const statusStyle = getStatusColor(report.status);

            return (
              <div
                key={report.id}
                onClick={() => onSelectIssue(report)}
                className="group flex gap-3.5 p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                id={`report-card-${report.id}`}
              >
                {/* Small Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {report.reportCount > 1 && (
                    <div className="absolute top-1 left-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 text-amber-400" />
                      <span>{report.reportCount}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                        {report.id}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        {report.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{report.address}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2 text-[11px]">
                    <span className="text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-medium text-[10px] border ${priorityStyle.badge}`}>
                      {report.priority}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
