import { CivicIssue, Department, User, CivicNotification, SystemLog } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-road',
    name: 'Road Maintenance Department',
    description: 'Responsible for road surfaces, potholes, arterial pavements, and asphalt re-laying.',
    headName: 'Er. R. Sundaram',
    contactEmail: 'roads.corporation@civicfix.gov.in',
    activeIssuesCount: 18,
    resolvedCount: 142
  },
  {
    id: 'dept-sanitation',
    name: 'Sanitation Department',
    description: 'Solid waste management, community dumpsters, bio-waste disposal, and public sanitation.',
    headName: 'Dr. K. Meenakshi',
    contactEmail: 'sanitation@civicfix.gov.in',
    activeIssuesCount: 26,
    resolvedCount: 215
  },
  {
    id: 'dept-electrical',
    name: 'Electrical Department',
    description: 'Streetlights, electrical junction poles, high-mast illumination, and overhead line safety.',
    headName: 'Er. V. Anand',
    contactEmail: 'electrical@civicfix.gov.in',
    activeIssuesCount: 9,
    resolvedCount: 98
  },
  {
    id: 'dept-water',
    name: 'Water Department',
    description: 'Potable water pipelines, sewage lines, manhole covers, and urban storm drainage.',
    headName: 'Er. P. Venkatesh',
    contactEmail: 'metrowater@civicfix.gov.in',
    activeIssuesCount: 14,
    resolvedCount: 165
  },
  {
    id: 'dept-parks',
    name: 'Parks/Maintenance Department',
    description: 'Horticulture, fallen trees, hazardous branches, urban greenery, and roadside canopy.',
    headName: 'Smt. S. Shalini',
    contactEmail: 'parks.civic@civicfix.gov.in',
    activeIssuesCount: 7,
    resolvedCount: 88
  },
  {
    id: 'dept-traffic',
    name: 'Traffic/Road Department',
    description: 'Traffic signage, zebra crossings, signal boards, speed bumps, and road median safety.',
    headName: 'Insp. M. Rajendran',
    contactEmail: 'traffic.roads@civicfix.gov.in',
    activeIssuesCount: 11,
    resolvedCount: 74
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-citizen-1',
    name: 'Amita',
    email: 'karthik.citizen@gmail.com',
    role: 'CITIZEN',
    createdAt: '2026-07-15T08:30:00Z'
  },
  {
    id: 'usr-citizen-2',
    name: 'Ananya Ramesh',
    email: 'ananya.r@gmail.com',
    role: 'CITIZEN',
    createdAt: '2026-07-20T11:20:00Z'
  },
  {
    id: 'usr-staff-road',
    name: 'Rajesh Kumar (Road Division)',
    email: 'rajesh.staff@civicfix.gov.in',
    role: 'STAFF',
    departmentId: 'dept-road',
    departmentName: 'Road Maintenance Department',
    createdAt: '2026-06-01T09:00:00Z'
  },
  {
    id: 'usr-staff-sanitation',
    name: 'Saravanan M. (Sanitation Staff)',
    email: 'saravanan.staff@civicfix.gov.in',
    role: 'STAFF',
    departmentId: 'dept-sanitation',
    departmentName: 'Sanitation Department',
    createdAt: '2026-06-01T09:00:00Z'
  },
  {
    id: 'usr-admin-1',
    name: 'Civic Administrator',
    email: 'admin@civicfix.gov.in',
    role: 'ADMIN',
    createdAt: '2026-05-10T10:00:00Z'
  }
];

export const DEMO_USERS = INITIAL_USERS;

export const INITIAL_ISSUES: CivicIssue[] = [
  {
    id: 'CF10024',
    userId: 'usr-citizen-1',
    userName: 'Amita',
    userEmail: 'karthik.citizen@gmail.com',
    category: 'Road Damage',
    title: 'Severe Pothole on 5th Avenue Junction',
    description: 'Large deep pothole spanning 1.5 meters causing severe vehicle disruption and near-accidents for two-wheelers during evening traffic.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    latitude: 13.0850,
    longitude: 80.2101,
    address: '5th Avenue, Anna Nagar East, Chennai, Tamil Nadu 600040',
    priority: 'High',
    priorityReason: 'High-traffic arterial road near Anna Nagar Tower park; 17 citizens corroborated road safety hazard.',
    status: 'In Progress',
    departmentId: 'dept-road',
    departmentName: 'Road Maintenance Department',
    reportCount: 17,
    duplicateReports: [
      { id: 'dup-1', userId: 'usr-cit-101', userName: 'Priya N.', reportedAt: '2026-08-28T10:14:00Z', note: 'Almost fell off scooter here today' },
      { id: 'dup-2', userId: 'usr-cit-102', userName: 'Manoj V.', reportedAt: '2026-08-28T14:30:00Z', note: 'Multiple cars got rim damage' },
      { id: 'dup-3', userId: 'usr-cit-103', userName: 'Devi S.', reportedAt: '2026-08-29T08:00:00Z', note: 'Urgent repair required before rain' }
    ],
    timeline: [
      {
        id: 'tl-1',
        status: 'Reported',
        timestamp: '2026-08-28T09:30:00Z',
        note: 'Citizen filed initial report with geo-tagged photographic evidence.',
        actor: 'Amita',
        actorRole: 'CITIZEN'
      },
      {
        id: 'tl-2',
        status: 'Assigned',
        timestamp: '2026-08-28T11:15:00Z',
        note: 'Auto-routed by CivicFix Engine to Anna Nagar Works Division.',
        actor: 'CivicFix Intelligent Router',
        actorRole: 'ADMIN'
      },
      {
        id: 'tl-3',
        status: 'In Progress',
        timestamp: '2026-08-29T08:45:00Z',
        note: 'Asphalt patching crew and road roller mobilized to site.',
        actor: 'Rajesh Kumar (Road Staff)',
        actorRole: 'STAFF'
      }
    ],
    createdAt: '2026-08-28T09:30:00Z',
    updatedAt: '2026-08-29T08:45:00Z'
  },
  {
    id: 'CF10025',
    userId: 'usr-citizen-2',
    userName: 'Ananya Ramesh',
    userEmail: 'ananya.r@gmail.com',
    category: 'Waste Management',
    title: 'Overflowing Commercial Waste Dumpster',
    description: 'Massive garbage heap overflowing onto pedestrian footpath, attracting stray animals and blocking store entrances on market street.',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    latitude: 13.0418,
    longitude: 80.2341,
    address: 'Ranganathan Street, T. Nagar, Chennai 600017',
    priority: 'Critical',
    priorityReason: 'Severe public hygiene hazard in densely crowded shopping corridor; multiple duplicate reports within 24 hours.',
    status: 'Reported',
    departmentId: 'dept-sanitation',
    departmentName: 'Sanitation Department',
    reportCount: 24,
    timeline: [
      {
        id: 'tl-4',
        status: 'Reported',
        timestamp: '2026-08-30T07:15:00Z',
        note: 'Issue reported and flagged with elevated priority due to high footfall commercial zone.',
        actor: 'Ananya Ramesh',
        actorRole: 'CITIZEN'
      }
    ],
    createdAt: '2026-08-30T07:15:00Z',
    updatedAt: '2026-08-30T07:15:00Z'
  },
  {
    id: 'CF10026',
    userId: 'usr-citizen-1',
    userName: 'Amita',
    userEmail: 'karthik.citizen@gmail.com',
    category: 'Street Lighting',
    title: 'Non-functioning Streetlight Pole #B14',
    description: 'High-pressure sodium lamp flickering out completely, leaving 100-meter seaside promenade stretch in total darkness.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    latitude: 13.0002,
    longitude: 80.2707,
    address: 'Besant Nagar Promenade, 6th Avenue, Chennai 600090',
    priority: 'Medium',
    priorityReason: 'Pedestrian walkway dark after dusk; moderate ambient light from nearby cafe facades.',
    status: 'Assigned',
    departmentId: 'dept-electrical',
    departmentName: 'Electrical Department',
    reportCount: 4,
    timeline: [
      {
        id: 'tl-5',
        status: 'Reported',
        timestamp: '2026-08-31T20:10:00Z',
        note: 'Citizen reported night-time visibility hazard.',
        actor: 'Amita',
        actorRole: 'CITIZEN'
      },
      {
        id: 'tl-6',
        status: 'Assigned',
        timestamp: '2026-09-01T09:00:00Z',
        note: 'Assigned to South Chennai Line Inspection Crew.',
        actor: 'Er. V. Anand (Electrical Dept)',
        actorRole: 'STAFF'
      }
    ],
    createdAt: '2026-08-31T20:10:00Z',
    updatedAt: '2026-09-01T09:00:00Z'
  },
  {
    id: 'CF10027',
    userId: 'usr-citizen-2',
    userName: 'Ananya Ramesh',
    userEmail: 'ananya.r@gmail.com',
    category: 'Water Supply',
    title: 'Major Potable Water Pipeline Rupture',
    description: 'High-pressure municipal drinking water line cracked and spewing potable water, flooding street and causing water loss in residential sector.',
    imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    latitude: 12.9815,
    longitude: 80.2180,
    address: '100 Feet Bypass Road, Velachery, Chennai 600042',
    priority: 'Critical',
    priorityReason: 'Extensive loss of treated drinking water and severe road ponding undermining road foundation.',
    status: 'In Progress',
    departmentId: 'dept-water',
    departmentName: 'Water Department',
    reportCount: 12,
    timeline: [
      {
        id: 'tl-7',
        status: 'Reported',
        timestamp: '2026-09-01T06:20:00Z',
        note: 'Emergency pipeline burst reported.',
        actor: 'Ananya Ramesh',
        actorRole: 'CITIZEN'
      },
      {
        id: 'tl-8',
        status: 'Assigned',
        timestamp: '2026-09-01T06:50:00Z',
        note: 'Emergency valves isolation team dispatched.',
        actor: 'CivicFix Emergency Router',
        actorRole: 'ADMIN'
      },
      {
        id: 'tl-9',
        status: 'In Progress',
        timestamp: '2026-09-01T08:15:00Z',
        note: 'Sluice gate isolated; excavation underway for collar replacement.',
        actor: 'Er. P. Venkatesh',
        actorRole: 'STAFF'
      }
    ],
    createdAt: '2026-09-01T06:20:00Z',
    updatedAt: '2026-09-01T08:15:00Z'
  },
  {
    id: 'CF10028',
    userId: 'usr-citizen-1',
    userName: 'Amita',
    userEmail: 'karthik.citizen@gmail.com',
    category: 'Tree Hazard',
    title: 'Heavy Banyan Tree Limb Fallen Across Road',
    description: 'Storm winds caused a 4-meter dense tree branch to snap and block southbound lane near Luz Church junction.',
    imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80',
    latitude: 13.0368,
    longitude: 80.2676,
    address: 'Luz Church Road, Mylapore, Chennai 600004',
    priority: 'High',
    priorityReason: 'Partial lane blockage creating traffic congestion during school hours.',
    status: 'Resolved',
    departmentId: 'dept-parks',
    departmentName: 'Parks/Maintenance Department',
    reportCount: 6,
    resolutionNotes: 'Horticulture team cleared fallen limb with motorized saws, cleared road surface, and pruned adjacent weak branches.',
    resolutionProof: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    resolvedAt: '2026-09-02T16:00:00Z',
    timeline: [
      {
        id: 'tl-10',
        status: 'Reported',
        timestamp: '2026-09-02T07:40:00Z',
        note: 'Branch reported after overnight thunderstorm.',
        actor: 'Amita',
        actorRole: 'CITIZEN'
      },
      {
        id: 'tl-11',
        status: 'Assigned',
        timestamp: '2026-09-02T08:10:00Z',
        note: 'Mylapore Zone Forestry Squad notified.',
        actor: 'Admin Dispatcher',
        actorRole: 'ADMIN'
      },
      {
        id: 'tl-12',
        status: 'In Progress',
        timestamp: '2026-09-02T11:00:00Z',
        note: 'Crew arrived with wood shredder and traffic cones.',
        actor: 'Smt. S. Shalini (Parks Dept)',
        actorRole: 'STAFF'
      },
      {
        id: 'tl-13',
        status: 'Resolved',
        timestamp: '2026-09-02T16:00:00Z',
        note: 'Road 100% cleared, branches recycled to organic compost depot.',
        actor: 'Smt. S. Shalini (Parks Dept)',
        actorRole: 'STAFF'
      }
    ],
    createdAt: '2026-09-02T07:40:00Z',
    updatedAt: '2026-09-02T16:00:00Z'
  },
  {
    id: 'CF10029',
    userId: 'usr-citizen-2',
    userName: 'Ananya Ramesh',
    userEmail: 'ananya.r@gmail.com',
    category: 'Road Signage',
    title: 'Bent School Zone & Speed Limit Signboard',
    description: 'Metal pole bent at 40 degrees following truck impact; school crossing advisory sign obscured from approaching vehicles.',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    latitude: 13.0112,
    longitude: 80.2370,
    address: 'Gandhi Mandapam Road, Adyar, Chennai 600020',
    priority: 'Low',
    priorityReason: 'Signpost tilted but upright; warning lettering still partially visible; scheduled for regular route realignment.',
    status: 'Reported',
    departmentId: 'dept-traffic',
    departmentName: 'Traffic/Road Department',
    reportCount: 2,
    timeline: [
      {
        id: 'tl-14',
        status: 'Reported',
        timestamp: '2026-09-03T11:45:00Z',
        note: 'Initial citizen report registered.',
        actor: 'Ananya Ramesh',
        actorRole: 'CITIZEN'
      }
    ],
    createdAt: '2026-09-03T11:45:00Z',
    updatedAt: '2026-09-03T11:45:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: CivicNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-citizen-1',
    issueId: 'CF10024',
    issueTitle: 'Severe Pothole on 5th Avenue Junction',
    message: 'Your complaint CF10024 has been assigned to Road Maintenance Department.',
    type: 'ASSIGNMENT',
    isRead: true,
    createdAt: '2026-08-28T11:15:00Z'
  },
  {
    id: 'notif-2',
    userId: 'usr-citizen-1',
    issueId: 'CF10024',
    issueTitle: 'Severe Pothole on 5th Avenue Junction',
    message: 'Your complaint CF10024 is now In Progress. Repair crew dispatched.',
    type: 'STATUS_CHANGE',
    isRead: false,
    createdAt: '2026-08-29T08:45:00Z'
  },
  {
    id: 'notif-3',
    userId: 'usr-citizen-1',
    issueId: 'CF10024',
    issueTitle: 'Severe Pothole on 5th Avenue Junction',
    message: '16 more citizens reported the same issue near your location. Priority elevated to High.',
    type: 'DUPLICATE',
    isRead: false,
    createdAt: '2026-08-29T14:20:00Z'
  },
  {
    id: 'notif-4',
    userId: 'usr-citizen-1',
    issueId: 'CF10028',
    issueTitle: 'Heavy Banyan Tree Limb Fallen Across Road',
    message: 'Your complaint CF10028 has been successfully resolved. Thank you for making Chennai safer!',
    type: 'RESOLVED',
    isRead: false,
    createdAt: '2026-09-02T16:00:00Z'
  }
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-04T03:30:12Z',
    level: 'INFO',
    service: 'CivicFix-Router',
    message: 'RuleEngine v2.4 initialized with 6 categories and priority weight vectors.'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-04T03:31:05Z',
    level: 'SUCCESS',
    service: 'NotificationDispatcher',
    message: 'Citizen notification batch dispatched for Issue #CF10024.'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-04T03:32:44Z',
    level: 'INFO',
    service: 'DuplicateClusterService',
    message: 'Spatial proximity scan matched 17 complaints within 80m radius for Anna Nagar zone.'
  },
  {
    id: 'log-4',
    timestamp: '2026-09-04T03:34:10Z',
    level: 'INFO',
    service: 'AuditLogger',
    message: 'Staff user Rajesh Kumar updated status of CF10024 to In Progress.'
  }
];

// Sample civic images that citizens can click to test quickly
export const SAMPLE_ISSUE_PHOTOS = [
  {
    label: 'Road Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Road Damage',
    sampleDescription: 'Deep pothole in the middle lane causing dangerous swerving by motorists.'
  },
  {
    label: 'Garbage Dump',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    category: 'Waste Management',
    sampleDescription: 'Commercial garbage bin overflowing onto walkway with foul odor and waste spilling.'
  },
  {
    label: 'Dark Streetlight',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    category: 'Street Lighting',
    sampleDescription: 'Broken street lamp post completely dead; street is pitch dark and unsafe at night.'
  },
  {
    label: 'Water Pipeline Leak',
    url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    category: 'Water Supply',
    sampleDescription: 'Major underground drinking water pipe leaking profusely and flooding the corner.'
  },
  {
    label: 'Fallen Tree Branch',
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80',
    category: 'Tree Hazard',
    sampleDescription: 'Large heavy branch collapsed onto the road obstructing one whole lane.'
  },
  {
    label: 'Damaged Road Sign',
    url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    category: 'Road Signage',
    sampleDescription: 'Traffic speed warning signboard damaged and bent, unreadable to incoming cars.'
  }
];

export const CHENNAI_PRESET_LOCATIONS = [
  { name: 'Anna Nagar (5th Ave)', lat: 13.0850, lng: 80.2101, address: '5th Avenue, Anna Nagar East, Chennai 600040' },
  { name: 'T. Nagar (Ranganathan St)', lat: 13.0418, lng: 80.2341, address: 'Ranganathan Street, T. Nagar, Chennai 600017' },
  { name: 'Mylapore (Luz Church Rd)', lat: 13.0368, lng: 80.2676, address: 'Luz Church Road, Mylapore, Chennai 600004' },
  { name: 'Adyar (Gandhi Mandapam)', lat: 13.0112, lng: 80.2370, address: 'Gandhi Mandapam Road, Adyar, Chennai 600020' },
  { name: 'Velachery (100 Ft Rd)', lat: 12.9815, lng: 80.2180, address: '100 Feet Bypass Road, Velachery, Chennai 600042' },
  { name: 'Besant Nagar (Beach Rd)', lat: 13.0002, lng: 80.2707, address: 'Besant Nagar Beach Road, Chennai 600090' }
];
