/// <reference types="vite/client" />
import { 
  CivicIssue, 
  Department, 
  User, 
  CivicNotification, 
  SystemLog, 
  AnalysisResult 
} from '../types';

const API_BASE =
import.meta.env.VITE_API_BASE_URL || '';

export async function loginApi(email: string, password?: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }
  return res.json();
}

export async function registerApi(data: {
  name: string;
  email: string;
  password?: string;
  role: 'CITIZEN' | 'STAFF' | 'ADMIN';
  departmentId?: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE}/api/departments`);
  if (!res.ok) throw new Error('Failed to load departments');
  return res.json();
}

export async function createDepartmentApi(dept: Partial<Department>): Promise<Department> {
  const res = await fetch(`${API_BASE}/api/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dept)
  });
  if (!res.ok) throw new Error('Failed to create department');
  return res.json();
}

export async function analyzeIssueApi(payload: {
  description: string;
  categoryHint?: string;
  latitude?: number;
  longitude?: number;
}): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/issues/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to analyze issue');
  return res.json();
}

export async function fetchIssues(params?: {
  category?: string;
  priority?: string;
  status?: string;
  departmentId?: string;
  userId?: string;
  search?: string;
}): Promise<CivicIssue[]> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.set(k, v);
    });
  }
  const res = await fetch(`${API_BASE}/api/issues?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
}

export async function fetchIssueById(id: string): Promise<CivicIssue> {
  const res = await fetch(`${API_BASE}/api/issues/${id}`);
  if (!res.ok) throw new Error('Failed to fetch issue details');
  return res.json();
}

export async function createIssueApi(data: Partial<CivicIssue>): Promise<{ issue: CivicIssue; message: string; groupedInto?: string }> {
  const res = await fetch(`${API_BASE}/api/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit complaint');
  }
  return res.json();
}

export async function corroborateIssueApi(id: string, data: { userId: string; userName: string; note?: string }): Promise<CivicIssue> {
  const res = await fetch(`${API_BASE}/api/issues/${id}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to corroborate issue');
  return res.json();
}

export async function updateIssueStatusApi(
  id: string, 
  data: {
    status?: string;
    note?: string;
    actor?: string;
    actorRole?: string;
    resolutionNotes?: string;
    resolutionProof?: string;
    departmentId?: string;
  }
): Promise<CivicIssue> {
  const res = await fetch(`${API_BASE}/api/issues/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function fetchNearbyIssues(lat?: number, lng?: number, radiusKm: number = 5): Promise<(CivicIssue & { distanceKm?: number })[]> {
  const url = lat && lng 
    ? `${API_BASE}/api/issues/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`
    : `${API_BASE}/api/issues/nearby?radius=${radiusKm}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch nearby issues');
  return res.json();
}

export async function fetchNotifications(userId?: string): Promise<CivicNotification[]> {
  const url = userId ? `${API_BASE}/api/notifications?userId=${userId}` : `${API_BASE}/api/notifications`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationReadApi(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsReadApi(userId?: string): Promise<void> {
  const query = userId ? `?userId=${userId}` : '';
  await fetch(`${API_BASE}/api/notifications/read-all${query}`, { method: 'PUT' });
}

export async function fetchAdminDashboard(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
}

export async function fetchAdminAnalytics(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchSystemLogs(): Promise<SystemLog[]> {
  const res = await fetch(`${API_BASE}/api/admin/logs`);
  if (!res.ok) throw new Error('Failed to fetch system logs');
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/api/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

// Convenient Aliases for Front-End Components
export const fetchIssuesApi = fetchIssues;
export const fetchDepartmentsApi = fetchDepartments;
export const fetchNotificationsApi = fetchNotifications;

export async function updateIssueDepartmentApi(
  id: string,
  departmentId: string,
  actor: string = 'Municipal Administrator'
): Promise<CivicIssue> {
  return updateIssueStatusApi(id, {
    departmentId,
    note: `Re-routed ticket department to ${departmentId}`,
    actor,
    actorRole: 'ADMIN'
  });
}

