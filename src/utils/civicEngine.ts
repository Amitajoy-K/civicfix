import { AnalysisResult, CivicIssue, IssueCategory, PriorityLevel } from '../types';

export interface ClassifyInput {
  description: string;
  categoryHint?: string;
  latitude?: number;
  longitude?: number;
  existingIssues?: CivicIssue[];
}

export function classifyIssueRuleBased(input: ClassifyInput): AnalysisResult {
  const text = (input.description || '').toLowerCase();
  const hint = input.categoryHint;

  let category: IssueCategory = 'Road Damage';
  let categoryDetail = 'General Road Surface Defect';
  let departmentId = 'dept-road';
  let departmentName = 'Road Maintenance Department';
  let detectedKeywords: string[] = [];

  // 1. Waste Management keywords
  const wasteKeywords = ['garbage', 'trash', 'waste', 'dumpster', 'bin', 'litter', 'rubbish', 'rotting', 'debris', 'solid waste', 'stench', 'spill'];
  // 2. Street Lighting keywords
  const lightKeywords = ['streetlight', 'street light', 'lamp', 'dark', 'bulb', 'lighting', 'illumination', 'blackout', 'pole wire', 'flickering'];
  // 3. Water Supply keywords
  const waterKeywords = ['water leakage', 'water leak', 'pipeline', 'pipe burst', 'sewage', 'drain', 'manhole', 'drinking water', 'leaking pipe', 'tap', 'flooding water'];
  // 4. Tree Hazard keywords
  const treeKeywords = ['tree', 'branch', 'fallen tree', 'bough', 'trunk', 'overgrown', 'leaves blocking', 'wood', 'uprooted'];
  // 5. Road Signage keywords
  const signKeywords = ['sign', 'signboard', 'traffic sign', 'stop sign', 'speed limit', 'signal board', 'zebra crossing', 'board bent', 'direction sign'];
  // 6. Road Damage keywords
  const roadKeywords = ['pothole', 'road damage', 'crater', 'asphalt', 'tar', 'road crack', 'pavement', 'trench', 'uneven road', 'cobblestone', 'ditch'];

  const matches = (keywords: string[]) => keywords.filter(kw => text.includes(kw));

  const wasteMatches = matches(wasteKeywords);
  const lightMatches = matches(lightKeywords);
  const waterMatches = matches(waterKeywords);
  const treeMatches = matches(treeKeywords);
  const signMatches = matches(signKeywords);
  const roadMatches = matches(roadKeywords);

  if (hint && isValidCategory(hint)) {
    category = hint as IssueCategory;
  } else {
    // Score based on count of matching tokens
    const scores = [
      { cat: 'Waste Management' as IssueCategory, count: wasteMatches.length, matches: wasteMatches, deptId: 'dept-sanitation', deptName: 'Sanitation Department' },
      { cat: 'Street Lighting' as IssueCategory, count: lightMatches.length, matches: lightMatches, deptId: 'dept-electrical', deptName: 'Electrical Department' },
      { cat: 'Water Supply' as IssueCategory, count: waterMatches.length, matches: waterMatches, deptId: 'dept-water', deptName: 'Water Department' },
      { cat: 'Tree Hazard' as IssueCategory, count: treeMatches.length, matches: treeMatches, deptId: 'dept-parks', deptName: 'Parks/Maintenance Department' },
      { cat: 'Road Signage' as IssueCategory, count: signMatches.length, matches: signMatches, deptId: 'dept-traffic', deptName: 'Traffic/Road Department' },
      { cat: 'Road Damage' as IssueCategory, count: roadMatches.length, matches: roadMatches, deptId: 'dept-road', deptName: 'Road Maintenance Department' },
    ];

    scores.sort((a, b) => b.count - a.count);
    if (scores[0].count > 0) {
      category = scores[0].cat;
      departmentId = scores[0].deptId;
      departmentName = scores[0].deptName;
      detectedKeywords = scores[0].matches;
    }
  }

  // Set category detail & mapped department
  switch (category) {
    case 'Road Damage':
      categoryDetail = text.includes('pothole') ? 'Road Damage (Pothole)' : 'Road Damage (Surface Defect)';
      departmentId = 'dept-road';
      departmentName = 'Road Maintenance Department';
      break;
    case 'Waste Management':
      categoryDetail = 'Waste Management (Garbage Overflow)';
      departmentId = 'dept-sanitation';
      departmentName = 'Sanitation Department';
      break;
    case 'Street Lighting':
      categoryDetail = 'Street Lighting (Darkness/Faulty Pole)';
      departmentId = 'dept-electrical';
      departmentName = 'Electrical Department';
      break;
    case 'Water Supply':
      categoryDetail = 'Water Supply (Pipeline Leakage)';
      departmentId = 'dept-water';
      departmentName = 'Water Department';
      break;
    case 'Tree Hazard':
      categoryDetail = 'Tree Hazard (Obstruction/Fallen Timber)';
      departmentId = 'dept-parks';
      departmentName = 'Parks/Maintenance Department';
      break;
    case 'Road Signage':
      categoryDetail = 'Road Signage (Damaged/Obscured Marker)';
      departmentId = 'dept-traffic';
      departmentName = 'Traffic/Road Department';
      break;
  }

  // Spatial duplicate detection
  let isDuplicateNearby = false;
  let nearbyMatchCount = 0;
  let nearbyIssueId: string | undefined = undefined;

  if (input.latitude && input.longitude && input.existingIssues && input.existingIssues.length > 0) {
    for (const ex of input.existingIssues) {
      if (ex.status !== 'Resolved' && ex.category === category) {
        const distKm = calculateDistanceKm(input.latitude, input.longitude, ex.latitude, ex.longitude);
        // within ~350 meters
        if (distKm <= 0.35) {
          isDuplicateNearby = true;
          nearbyMatchCount = ex.reportCount;
          nearbyIssueId = ex.id;
          break;
        }
      }
    }
  }

  // Priority evaluation
  let priority: PriorityLevel = 'Medium';
  let reason = '';

  const highRiskKeywords = ['school', 'hospital', 'injury', 'accident', 'danger', 'deep', 'live wire', 'electrocution', 'spark', 'flood', 'collapse', 'crushed', 'ambulance', 'fatal'];
  const matchedHighRisk = highRiskKeywords.filter(k => text.includes(k));

  if (matchedHighRisk.length > 0 || (isDuplicateNearby && nearbyMatchCount >= 10)) {
    priority = 'Critical';
    reason = matchedHighRisk.length > 0 
      ? `Critical safety factor identified: "${matchedHighRisk.join(', ')}" in vicinity presents immediate public hazard.`
      : `Elevated to Critical: High density of citizen duplicate reports (${nearbyMatchCount} reports) indicating acute unresolved impact.`;
  } else if (text.includes('urgent') || text.includes('heavy traffic') || text.includes('arterial') || text.includes('bus route') || (isDuplicateNearby && nearbyMatchCount >= 3)) {
    priority = 'High';
    reason = isDuplicateNearby
      ? `Multiple citizens (${nearbyMatchCount} prior reports) corroborated this civic issue in the immediate zone.`
      : `High traffic/arterial zone impact identified from location and description context.`;
  } else if (text.includes('small') || text.includes('minor') || text.includes('cosmetic') || category === 'Road Signage') {
    priority = 'Low';
    reason = `Non-immediate hazard; no traffic disruption or pedestrian injury risk indicated. Scheduled for standard queue.`;
  } else {
    priority = 'Medium';
    reason = `Moderate civic inconvenience requiring standard municipal departmental attention within regular SLA.`;
  }

  // Title generation
  const words = input.description.trim().split(/\s+/).slice(0, 7).join(' ');
  const suggestedTitle = words ? `${category}: ${words}...` : `${category} Issue`;

  return {
    category,
    categoryDetail,
    priority,
    departmentId,
    departmentName,
    reason,
    detectedKeywords,
    suggestedTitle,
    isDuplicateNearby,
    nearbyMatchCount,
    nearbyIssueId
  };
}

function isValidCategory(cat: string): boolean {
  return [
    'Road Damage',
    'Waste Management',
    'Street Lighting',
    'Water Supply',
    'Tree Hazard',
    'Road Signage'
  ].includes(cat);
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getPriorityColor(priority: PriorityLevel): { bg: string; text: string; border: string; badge: string; pin: string } {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-700 border-red-200',
        pin: '#EF4444'
      };
    case 'High':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        pin: '#F97316'
      };
    case 'Medium':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        pin: '#EAB308'
      };
    case 'Low':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        pin: '#10B981'
      };
  }
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Resolved':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'In Progress':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Assigned':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'Reported':
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  }
}
