import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_ISSUES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SYSTEM_LOGS, 
  INITIAL_USERS 
} from './src/data/mockData';
import { CivicIssue, Department, User, CivicNotification, SystemLog, PriorityLevel, IssueStatus, IssueCategory } from './src/types';
import { classifyIssueRuleBased, calculateDistanceKm } from './src/utils/civicEngine';

dotenv.config();

// In-Memory Database Store
let issues: CivicIssue[] = [...INITIAL_ISSUES];
let departments: Department[] = [...INITIAL_DEPARTMENTS];
let users: User[] = [...INITIAL_USERS];
let notifications: CivicNotification[] = [...INITIAL_NOTIFICATIONS];
let systemLogs: SystemLog[] = [...INITIAL_SYSTEM_LOGS];

function addLog(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', service: string, message: string, details?: string) {
  const log: SystemLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    details
  };
  systemLogs.unshift(log);
  if (systemLogs.length > 200) systemLogs.pop();
}

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Could not initialize Gemini Client:', e);
    }
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // --- REST API ENDPOINTS ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CivicFix Engine',
      version: '1.0.0',
      database: 'MySQL Emulated Cluster (Active)',
      issuesCount: issues.length,
      timestamp: new Date().toISOString()
    });
  });

  // Source code zip download endpoint
  app.get('/api/download-zip', (req, res) => {
    try {
      const zipPath = path.resolve(process.cwd(), 'civicfix-app.zip');
      if (!fs.existsSync(zipPath)) {
        execSync('python3 scripts/generate_zip.py', { stdio: 'inherit' });
      }
      if (!fs.existsSync(zipPath)) {
        return res.status(500).json({ error: 'Zip generation failed on server' });
      }

      const stat = fs.statSync(zipPath);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="civicfix-app.zip"');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      const fileStream = fs.createReadStream(zipPath);
      fileStream.pipe(res);
    } catch (err: any) {
      console.error('Error serving zip:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream ZIP file: ' + err.message });
      }
    }
  });

  // Base64-encoded zip endpoint for guaranteed cross-origin/iframe download support
  app.get('/api/download-zip-data', (req, res) => {
    try {
      const zipPath = path.resolve(process.cwd(), 'civicfix-app.zip');
      if (!fs.existsSync(zipPath)) {
        execSync('python3 scripts/generate_zip.py', { stdio: 'inherit' });
      }
      const data = fs.readFileSync(zipPath);
      res.json({
        filename: 'civicfix-app.zip',
        size: data.length,
        base64: data.toString('base64'),
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to encode ZIP file: ' + err.message });
    }
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, role, departmentId } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required.' });
      }

      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }

      const assignedRole = role || 'CITIZEN';
      const dept = departments.find(d => d.id === departmentId);

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name,
        email,
        role: assignedRole,
        departmentId: assignedRole === 'STAFF' ? departmentId : undefined,
        departmentName: assignedRole === 'STAFF' && dept ? dept.name : undefined,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      addLog('SUCCESS', 'AuthService', `New ${assignedRole} registered: ${name} (${email})`);

      // Welcome notification
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: newUser.id,
        issueId: 'system',
        issueTitle: 'Welcome to CivicFix',
        message: `Welcome to CivicFix, ${name}! See it. Report it. Fix it.`,
        type: 'ALERT',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({ user: newUser, token: `cf-tok-${newUser.id}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }

      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials or user not found.' });
      }

      addLog('INFO', 'AuthService', `User logged in: ${user.name} [${user.role}]`);
      res.json({ user, token: `cf-tok-${user.id}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  // Departments
  app.get('/api/departments', (req, res) => {
    // dynamically sync counts
    const enriched = departments.map(d => {
      const active = issues.filter(i => i.departmentId === d.id && i.status !== 'Resolved').length;
      const resolved = issues.filter(i => i.departmentId === d.id && i.status === 'Resolved').length;
      return {
        ...d,
        activeIssuesCount: active,
        resolvedCount: resolved
      };
    });
    res.json(enriched);
  });

  app.post('/api/departments', (req, res) => {
    const { name, description, headName, contactEmail } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name,
      description: description || '',
      headName: headName || '',
      contactEmail: contactEmail || '',
      activeIssuesCount: 0,
      resolvedCount: 0
    };
    departments.push(newDept);
    addLog('INFO', 'DepartmentService', `Created department: ${name}`);
    res.status(201).json(newDept);
  });

  // Smart Analyze Issue (Rule-Based + optional Gemini AI integration)
  app.post('/api/issues/analyze', async (req, res) => {
    try {
      const { description, categoryHint, latitude, longitude } = req.body;
      if (!description && !categoryHint) {
        return res.status(400).json({ error: 'Description or category is required for analysis.' });
      }

      // 1. Initial rule-based baseline
      const ruleResult = classifyIssueRuleBased({
        description: description || '',
        categoryHint,
        latitude,
        longitude,
        existingIssues: issues
      });

      // 2. Check if Gemini AI is accessible to enrich analysis
      const ai = getGemini();
      if (ai && description && description.length > 8) {
        try {
          const prompt = `You are the civic intelligence classification system for CivicFix ("See it. Report it. Fix it.").
Analyze this citizen civic complaint:
Description: "${description}"
Location hint: ${latitude && longitude ? `Lat: ${latitude}, Lng: ${longitude}` : 'Chennai, India'}

Categorize into exactly one of these 6 categories:
1. "Road Damage" (Potholes, broken roads, damaged asphalt) -> Department: "Road Maintenance Department"
2. "Waste Management" (Garbage dumps, overflowing bins, uncollected waste) -> Department: "Sanitation Department"
3. "Street Lighting" (Dead streetlights, dark roads, broken lamp posts) -> Department: "Electrical Department"
4. "Water Supply" (Leaking pipes, broken mains, sewage overflow, contaminated water) -> Department: "Water Department"
5. "Tree Hazard" (Fallen trees, dangerous branches, blocked roads) -> Department: "Parks/Maintenance Department"
6. "Road Signage" (Damaged signs, bent stop signs, obscured signals) -> Department: "Traffic/Road Department"

Determine priority: "Low", "Medium", "High", or "Critical".
Consider severity, public health/safety, traffic congestion, and school/pedestrian risk.

Provide your output ONLY in valid JSON with these exact keys:
{
  "category": "Road Damage",
  "categoryDetail": "Road Damage (Pothole)",
  "priority": "High",
  "departmentName": "Road Maintenance Department",
  "departmentId": "dept-road",
  "reason": "Clear explanation of why this priority and department were chosen",
  "suggestedTitle": "Concise 4-8 word title for the complaint"
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            if (parsed.category && parsed.priority) {
              // Merge with duplicate awareness
              return res.json({
                ...parsed,
                isDuplicateNearby: ruleResult.isDuplicateNearby,
                nearbyMatchCount: ruleResult.nearbyMatchCount,
                nearbyIssueId: ruleResult.nearbyIssueId,
                detectedKeywords: ruleResult.detectedKeywords
              });
            }
          }
        } catch (aiErr) {
          console.log('Gemini classification fallback to rule engine:', aiErr);
        }
      }

      // Return reliable rule-based result
      res.json(ruleResult);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Analysis failed' });
    }
  });

  // Get Issues (with filtering)
  app.get('/api/issues', (req, res) => {
    const { category, priority, status, departmentId, userId, search } = req.query;
    let filtered = [...issues];

    if (category && category !== 'All') {
      filtered = filtered.filter(i => i.category === category);
    }
    if (priority && priority !== 'All') {
      filtered = filtered.filter(i => i.priority === priority);
    }
    if (status && status !== 'All') {
      filtered = filtered.filter(i => i.status === status);
    }
    if (departmentId && departmentId !== 'All') {
      filtered = filtered.filter(i => i.departmentId === departmentId);
    }
    if (userId) {
      filtered = filtered.filter(i => i.userId === userId);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(i => 
        i.id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.address.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(filtered);
  });

  // Get Nearby Issues
  app.get('/api/issues/nearby', (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat((req.query.radius as string) || '5');

    if (isNaN(lat) || isNaN(lng)) {
      // Default to Chennai Central coordinates
      return res.json(issues.slice(0, 10));
    }

    const nearby = issues
      .map(issue => {
        const dist = calculateDistanceKm(lat, lng, issue.latitude, issue.longitude);
        return { ...issue, distanceKm: Math.round(dist * 10) / 10 };
      })
      .filter(item => item.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(nearby);
  });

  // Get Issues by Category
  app.get('/api/issues/category/:category', (req, res) => {
    const cat = req.params.category;
    const filtered = issues.filter(i => i.category.toLowerCase() === cat.toLowerCase());
    res.json(filtered);
  });

  // Get Issue by ID
  app.get('/api/issues/:id', (req, res) => {
    const issue = issues.find(i => i.id.toLowerCase() === req.params.id.toLowerCase());
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  });

  // Post New Issue
  app.post('/api/issues', (req, res) => {
    try {
      const {
        userId,
        userName,
        userEmail,
        category,
        title,
        description,
        imageUrl,
        latitude,
        longitude,
        address,
        priority,
        priorityReason,
        departmentId
      } = req.body;

      if (!description || !address) {
        return res.status(400).json({ error: 'Description and address are required' });
      }

      // Check for spatial duplicate grouping
      const issueCategory = (category || 'Road Damage') as IssueCategory;
      const parsedLat = parseFloat(latitude) || 13.0827;
      const parsedLng = parseFloat(longitude) || 80.2707;

      const duplicateExisting = issues.find(ex => {
        if (ex.status === 'Resolved') return false;
        if (ex.category !== issueCategory) return false;
        const d = calculateDistanceKm(parsedLat, parsedLng, ex.latitude, ex.longitude);
        return d <= 0.35; // within 350 meters
      });

      if (duplicateExisting) {
        // Group into existing issue
        duplicateExisting.reportCount += 1;
        if (!duplicateExisting.duplicateReports) duplicateExisting.duplicateReports = [];
        duplicateExisting.duplicateReports.push({
          id: `dup-${Date.now()}`,
          userId: userId || 'anonymous',
          userName: userName || 'Citizen',
          reportedAt: new Date().toISOString(),
          note: description
        });

        // Recalculate / elevate priority
        if (duplicateExisting.reportCount >= 15 && duplicateExisting.priority !== 'Critical') {
          duplicateExisting.priority = 'Critical';
          duplicateExisting.priorityReason = `Elevated to Critical due to high volume of duplicate citizen reports (${duplicateExisting.reportCount} reports).`;
        } else if (duplicateExisting.reportCount >= 4 && duplicateExisting.priority === 'Low') {
          duplicateExisting.priority = 'High';
          duplicateExisting.priorityReason = `Elevated to High: Corroborated by ${duplicateExisting.reportCount} citizen reports.`;
        }

        duplicateExisting.updatedAt = new Date().toISOString();

        addLog('INFO', 'DuplicateClusterService', `Corroborated duplicate report for Issue #${duplicateExisting.id}. Total reports: ${duplicateExisting.reportCount}`);

        // Notify original reporter
        notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: duplicateExisting.userId,
          issueId: duplicateExisting.id,
          issueTitle: duplicateExisting.title,
          message: `Another citizen reported an issue near your complaint #${duplicateExisting.id}. Total reports: ${duplicateExisting.reportCount}. Priority: ${duplicateExisting.priority}.`,
          type: 'DUPLICATE',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        return res.status(200).json({
          groupedInto: duplicateExisting.id,
          issue: duplicateExisting,
          message: `Your report was linked to active nearby complaint #${duplicateExisting.id}. Community support count increased to ${duplicateExisting.reportCount}!`
        });
      }

      // Create new issue ID
      const nextNum = issues.length + 10025;
      const id = `CF${nextNum}`;

      // Resolve department
      const dept = departments.find(d => d.id === departmentId) || 
                   departments.find(d => d.name.toLowerCase().includes(issueCategory.toLowerCase())) ||
                   departments[0];

      const newIssue: CivicIssue = {
        id,
        userId: userId || 'usr-citizen-1',
        userName: userName || 'Karthik Subramanian',
        userEmail: userEmail || 'citizen@civicfix.gov.in',
        category: issueCategory,
        title: title || `${issueCategory} reported at ${address.split(',')[0]}`,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        latitude: parsedLat,
        longitude: parsedLng,
        address,
        priority: (priority || 'Medium') as PriorityLevel,
        priorityReason: priorityReason || 'Classified based on municipal urban defect analysis.',
        status: 'Reported',
        departmentId: dept.id,
        departmentName: dept.name,
        reportCount: 1,
        duplicateReports: [],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            status: 'Reported',
            timestamp: new Date().toISOString(),
            note: 'Complaint registered by citizen with location and photographic evidence.',
            actor: userName || 'Citizen',
            actorRole: 'CITIZEN'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      issues.unshift(newIssue);
      addLog('SUCCESS', 'IssueEngine', `Registered complaint #${id} [${issueCategory}] for ${dept.name}`);

      // Create notification for citizen
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: newIssue.userId,
        issueId: newIssue.id,
        issueTitle: newIssue.title,
        message: `Your complaint #${newIssue.id} has been registered and routed to ${dept.name}.`,
        type: 'ASSIGNMENT',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({ issue: newIssue, message: 'Complaint submitted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create issue' });
    }
  });

  // Upvote / Corroborate Issue (Citizen duplicate support)
  app.post('/api/issues/:id/duplicate', (req, res) => {
    const issue = issues.find(i => i.id.toLowerCase() === req.params.id.toLowerCase());
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const { userId, userName, note } = req.body;
    issue.reportCount += 1;
    if (!issue.duplicateReports) issue.duplicateReports = [];
    issue.duplicateReports.push({
      id: `dup-${Date.now()}`,
      userId: userId || 'anonymous',
      userName: userName || 'Citizen',
      reportedAt: new Date().toISOString(),
      note: note || 'Corroborated by nearby citizen.'
    });

    if (issue.reportCount >= 10 && issue.priority !== 'Critical') {
      issue.priority = 'Critical';
      issue.priorityReason = `Elevated to Critical: Corroborated by ${issue.reportCount} citizens.`;
    } else if (issue.reportCount >= 3 && issue.priority === 'Low') {
      issue.priority = 'High';
      issue.priorityReason = `Elevated to High: ${issue.reportCount} citizens corroborated impact.`;
    }

    issue.updatedAt = new Date().toISOString();

    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: issue.userId,
      issueId: issue.id,
      issueTitle: issue.title,
      message: `${userName || 'Another citizen'} corroborated your complaint #${issue.id}. Total citizen reports: ${issue.reportCount}.`,
      type: 'DUPLICATE',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    addLog('INFO', 'IssueEngine', `Citizen corroborated Issue #${issue.id}. Count now: ${issue.reportCount}`);
    res.json(issue);
  });

  // Update Issue Status (by Department Staff or Admin)
  app.put('/api/issues/:id/status', (req, res) => {
    try {
      const issue = issues.find(i => i.id.toLowerCase() === req.params.id.toLowerCase());
      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      const { status, note, actor, actorRole, resolutionProof, resolutionNotes, departmentId } = req.body;

      if (departmentId && departmentId !== issue.departmentId) {
        const dept = departments.find(d => d.id === departmentId);
        if (dept) {
          issue.departmentId = dept.id;
          issue.departmentName = dept.name;
          issue.timeline.push({
            id: `tl-${Date.now()}`,
            status: issue.status,
            timestamp: new Date().toISOString(),
            note: `Department reassigned to ${dept.name}`,
            actor: actor || 'Civic Administrator',
            actorRole: actorRole || 'ADMIN'
          });
        }
      }

      if (status) {
        issue.status = status as IssueStatus;
        if (status === 'Resolved') {
          issue.resolvedAt = new Date().toISOString();
          if (resolutionProof) issue.resolutionProof = resolutionProof;
          if (resolutionNotes) issue.resolutionNotes = resolutionNotes;
        }

        issue.timeline.push({
          id: `tl-${Date.now()}`,
          status: status as IssueStatus,
          timestamp: new Date().toISOString(),
          note: note || `Status updated to ${status}. ${resolutionNotes || ''}`.trim(),
          actor: actor || 'Municipal Staff',
          actorRole: actorRole || 'STAFF'
        });

        // Notify citizen
        let msg = `Your complaint #${issue.id} status changed to ${status}.`;
        if (status === 'Assigned') {
          msg = `Your complaint #${issue.id} has been assigned to ${issue.departmentName}.`;
        } else if (status === 'In Progress') {
          msg = `Work has begun on your complaint #${issue.id} by ${issue.departmentName}.`;
        } else if (status === 'Resolved') {
          msg = `Your complaint #${issue.id} has been resolved! Resolution proof and notes are available in your portal.`;
        }

        notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: issue.userId,
          issueId: issue.id,
          issueTitle: issue.title,
          message: msg,
          type: status === 'Resolved' ? 'RESOLVED' : 'STATUS_CHANGE',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        addLog('SUCCESS', 'StatusWorkflow', `Issue #${issue.id} transition to ${status} by ${actor || 'Staff'}`);
      }

      issue.updatedAt = new Date().toISOString();
      res.json(issue);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Update failed' });
    }
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    const userId = req.query.userId as string;
    let filtered = notifications;
    if (userId) {
      filtered = notifications.filter(n => n.userId === userId || n.userId === 'system');
    }
    res.json(filtered);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const notif = notifications.find(n => n.id === req.params.id);
    if (notif) notif.isRead = true;
    res.json({ success: true });
  });

  app.put('/api/notifications/read-all', (req, res) => {
    const userId = req.query.userId as string;
    notifications.forEach(n => {
      if (!userId || n.userId === userId) {
        n.isRead = true;
      }
    });
    res.json({ success: true });
  });

  // Admin: Dashboard Stats
  app.get('/api/admin/dashboard', (req, res) => {
    const total = issues.length;
    const pending = issues.filter(i => i.status === 'Reported').length;
    const assigned = issues.filter(i => i.status === 'Assigned').length;
    const inProgress = issues.filter(i => i.status === 'In Progress').length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const critical = issues.filter(i => i.priority === 'Critical').length;

    const categoryCounts: Record<string, number> = {};
    issues.forEach(i => {
      categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
    });

    res.json({
      totalIssues: total,
      pending: pending + assigned,
      inProgress,
      resolved,
      critical,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      categoryCounts,
      recentIssues: issues.slice(0, 6)
    });
  });

  // Admin: Analytics
  app.get('/api/admin/analytics', (req, res) => {
    const categoryCounts: Record<string, number> = {};
    issues.forEach(i => {
      categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
    });

    const deptPerformance = departments.map(d => {
      const deptIssues = issues.filter(i => i.departmentId === d.id);
      const resCount = deptIssues.filter(i => i.status === 'Resolved').length;
      return {
        department: d.name,
        assigned: deptIssues.length,
        resolved: resCount,
        avgResolutionHours: 28.5 + (d.name.length % 7) * 4
      };
    });

    const monthlyTrend = [
      { month: 'Apr', reported: 45, resolved: 38 },
      { month: 'May', reported: 62, resolved: 54 },
      { month: 'Jun', reported: 88, resolved: 76 },
      { month: 'Jul', reported: 110, resolved: 98 },
      { month: 'Aug', reported: 135, resolved: 115 },
      { month: 'Sep', reported: issues.length + 42, resolved: 18 }
    ];

    res.json({
      categoryCounts,
      deptPerformance,
      monthlyTrend,
      topLocation: 'Anna Nagar / Central Corridor',
      topCategory: 'Road Damage (Potholes)',
      avgResolutionTimeDays: 2.4
    });
  });

  // Admin: Logs
  app.get('/api/admin/logs', (req, res) => {
    res.json(systemLogs);
  });

  // Users listing (for Admin)
  app.get('/api/users', (req, res) => {
    res.json(users);
  });

  // --- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicFix backend and UI running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
