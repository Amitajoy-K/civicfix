export type UserRole = 'CITIZEN' | 'STAFF' | 'ADMIN';

export type IssueCategory = 
  | 'Road Damage' 
  | 'Waste Management' 
  | 'Street Lighting' 
  | 'Water Supply' 
  | 'Tree Hazard' 
  | 'Road Signage';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueStatus = 'Reported' | 'Assigned' | 'In Progress' | 'Resolved';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headName?: string;
  contactEmail?: string;
  activeIssuesCount?: number;
  resolvedCount?: number;
}

export interface TimelineEvent {
  id: string;
  status: IssueStatus;
  timestamp: string;
  note: string;
  actor: string;
  actorRole: UserRole;
}

export interface DuplicateReport {
  id: string;
  userId: string;
  userName: string;
  reportedAt: string;
  note?: string;
}

export interface CivicIssue {
  id: string; // e.g., CF10024
  userId: string;
  userName: string;
  userEmail?: string;
  category: IssueCategory;
  title: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  address: string;
  priority: PriorityLevel;
  priorityReason: string;
  status: IssueStatus;
  departmentId: string;
  departmentName: string;
  reportCount: number;
  duplicateReports?: DuplicateReport[];
  timeline: TimelineEvent[];
  resolutionNotes?: string;
  resolutionProof?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CivicNotification {
  id: string;
  userId: string;
  issueId: string;
  issueTitle?: string;
  message: string;
  type: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'DUPLICATE' | 'RESOLVED' | 'ALERT';
  isRead: boolean;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  service: string;
  message: string;
  details?: string;
}

export interface AnalysisResult {
  category: IssueCategory;
  categoryDetail: string;
  priority: PriorityLevel;
  departmentId: string;
  departmentName: string;
  reason: string;
  detectedKeywords?: string[];
  suggestedTitle: string;
  isDuplicateNearby?: boolean;
  nearbyMatchCount?: number;
  nearbyIssueId?: string;
}

export interface DashboardStats {
  totalIssues: number;
  pending: number;
  inProgress: number;
  resolved: number;
  critical: number;
  categoryCounts: Record<string, number>;
  departmentPerformance: Array<{
    department: string;
    assigned: number;
    resolved: number;
    avgResolutionHours: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    reported: number;
    resolved: number;
  }>;
}
