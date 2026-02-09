/**
 * PropertyLeads Platform Connector
 * 
 * Handles authentication and dispute filing for PropertyLeads
 * Portal: propertyleads.com/get-leads/
 * Refund Page: My Leads → Request Refund (inline form per lead)
 */

import { Browser, Page } from 'playwright';
import {
  PlatformCredentials,
  PlatformSession,
  DetectedDispute,
  FilingResult,
  DisputeReason,
} from '../types';

// PropertyLeads-specific reason mapping
const REASON_MAP: Record<DisputeReason, string> = {
  disconnected: 'Wrong Number',
  wrong_number: 'Wrong Number',
  duplicate: 'Duplicate',
  mls_listed: 'Listed on MLS',
  not_owner: 'Not Property Owner',
  wholesaler: 'Wholesaler',
  invalid_data: 'Invalid Information',
  wrong_market: 'Wrong Area',
  wrong_property_type: 'Wrong Property Type',
  no_response: 'No Response',
  other: 'Other',
};

const URLS = {
  login: 'https://www.propertyleads.com/login',
  dashboard: 'https://www.propertyleads.com/get-leads/',
  requestRefund: 'https://www.propertyleads.com/get-leads/', // Same page, different section
  refundStatus: 'https://www.propertyleads.com/get-leads/', // Check via My Leads → Refund Status
};

export class PropertyLeadsConnector {
  private browser: Browser;
  private page: Page | null = null;
  private session: PlatformSession | null = null;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  /**
   * Authenticate with PropertyLeads portal
   */
  async login(credentials: PlatformCredentials): Promise<PlatformSession> {
    const context = await this.browser.newContext();
    this.page = await context.newPage();

    try {
      // Navigate to login page
      await this.page.goto(URLS.login, { waitUntil: 'networkidle' });

      // Fill email
      await this.page.fill(
        'input[name="email"], input[type="email"], input[placeholder*="email" i]',
        credentials.email
      );

      // Fill password
      await this.page.fill(
        'input[name="password"], input[type="password"]',
        credentials.password
      );

      // Click sign in
      await this.page.click(
        'button:has-text("Sign In"), button:has-text("Login"), input[type="submit"]'
      );

      // Wait for redirect to dashboard
      await this.page.waitForURL(/propertyleads\.com\/get-leads/, { timeout: 30000 });

      // Get cookies for session storage
      const cookies = await context.cookies();
      const cookieString = JSON.stringify(cookies);

      this.session = {
        platform: 'propertyleads',
        cookies: cookieString,
        lastAuth: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'active',
      };

      return this.session;
    } catch (error) {
      throw new Error(`PropertyLeads login failed: ${error}`);
    }
  }

  /**
   * Restore session from stored cookies
   */
  async restoreSession(session: PlatformSession): Promise<boolean> {
    try {
      const context = await this.browser.newContext();
      const cookies = JSON.parse(session.cookies);
      await context.addCookies(cookies);

      this.page = await context.newPage();
      await this.page.goto(URLS.dashboard, { waitUntil: 'networkidle' });

      // Check if we're still logged in
      const url = this.page.url();
      if (url.includes('/login') || url.includes('/signin')) {
        return false; // Session expired
      }

      this.session = session;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * File a dispute via the Request Refund page
   * PropertyLeads has inline refund requests per lead row
   */
  async fileDispute(dispute: DetectedDispute): Promise<FilingResult> {
    if (!this.page) {
      throw new Error('Not authenticated. Call login() first.');
    }

    try {
      // Navigate to Request Refund section
      // Based on screenshots: My Leads → Request Refund in left nav
      await this.page.goto(URLS.dashboard, { waitUntil: 'networkidle' });

      // Click on "Request Refund" in the sidebar
      await this.page.click('a:has-text("Request Refund"), [href*="refund"]');
      await this.page.waitForTimeout(2000);

      // Find the lead row by Lead ID or name
      // Table columns: Lead ID, Lead Type/Date&Time, Lead Details, Reason, Description, Action
      const leadRow = await this.findLeadRow(dispute);

      if (!leadRow) {
        throw new Error(`Could not find lead ${dispute.lead.platformLeadId || dispute.lead.name} in refund list`);
      }

      // Select reason from dropdown in this row
      const platformReason = REASON_MAP[dispute.reason] || 'Other';
      
      // Find the select element within the row
      const reasonSelect = await leadRow.$('select');
      if (reasonSelect) {
        await reasonSelect.selectOption({ label: platformReason });
      } else {
        // Try clicking a dropdown trigger
        await leadRow.click('.reason-dropdown, [data-reason]');
        await this.page.click(`text="${platformReason}"`);
      }

      // Fill description in this row
      const evidenceText = this.compileEvidenceText(dispute);
      const descInput = await leadRow.$('input[type="text"], textarea');
      if (descInput) {
        await descInput.fill(evidenceText);
      }

      // Click the action/submit button in this row
      const actionBtn = await leadRow.$('button, .action-btn, [data-action]');
      if (actionBtn) {
        await actionBtn.click();
      } else {
        // Look for an icon button (from screenshots it might be a small action button)
        await leadRow.click('td:last-child button, td:last-child a');
      }

      // Wait for confirmation
      await this.page.waitForTimeout(3000);

      // Take screenshot
      const screenshotPath = `/tmp/propertyleads_confirmation_${dispute.id}_${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: false });

      // Check for success
      const pageContent = await this.page.content();
      const success = pageContent.toLowerCase().includes('success') ||
                      pageContent.toLowerCase().includes('submitted') ||
                      pageContent.toLowerCase().includes('request received');

      return {
        success,
        disputeId: dispute.id,
        platform: 'propertyleads',
        confirmationScreenshot: screenshotPath,
        filedAt: new Date(),
        error: success ? undefined : 'Could not confirm submission',
      };
    } catch (error) {
      return {
        success: false,
        disputeId: dispute.id,
        platform: 'propertyleads',
        filedAt: new Date(),
        error: `Filing failed: ${error}`,
      };
    }
  }

  /**
   * Find lead row in the refund request table
   */
  private async findLeadRow(dispute: DetectedDispute) {
    // Try by Lead ID first (most reliable)
    if (dispute.lead.platformLeadId) {
      const row = await this.page?.$(`tr:has-text("${dispute.lead.platformLeadId}")`);
      if (row) return row;
    }

    // Try by name
    let row = await this.page?.$(`tr:has-text("${dispute.lead.name}")`);
    if (row) return row;

    // Try by phone
    const phoneClean = dispute.lead.phone.replace(/\D/g, '');
    row = await this.page?.$(`tr:has-text("${phoneClean}")`);
    if (row) return row;

    // Try by email
    row = await this.page?.$(`tr:has-text("${dispute.lead.email}")`);
    return row;
  }

  /**
   * Check refund status for a dispute
   */
  async checkDisputeStatus(disputeId: string): Promise<string> {
    if (!this.page) {
      throw new Error('Not authenticated');
    }

    try {
      // Navigate to Refund Status
      await this.page.click('a:has-text("Refund Status")');
      await this.page.waitForTimeout(2000);

      // Look for the dispute
      const content = await this.page.content();
      
      if (content.includes('Approved')) return 'approved';
      if (content.includes('Denied') || content.includes('Rejected')) return 'denied';
      if (content.includes('Pending') || content.includes('Review')) return 'pending';
      
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Compile evidence text (shorter for PropertyLeads inline form)
   */
  private compileEvidenceText(dispute: DetectedDispute): string {
    const evidence = dispute.evidence;
    
    // PropertyLeads has a smaller description field, keep it concise
    let text = `${dispute.reasonDetails}. `;
    
    text += `${evidence.totalCallAttempts} calls, ${evidence.totalSMSSent} texts over ${evidence.daysSinceReceived} days. `;
    text += `${evidence.totalResponses} responses. `;

    if (dispute.reason === 'disconnected' || dispute.reason === 'wrong_number') {
      text += 'Phone number is invalid/disconnected.';
    } else if (dispute.reason === 'no_response') {
      text += 'No contact after multiple attempts.';
    } else if (dispute.reason === 'duplicate') {
      text += 'Duplicate of previously received lead.';
    }

    return text;
  }

  /**
   * Get account stats (for monitoring declined refund rate)
   */
  async getAccountStats(): Promise<{ declinedRate: number; balance: number }> {
    if (!this.page) {
      throw new Error('Not authenticated');
    }

    try {
      await this.page.goto(URLS.dashboard, { waitUntil: 'networkidle' });
      
      // Look for stats in header (from screenshots: "Declined Refund %: 4.89%")
      const statsText = await this.page.textContent('body');
      
      const declinedMatch = statsText?.match(/Declined Refund %:\s*([\d.]+)%/);
      const balanceMatch = statsText?.match(/Account Balance[:\s]*\$?([\d,]+\.?\d*)/);

      return {
        declinedRate: declinedMatch ? parseFloat(declinedMatch[1]) : 0,
        balance: balanceMatch ? parseFloat(balanceMatch[1].replace(',', '')) : 0,
      };
    } catch {
      return { declinedRate: 0, balance: 0 };
    }
  }

  /**
   * Close browser context
   */
  async close(): Promise<void> {
    if (this.page) {
      await this.page.context().close();
      this.page = null;
    }
  }
}

export default PropertyLeadsConnector;
