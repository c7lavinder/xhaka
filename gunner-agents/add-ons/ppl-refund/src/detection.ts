/**
 * PPL Refund Bot - Detection Engine (v2)
 * 
 * Fully automated detection with 3 core checks:
 * 1. Property Type (Day 0) - Must be single family
 * 2. MLS Status (Day 0) - Must NOT be listed
 * 3. No Response (Day 4) - 3+ calls, 2+ SMS, no reply
 */

import {
  PPLPlatform,
  PPLLead,
  DisputeReason,
  DetectedDispute,
  Evidence,
  CallLog,
  SMSLog,
  TenantConfig,
} from './types';

// Platform identification patterns
const PLATFORM_PATTERNS: Record<PPLPlatform, RegExp[]> = {
  leadzolo: [/leadzolo/i, /lead\s*zolo/i],
  motivatedsellers: [/motivatedsellers/i, /motivated\s*sellers/i, /msl/i],
  propertyleads: [/propertyleads/i, /property\s*leads/i],
};

// Dispute windows by platform (days)
const DISPUTE_WINDOWS: Record<PPLPlatform, number> = {
  leadzolo: 7,
  motivatedsellers: 10,
  propertyleads: 7,
};

// Valid single family property types
const VALID_PROPERTY_TYPES = [
  'single family',
  'single-family',
  'sfr',
  'house',
  'residential',
  'detached',
];

// Invalid property types that trigger dispute
const INVALID_PROPERTY_TYPES = [
  'mobile home',
  'manufactured',
  'mobile',
  'trailer',
  'vacant land',
  'land',
  'lot',
  'commercial',
  'multi-family',
  'multifamily',
  'duplex',
  'triplex',
  'apartment',
  'condo',
  'townhome',
  'townhouse',
];

export class DetectionEngine {
  private config: TenantConfig;

  constructor(config: TenantConfig) {
    this.config = config;
  }

  /**
   * Identify which PPL platform a lead came from
   */
  identifyPlatform(lead: { source: string }): PPLPlatform | null {
    for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(lead.source)) {
          return platform as PPLPlatform;
        }
      }
    }
    return null;
  }

  /**
   * Check if a lead is eligible for dispute (within window)
   */
  isWithinDisputeWindow(lead: PPLLead): boolean {
    const window = DISPUTE_WINDOWS[lead.platform];
    const daysSince = this.daysSince(lead.receivedAt);
    return daysSince <= window;
  }

  /**
   * Get days remaining in dispute window
   */
  getDaysRemaining(lead: PPLLead): number {
    const window = DISPUTE_WINDOWS[lead.platform];
    const daysSince = this.daysSince(lead.receivedAt);
    return Math.max(0, window - daysSince);
  }

  // ============================================
  // CORE CHECK #1: Property Type (Day 0)
  // ============================================
  
  /**
   * Check if property type is valid (single family)
   * Returns dispute reason if NOT valid
   */
  async checkPropertyType(lead: PPLLead): Promise<DetectionResult | null> {
    const propertyType = lead.propertyType?.toLowerCase() || '';
    
    // Check if it's an invalid type
    for (const invalidType of INVALID_PROPERTY_TYPES) {
      if (propertyType.includes(invalidType)) {
        return {
          reason: 'wrong_property_type',
          details: `Invalid property type: "${lead.propertyType}". Not single family residential.`,
          confidence: 'high',
          autoFile: true,
        };
      }
    }

    // If property type is empty, try to enrich from external source
    if (!propertyType) {
      const enrichedType = await this.enrichPropertyType(lead.address, lead.city, lead.state);
      if (enrichedType) {
        for (const invalidType of INVALID_PROPERTY_TYPES) {
          if (enrichedType.toLowerCase().includes(invalidType)) {
            return {
              reason: 'wrong_property_type',
              details: `Invalid property type (from records): "${enrichedType}". Not single family residential.`,
              confidence: 'high',
              autoFile: true,
            };
          }
        }
      }
    }

    return null; // Property type is valid or unknown
  }

  /**
   * Enrich property type from external sources
   */
  private async enrichPropertyType(address: string, city: string, state: string): Promise<string | null> {
    // TODO: Integrate with property data API (Zillow, county records, etc.)
    // For now, return null - will be implemented with actual API
    console.log(`[PropertyEnrich] Would query: ${address}, ${city}, ${state}`);
    return null;
  }

  // ============================================
  // CORE CHECK #2: MLS Status (Day 0)
  // ============================================

  /**
   * Check if property is listed on MLS
   * Returns dispute reason if listed
   */
  async checkMLSStatus(lead: PPLLead): Promise<DetectionResult | null> {
    const mlsListing = await this.queryMLSStatus(lead.address, lead.city, lead.state, lead.zip);
    
    if (mlsListing.isListed) {
      return {
        reason: 'mls_listed',
        details: `Property is actively listed on MLS. ${mlsListing.listingUrl ? `Listing: ${mlsListing.listingUrl}` : ''}`,
        confidence: 'high',
        autoFile: true,
        evidence: {
          mlsUrl: mlsListing.listingUrl,
          listPrice: mlsListing.listPrice,
          daysOnMarket: mlsListing.daysOnMarket,
        },
      };
    }

    return null; // Not listed on MLS
  }

  /**
   * Query MLS/Zillow/Redfin for active listing
   */
  private async queryMLSStatus(address: string, city: string, state: string, zip?: string): Promise<MLSResult> {
    // TODO: Integrate with Zillow API, Redfin API, or MLS data provider
    // For now, return mock - will be implemented with actual API
    
    console.log(`[MLSCheck] Would query: ${address}, ${city}, ${state} ${zip || ''}`);
    
    // Placeholder - in production, this would call real APIs
    return {
      isListed: false,
      listingUrl: null,
      listPrice: null,
      daysOnMarket: null,
    };
  }

  // ============================================
  // CORE CHECK #3: No Response (Day 4)
  // ============================================

  /**
   * Check if lead is unresponsive after sufficient contact attempts
   * Triggers on Day 4: 3+ calls AND 2+ SMS AND 0 responses
   */
  checkNoResponse(lead: PPLLead, callLogs: CallLog[], smsLogs: SMSLog[]): DetectionResult | null {
    const daysSinceReceived = this.daysSince(lead.receivedAt);
    
    // Only check on Day 4+
    if (daysSinceReceived < 4) {
      return null;
    }

    // Count outbound attempts
    const outboundCalls = callLogs.filter(c => c.direction === 'outbound');
    const outboundSMS = smsLogs.filter(s => s.direction === 'outbound');
    
    // Count any responses
    const inboundCalls = callLogs.filter(c => c.direction === 'inbound');
    const inboundSMS = smsLogs.filter(s => s.direction === 'inbound');
    const answeredCalls = callLogs.filter(c => c.outcome === 'answered' || c.outcome === 'connected');
    
    const totalResponses = inboundCalls.length + inboundSMS.length + answeredCalls.length;

    // Check thresholds: 3+ calls AND 2+ SMS AND 0 responses
    if (outboundCalls.length >= 3 && outboundSMS.length >= 2 && totalResponses === 0) {
      return {
        reason: 'no_response',
        details: `No response after ${outboundCalls.length} calls and ${outboundSMS.length} texts over ${daysSinceReceived} days.`,
        confidence: 'high',
        autoFile: true,
        evidence: {
          callAttempts: outboundCalls.length,
          smsAttempts: outboundSMS.length,
          daysSinceReceived,
          responses: 0,
        },
      };
    }

    return null;
  }

  // ============================================
  // MAIN DETECTION RUNNER
  // ============================================

  /**
   * Run all checks on a lead (called when lead arrives and daily)
   */
  async runAllChecks(
    lead: PPLLead,
    callLogs: CallLog[],
    smsLogs: SMSLog[]
  ): Promise<DetectedDispute | null> {
    
    // Check 1: Property Type (immediate)
    const propertyTypeIssue = await this.checkPropertyType(lead);
    if (propertyTypeIssue) {
      return this.createDispute(lead, propertyTypeIssue, callLogs, smsLogs);
    }

    // Check 2: MLS Status (immediate)
    const mlsIssue = await this.checkMLSStatus(lead);
    if (mlsIssue) {
      return this.createDispute(lead, mlsIssue, callLogs, smsLogs);
    }

    // Check 3: No Response (Day 4+)
    const noResponseIssue = this.checkNoResponse(lead, callLogs, smsLogs);
    if (noResponseIssue) {
      return this.createDispute(lead, noResponseIssue, callLogs, smsLogs);
    }

    return null; // No issues detected
  }

  /**
   * Run immediate checks only (on lead arrival)
   */
  async runImmediateChecks(lead: PPLLead): Promise<DetectedDispute | null> {
    // Check 1: Property Type
    const propertyTypeIssue = await this.checkPropertyType(lead);
    if (propertyTypeIssue) {
      return this.createDispute(lead, propertyTypeIssue, [], []);
    }

    // Check 2: MLS Status
    const mlsIssue = await this.checkMLSStatus(lead);
    if (mlsIssue) {
      return this.createDispute(lead, mlsIssue, [], []);
    }

    return null;
  }

  /**
   * Run delayed checks only (daily cron for Day 4+ leads)
   */
  runDelayedChecks(
    lead: PPLLead,
    callLogs: CallLog[],
    smsLogs: SMSLog[]
  ): DetectedDispute | null {
    const noResponseIssue = this.checkNoResponse(lead, callLogs, smsLogs);
    if (noResponseIssue) {
      return this.createDispute(lead, noResponseIssue, callLogs, smsLogs);
    }

    return null;
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Create dispute object from detection result
   */
  private createDispute(
    lead: PPLLead,
    result: DetectionResult,
    callLogs: CallLog[],
    smsLogs: SMSLog[]
  ): DetectedDispute {
    const evidence = this.buildEvidence(lead, callLogs, smsLogs, result.evidence);
    const daysRemaining = this.getDaysRemaining(lead);

    return {
      id: `dispute_${lead.id}_${Date.now()}`,
      tenantId: this.config.tenantId,
      lead,
      reason: result.reason,
      reasonDetails: result.details,
      confidence: result.confidence,
      evidence,
      deadline: new Date(lead.receivedAt.getTime() + DISPUTE_WINDOWS[lead.platform] * 24 * 60 * 60 * 1000),
      daysRemaining,
      status: result.autoFile ? 'ready_to_file' : 'queued',
      detectedAt: new Date(),
    };
  }

  /**
   * Build evidence package
   */
  private buildEvidence(
    lead: PPLLead,
    callLogs: CallLog[],
    smsLogs: SMSLog[],
    additionalEvidence?: Record<string, unknown>
  ): Evidence {
    const outboundCalls = callLogs.filter(c => c.direction === 'outbound');
    const outboundSMS = smsLogs.filter(s => s.direction === 'outbound');
    const inboundResponses = [
      ...callLogs.filter(c => c.direction === 'inbound'),
      ...smsLogs.filter(s => s.direction === 'inbound'),
    ];

    const allAttempts = [...callLogs, ...smsLogs].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    return {
      callLogs,
      smsLogs,
      notes: [],
      totalCallAttempts: outboundCalls.length,
      totalSMSSent: outboundSMS.length,
      totalResponses: inboundResponses.length,
      firstContactAttempt: allAttempts[0]?.timestamp,
      lastContactAttempt: allAttempts[allAttempts.length - 1]?.timestamp,
      daysSinceReceived: this.daysSince(lead.receivedAt),
      ...additionalEvidence,
    };
  }

  /**
   * Calculate days since a date
   */
  private daysSince(date: Date): number {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (24 * 60 * 60 * 1000));
  }
}

interface DetectionResult {
  reason: DisputeReason;
  details: string;
  confidence: 'high' | 'medium' | 'low';
  autoFile: boolean;
  evidence?: Record<string, unknown>;
}

interface MLSResult {
  isListed: boolean;
  listingUrl: string | null;
  listPrice: number | null;
  daysOnMarket: number | null;
}

export default DetectionEngine;
