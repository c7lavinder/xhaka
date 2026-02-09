/**
 * Leadzolo Platform Connector
 * 
 * Handles authentication and dispute filing for Leadzolo
 * Portal: portal.leadzolo.com
 * Return Form: leadzolo.com/lead-return-policy1657028939148
 */

import { Browser, Page } from 'playwright';
import {
  PlatformCredentials,
  PlatformSession,
  DetectedDispute,
  FilingResult,
  DisputeReason,
} from '../types';

// Leadzolo-specific reason mapping
const REASON_MAP: Record<DisputeReason, string> = {
  wrong_market: 'Wrong Lead Type',
  wrong_property_type: 'Wrong Lead Type',
  wholesaler: 'Wholesaler Lead',
  duplicate: 'Duplicate Lead',
  not_owner: 'Not The Property Owner',
  disconnected: 'Invalid Contact Information',
  wrong_number: 'Invalid Contact Information',
  invalid_data: 'Invalid Contact Information',
  mls_listed: 'Other',
  no_response: 'Other',
  other: 'Other',
};

const URLS = {
  login: 'https://portal.leadzolo.com/app/login',
  dashboard: 'https://portal.leadzolo.com/app/',
  returnForm: 'https://www.leadzolo.com/lead-return-policy1657028939148',
};

export class LeadzoloConnector {
  private browser: Browser;
  private page: Page | null = null;
  private session: PlatformSession | null = null;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  /**
   * Authenticate with Leadzolo portal
   */
  async login(credentials: PlatformCredentials): Promise<PlatformSession> {
    const context = await this.browser.newContext();
    this.page = await context.newPage();

    try {
      // Navigate to login page
      await this.page.goto(URLS.login, { waitUntil: 'networkidle' });

      // Fill email
      await this.page.fill('input[type="email"], input[name="email"]', credentials.email);

      // Fill password
      await this.page.fill('input[type="password"], input[name="password"]', credentials.password);

      // Check the agreement checkbox
      await this.page.click('input[type="checkbox"]');

      // Click sign in
      await this.page.click('button:has-text("Sign in")');

      // Wait for redirect to dashboard
      await this.page.waitForURL(/portal\.leadzolo\.com\/app\/\d+/, { timeout: 30000 });

      // Get cookies for session storage
      const cookies = await context.cookies();
      const cookieString = JSON.stringify(cookies);

      this.session = {
        platform: 'leadzolo',
        cookies: cookieString, // Should be encrypted before storage
        lastAuth: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'active',
      };

      return this.session;
    } catch (error) {
      throw new Error(`Leadzolo login failed: ${error}`);
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
      if (url.includes('/app/login')) {
        return false; // Session expired
      }

      this.session = session;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * File a dispute via the return form
   */
  async fileDispute(
    dispute: DetectedDispute,
    tenantName: string,
    tenantEmail: string
  ): Promise<FilingResult> {
    if (!this.page) {
      throw new Error('Not authenticated. Call login() first.');
    }

    try {
      // Navigate to return form
      await this.page.goto(URLS.returnForm, { waitUntil: 'networkidle' });

      // Click "Start Return" to scroll to form
      await this.page.click('a:has-text("Start Return"), button:has-text("Start Return")');
      await this.page.waitForTimeout(1000); // Wait for scroll

      // Select reason from dropdown
      const platformReason = REASON_MAP[dispute.reason] || 'Other';
      await this.page.selectOption(
        'select[name*="reason"], select:near(:text("Reason"))',
        { label: platformReason }
      );

      // Fill Lead Email
      await this.page.fill(
        'input[name*="email"]:near(:text("Lead Email")), input:below(:text("Lead Email"))',
        dispute.lead.email
      );

      // Fill Lead Address
      const fullAddress = `${dispute.lead.address}, ${dispute.lead.city}, ${dispute.lead.state} ${dispute.lead.zip}`;
      await this.page.fill(
        'input[name*="address"]:near(:text("Lead Address")), input:below(:text("Lead Address"))',
        fullAddress
      );

      // Fill Additional Information with evidence
      const evidenceText = this.compileEvidenceText(dispute);
      await this.page.fill(
        'textarea[name*="additional"], textarea:below(:text("Additional Information"))',
        evidenceText
      );

      // Fill Client Name
      await this.page.fill(
        'input[name*="client"]:near(:text("Client Name")), input:below(:text("Client Name"))',
        tenantName
      );

      // Fill Client Email
      await this.page.fill(
        'input[name*="email"]:near(:text("Client Email")), input:below(:text("Client Email")):below(:text("Client Name"))',
        tenantEmail
      );

      // Submit form
      await this.page.click('button:has-text("Submit"), input[type="submit"]');

      // Wait for confirmation
      await this.page.waitForTimeout(3000);

      // Take confirmation screenshot
      const screenshotPath = `/tmp/leadzolo_confirmation_${dispute.id}_${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: false });

      // Check for success message
      const pageContent = await this.page.content();
      const success = pageContent.toLowerCase().includes('success') ||
                      pageContent.toLowerCase().includes('submitted') ||
                      pageContent.toLowerCase().includes('thank you');

      return {
        success,
        disputeId: dispute.id,
        platform: 'leadzolo',
        confirmationScreenshot: screenshotPath,
        filedAt: new Date(),
        error: success ? undefined : 'Could not confirm submission',
      };
    } catch (error) {
      return {
        success: false,
        disputeId: dispute.id,
        platform: 'leadzolo',
        filedAt: new Date(),
        error: `Filing failed: ${error}`,
      };
    }
  }

  /**
   * Compile evidence into text for the form
   */
  private compileEvidenceText(dispute: DetectedDispute): string {
    const evidence = dispute.evidence;
    let text = `DISPUTE REASON: ${dispute.reasonDetails}\n\n`;

    text += `EVIDENCE:\n`;
    text += `────────────────────────────────────\n`;

    // Call logs
    if (evidence.callLogs.length > 0) {
      text += `\nCALL ATTEMPTS (${evidence.totalCallAttempts} total):\n`;
      evidence.callLogs.forEach((call, i) => {
        const date = call.timestamp.toLocaleDateString();
        const time = call.timestamp.toLocaleTimeString();
        text += `• Call #${i + 1}: ${date} ${time} — ${call.outcome}`;
        if (call.notes) text += ` (${call.notes})`;
        text += `\n`;
      });
    }

    // SMS logs
    if (evidence.smsLogs.length > 0) {
      text += `\nSMS ATTEMPTS (${evidence.totalSMSSent} sent):\n`;
      evidence.smsLogs
        .filter(sms => sms.direction === 'outbound')
        .forEach((sms, i) => {
          const date = sms.timestamp.toLocaleDateString();
          const time = sms.timestamp.toLocaleTimeString();
          text += `• SMS #${i + 1}: ${date} ${time} — ${sms.status}\n`;
        });
    }

    // Summary
    text += `\nSUMMARY:\n`;
    text += `• Total call attempts: ${evidence.totalCallAttempts}\n`;
    text += `• Total SMS sent: ${evidence.totalSMSSent}\n`;
    text += `• Total responses: ${evidence.totalResponses}\n`;
    text += `• Days since received: ${evidence.daysSinceReceived}\n`;

    if (evidence.additionalInfo) {
      text += `\nADDITIONAL NOTES:\n${evidence.additionalInfo}\n`;
    }

    return text;
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

export default LeadzoloConnector;
