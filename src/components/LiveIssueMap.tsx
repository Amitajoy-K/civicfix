import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Filter, 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Flame, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Eye
} from 'lucide-react';
import { CivicIssue, IssueCategory, PriorityLevel, IssueStatus } from '../types';
import { getPriorityColor, getStatusColor } from '../utils/civicEngine';

interface LiveIssueMapProps {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  onStartReport: () => void;
}

export const LiveIssueMap: React.FC<LiveIssueMapProps> = ({
  issues,
  onSelectIssue,
  onStartReport
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeIssue, setActiveIssue] = useState<CivicIssue | null>(issues[0] || null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (selectedCategory !== 'All' && issue.category !== selectedCategory) return false;
      if (selectedPriority !== 'All' && issue.priority !== selectedPriority) return false;
      if (selectedStatus !== 'All' && issue.status !== selectedStatus) return false;
      return true;
    });
  }, [issues, selectedCategory, selectedPriority, selectedStatus]);

  // Chennai Map Bounding Box for SVG Coordinate Projection
  // Chennai Lat bounds roughly ~12.95 to 13.15, Lng bounds ~80.18 to 80.29
  const minLat = 12.95;
  const maxLat = 13.12;
  const minLng = 80.18;
  const maxLng = 80.30;

  const projectToMap = (lat: number, lng: number) => {
    // Normalizing between 0 and 100%
    const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
    // Invert Y because SVG/screen coordinates grow downward
    const y = ((maxLat - lat) / (maxLat - minLat)) * 80 + 10;
    return {
      left: `${Math.max(8, Math.min(92, x))}%`,
      top: `${Math.max(8, Math.min(92, y))}%`
    };
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Map Header & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-display">Live Civic Issue Map</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {filteredIssues.length} Pins Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time geospatial visualization of reported urban defects across Chennai
            </p>
          </div>

          {/* Priority Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Priority:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200" />
              <span className="text-slate-700 font-medium">Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200" />
              <span className="text-slate-700 font-medium">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-yellow-200" />
              <span className="text-slate-700 font-medium">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              <span className="text-slate-700 font-medium">Low</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
              id="map-filter-category"
            >
              <option value="All">All Categories</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Street Lighting">Street Lighting</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Tree Hazard">Tree Hazard</option>
              <option value="Road Signage">Road Signage</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
              id="map-filter-priority"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
              id="map-filter-status"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map Canvas and Active Issue Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Vector GIS Canvas */}
        <div className="lg:col-span-2 relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md min-h-[460px] sm:min-h-[520px] select-none">
          {/* Custom Stylized Chennai Street Grid Background */}
          <div className="absolute inset-0 opacity-40">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.75" />
                </pattern>
                <linearGradient id="bayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Bay of Bengal Coastline representation on East (Right) */}
              <path d="M 85% 0 Q 82% 30%, 88% 60% T 92% 100% L 100% 100% L 100% 0 Z" fill="url(#bayGradient)" opacity="0.6" />
              {/* Arterial Corridors (Anna Salai, Poonamallee High Rd, OMR, ECR, 100ft Rd) */}
              <path d="M 10% 40% Q 45% 48%, 85% 35%" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.4" />
              <path d="M 30% 10% Q 55% 50%, 85% 80%" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.4" />
              <path d="M 50% 10% L 50% 90%" stroke="#475569" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
              <path d="M 15% 70% Q 50% 70%, 88% 90%" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.3" />
            </svg>
          </div>

          {/* City Locality Watermark Labels */}
          <div className="absolute top-10 left-12 text-slate-500 font-bold text-xs tracking-widest uppercase pointer-events-none opacity-60">
            Anna Nagar West
          </div>
          <div className="absolute top-1/3 left-1/4 text-slate-500 font-bold text-xs tracking-widest uppercase pointer-events-none opacity-60">
            Central / Kilpauk
          </div>
          <div className="absolute top-1/2 left-1/3 text-slate-500 font-bold text-xs tracking-widest uppercase pointer-events-none opacity-60">
            T. Nagar Commercial
          </div>
          <div className="absolute top-2/3 left-1/2 text-slate-500 font-bold text-xs tracking-widest uppercase pointer-events-none opacity-60">
            Mylapore / Adyar
          </div>
          <div className="absolute bottom-16 left-1/3 text-slate-500 font-bold text-xs tracking-widest uppercase pointer-events-none opacity-60">
            Velachery Corridor
          </div>
          <div className="absolute top-1/2 right-6 text-blue-300/40 font-bold text-xs tracking-widest uppercase pointer-events-none rotate-90">
            Bay of Bengal
          </div>

          {/* Interactive Issue Markers */}
          {filteredIssues.map((issue) => {
            const pos = projectToMap(issue.latitude, issue.longitude);
            const isSelected = activeIssue?.id === issue.id;
            const priorityColor = getPriorityColor(issue.priority);

            return (
              <div
                key={issue.id}
                style={{ left: pos.left, top: pos.top }}
                onClick={() => setActiveIssue(issue)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20 group"
                id={`map-marker-${issue.id}`}
              >
                {/* Pulsing Aura for Critical Issues */}
                {issue.priority === 'Critical' && (
                  <span className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping" />
                )}

                {/* Marker Pin */}
                <div className={`relative flex items-center justify-center transition-transform ${
                  isSelected ? 'scale-125 z-30' : 'group-hover:scale-110'
                }`}>
                  <div 
                    className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white"
                    style={{ backgroundColor: priorityColor.pin }}
                  >
                    <MapPin className="w-4 h-4 fill-white" />
                  </div>

                  {issue.reportCount > 1 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                      {issue.reportCount}
                    </div>
                  )}
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap z-40 pointer-events-none border border-slate-700">
                  <div className="font-bold">{issue.id}: {issue.category}</div>
                  <div className="text-slate-400 text-[10px]">{issue.address.split(',')[0]}</div>
                </div>
              </div>
            );
          })}

          {/* Floating Map Zoom / Reset Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-30">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
              className="w-8 h-8 bg-slate-800/90 text-white hover:bg-slate-700 rounded-lg flex items-center justify-center backdrop-blur-xs border border-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
              className="w-8 h-8 bg-slate-800/90 text-white hover:bg-slate-700 rounded-lg flex items-center justify-center backdrop-blur-xs border border-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* GIS Coordinates Badge */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Chennai GIS: 13.0827° N, 80.2707° E</span>
          </div>
        </div>

        {/* Selected Issue Inspector Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          {activeIssue ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                  {activeIssue.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(activeIssue.status).bg} ${getStatusColor(activeIssue.status).text} ${getStatusColor(activeIssue.status).border}`}>
                  {activeIssue.status}
                </span>
              </div>

              {/* Photo Thumbnail */}
              <div className="relative rounded-xl overflow-hidden aspect-16/9 bg-slate-100 border border-slate-200">
                <img
                  src={activeIssue.imageUrl}
                  alt={activeIssue.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityColor(activeIssue.priority).badge}`}>
                    {activeIssue.priority} Priority
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {activeIssue.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{activeIssue.address}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Department</span>
                  <span className="font-semibold text-slate-800 text-[11px] truncate block mt-0.5">
                    {activeIssue.departmentName}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Reports</span>
                  <span className="font-semibold text-slate-800 text-[11px] block mt-0.5">
                    {activeIssue.reportCount} {activeIssue.reportCount === 1 ? 'Citizen' : 'Citizens'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {activeIssue.description}
              </p>

              <button
                onClick={() => onSelectIssue(activeIssue)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                id="map-view-details-btn"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Issue & Timeline</span>
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-medium">Click any marker pin on the map to inspect defect details.</p>
            </div>
          )}

          {/* Quick Citizen CTA */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={onStartReport}
              className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>+ Report an Issue at Your Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
