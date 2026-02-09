/**
 * PPL Refund Bot - Detection Engine
 * 
 * Monitors GHL contacts and identifies dispute-eligible PPL leads
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

  /**
   * Analyze a lead and detect any dispute-eligible issues
   */
  detectIssues(
    lead: PPLLead,
    callLogs: CallLog[],
    smsLogs: SMSLog[],
    notes: string[]
  ): DetectedDispute | null {
    // Build evidence
    const evidence = this.buildEvidence(lead, callLogs, smsLogs, notes);

    // Check for various issue types
    const checks = [
      () => this.checkDisconnected(evidence, callLogs),
      () => this.checkWrongNumber(evidence, notes),
      () => this.checkDuplicate(lead, notes),
      () => this.checkInvalidData(lead),
      () => this.checkNoResponse(evidence),
      () => this.checkNotOwner(notes),
      () => this.checkWholesaler(notes),
      () => this.checkMLSListed(notes),
      () => this.checkWrongMarket(lead, notes),
      () => this.checkWrongPropertyType(notes),
    ];

    for (const check of checks) {
      const result = check();
      if (result) {
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
          status: this.determineInitialStatus(result.reason),
          detectedAt: new Date(),
        };
      }
    }

    return null;
  }

  /**
   * Build evidence package from GHL data
   */
  private buildEvidence(
    lead: PPLLead,
    callLogs: CallLog[],
    smsLogs: SMSLog[],
    notes: string[]
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
      notes,
      totalCallAttempts: outboundCalls.length,
      totalSMSSent: outboundSMS.length,
      totalResponses: inboundResponses.length,
      firstContactAttempt: allAttempts[0]?.timestamp,
      lastContactAttempt: allAttempts[allAttempts.length - 1]?.timestamp,
      daysSinceReceived: this.daysSince(lead.receivedAt),
    };
  }

  /**
   * Check for disconnected number
   */
  private checkDisconnected(evidence: Evidence, callLogs: CallLog[]): DetectionResult | null {
    const disconnectedCalls = callLogs.filter(
      c => c.outcome === 'disconnected' || c.outcome === 'failed'
    );

    // If first call was disconnected, high confidence
    if (callLogs.length > 0 && callLogs[0].outcome === 'disconnected') {
      return {
        reason: 'disconnected',
        details: 'Phone number is disconnected. First call attempt resulted in carrier disconnect message.',
        confidence: 'high',
      };
    }

    // If multiple calls disconnected
    if (disconnectedCalls.length >= 2) {
      return {
        reason: 'disconnected',
        details: `Phone number appears disconnected. ${disconnectedCalls.length} calls failed with disconnect message.`,
        confidence: 'high',
      };
    }

    return null;
  }

  /**
   * Check for wrong number
   */
  private checkWrongNumber(evidence: Evidence, notes: string[]): DetectionResult | null {
    const wrongNumberKeywords = [
      'wrong number',
      'wrong person',
      'not them',
      "doesn't live here",
      'never heard of',
      'sold the house',
      'different person',
    ];

    for (const note of notes) {
      const noteLower = note.toLowerCase();
      for (const keyword of wrongNumberKeywords) {
        if (noteLower.includes(keyword)) {
          return {
            reason: 'wrong_number',
            details: `Wrong number confirmed. Notes indicate: "${note.substring(0, 100)}"`,
            confidence: 'high',
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for duplicate lead
   */
  private checkDuplicate(lead: PPLLead, notes: string[]): DetectionResult | null {
    const duplicateKeywords = ['duplicate', 'already have', 'received before', 'same lead'];

    for (const note of notes) {
      const noteLower = note.toLowerCase();
      for (const keyword of duplicateKeywords) {
        if (noteLower.includes(keyword)) {
          return {
            reason: 'duplicate',
            details: 'Duplicate lead. This contact was previously received.',
            confidence: 'high',
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for invalid/fake data
   */
  private checkInvalidData(lead: PPLLead): DetectionResult | null {
    // Check for obviously fake names
    const fakeNamePatterns = [
      /^test/i,
      /^fake/i,
      /^asdf/i,
      /mickey mouse/i,
      /donald trump/i,
      /joe biden/i,
      /john doe/i,
      /jane doe/i,
      /^\d+$/, // All numbers
    ];

    for (const pattern of fakeNamePatterns) {
      if (pattern.test(lead.name)) {
        return {
          reason: 'invalid_data',
          details: `Invalid/fake name detected: "${lead.name}"`,
          confidence: 'high',
        };
      }
    }

    // Check for invalid phone (too short, all same digit)
    const phoneDigits = lead.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return {
        reason: 'invalid_data',
        details: `Invalid phone number: "${lead.phone}" (too short)`,
        confidence: 'high',
      };
    }

    if (/^(\d)\1+$/.test(phoneDigits)) {
      return {
        reason: 'invalid_data',
        details: `Invalid phone number: "${lead.phone}" (fake pattern)`,
        confidence: 'high',
      };
    }

    return null;
  }

  /**
   * Check for no response after configured attempts/days
   */
  private checkNoResponse(evidence: Evidence): DetectionResult | null {
    const { noResponseDays, noResponseAttempts } = this.config.detection;

    if (
      evidence.daysSinceReceived >= noResponseDays &&
      evidence.totalCallAttempts >= noResponseAttempts &&
      evidence.totalResponses === 0
    ) {
      return {
        reason: 'no_response',
        details: `No response after ${evidence.totalCallAttempts} calls and ${evidence.totalSMSSent} texts over ${evidence.daysSinceReceived} days.`,
        confidence: 'medium',
      };
    }

    return null;
  }

  /**
   * Check for not property owner
   */
  private checkNotOwner(notes: string[]): DetectionResult | null {
    const notOwnerKeywords = [
      'not the owner',
      "doesn't own",
      'not property owner',
      'tenant',
      'renter',
      'not on title',
      "can't sell",
    ];

    for (const note of notes) {
      const noteLower = note.toLowerCase();
      for (const keyword of notOwnerKeywords) {
        if (noteLower.includes(keyword)) {
          return {
            reason: 'not_owner',
            details: `Not the property owner. Notes: "${note.substring(0, 100)}"`,
            confidence: 'high',
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for wholesaler
   */
  private checkWholesaler(notes: string[]): DetectionResult | null {
    const wholesalerKeywords = [
      'wholesaler',
      'under contract',
      'assignment',
      'fellow investor',
      'already has buyer',
    ];

    for (const note of notes) {
      const noteLower = note.toLowerCase();
      for (const keyword of wholesalerKeywords) {
        if (noteLower.includes(keyword)) {
          return {
            reason: 'wholesaler',
            details: `Wholesaler lead. Property is under contract with another investor.`,
            confidence: 'high',
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for MLS listed
   */
  private checkMLSListed(notes: string[]): DetectionResult | null {
    const mlsKeywords = ['mls', 'listed', 'on market', 'with agent', 'realtor'];

    for (const note of notes) {
      const noteLower = note.toLowerCase();
      for (const keyword of mlsKeywords) {
        if (noteLower.includes(keyword)) {
          return {
            reason: 'mls_listed',
            details: `Property is listed on MLS. Notes: "${note.substring(0, 100)}"`,
            confidence: 'high',
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for wrong market/area
   */
  private checkWrongMarket(lead: PPLLead, notes: string[]): DetectionResult | null {
    const wrongMarketKeywords = ['wrong area', 'wrong market', 'outside', 'not in our area'];

    for (const note of notes) {
      const noteLower = note.toLowerCase();
      for (const keyword of wrongMarketKeywords) {
        if (noteLower.includes(keyword)) {
          return {
            reason: 'wrong_market',
            details: `Lead is outside service area. Address: ${lead.address}, ${lead.city}, ${lead.state}`,
            confidence: 'high',
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for wrong property type
   */
  private checkWrongPropertyType(notes: string[]): DetectionResult | null {
    const wrongTypeKeywords = [
      'mobile home',
      'manufactured',
      'commercial',
      'vacant land',
      'land only',
      'no structure',
    ];

    for (const note of notes) {
      const noteLower = note.toLowerCase();
      for (const keyword of wrongTypeKeywords) {
        if (noteLower.includes(keyword)) {
          return {
            reason: 'wrong_property_type',
            details: `Wrong property type. Notes indicate: "${note.substring(0, 100)}"`,
            confidence: 'high',
          };
        }
      }
    }

    return null;
  }

  /**
   * Determine initial status based on reason and automation config
   */
  private determineInitialStatus(reason: DisputeReason): 'detected' | 'queued' {
    if (this.config.automation.level === 'manual') {
      return 'detected';
    }

    if (
      this.config.automation.level === 'full-auto' &&
      this.config.automation.autoFileReasons.includes(reason)
    ) {
      return 'detected'; // Will be auto-filed
    }

    return 'queued'; // Needs approval
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
}

export default DetectionEngine;
