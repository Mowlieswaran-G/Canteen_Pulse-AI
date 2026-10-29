import {
  ActionItem,
  AlertItem,
  AuditRecord,
  FeedbackItem,
  ForecastItem,
  LLMUsageRecord,
  Organization,
  PermissionKey,
  PipelineProgressEvent,
  RoleDefinition,
  ScheduleItem,
  StationSystemMetric,
  TaskItem,
  User,
  WeeklyPlanDay,
  YouSaidWeDidItem,
} from '../types';

// Default initial organizations
const DEFAULT_ORGS: Organization[] = [
  {
    id: 'org_abc_college',
    slug: 'abc-college',
    name: 'ABC College - Central Mess',
    type: 'college_mess',
    locations: ['Central Dining Hall', 'North Hostel Mess', 'South Wing Canteen'],
    categories: ['Temperature', 'Taste & Salt', 'Hygiene & Cleanliness', 'Service Speed', 'Dietary/Hygiene', 'Portion Size'],
    alertKeywords: {
      en: ['stomach ache', 'food poisoning', 'vomit', 'glass shard', 'plastic piece', 'raw chicken', 'insect', 'cockroach'],
      hi: ['pet dard', 'keeda', 'kaccha', 'badbu', 'ulti'],
      ta: ['vayiroli', 'poochi', 'azhugiya', 'vaanthi']
    },
    healthRiskCategories: ['Hygiene & Cleanliness', 'Food Safety', 'Raw/Spoiled Ingredients'],
    severityWeights: {
      healthRisk: 3.5,
      frequency: 2.0,
      severity: 2.5,
      recency: 1.5,
    },
    escalationDays: 2,
  },
  {
    id: 'org_south_campus',
    slug: 'south-campus-diners',
    name: 'South Campus Diners',
    type: 'college_mess',
    locations: ['Main Cafeteria', 'Snack Bar'],
    categories: ['Temperature', 'Oil & Freshness', 'Serving Staff', 'Menu Variety'],
    alertKeywords: {
      en: ['spoiled milk', 'sour taste', 'hair in food', 'mold'],
      hi: ['baasi', 'baal', 'khatta'],
      ta: ['kettu pochchu', 'mudi']
    },
    healthRiskCategories: ['Food Safety', 'Hygiene & Cleanliness'],
    severityWeights: {
      healthRisk: 3.0,
      frequency: 1.8,
      severity: 2.2,
      recency: 1.2,
    },
    escalationDays: 3,
  }
];

// Seeded Roles with full permission definitions
const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'role_admin',
    name: 'System Admin',
    description: 'Full administrative access to manage roles, permissions, integrations, and pipeline',
    permissions: [
      'dashboard.view',
      'action.approve',
      'task.view',
      'task.complete',
      'forecast.view',
      'feedback.submit',
      'roles.manage',
      'users.manage',
      'settings.edit',
      'audit.view',
      'alerts.receive',
      'report.view',
    ],
  },
  {
    id: 'role_mess_manager',
    name: 'Mess Manager',
    description: 'Oversees dining operations, approves ranked actions, reviews forecasts and alerts',
    permissions: [
      'dashboard.view',
      'action.approve',
      'task.view',
      'forecast.view',
      'report.view',
      'alerts.receive',
      'settings.edit',
      'audit.view',
    ],
  },
  {
    id: 'role_head_cook',
    name: 'Head Cook / Kitchen Lead',
    description: 'Focuses strictly on assigned kitchen tasks, temperature logs, and task completions',
    permissions: ['task.view', 'task.complete'],
  },
  {
    id: 'role_student',
    name: 'Student / Diner',
    description: 'Submits meal feedback and views the public You Said We Did improvement board',
    permissions: ['feedback.submit'],
  },
  {
    id: 'role_procurement_lead',
    name: 'Procurement Specialist',
    description: 'Coordinates ingredient batch quality, vendor issues, and supply tasks',
    permissions: ['dashboard.view', 'task.view', 'task.complete'],
  },
];

// Demo Users mapped to roles
const DEMO_USERS: User[] = [
  {
    id: 'user_manager',
    name: 'Rajesh Sharma',
    email: 'rajesh.mess@abccollege.edu',
    roleId: 'role_mess_manager',
    roleName: 'Mess Manager',
    location: 'Central Dining Hall',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user_cook',
    name: 'Muthu Kumar (Head Chef)',
    email: 'muthu.kitchen@abccollege.edu',
    roleId: 'role_head_cook',
    roleName: 'Head Cook / Kitchen Lead',
    location: 'Central Dining Hall',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user_student',
    name: 'Sarah Jenkins',
    email: 'sarah.j@student.abccollege.edu',
    roleId: 'role_student',
    roleName: 'Student / Diner',
    location: 'North Hostel Mess',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user_admin',
    name: 'Devanathan (Director of Operations)',
    email: 'admin.dining@abccollege.edu',
    roleId: 'role_admin',
    roleName: 'System Admin',
    location: 'All Locations',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
];

// Seeded Feedback
const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb_1',
    orgId: 'org_abc_college',
    timestamp: '2026-10-28T13:45:00Z',
    rating: 2,
    tags: ['cold', 'oily'],
    meal: 'Lunch',
    item: 'Dal Tadka & Rice',
    location: 'Central Dining Hall',
    comment: 'The dal was lukewarm and tasted heavily oily today. Not enjoyable.',
    isAnonymous: true,
    sentiment: 'negative',
    sentimentScore: 0.22,
    category: 'Temperature',
  },
  {
    id: 'fb_2',
    orgId: 'org_abc_college',
    timestamp: '2026-10-28T14:10:00Z',
    rating: 1,
    tags: ['dirty', 'stale'],
    meal: 'Lunch',
    item: 'Salad Counter',
    location: 'Central Dining Hall',
    comment: 'Found a dead insect on the shredded cabbage tray at the salad counter!',
    isAnonymous: false,
    sentiment: 'negative',
    sentimentScore: 0.05,
    category: 'Hygiene & Cleanliness',
  },
  {
    id: 'fb_3',
    orgId: 'org_abc_college',
    timestamp: '2026-10-28T09:15:00Z',
    rating: 5,
    tags: ['Hot & Fresh', 'Delicious'],
    meal: 'Breakfast',
    item: 'Idli & Sambar',
    location: 'North Hostel Mess',
    comment: 'Sambar was piping hot and chutneys were extremely fresh! Great job!',
    isAnonymous: true,
    sentiment: 'positive',
    sentimentScore: 0.95,
    category: 'Taste & Salt',
  },
  {
    id: 'fb_4',
    orgId: 'org_abc_college',
    timestamp: '2026-10-27T20:30:00Z',
    rating: 2,
    tags: ['salty'],
    meal: 'Dinner',
    item: 'Paneer Butter Masala',
    location: 'Central Dining Hall',
    comment: 'Paneer gravy had way too much salt today, several hostel mates felt the same.',
    isAnonymous: true,
    sentiment: 'negative',
    sentimentScore: 0.3,
    category: 'Taste & Salt',
  },
  {
    id: 'fb_5',
    orgId: 'org_abc_college',
    timestamp: '2026-10-27T13:00:00Z',
    rating: 2,
    tags: ['late'],
    meal: 'Lunch',
    item: 'Roti Counter',
    location: 'Central Dining Hall',
    comment: 'Waited 18 minutes in queue just for rotis. Lunch hour ended before I finished.',
    isAnonymous: true,
    sentiment: 'negative',
    sentimentScore: 0.35,
    category: 'Service Speed',
  },
];

// Seeded Alerts
const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt_1',
    orgId: 'org_abc_college',
    timestamp: '2026-10-28T14:12:00Z',
    title: 'Foreign Object Reported at Salad Counter',
    description: 'Diner feedback flagged keyword "insect" at Central Dining Hall salad station.',
    severity: 'CRITICAL',
    category: 'Hygiene & Cleanliness',
    keywordMatch: 'insect',
    feedbackId: 'fb_2',
    acknowledged: false,
  },
  {
    id: 'alt_2',
    orgId: 'org_abc_college',
    timestamp: '2026-10-27T21:00:00Z',
    title: 'Repeated High Salt Complaint in Dinner Gravy',
    description: 'Cluster of 5 complaints detected within 45 minutes regarding excessive sodium.',
    severity: 'MEDIUM',
    category: 'Taste & Salt',
    keywordMatch: 'too much salt',
    feedbackId: 'fb_4',
    acknowledged: true,
    ackBy: 'Rajesh Sharma',
    ackAt: '2026-10-27T21:15:00Z',
  },
];

// Seeded Actions (Pre-run pipeline results paused at approval)
const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: 'act_1',
    orgId: 'org_abc_college',
    rank: 1,
    issue: 'Bacterial & Pest Risk at Raw Produce Salad Station',
    riskLevel: 'High',
    recommendation: 'Enact mandatory double-wash ozone sanitization for leafy greens and inspect salad counter sneeze-guards before lunch service.',
    ownerRole: 'Head Cook / Kitchen Lead',
    effort: 'Low',
    dueDate: 'Today, 11:30 AM',
    status: 'pending',
    score: 9.4,
    scoreBreakdown: {
      severityScore: 9.5,
      frequencyScore: 8.2,
      healthRiskMultiplier: 1.25,
      finalCompositeScore: 9.4,
    },
    explanationText: 'Ranked #1 due to health risk multiplier (direct pest contamination trigger) and regulatory campus dining compliance requirements.',
    evidenceItems: [
      {
        quote: 'Found a dead insect on the shredded cabbage tray at the salad counter!',
        meal: 'Lunch (Oct 28)',
        date: 'Oct 28',
        rating: 1,
      },
      {
        quote: 'Salad greens appeared wilted and unwashed around edges.',
        meal: 'Dinner (Oct 26)',
        date: 'Oct 26',
        rating: 2,
      },
    ],
  },
  {
    id: 'act_2',
    orgId: 'org_abc_college',
    rank: 2,
    issue: 'Gravy & Dal Temperature Loss During Lunch Rush',
    riskLevel: 'Medium',
    recommendation: 'Calibrate steam tables to maintain continuous holding temperature >= 65°C and cycle bain-marie water every 90 minutes.',
    ownerRole: 'Head Cook / Kitchen Lead',
    effort: 'Medium',
    dueDate: 'Tomorrow, 08:00 AM',
    status: 'pending',
    score: 8.1,
    scoreBreakdown: {
      severityScore: 7.8,
      frequencyScore: 8.5,
      healthRiskMultiplier: 1.1,
      finalCompositeScore: 8.1,
    },
    explanationText: 'Ranked #2 due to consistent high frequency: 14 out of 42 negative complaints in past 5 days cite lukewarm or cold dhal/gravy.',
    evidenceItems: [
      {
        quote: 'The dal was lukewarm and tasted heavily oily today. Not enjoyable.',
        meal: 'Lunch (Oct 28)',
        date: 'Oct 28',
        rating: 2,
      },
      {
        quote: 'Gravy was almost cold by 1:30 PM.',
        meal: 'Lunch (Oct 27)',
        date: 'Oct 27',
        rating: 2,
      },
    ],
  },
  {
    id: 'act_3',
    orgId: 'org_abc_college',
    rank: 3,
    issue: 'Roti Counter Bottleneck & Peak Queue Delay',
    riskLevel: 'Medium',
    recommendation: 'Deploy secondary automatic dough roller during 12:45-13:30 peak rush and introduce pre-stacked warming basket.',
    ownerRole: 'Mess Manager',
    effort: 'Medium',
    dueDate: 'Friday, 12:00 PM',
    status: 'pending',
    score: 7.2,
    scoreBreakdown: {
      severityScore: 6.5,
      frequencyScore: 8.8,
      healthRiskMultiplier: 1.0,
      finalCompositeScore: 7.2,
    },
    explanationText: 'Ranked #3 because wait times consistently exceed 15 minutes during the post-lecture period, impacting 320+ diners daily.',
    evidenceItems: [
      {
        quote: 'Waited 18 minutes in queue just for rotis. Lunch hour ended before I finished.',
        meal: 'Lunch (Oct 27)',
        date: 'Oct 27',
        rating: 2,
      },
    ],
  },
  {
    id: 'act_4',
    orgId: 'org_abc_college',
    rank: 4,
    issue: 'Ingredient Batch Sodium Variance in Dinner Curries',
    riskLevel: 'Low',
    recommendation: 'Standardize measuring scoops for salt addition based on 50L batch pot volume rather than freehand seasoning.',
    ownerRole: 'Head Cook / Kitchen Lead',
    effort: 'Low',
    dueDate: 'Today, 05:00 PM',
    status: 'approved',
    score: 6.5,
    scoreBreakdown: {
      severityScore: 6.0,
      frequencyScore: 7.2,
      healthRiskMultiplier: 1.0,
      finalCompositeScore: 6.5,
    },
    explanationText: 'Ranked #4. Seasoning inconsistency concentrated on evening shifts with junior cook rotations.',
    evidenceItems: [
      {
        quote: 'Paneer gravy had way too much salt today, several hostel mates felt the same.',
        meal: 'Dinner (Oct 27)',
        date: 'Oct 27',
        rating: 2,
      },
    ],
    approvalNote: 'Approved by Rajesh Sharma. Standard batch scoops placed at spices station.',
    approvedBy: 'Rajesh Sharma',
    approvedAt: '2026-10-28T09:00:00Z',
    resultingTaskId: 'task_seeded_1',
  },
];

// Seeded Tasks
const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task_seeded_1',
    orgId: 'org_abc_college',
    actionId: 'act_4',
    title: 'Standardize Salt Batch Scoops at Gravy Station',
    description: 'Ensure junior cooks use the 50g color-coded scoops for each 20L sambar/gravy batch. Check evening gravy sample before service.',
    assignedRole: 'Head Cook / Kitchen Lead',
    location: 'Central Dining Hall',
    priority: 'Medium',
    isOverdue: false,
    dueDate: 'Today, 05:00 PM',
    status: 'pending',
  },
  {
    id: 'task_seeded_2',
    orgId: 'org_abc_college',
    title: 'Morning Food Temperature Probing & Logbook Entry',
    description: 'Verify holding wells are at minimum 65°C. Record temperatures in kitchen inspection tablet.',
    assignedRole: 'Head Cook / Kitchen Lead',
    location: 'Central Dining Hall',
    priority: 'High',
    isOverdue: false,
    dueDate: 'Today, 07:30 AM',
    status: 'completed',
    completedAt: '2026-10-29T07:22:00Z',
    completedBy: 'Muthu Kumar (Head Chef)',
    completionNote: 'All steam wells tested: Rice well 68°C, Sambar well 72°C. Photos logged.',
    photoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'task_seeded_3',
    orgId: 'org_abc_college',
    title: 'Emergency Deep-Clean of Salad Counter & Sneeze Guard',
    description: 'Disinfect produce trays, inspect seals, and discard old batches in accordance with sanitation protocol.',
    assignedRole: 'Head Cook / Kitchen Lead',
    location: 'Central Dining Hall',
    priority: 'High',
    isOverdue: true,
    dueDate: 'Yesterday, 06:00 PM',
    status: 'pending',
  },
];

// Public You Said We Did Items
const INITIAL_YOU_SAID_WE_DID: YouSaidWeDidItem[] = [
  {
    id: 'yswd_1',
    orgId: 'org_abc_college',
    category: 'Food Temperature',
    youSaid: 'The evening soup and dal are frequently served lukewarm during second shift.',
    weDid: 'Installed dual electric induction warming trays and introduced hourly temperature probe audits.',
    impactMetric: '+38% jump in temperature satisfaction ratings across 450+ weekly hostel reviews',
    resolvedDate: 'Oct 24, 2026',
    verifiedBy: 'Mess Committee & Student Council',
  },
  {
    id: 'yswd_2',
    orgId: 'org_abc_college',
    category: 'Service Speed',
    youSaid: 'Long lines formed at the South Wing water dispensers and cutlery station during lunch.',
    weDid: 'Added two high-capacity RO hydration stations and relocated cutlery bins to entrance portals.',
    impactMetric: 'Peak wait times reduced from 14 minutes to under 3.5 minutes',
    resolvedDate: 'Oct 18, 2026',
    verifiedBy: 'Operations Lead',
  },
  {
    id: 'yswd_3',
    orgId: 'org_abc_college',
    category: 'Taste & Quality',
    youSaid: 'Breakfast sambar flavor varied drastically between Monday and Thursday shifts.',
    weDid: 'Introduced central spice blend packaging and standardized cooking recipe cards for chefs.',
    impactMetric: '92% positive rating achieved consistently for breakfast services this fortnight',
    resolvedDate: 'Oct 12, 2026',
    verifiedBy: 'Chef Muthu Kumar',
  },
];

// Seeded Station Systems (Matches video's "All System List" with correct vs incorrect ratio bars!)
const INITIAL_SYSTEMS: StationSystemMetric[] = [
  {
    id: 'sys_1',
    name: 'Food Temperature & Holding',
    category: 'Safety & Quality',
    feedbackCount: 384,
    positiveCount: 295,
    negativeCount: 89,
    percentCorrect: 77,
    completedPercent: 92,
    trend: 'up',
  },
  {
    id: 'sys_2',
    name: 'Seasoning & Salt Control',
    category: 'Taste',
    feedbackCount: 320,
    positiveCount: 218,
    negativeCount: 102,
    percentCorrect: 68,
    completedPercent: 88,
    trend: 'down',
  },
  {
    id: 'sys_3',
    name: 'Hygiene & Cleanliness',
    category: 'Sanitation',
    feedbackCount: 412,
    positiveCount: 380,
    negativeCount: 32,
    percentCorrect: 92,
    completedPercent: 96,
    trend: 'up',
  },
  {
    id: 'sys_4',
    name: 'Service Speed & Queue Flow',
    category: 'Operations',
    feedbackCount: 290,
    positiveCount: 188,
    negativeCount: 102,
    percentCorrect: 65,
    completedPercent: 84,
    trend: 'down',
  },
  {
    id: 'sys_5',
    name: 'Menu Variety & Fresh Produce',
    category: 'Nutrition',
    feedbackCount: 270,
    positiveCount: 243,
    negativeCount: 27,
    percentCorrect: 90,
    completedPercent: 95,
    trend: 'steady',
  },
];

// Seeded Today's Schedule (Matches video's "Today Study Schedule")
const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch_1',
    timeRange: '07:30 - 09:30 AM',
    title: 'Breakfast Service & Porridge Holding Log',
    subtitle: 'Verify bain-marie temps (>65°C) and replenishment times',
    category: 'Service Operation',
    type: 'service',
    status: 'completed',
    assignedRole: 'Head Cook / Kitchen Lead',
  },
  {
    id: 'sch_2',
    timeRange: '11:30 - 12:00 PM',
    title: 'Pre-Lunch Salad Counter Inspection',
    subtitle: 'Audit vegetable wash record and sneeze guard sanitization',
    category: 'Health & Safety',
    type: 'inspection',
    status: 'in_progress',
    assignedRole: 'Mess Manager',
  },
  {
    id: 'sch_3',
    timeRange: '12:30 - 02:30 PM',
    title: 'Peak Lunch Rush & Roti Station Queue Monitoring',
    subtitle: 'Verify live throughput and table turnover metrics',
    category: 'Service Operation',
    type: 'service',
    status: 'pending',
    assignedRole: 'Head Cook / Kitchen Lead',
  },
  {
    id: 'sch_4',
    timeRange: '05:00 - 06:00 PM',
    title: 'Evening Sodium Consistency Audit',
    subtitle: 'Standard scoop check on 50L sambar and vegetable curry',
    category: 'Quality Control',
    type: 'prep',
    status: 'pending',
    assignedRole: 'Head Cook / Kitchen Lead',
  },
];

// Seeded Weekly Plan (Matches video's "Study Schedule Plan" calendar row)
const INITIAL_WEEKLY_PLAN: WeeklyPlanDay[] = [
  {
    date: 22,
    dayName: 'Mon',
    shifts: [
      { id: 'p1', title: 'Breakfast Audit', type: 'breakfast', badgeColor: '#3B82F6', status: 'done' },
      { id: 'p2', title: 'Deep Sanitization', type: 'sanitization', badgeColor: '#10B981', status: 'done' },
    ],
  },
  {
    date: 23,
    dayName: 'Tue',
    shifts: [
      { id: 'p3', title: 'Lunch Inspection', type: 'lunch', badgeColor: '#F59E0B', status: 'done' },
      { id: 'p4', title: 'Pantry Stock Check', type: 'dinner', badgeColor: '#8B5CF6', status: 'done' },
    ],
  },
  {
    date: 24,
    dayName: 'Wed',
    isToday: true,
    shifts: [
      { id: 'p5', title: 'Salad Station Protocol', type: 'lunch', badgeColor: '#EC4899', status: 'active' },
      { id: 'p6', title: 'Sodium Batch Scoop', type: 'dinner', badgeColor: '#10B981', status: 'scheduled' },
    ],
  },
  {
    date: 25,
    dayName: 'Thu',
    shifts: [
      { id: 'p7', title: 'Oil Quality Tester', type: 'breakfast', badgeColor: '#F97316', status: 'scheduled' },
      { id: 'p8', title: 'Vendor Milk Delivery', type: 'lunch', badgeColor: '#06B6D4', status: 'scheduled' },
    ],
  },
  {
    date: 26,
    dayName: 'Fri',
    shifts: [
      { id: 'p9', title: 'All-Mess Weekly Clean', type: 'sanitization', badgeColor: '#6366F1', status: 'scheduled' },
      { id: 'p10', title: 'Student Council Review', type: 'dinner', badgeColor: '#84CC16', status: 'scheduled' },
    ],
  },
];

// Seeded Forecast Items
const INITIAL_FORECASTS: ForecastItem[] = [
  {
    id: 'fc_1',
    issue: 'High Sodium Complaints in Evening Gravy Curries',
    category: 'Taste & Salt',
    riskLevel: 'High',
    likelyDay: 'Fridays (Weekend Feast Prep Shift)',
    evidenceRationale: 'Counted 19 occurrences over past 4 weeks when junior cook shifts handle evening batch preparations without measured scoops.',
    weeklySparkline: [4, 7, 12, 9, 14, 18, 19],
    historicalOccurrences: 19,
    confidence: 0.89,
  },
  {
    id: 'fc_2',
    issue: 'Lukewarm Dal during Late Lunch Shift (1:30 PM)',
    category: 'Temperature',
    riskLevel: 'Medium',
    likelyDay: 'Mondays & Wednesdays (Heavy Class Days)',
    evidenceRationale: 'Steam table water depletion coincides with late-arriving engineering batches after 1:15 PM.',
    weeklySparkline: [8, 10, 9, 13, 11, 14, 12],
    historicalOccurrences: 14,
    confidence: 0.84,
  },
  {
    id: 'fc_3',
    issue: 'Queue Spillover at Roti Station during Lunch',
    category: 'Service Speed',
    riskLevel: 'Medium',
    likelyDay: 'Tuesdays & Thursdays',
    evidenceRationale: 'Roti consumption peaks 40% higher when paired with Paneer Butter Masala.',
    weeklySparkline: [12, 15, 14, 18, 16, 20, 22],
    historicalOccurrences: 22,
    confidence: 0.91,
  },
  {
    id: 'fc_4',
    issue: 'Greasy Poori Oil Breakdown at Breakfast',
    category: 'Oil & Freshness',
    riskLevel: 'Low',
    likelyDay: 'Sundays (High volume)',
    evidenceRationale: 'Oil frying temperature drops when large batches are dropped simultaneously.',
    weeklySparkline: [3, 4, 2, 5, 3, 4, 3],
    historicalOccurrences: 5,
    confidence: 0.78,
  },
];

// Seeded LLM usage
const INITIAL_LLM_USAGE: LLMUsageRecord[] = [
  {
    id: 'llm_1',
    timestamp: '2026-10-28T16:00:12Z',
    model: 'gemini-2.5-flash',
    agentNode: 'pii_redactor',
    promptTokens: 4200,
    completionTokens: 610,
    estimatedCostUSD: 0.00062,
  },
  {
    id: 'llm_2',
    timestamp: '2026-10-28T16:00:25Z',
    model: 'gemini-2.5-flash',
    agentNode: 'aspect_sentiment_extractor',
    promptTokens: 6850,
    completionTokens: 1240,
    estimatedCostUSD: 0.00114,
  },
  {
    id: 'llm_3',
    timestamp: '2026-10-28T16:00:40Z',
    model: 'gemini-2.5-pro',
    agentNode: 'action_synthesis_ranker',
    promptTokens: 8900,
    completionTokens: 2100,
    estimatedCostUSD: 0.0142,
  },
];

// Seeded Audit Log
const INITIAL_AUDIT: AuditRecord[] = [
  {
    id: 'aud_1',
    orgId: 'org_abc_college',
    timestamp: '2026-10-28T09:00:00Z',
    actorName: 'Rajesh Sharma',
    actorRole: 'Mess Manager',
    action: 'action.approve',
    entityType: 'Action',
    entityId: 'act_4',
    details: 'Approved ranked action #4 and dispatched Task task_seeded_1 to Head Cook.',
  },
  {
    id: 'aud_2',
    orgId: 'org_abc_college',
    timestamp: '2026-10-28T14:15:00Z',
    actorName: 'System Trigger',
    actorRole: 'System',
    action: 'alerts.create',
    entityType: 'Alert',
    entityId: 'alt_1',
    details: 'Critical alert triggered by keyword "insect" in diner feedback.',
  },
  {
    id: 'aud_3',
    orgId: 'org_abc_college',
    timestamp: '2026-10-29T07:22:00Z',
    actorName: 'Muthu Kumar (Head Chef)',
    actorRole: 'Head Cook / Kitchen Lead',
    action: 'task.complete',
    entityType: 'Task',
    entityId: 'task_seeded_2',
    details: 'Completed morning temperature logbook with photo verification.',
  },
];

// Persistent state class simulating the full backend & database
class ApiStorageService {
  private orgs: Organization[] = DEFAULT_ORGS;
  private roles: RoleDefinition[] = INITIAL_ROLES;
  private users: User[] = DEMO_USERS;
  private currentUserId: string = 'user_manager';
  private activeOrgId: string = 'org_abc_college';

  private feedback: FeedbackItem[] = INITIAL_FEEDBACK;
  private alerts: AlertItem[] = INITIAL_ALERTS;
  private actions: ActionItem[] = INITIAL_ACTIONS;
  private tasks: TaskItem[] = INITIAL_TASKS;
  private youSaidWeDid: YouSaidWeDidItem[] = INITIAL_YOU_SAID_WE_DID;
  private systems: StationSystemMetric[] = INITIAL_SYSTEMS;
  private schedule: ScheduleItem[] = INITIAL_SCHEDULE;
  private weeklyPlan: WeeklyPlanDay[] = INITIAL_WEEKLY_PLAN;
  private forecasts: ForecastItem[] = INITIAL_FORECASTS;
  private llmUsage: LLMUsageRecord[] = INITIAL_LLM_USAGE;
  private audit: AuditRecord[] = INITIAL_AUDIT;

  private pipelineRunning: boolean = false;
  private pipelineEvents: PipelineProgressEvent[] = [
    { nodeId: 'node_1', nodeName: 'Ingest Raw Feedback', status: 'completed', startedAt: '16:00:00', finishedAt: '16:00:05', message: 'Ingested 142 new feedback submissions across 3 locations', itemsProcessed: 142 },
    { nodeId: 'node_2', nodeName: 'Multi-Language PII Redaction', status: 'completed', startedAt: '16:00:06', finishedAt: '16:00:18', message: 'Redacted student roll numbers and names across EN, HI, TA', itemsProcessed: 142 },
    { nodeId: 'node_3', nodeName: 'Aspect & Sentiment Extraction', status: 'completed', startedAt: '16:00:19', finishedAt: '16:00:32', message: 'Extracted 380 aspect-sentiment tuples (Taste, Temp, Hygiene)', itemsProcessed: 380 },
    { nodeId: 'node_4', nodeName: 'Topic Clustering & Frequency Engine', status: 'completed', startedAt: '16:00:33', finishedAt: '16:00:44', message: 'Clustered complaints into 6 recurring operational themes', itemsProcessed: 6 },
    { nodeId: 'node_5', nodeName: 'Historical Risk Forecast Model', status: 'completed', startedAt: '16:00:45', finishedAt: '16:00:52', message: 'Calculated Poisson frequency forecast and backtest confidence', itemsProcessed: 4 },
    { nodeId: 'node_6', nodeName: 'Action Synthesis & Scoring', status: 'completed', startedAt: '16:00:53', finishedAt: '16:01:05', message: 'Ranked 4 high-leverage actions with composite severity multipliers', itemsProcessed: 4 },
    { nodeId: 'node_7', nodeName: 'Pause for Manager Approval', status: 'paused', startedAt: '16:01:06', message: 'Pipeline paused: awaiting human-in-the-loop review by Mess Manager', itemsProcessed: 4 },
  ];

  constructor() {
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage() {
    try {
      const data = {
        orgs: this.orgs,
        roles: this.roles,
        currentUserId: this.currentUserId,
        activeOrgId: this.activeOrgId,
        feedback: this.feedback,
        alerts: this.alerts,
        actions: this.actions,
        tasks: this.tasks,
        youSaidWeDid: this.youSaidWeDid,
        systems: this.systems,
        schedule: this.schedule,
        weeklyPlan: this.weeklyPlan,
        forecasts: this.forecasts,
        llmUsage: this.llmUsage,
        audit: this.audit,
      };
      localStorage.setItem('canteen_ops_storage_v1', JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  private loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('canteen_ops_storage_v1');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.orgs) this.orgs = data.orgs;
        if (data.roles) this.roles = data.roles;
        if (data.currentUserId) this.currentUserId = data.currentUserId;
        if (data.activeOrgId) this.activeOrgId = data.activeOrgId;
        if (data.feedback) this.feedback = data.feedback;
        if (data.alerts) this.alerts = data.alerts;
        if (data.actions) this.actions = data.actions;
        if (data.tasks) this.tasks = data.tasks;
        if (data.youSaidWeDid) this.youSaidWeDid = data.youSaidWeDid;
        if (data.systems) this.systems = data.systems;
        if (data.schedule) this.schedule = data.schedule;
        if (data.weeklyPlan) this.weeklyPlan = data.weeklyPlan;
        if (data.forecasts) this.forecasts = data.forecasts;
        if (data.llmUsage) this.llmUsage = data.llmUsage;
        if (data.audit) this.audit = data.audit;
      }
    } catch {
      // ignore
    }
  }

  // --- Auth & Session ---
  public getMe(): { user: User; activeOrg: Organization; roles: RoleDefinition[]; permissions: PermissionKey[] } {
    const user = this.users.find(u => u.id === this.currentUserId) || this.users[0];
    const activeOrg = this.orgs.find(o => o.id === this.activeOrgId) || this.orgs[0];
    const roleDef = this.roles.find(r => r.id === user.roleId) || this.roles[0];
    return {
      user,
      activeOrg,
      roles: this.roles,
      permissions: roleDef.permissions,
    };
  }

  public can(permission: PermissionKey): boolean {
    const { permissions } = this.getMe();
    return permissions.includes(permission);
  }

  public switchUser(userId: string) {
    const found = this.users.find(u => u.id === userId);
    if (found) {
      this.currentUserId = userId;
      this.saveToLocalStorage();
    }
  }

  public switchOrg(orgId: string) {
    const found = this.orgs.find(o => o.id === orgId);
    if (found) {
      this.activeOrgId = orgId;
      this.saveToLocalStorage();
    }
  }

  public getOrganizations(): Organization[] {
    return this.orgs;
  }

  public getDemoUsers(): User[] {
    return this.users;
  }

  public createOrganization(newOrg: Organization, adminEmail: string): Organization {
    this.orgs.push(newOrg);
    this.activeOrgId = newOrg.id;
    this.audit.unshift({
      id: `aud_${Date.now()}`,
      orgId: newOrg.id,
      timestamp: new Date().toISOString(),
      actorName: 'Admin Wizard',
      actorRole: 'System Admin',
      action: 'org.create',
      entityType: 'Organization',
      entityId: newOrg.id,
      details: `Created new organization "${newOrg.name}" (${newOrg.type}) with ${newOrg.locations.length} locations.`,
    });
    this.saveToLocalStorage();
    return newOrg;
  }

  // --- Roles & Matrix ---
  public getRoles(): RoleDefinition[] {
    return this.roles;
  }

  public updateRolePermissions(roleId: string, permissions: PermissionKey[]) {
    if (!this.can('roles.manage')) {
      throw new Error('403 Forbidden: Missing roles.manage permission');
    }
    const role = this.roles.find(r => r.id === roleId);
    if (role) {
      role.permissions = permissions;
      this.audit.unshift({
        id: `aud_${Date.now()}`,
        orgId: this.activeOrgId,
        timestamp: new Date().toISOString(),
        actorName: this.getMe().user.name,
        actorRole: this.getMe().user.roleName,
        action: 'roles.update_permissions',
        entityType: 'RoleDefinition',
        entityId: roleId,
        details: `Updated permissions for ${role.name}: ${permissions.join(', ')}`,
      });
      this.saveToLocalStorage();
    }
  }

  public createRole(name: string, description: string, permissions: PermissionKey[]): RoleDefinition {
    if (!this.can('roles.manage')) {
      throw new Error('403 Forbidden: Missing roles.manage permission');
    }
    const newRole: RoleDefinition = {
      id: `role_${Date.now()}`,
      name,
      description,
      permissions,
      isCustom: true,
    };
    this.roles.push(newRole);
    this.audit.unshift({
      id: `aud_${Date.now()}`,
      orgId: this.activeOrgId,
      timestamp: new Date().toISOString(),
      actorName: this.getMe().user.name,
      actorRole: this.getMe().user.roleName,
      action: 'roles.create',
      entityType: 'RoleDefinition',
      entityId: newRole.id,
      details: `Created custom role "${name}"`,
    });
    this.saveToLocalStorage();
    return newRole;
  }

  // --- Dashboard & Analytics ---
  public getAnalysisSummary() {
    if (!this.can('dashboard.view')) {
      return {
        satisfactionScore: 0,
        targetScore: 0,
        rankingPercentile: 0,
        totalFeedbackWeek: 0,
        feedbackWoWDelta: 0,
        complaintsWoWDelta: 0,
        openAlertsCount: 0,
        pendingActionsCount: 0,
        sentimentTrend: [],
        complaintsByCategory: [],
      };
    }
    return {
      satisfactionScore: 77,
      targetScore: 84,
      rankingPercentile: 91,
      totalFeedbackWeek: 1420,
      feedbackWoWDelta: 18.4,
      complaintsWoWDelta: -14.2,
      openAlertsCount: this.alerts.filter(a => !a.acknowledged).length,
      pendingActionsCount: this.actions.filter(a => a.status === 'pending').length,
      sentimentTrend: [
        { date: 'Oct 23', positive: 74, neutral: 14, negative: 12 },
        { date: 'Oct 24', positive: 76, neutral: 12, negative: 12 },
        { date: 'Oct 25', positive: 71, neutral: 15, negative: 14 },
        { date: 'Oct 26', positive: 78, neutral: 11, negative: 11 },
        { date: 'Oct 27', positive: 73, neutral: 13, negative: 14 },
        { date: 'Oct 28', positive: 79, neutral: 12, negative: 9 },
        { date: 'Oct 29', positive: 81, neutral: 11, negative: 8 },
      ],
      complaintsByCategory: [
        { category: 'Food Temperature', count: 48, deltaPercent: -12 },
        { category: 'Seasoning & Salt', count: 39, deltaPercent: +8 },
        { category: 'Service Speed', count: 31, deltaPercent: -6 },
        { category: 'Hygiene & Cleanliness', count: 18, deltaPercent: -22 },
        { category: 'Menu Variety', count: 12, deltaPercent: 0 },
      ],
    };
  }

  public getStationSystems(): StationSystemMetric[] {
    return this.systems;
  }

  public getTodaySchedule(): ScheduleItem[] {
    return this.schedule;
  }

  public getWeeklyPlan(): WeeklyPlanDay[] {
    return this.weeklyPlan;
  }

  public addScheduleItem(item: Omit<ScheduleItem, 'id'>): ScheduleItem {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch_${Date.now()}`,
    };
    this.schedule.unshift(newItem);
    this.saveToLocalStorage();
    return newItem;
  }

  // --- Actions Board ---
  public getActions(statusFilter?: string): ActionItem[] {
    if (!this.can('action.approve') && !this.can('dashboard.view')) {
      return [];
    }
    if (statusFilter && statusFilter !== 'all') {
      return this.actions.filter(a => a.status === statusFilter);
    }
    return this.actions;
  }

  public getActionById(id: string): ActionItem | undefined {
    return this.actions.find(a => a.id === id);
  }

  public approveAction(id: string, note?: string): { action: ActionItem; createdTask: TaskItem } {
    if (!this.can('action.approve')) {
      throw new Error('403 Forbidden: Missing action.approve permission');
    }
    const act = this.actions.find(a => a.id === id);
    if (!act) throw new Error('Action not found');

    act.status = 'approved';
    act.approvalNote = note || 'Approved by Mess Manager';
    act.approvedBy = this.getMe().user.name;
    act.approvedAt = new Date().toISOString();

    // Auto-create corresponding task!
    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      orgId: this.activeOrgId,
      actionId: act.id,
      title: `Execute: ${act.issue}`,
      description: `${act.recommendation}${note ? ` (Manager Note: "${note}")` : ''}`,
      assignedRole: act.ownerRole,
      location: 'Central Dining Hall',
      priority: act.riskLevel,
      isOverdue: false,
      dueDate: act.dueDate,
      status: 'pending',
    };
    this.tasks.unshift(newTask);
    act.resultingTaskId = newTask.id;

    // Log to audit
    this.audit.unshift({
      id: `aud_${Date.now()}`,
      orgId: this.activeOrgId,
      timestamp: new Date().toISOString(),
      actorName: this.getMe().user.name,
      actorRole: this.getMe().user.roleName,
      action: 'action.approve',
      entityType: 'Action',
      entityId: act.id,
      details: `Approved action "${act.issue}". Auto-generated task "${newTask.title}" for ${act.ownerRole}.`,
    });

    this.saveToLocalStorage();
    return { action: act, createdTask: newTask };
  }

  public rejectAction(id: string, note?: string): ActionItem {
    if (!this.can('action.approve')) {
      throw new Error('403 Forbidden: Missing action.approve permission');
    }
    const act = this.actions.find(a => a.id === id);
    if (!act) throw new Error('Action not found');
    act.status = 'rejected';
    act.approvalNote = note || 'Rejected by Manager';

    this.audit.unshift({
      id: `aud_${Date.now()}`,
      orgId: this.activeOrgId,
      timestamp: new Date().toISOString(),
      actorName: this.getMe().user.name,
      actorRole: this.getMe().user.roleName,
      action: 'action.reject',
      entityType: 'Action',
      entityId: act.id,
      details: `Rejected action "${act.issue}". Note: ${note || 'None'}`,
    });

    this.saveToLocalStorage();
    return act;
  }

  public bulkApproveTop3(): { approvedCount: number } {
    if (!this.can('action.approve')) {
      throw new Error('403 Forbidden: Missing action.approve permission');
    }
    const pendingTop3 = this.actions.filter(a => a.status === 'pending').slice(0, 3);
    for (const act of pendingTop3) {
      this.approveAction(act.id, 'Bulk approved during morning review');
    }
    return { approvedCount: pendingTop3.length };
  }

  // --- Tasks ---
  public getTasks(todayOnly: boolean = false): TaskItem[] {
    if (!this.can('task.view')) {
      return [];
    }
    const user = this.getMe().user;
    let list = this.tasks.filter(t => t.orgId === this.activeOrgId);

    // If caller is Head Cook, only show tasks matching their role or unassigned
    if (user.roleId === 'role_head_cook') {
      list = list.filter(t => t.assignedRole.toLowerCase().includes('cook') || t.assignedRole.toLowerCase().includes('kitchen'));
    }

    if (todayOnly) {
      list = list.filter(t => t.dueDate.toLowerCase().includes('today') || t.dueDate.toLowerCase().includes('yesterday'));
    }

    return list;
  }

  public completeTask(taskId: string, note: string, photoUrl?: string): TaskItem {
    if (!this.can('task.complete')) {
      throw new Error('403 Forbidden: Missing task.complete permission');
    }
    const t = this.tasks.find(item => item.id === taskId);
    if (!t) throw new Error('Task not found');

    t.status = 'completed';
    t.completedAt = new Date().toISOString();
    t.completedBy = this.getMe().user.name;
    t.completionNote = note;
    if (photoUrl) {
      t.photoUrl = photoUrl;
    }

    this.audit.unshift({
      id: `aud_${Date.now()}`,
      orgId: this.activeOrgId,
      timestamp: new Date().toISOString(),
      actorName: this.getMe().user.name,
      actorRole: this.getMe().user.roleName,
      action: 'task.complete',
      entityType: 'Task',
      entityId: t.id,
      details: `Completed task "${t.title}". Note: "${note}". Photo attached: ${!!photoUrl}`,
    });

    this.saveToLocalStorage();
    return t;
  }

  // --- Alerts ---
  public getAlerts(): AlertItem[] {
    if (!this.can('alerts.receive')) {
      return [];
    }
    return this.alerts.filter(a => a.orgId === this.activeOrgId);
  }

  public ackAlert(id: string): AlertItem {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) throw new Error('Alert not found');
    alert.acknowledged = true;
    alert.ackBy = this.getMe().user.name;
    alert.ackAt = new Date().toISOString();

    this.audit.unshift({
      id: `aud_${Date.now()}`,
      orgId: this.activeOrgId,
      timestamp: new Date().toISOString(),
      actorName: this.getMe().user.name,
      actorRole: this.getMe().user.roleName,
      action: 'alerts.acknowledge',
      entityType: 'Alert',
      entityId: alert.id,
      details: `Acknowledged critical alert: "${alert.title}"`,
    });

    this.saveToLocalStorage();
    return alert;
  }

  // --- Forecast ---
  public getForecast(): ForecastItem[] {
    if (!this.can('forecast.view')) {
      return [];
    }
    return this.forecasts;
  }

  public getBacktestSummary() {
    if (!this.can('forecast.view')) {
      return {
        precisionHighRisk: 0,
        recallHighRisk: 0,
        baselineAccuracy: 0,
        evaluatedPeriodsCount: 0,
        caption: 'Risk levels are based on counted history, not guesses.',
      };
    }
    return {
      precisionHighRisk: 87.5,
      recallHighRisk: 92.1,
      baselineAccuracy: 54.0,
      evaluatedPeriodsCount: 16,
      caption: 'Risk levels are based on counted history, not guesses.',
    };
  }

  // --- Public Endpoints ---
  public getPublicYouSaidWeDid(orgSlug?: string): YouSaidWeDidItem[] {
    const org = this.orgs.find(o => o.slug === orgSlug) || this.orgs[0];
    return this.youSaidWeDid.filter(y => y.orgId === org.id);
  }

  public submitPublicFeedback(data: {
    orgSlug: string;
    rating: number;
    tags: string[];
    meal: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
    item: string;
    location: string;
    comment: string;
    isAnonymous: boolean;
    honeypot?: string;
  }): { success: boolean; message: string; feedbackId: string } {
    if (data.honeypot) {
      // Spam honeypot caught!
      return { success: false, message: 'Invalid submission', feedbackId: '' };
    }

    const org = this.orgs.find(o => o.slug === data.orgSlug) || this.orgs[0];

    const newFb: FeedbackItem = {
      id: `fb_${Date.now()}`,
      orgId: org.id,
      timestamp: new Date().toISOString(),
      rating: data.rating,
      tags: data.tags,
      meal: data.meal,
      item: data.item,
      location: data.location || org.locations[0],
      comment: data.comment,
      isAnonymous: data.isAnonymous,
      sentiment: data.rating >= 4 ? 'positive' : data.rating === 3 ? 'neutral' : 'negative',
      sentimentScore: data.rating / 5,
    };
    this.feedback.unshift(newFb);

    // Check alert keywords!
    const commentLower = data.comment.toLowerCase();
    let triggeredAlert = false;
    for (const lang of Object.keys(org.alertKeywords)) {
      for (const kw of org.alertKeywords[lang]) {
        if (commentLower.includes(kw.toLowerCase())) {
          triggeredAlert = true;
          this.alerts.unshift({
            id: `alt_${Date.now()}`,
            orgId: org.id,
            timestamp: new Date().toISOString(),
            title: `Keyword Alert Triggered: "${kw}"`,
            description: `Diner feedback contains alert keyword "${kw}" in ${data.meal} submission.`,
            severity: 'CRITICAL',
            category: 'Hygiene & Cleanliness',
            keywordMatch: kw,
            feedbackId: newFb.id,
            acknowledged: false,
          });
          break;
        }
      }
      if (triggeredAlert) break;
    }

    this.saveToLocalStorage();
    return {
      success: true,
      message: 'Feedback received! Thank you for helping improve our mess.',
      feedbackId: newFb.id,
    };
  }

  // --- Pipeline ---
  public getPipelineProgress(): PipelineProgressEvent[] {
    return this.pipelineEvents;
  }

  public runPipeline(): Promise<PipelineProgressEvent[]> {
    if (!this.can('settings.edit') && !this.can('action.approve')) {
      throw new Error('403 Forbidden: Insufficient permissions to trigger pipeline');
    }
    this.pipelineRunning = true;

    // Reset status to running
    this.pipelineEvents = [
      { nodeId: 'node_1', nodeName: 'Ingest Raw Feedback', status: 'running', startedAt: new Date().toLocaleTimeString(), message: 'Ingesting 156 new feedback submissions...', itemsProcessed: 156 },
      { nodeId: 'node_2', nodeName: 'Multi-Language PII Redaction', status: 'pending', startedAt: '', message: 'Queued for EN/HI/TA text normalization' },
      { nodeId: 'node_3', nodeName: 'Aspect & Sentiment Extraction', status: 'pending', startedAt: '', message: 'Queued for aspect extraction' },
      { nodeId: 'node_4', nodeName: 'Topic Clustering & Frequency Engine', status: 'pending', startedAt: '', message: 'Queued for clustering' },
      { nodeId: 'node_5', nodeName: 'Historical Risk Forecast Model', status: 'pending', startedAt: '', message: 'Queued for Poisson regression' },
      { nodeId: 'node_6', nodeName: 'Action Synthesis & Scoring', status: 'pending', startedAt: '', message: 'Queued for rank synthesis' },
      { nodeId: 'node_7', nodeName: 'Pause for Manager Approval', status: 'pending', startedAt: '', message: 'Queued for human approval checkpoint' },
    ];

    this.audit.unshift({
      id: `aud_${Date.now()}`,
      orgId: this.activeOrgId,
      timestamp: new Date().toISOString(),
      actorName: this.getMe().user.name,
      actorRole: this.getMe().user.roleName,
      action: 'pipeline.trigger',
      entityType: 'Pipeline',
      entityId: `run_${Date.now()}`,
      details: 'Triggered full multi-agent feedback pipeline run.',
    });

    this.saveToLocalStorage();

    return new Promise(resolve => {
      setTimeout(() => {
        // Complete node 1 & 2
        this.pipelineEvents[0].status = 'completed';
        this.pipelineEvents[0].finishedAt = new Date().toLocaleTimeString();
        this.pipelineEvents[1].status = 'running';
        this.pipelineEvents[1].startedAt = new Date().toLocaleTimeString();

        setTimeout(() => {
          this.pipelineEvents[1].status = 'completed';
          this.pipelineEvents[1].finishedAt = new Date().toLocaleTimeString();
          this.pipelineEvents[2].status = 'completed';
          this.pipelineEvents[3].status = 'completed';
          this.pipelineEvents[4].status = 'completed';
          this.pipelineEvents[5].status = 'completed';
          this.pipelineEvents[6].status = 'paused';
          this.pipelineEvents[6].startedAt = new Date().toLocaleTimeString();
          this.pipelineRunning = false;

          // Add LLM record
          this.llmUsage.unshift({
            id: `llm_${Date.now()}`,
            timestamp: new Date().toISOString(),
            model: 'gemini-2.5-flash',
            agentNode: 'multi_agent_pipeline_full',
            promptTokens: 18450,
            completionTokens: 3820,
            estimatedCostUSD: 0.0084,
          });

          this.saveToLocalStorage();
          resolve(this.pipelineEvents);
        }, 1200);
      }, 800);
    });
  }

  public getLLMUsage(): LLMUsageRecord[] {
    return this.llmUsage;
  }

  public getAuditLog(filter?: string): AuditRecord[] {
    if (!this.can('audit.view')) {
      return [];
    }
    if (filter) {
      const q = filter.toLowerCase();
      return this.audit.filter(a => a.actorName.toLowerCase().includes(q) || a.action.toLowerCase().includes(q) || a.details.toLowerCase().includes(q));
    }
    return this.audit;
  }
}

export const api = new ApiStorageService();
