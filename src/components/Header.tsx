import React, { useState } from 'react';
import { 
  Building2, 
  Bell, 
  MapPin, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Wrench, 
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User, CivicNotification } from '../types';

interface HeaderProps {
  currentUser: User;
  onSelectRole: (role: 'CITIZEN' | 'STAFF' | 'ADMIN') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onStartReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectRole,
  onOpenAuth,
  onLogout,
  onOpenNotifications,
  unreadNotificationCount,
  activeTab,
  onNavigate,
  onStartReport
}) => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDownloadZip = async () => {
    if (downloadStatus === 'loading') return;
    setDownloadStatus('loading');
    setErrorMessage('');

    try {
      let blob: Blob | null = null;

      // Primary Attempt: Direct binary stream from /api/download-zip
      try {
        const res = await fetch('/api/download-zip', { cache: 'no-store' });
        if (res.ok) {
          const streamBlob = await res.blob();
          if (streamBlob.size > 20000) {
            const buffer = await streamBlob.slice(0, 4).arrayBuffer();
            const bytes = new Uint8Array(buffer);
            // Verify ZIP magic bytes 'PK' (0x50, 0x4B)
            if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
              blob = streamBlob;
            }
          }
        }
      } catch (streamErr) {
        console.warn('Direct stream fetch failed, trying base64 fallback:', streamErr);
      }

      // Secondary Attempt: If stream was truncated or intercepted, fetch base64 data
      if (!blob) {
        const dataRes = await fetch('/api/download-zip-data', { cache: 'no-store' });
        if (!dataRes.ok) {
          throw new Error(`Server returned HTTP ${dataRes.status} when generating ZIP archive`);
        }
        const dataJson = await dataRes.json();
        if (!dataJson.base64) {
          throw new Error('Received empty payload from ZIP generator');
        }

        const binaryStr = atob(dataJson.base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: 'application/zip' });
      }

      // Trigger browser download via object URL
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'civicfix-app.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);

      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Download ZIP error:', err);
      setDownloadStatus('error');
      setErrorMessage(err?.message || 'Download failed');
      setTimeout(() => setDownloadStatus('idle'), 5000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              id="brand-logo-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-600 transition-colors">
                <Building2 className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-display">CivicFix</span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                    Smart City
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium tracking-wide">See it. Report it. Fix it.</p>
              </div>
            </button>

            {/* Desktop Navigation Links for Citizens */}
            {currentUser.role === 'CITIZEN' && (
              <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
                <button
                  onClick={() => onNavigate('home')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'home' 
                      ? 'bg-slate-100 text-slate-900 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id="nav-citizen-home"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('complaints')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'complaints' 
                      ? 'bg-slate-100 text-slate-900 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id="nav-citizen-complaints"
                >
                  My Complaints
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'map' 
                      ? 'bg-slate-100 text-slate-900 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id="nav-citizen-map"
                >
                  Live Map
                </button>
                <button
                  onClick={() => onNavigate('nearby')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'nearby' 
                      ? 'bg-slate-100 text-slate-900 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id="nav-citizen-nearby"
                >
                  Nearby Issues
                </button>
              </nav>
            )}
          </div>

          {/* Right Actions: Quick Role Switcher + Report Button + Notifications + Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Quick Demo Role Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 text-xs">
              <span className="px-2 font-medium text-slate-500 uppercase text-[10px] tracking-wider">Demo Role:</span>
              <button
                onClick={() => onSelectRole('CITIZEN')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentUser.role === 'CITIZEN'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Citizen view"
                id="role-switch-citizen"
              >
                Citizen
              </button>
              <button
                onClick={() => onSelectRole('STAFF')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentUser.role === 'STAFF'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Department Staff view"
                id="role-switch-staff"
              >
                Staff
              </button>
              <button
                onClick={() => onSelectRole('ADMIN')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Administrator view"
                id="role-switch-admin"
              >
                Admin
              </button>
            </div>

            {/* Citizen "Report Issue" CTA */}
            {currentUser.role === 'CITIZEN' && (
              <button
                onClick={onStartReport}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-[0.98]"
                id="header-report-btn"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Report Issue</span>
              </button>
            )}

            {/* Download App Bundle (.ZIP) for Deployment */}
            <button
              onClick={handleDownloadZip}
              disabled={downloadStatus === 'loading'}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs border ${
                downloadStatus === 'loading'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 cursor-wait'
                  : downloadStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : downloadStatus === 'error'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/90 active:scale-[0.98]'
              }`}
              title={errorMessage || "Download full Windows/Mac/Linux project zip with Docker & deployment configs"}
              id="header-download-zip-btn"
            >
              {downloadStatus === 'loading' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span className="hidden sm:inline">Packaging ZIP...</span>
                </>
              ) : downloadStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Downloaded!</span>
                </>
              ) : downloadStatus === 'error' ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Retry ZIP</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Export ZIP</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifications"
              id="header-notifications-btn"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-white">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* User Profile Badge & Quick Menu */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
                <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500">
                  {currentUser.role === 'ADMIN' && <ShieldCheck className="w-3 h-3 text-slate-700" />}
                  {currentUser.role === 'STAFF' && <Wrench className="w-3 h-3 text-blue-600" />}
                  <span>{currentUser.role === 'STAFF' ? (currentUser.departmentName || 'Staff') : currentUser.role}</span>
                </div>
              </div>
              <button
                onClick={onOpenAuth}
                className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                title="Account / Switch Account"
                id="header-user-avatar"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
