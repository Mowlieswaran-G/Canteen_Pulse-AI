export type PermissionKey =
  | 'dashboard.view'
  | 'action.approve'
  | 'task.view'
  | 'task.complete'
  | 'forecast.view'
  | 'feedback.submit'
  | 'roles.manage'
  | 'users.manage'
  | 'settings.edit'
  | 'audit.view'
  | 'alerts.receive'
  | 'report.view';

export type UserRole = 'mess_manager' | 'head_cook' | 'student' | 'admin' | 'procurement_lead';

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  avatarUrl?: string;
  location: string;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  type: 'college_mess' | 'corporate_cafeteria' | 'hospital_dining' | 'restaurant_chain';
  locations: string[];
  categories: string[];
  alertKeywords: { [lang: string]: string[] };
  healthRiskCategories: string[];
  severityWeights: {
    healthRisk: number;
    frequency: number;
    severity: number;
    recency: number;
  };
  escalationDays: number;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isCustom?: boolean;
}

export interface FeedbackItem {
  id: string;
  orgId: string;
  timestamp: string;
  rating: number; // 1-5
  tags: string[]; // e.g. 'cold', 'salty', 'stale', 'oily', 'late', 'dirty'
  meal: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  item: string;
  location: string;
  comment: string;
  isAnonymous: boolean;
  language?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number; // 0 to 1
  category?: string;
  redactedComment?: string;
}

export interface StationSystemMetric {
  id: string;
  name: string;
  category: string;
  feedbackCount: number;
  positiveCount: number;
  negativeCount: number;
  percentCorrect: number; // % positive/acceptable
  completedPercent: number; // % of weekly target logs
  trend: 'up' | 'down' | 'steady';
}

export interface ScheduleItem {
  id: string;
  timeRange: string;
  title: string;
  subtitle: string;
  category: string;
  type: 'service' | 'inspection' | 'prep' | 'audit';
  status: 'pending' | 'in_progress' | 'completed';
  assignedRole: string;
}

export interface WeeklyPlanDay {
  date: number; // e.g. 22
  dayName: string; // Mon, Tue, etc.
  isToday?: boolean;
  shifts: {
    id: string;
    title: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'sanitization';
    badgeColor: string;
    status: 'scheduled' | 'active' | 'done';
  }[];
}

export interface AlertItem {
  id: string;
  orgId: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: string;
  keywordMatch: string;
  feedbackId?: string;
  acknowledged: boolean;
  ackBy?: string;
  ackAt?: string;
}

export interface ActionItem {
  id: string;
  orgId: string;
  rank: number;
  issue: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  recommendation: string;
  ownerRole: string;
  effort: 'Low' | 'Medium' | 'High';
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  score: number;
  scoreBreakdown: {
    severityScore: number;
    frequencyScore: number;
    healthRiskMultiplier: number;
    finalCompositeScore: number;
  };
  explanationText: string;
  evidenceItems: {
    quote: string;
    meal: string;
    date: string;
    rating: number;
  }[];
  approvalNote?: string;
  approvedBy?: string;
  approvedAt?: string;
  resultingTaskId?: string;
}

export interface TaskItem {
  id: string;
  orgId: string;
  actionId?: string;
  title: string;
  description: string;
  assignedRole: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  isOverdue: boolean;
  dueDate: string;
  status: 'pending' | 'completed';
  completedAt?: string;
  completedBy?: string;
  completionNote?: string;
  photoUrl?: string;
}

export interface YouSaidWeDidItem {
  id: string;
  orgId: string;
  category: string;
  youSaid: string;
  weDid: string;
  impactMetric: string;
  resolvedDate: string;
  verifiedBy: string;
}

export interface ForecastItem {
  id: string;
  issue: string;
  category: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  likelyDay: string;
  evidenceRationale: string;
  weeklySparkline: number[];
  historicalOccurrences: number;
  confidence: number;
}

export interface PipelineProgressEvent {
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'paused' | 'failed';
  startedAt: string;
  finishedAt?: string;
  message: string;
  itemsProcessed?: number;
}

export interface LLMUsageRecord {
  id: string;
  timestamp: string;
  model: string;
  agentNode: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUSD: number;
}

export interface AuditRecord {
  id: string;
  orgId: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}
