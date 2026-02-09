/**
 * PPL Refund Bot - Main Entry Point
 * 
 * Gunner Add-on for automating PPL lead refund requests
 */

export * from './types';
export * from './detection';
export * from './platforms/leadzolo';
export * from './platforms/motivatedsellers';
export * from './platforms/propertyleads';

import { chromium, Browser } from 'playwright';
import {
  TenantConfig,
  PPLLead,
  DetectedDispute,
  FilingResult,
  PPLPlatform,
  PlatformSession,
  CallLog,
  SMSLog,
} from './types';
import { DetectionEngine } from './detection';
import { LeadzoloConnector } from './platforms/leadzolo';
import { MotivatedSellersConnector } from './platforms/motivatedsellers';
import { PropertyLeadsConnector } from './platforms/propertyleads';

/**
 * Main PPL Refund Bot class
 */
export class PPLRefundBot {
  private config: TenantConfig;
  private browser: Browser | null = null;
  private detection: DetectionEngine;
  private sessions: Map<PPLPlatform, PlatformSession> = new Map();
  private connectors: Map<PPLPlatform, any> = new Map();

  constructor(config: TenantConfig) {
    this.config = config;
    this.detection = new DetectionEngine(config);
  }

  /**
   * Initialize the bot (start browser)
   */
  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true, // Run headless in production
    });
    console.log(`[PPL Bot] Initialized for tenant: ${this.config.tenantId}`);
  }

  /**
   * Process a batch of leads from GHL
   */
  async processLeads(
    leads: PPLLead[],
    getCallLogs: (contactId: string) => Promise<CallLog[]>,
    getSMSLogs: (contactId: string) => Promise<SMSLog[]>,
    getNotes: (contactId: string) => Promise<string[]>
  ): Promise<DetectedDispute[]> {
    const disputes: DetectedDispute[] = [];

    for (const lead of leads) {
      // Skip if platform not enabled
      if (!this.config.platforms[lead.platform]?.enabled) {
        continue;
      }

      // Skip if outside dispute window
      if (!this.detection.isWithinDisputeWindow(lead)) {
        continue;
      }

      // Get contact data from GHL
      const [callLogs, smsLogs, notes] = await Promise.all([
        getCallLogs(lead.ghlContactId),
        getSMSLogs(lead.ghlContactId),
        getNotes(lead.ghlContactId),
      ]);

      // Detect issues
      const dispute = this.detection.detectIssues(lead, callLogs, smsLogs, notes);
      if (dispute) {
        disputes.push(dispute);
      }
    }

    return disputes;
  }

  /**
   * File a dispute with the appropriate platform
   */
  async fileDispute(dispute: DetectedDispute): Promise<FilingResult> {
    if (!this.browser) {
      throw new Error('Bot not initialized. Call initialize() first.');
    }

    const platform = dispute.lead.platform;
    const platformConfig = this.config.platforms[platform];

    if (!platformConfig?.enabled) {
      throw new Error(`Platform ${platform} is not enabled`);
    }

    // Get or create connector
    let connector = this.connectors.get(platform);
    if (!connector) {
      connector = this.createConnector(platform);
      this.connectors.set(platform, connector);
    }

    // Check session
    let session = this.sessions.get(platform);
    let authenticated = false;

    if (session) {
      authenticated = await connector.restoreSession(session);
    }

    if (!authenticated) {
      // Need to login
      session = await connector.login(platformConfig.credentials);
      this.sessions.set(platform, session);
    }

    // File the dispute
    let result: FilingResult;

    switch (platform) {
      case 'leadzolo':
        result = await (connector as LeadzoloConnector).fileDispute(
          dispute,
          this.config.companyName,
          platformConfig.credentials.email
        );
        break;

      case 'motivatedsellers':
      case 'propertyleads':
        result = await connector.fileDispute(dispute);
        break;

      default:
        throw new Error(`Unknown platform: ${platform}`);
    }

    return result;
  }

  /**
   * Create connector for a platform
   */
  private createConnector(platform: PPLPlatform) {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    switch (platform) {
      case 'leadzolo':
        return new LeadzoloConnector(this.browser);
      case 'motivatedsellers':
        return new MotivatedSellersConnector(this.browser);
      case 'propertyleads':
        return new PropertyLeadsConnector(this.browser);
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  /**
   * Process disputes based on automation level
   */
  async processDisputes(disputes: DetectedDispute[]): Promise<{
    autoFiled: FilingResult[];
    queued: DetectedDispute[];
    manual: DetectedDispute[];
  }> {
    const autoFiled: FilingResult[] = [];
    const queued: DetectedDispute[] = [];
    const manual: DetectedDispute[] = [];

    for (const dispute of disputes) {
      switch (this.config.automation.level) {
        case 'full-auto':
          if (this.config.automation.autoFileReasons.includes(dispute.reason)) {
            // Auto-file
            const result = await this.fileDispute(dispute);
            autoFiled.push(result);
          } else {
            // Queue for approval
            queued.push(dispute);
          }
          break;

        case 'semi-auto':
          // All go to queue
          queued.push(dispute);
          break;

        case 'manual':
          // Just detect, don't queue
          manual.push(dispute);
          break;
      }
    }

    return { autoFiled, queued, manual };
  }

  /**
   * Get disputes approaching deadline
   */
  getDeadlineAlerts(disputes: DetectedDispute[], daysThreshold: number = 2): DetectedDispute[] {
    return disputes.filter(d => d.daysRemaining <= daysThreshold && d.status !== 'filed');
  }

  /**
   * Clean up resources
   */
  async shutdown(): Promise<void> {
    // Close all connectors
    for (const connector of this.connectors.values()) {
      await connector.close?.();
    }
    this.connectors.clear();

    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    console.log(`[PPL Bot] Shut down for tenant: ${this.config.tenantId}`);
  }
}

/**
 * Create and configure a PPL Refund Bot instance
 */
export function createPPLRefundBot(config: TenantConfig): PPLRefundBot {
  return new PPLRefundBot(config);
}

export default PPLRefundBot;
