import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CitizenHome } from './components/CitizenHome';
import { ReportIssueWizard } from './components/ReportIssueWizard';
import { IssueDetailModal } from './components/IssueDetailModal';
import { LiveIssueMap } from './components/LiveIssueMap';
import { NearbyIssues } from './components/NearbyIssues';
import { MyComplaints } from './components/MyComplaints';
import { DepartmentDashboard } from './components/DepartmentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CivicIssue, Department, CivicNotification, User } from './types';
import { 
  fetchIssuesApi, 
  fetchDepartmentsApi, 
  fetchNotificationsApi, 
  markNotificationReadApi, 
  markAllNotificationsReadApi 
} from './services/api';
import { DEMO_USERS } from './data/mockData';
import { CheckCircle2, Building2, Heart } from 'lucide-react';

export function App() {
  // Current logged in user (Default to Citizen for smooth immediate test)
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  
  // App navigation state: 'home' | 'map' | 'nearby' | 'complaints' | 'department' | 'admin'
  const [activeTab, setActiveTab] = useState<string>('home');
  
  // Data State
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [notifications, setNotifications] = useState<CivicNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [isReportWizardOpen, setIsReportWizardOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(true);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);

  // Success Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load initial data from APIs
  const loadData = async () => {
    try {
      const [fetchedIssues, fetchedDepts, fetchedNotifs] = await Promise.all([
        fetchIssuesApi(),
        fetchDepartmentsApi(),
        fetchNotificationsApi(currentUser.id)
      ]);
      setIssues(fetchedIssues);
      setDepartments(fetchedDepts);
      setNotifications(fetchedNotifs);
    } catch (err) {
      console.error('Error fetching civic data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  // When changing role, adapt default view
  const handleRoleChange = (role: 'CITIZEN' | 'STAFF' | 'ADMIN') => {
    const foundUser = DEMO_USERS.find(u => u.role === role) || currentUser;
    setCurrentUser(foundUser);
    if (role === 'STAFF') {
      setActiveTab('department');
    } else if (role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
    showToast(`Switched active session to ${foundUser.name} (${role})`);
  };

  const handleIssueCreated = (newIssue: CivicIssue) => {
    setIssues(prev => [newIssue, ...prev]);
    setIsReportWizardOpen(false);
    setSelectedIssue(newIssue);
    showToast(`✓ Ticket #${newIssue.id} submitted & routed to ${newIssue.departmentName}!`);
    fetchNotificationsApi(currentUser.id).then(setNotifications);
  };

  const handleIssueUpdated = (updated: CivicIssue) => {
    setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));
    if (selectedIssue && selectedIssue.id === updated.id) {
      setSelectedIssue(updated);
    }
    showToast(`Ticket #${updated.id} status updated to ${updated.status}`);
    fetchNotificationsApi(currentUser.id).then(setNotifications);
  };

  const handleMarkNotificationRead = async (id: string) => {
    await markNotificationReadApi(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotificationsRead = async () => {
    await markAllNotificationsReadApi();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleSelectIssueById = (issueId: string) => {
    const found = issues.find(i => i.id === issueId);
    if (found) {
      setSelectedIssue(found);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        notifications={notifications}
        onNavigate={(tab) => {
          setIsReportWizardOpen(false);
          setActiveTab(tab);
        }}
        onOpenReportWizard={() => setIsReportWizardOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationsModalOpen(true)}
        onRoleChange={handleRoleChange}
      />

      {/* Main App Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-semibold text-slate-500 font-mono">
              Loading CivicFix Chennai Telemetry...
            </p>
          </div>
        ) : isReportWizardOpen ? (
          <ReportIssueWizard
            currentUser={currentUser}
            onCancel={() => setIsReportWizardOpen(false)}
            onSuccess={handleIssueCreated}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <CitizenHome
                currentUser={currentUser}
                issues={issues}
                onStartReport={() => setIsReportWizardOpen(true)}
                onNavigate={(tab) => setActiveTab(tab)}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
              />
            )}

            {activeTab === 'map' && (
              <LiveIssueMap
                issues={issues}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onStartReport={() => setIsReportWizardOpen(true)}
              />
            )}

            {activeTab === 'nearby' && (
              <NearbyIssues
                currentUser={currentUser}
                issues={issues}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onIssueUpdated={handleIssueUpdated}
                onStartReport={() => setIsReportWizardOpen(true)}
              />
            )}

            {activeTab === 'complaints' && (
              <MyComplaints
                currentUser={currentUser}
                issues={issues}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onStartReport={() => setIsReportWizardOpen(true)}
              />
            )}

            {activeTab === 'department' && (
              <DepartmentDashboard
                currentUser={currentUser}
                issues={issues}
                departments={departments}
                onIssueUpdated={handleIssueUpdated}
                onOpenIssueDetail={(issue) => setSelectedIssue(issue)}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard
                currentUser={currentUser}
                issues={issues}
                departments={departments}
                onIssueUpdated={handleIssueUpdated}
                onOpenIssueDetail={(issue) => setSelectedIssue(issue)}
              />
            )}
          </>
        )}
      </main>

      {/* Interactive Issue Details & Timeline Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        currentUser={currentUser}
        onClose={() => setSelectedIssue(null)}
        onIssueUpdated={handleIssueUpdated}
      />

      {/* Notifications Drawer/Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onSelectIssueId={handleSelectIssueById}
      />

      {/* Auth / Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'STAFF') setActiveTab('department');
          else if (user.role === 'ADMIN') setActiveTab('admin');
          else setActiveTab('home');
          showToast(`Welcome back, ${user.name}!`);
        }}
        departments={departments}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800">CivicFix</span>
            <span>—</span>
            <span className="italic">“See it. Report it. Fix it.”</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Chennai Municipal Corporation Initiative</span>
            <span>•</span>
            <span>Automated AI Dispatch & Triage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
