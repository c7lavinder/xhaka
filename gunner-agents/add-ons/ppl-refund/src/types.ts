/**
 * PPL Refund Bot - Type Definitions
 */

// Supported PPL platforms
export type PPLPlatform = 'leadzolo' | 'motivatedsellers' | 'propertyleads';

// Dispute reasons (normalized across platforms)
export type DisputeReason =
  | 'disconnected'
  | 'wrong_number'
  | 'duplicate'
  | 'mls_listed'
  | 'not_owner'
  | 'wholesaler'
  | 'wrong_market'
  | 'wrong_property_type'
  | 'invalid_data'
  | 'no_response'
  | 'other';

// Dispute status
export type DisputeStatus =
  | 'detected'      // Issue identified, not yet filed
  | 'queued'        // Awaiting tenant approval
  | 'filing'        // Currently being filed
  | 'filed'         // Successfully submitted
  | 'pending'       // Under review by provider
  | 'approved'      // Refund granted
  | 'denied'        // Refund rejected
  | 'credited'      // Money returned
  | 'expired'       // Missed deadline
  | 'failed';       // Filing failed

// Platform credentials (stored encrypted)
export interface PlatformCredentials {
  email: string;
  password: string; // Encrypted at rest
}

// Platform session
export interface PlatformSession {
  platform: PPLPlatform;
  cookies: string; // Encrypted
  lastAuth: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'invalid';
}

// Tenant configuration
export interface TenantConfig {
  tenantId: string;
  companyName: string;
  platforms: {
    [K in PPLPlatform]?: {
      enabled: boolean;
      credentials: PlatformCredentials;
      disputeWindow: number; // days
    };
  };
  automation: {
    level: 'full-auto' | 'semi-auto' | 'manual';
    autoFileReasons: DisputeReason[];
    queueReasons: DisputeReason[];
  };
  detection: {
    noResponseDays: number;
    noResponseAttempts: number;
    duplicateWindowDays: number;
  };
  notifications: {
    onFiled: boolean;
    onResolved: boolean;
    weeklyReport: boolean;
    deadlineAlerts: boolean;
  };
}

// Lead from GHL
export interface PPLLead {
  id: string;
  ghlContactId: string;
  platform: PPLPlatform;
  platformLeadId?: string; // ID from PPL provider if known
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  receivedAt: Date;
  cost: number;
  source: string; // Original lead source field
}

// Call log entry from GHL
export interface CallLog {
  timestamp: Date;
  direction: 'inbound' | 'outbound';
  duration: number; // seconds
  outcome: 'answered' | 'no_answer' | 'voicemail' | 'busy' | 'failed' | 'disconnected';
  notes?: string;
}

// SMS log entry from GHL
export interface SMSLog {
  timestamp: Date;
  direction: 'inbound' | 'outbound';
  message: string;
  status: 'delivered' | 'failed' | 'pending';
}

// Evidence package
export interface Evidence {
  callLogs: CallLog[];
  smsLogs: SMSLog[];
  notes: string[];
  totalCallAttempts: number;
  totalSMSSent: number;
  totalResponses: number;
  firstContactAttempt?: Date;
  lastContactAttempt?: Date;
  daysSinceReceived: number;
  additionalInfo?: string;
  attachments?: string[]; // File paths
}

// Detected dispute
export interface DetectedDispute {
  id: string;
  tenantId: string;
  lead: PPLLead;
  reason: DisputeReason;
  reasonDetails: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: Evidence;
  deadline: Date;
  daysRemaining: number;
  status: DisputeStatus;
  detectedAt: Date;
  filedAt?: Date;
  resolvedAt?: Date;
  resolution?: 'approved' | 'denied';
  refundAmount?: number;
  providerResponse?: string;
  filingConfirmation?: string;
}

// Platform-specific reason mapping
export interface PlatformReasonMap {
  platform: PPLPlatform;
  internalReason: DisputeReason;
  platformReason: string; // Exact text/value for dropdown
}

// Form field for automation
export interface FormField {
  name: string;
  selector: string;
  type: 'text' | 'dropdown' | 'textarea' | 'checkbox' | 'file';
  required: boolean;
  value?: string;
}

// Filing result
export interface FilingResult {
  success: boolean;
  disputeId: string;
  platform: PPLPlatform;
  confirmationId?: string;
  confirmationScreenshot?: string;
  error?: string;
  filedAt: Date;
}

// Weekly report
export interface WeeklyReport {
  tenantId: string;
  periodStart: Date;
  periodEnd: Date;
  detected: number;
  filed: number;
  approved: number;
  denied: number;
  pending: number;
  expired: number;
  moneyRecovered: number;
  byPlatform: {
    [K in PPLPlatform]?: {
      filed: number;
      approved: number;
      denied: number;
      recovered: number;
    };
  };
  byReason: {
    [K in DisputeReason]?: number;
  };
  approvalRate: number;
}
