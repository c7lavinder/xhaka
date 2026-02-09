/**
 * MotivatedSellers Platform Connector
 * 
 * Handles authentication and dispute filing for MotivatedSellers
 * Portal: motivatedsellers.com/leads/app/leads
 * 
 * NOTE: Login has reCAPTCHA - requires CAPTCHA solving service
 */

import { Browser, Page } from 'playwright';
import {
  PlatformCredentials,
  PlatformSession,
  DetectedDispute,
  FilingResult,
  DisputeReason,
} from '../types';

// MotivatedSellers-specific reason mapping
const REASON_MAP: Record<DisputeReason, string> = {
  mls_listed: 'MLS Listed',
  wrong_property_type: 'Mobile Home', // or 'Vacant Land'
  wholesaler: 'Wholesaler',
  duplicate: 'Duplicate',
  disconnected: 'Wrong Number',
  wrong_number: 'Wrong Number',
  invalid_data: 'Wrong Number',
  not_owner: 'Wholesaler', // Closest match
  wrong_market: 'Other',
  no_response: 'Other',
  other: 'Other',
};

const URLS = {
  login: 'https://motivatedsellers.com/leads/signin',
  dashboard: 'https://motivatedsellers.com/leads/app/leads',
  returns: 'https://motivatedsellers.com/returns',
};

// Interface for CAPTCHA solving service
interface CaptchaSolver {
  solveRecaptchaV2(siteKey: string, pageUrl: string): Promise<string>;
}

export class MotivatedSellersConnector {
  private browser: Browser;
  private page: Page | null = null;
  private session: PlatformSession | null = null;
  private captchaSolver: CaptchaSolver | null = null;

  constructor(browser: Browser, captchaSolver?: CaptchaSolver) {
    this.browser = browser;
    this.captchaSolver = captchaSolver || null;
  }

  /**
   * Authenticate with MotivatedSellers portal
   * Requires CAPTCHA solving
   */
  async login(credentials: PlatformCredentials): Promise<PlatformSession> {
    const context = await this.browser.newContext();
    this.page = await context.newPage();

    try {
      // Navigate to login page
      await this.page.goto(URLS.login, { waitUntil: 'networkidle' });

      // Fill email
      await this.page.fill('input[name="email"], input[type="email"]', credentials.email);

      // Fill password
      await this.page.fill('input[name="password"], input[type="password"]', credentials.password);

      // Handle reCAPTCHA
      if (this.captchaSolver) {
        // Get reCAPTCHA site key from page
        const siteKey = await this.page.evaluate(() => {
          const recaptcha = document.querySelector('.g-recaptcha, [data-sitekey]');
          return recaptcha?.getAttribute('data-sitekey') || '';
        });

        if (siteKey) {
          // Solve CAPTCHA via service
          const token = await this.captchaSolver.solveRecaptchaV2(siteKey, URLS.login);
          
          // Inject solution
          await this.page.evaluate((token) => {
            const textarea = document.querySelector('#g-recaptcha-response') as HTMLTextAreaElement;
            if (textarea) {
              textarea.value = token;
              textarea.style.display = 'block';
            }
            // Trigger callback if exists
            // @ts-ignore
            if (window.grecaptcha && window.grecaptcha.getResponse) {
              // Already handled
            }
          }, token);
        }
      } else {
        // No CAPTCHA solver - check the checkbox manually (may trigger challenge)
        const recaptchaFrame = this.page.frameLocator('iframe[src*="recaptcha"]');
        await recaptchaFrame.locator('.recaptcha-checkbox-border').click();
        
        // Wait for potential challenge or completion
        await this.page.waitForTimeout(5000);
      }

      // Click sign in
      await this.page.click('button:has-text("Sign In"), button:has-text("Sign in")');

      // Wait for redirect to dashboard
      await this.page.waitForURL(/motivatedsellers\.com\/leads\/app/, { timeout: 30000 });

      // Get cookies for session storage
      const cookies = await context.cookies();
      const cookieString = JSON.stringify(cookies);

      this.session = {
        platform: 'motivatedsellers',
        cookies: cookieString,
        lastAuth: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day (shorter due to security)
        status: 'active',
      };

      return this.session;
    } catch (error) {
      throw new Error(`MotivatedSellers login failed: ${error}`);
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
      if (url.includes('/signin') || url.includes('/login')) {
        return false; // Session expired
      }

      this.session = session;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * File a dispute via the portal
   */
  async fileDispute(dispute: DetectedDispute): Promise<FilingResult> {
    if (!this.page) {
      throw new Error('Not authenticated. Call login() first.');
    }

    try {
      // Navigate to My Leads
      await this.page.goto(URLS.dashboard, { waitUntil: 'networkidle' });

      // Find the lead in the table
      // MotivatedSellers shows leads with: Lead ID, Name, Address, Subscription, Payment
      const leadRow = await this.findLeadRow(dispute.lead);
      
      if (!leadRow) {
        // Try clicking on the lead ID if visible
        const leadLink = await this.page.$(`a:has-text("${dispute.lead.platformLeadId}")`);
        if (leadLink) {
          await leadLink.click();
        } else {
          throw new Error('Could not find lead in MotivatedSellers portal');
        }
      }

      // Navigate to dispute section
      // Based on screenshots: Settings area has "DISPUTES" section with "Open Dispute" button
      // Let's look for that or a dispute link on the lead
      
      // Scroll down to find Disputes section
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(1000);

      // Look for Open Dispute button
      const openDisputeBtn = await this.page.$('button:has-text("Open Dispute"), a:has-text("Open Dispute")');
      if (openDisputeBtn) {
        await openDisputeBtn.click();
        await this.page.waitForTimeout(2000);
      }

      // Fill dispute form
      // Select reason
      const platformReason = REASON_MAP[dispute.reason] || 'Other';
      await this.page.selectOption(
        'select[name*="reason"], select:near(:text("Reason"))',
        { label: platformReason }
      ).catch(() => {
        // Try clicking radio/checkbox if it's not a dropdown
        return this.page!.click(`label:has-text("${platformReason}"), input[value="${platformReason}"]`);
      });

      // Fill description/evidence
      const evidenceText = this.compileEvidenceText(dispute);
      await this.page.fill(
        'textarea[name*="description"], textarea[name*="reason"], textarea:near(:text("Description"))',
        evidenceText
      );

      // Submit
      await this.page.click('button:has-text("Submit"), button:has-text("Dispute"), input[type="submit"]');

      // Wait for confirmation
      await this.page.waitForTimeout(3000);

      // Take screenshot
      const screenshotPath = `/tmp/motivatedsellers_confirmation_${dispute.id}_${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: false });

      // Check for success
      const pageContent = await this.page.content();
      const success = pageContent.toLowerCase().includes('success') ||
                      pageContent.toLowerCase().includes('submitted') ||
                      pageContent.toLowerCase().includes('received');

      return {
        success,
        disputeId: dispute.id,
        platform: 'motivatedsellers',
        confirmationScreenshot: screenshotPath,
        filedAt: new Date(),
        error: success ? undefined : 'Could not confirm submission',
      };
    } catch (error) {
      return {
        success: false,
        disputeId: dispute.id,
        platform: 'motivatedsellers',
        filedAt: new Date(),
        error: `Filing failed: ${error}`,
      };
    }
  }

  /**
   * Find lead row in the leads table
   */
  private async findLeadRow(lead: { name: string; phone: string; address: string }) {
    // Try to find by name
    let row = await this.page?.$(`tr:has-text("${lead.name}")`);
    if (row) return row;

    // Try by phone
    const phoneClean = lead.phone.replace(/\D/g, '');
    row = await this.page?.$(`tr:has-text("${phoneClean}")`);
    if (row) return row;

    // Try by address
    row = await this.page?.$(`tr:has-text("${lead.address.split(',')[0]}")`);
    return row;
  }

  /**
   * Compile evidence text
   */
  private compileEvidenceText(dispute: DetectedDispute): string {
    const evidence = dispute.evidence;
    let text = `DISPUTE REASON: ${dispute.reasonDetails}\n\n`;

    if (evidence.callLogs.length > 0) {
      text += `CALL LOG:\n`;
      evidence.callLogs.slice(0, 5).forEach((call, i) => {
        const date = call.timestamp.toLocaleDateString();
        text += `${i + 1}. ${date} - ${call.outcome}\n`;
      });
      text += `\n`;
    }

    if (evidence.smsLogs.length > 0) {
      text += `SMS LOG:\n`;
      text += `Sent: ${evidence.totalSMSSent}, Responses: ${evidence.totalResponses}\n\n`;
    }

    text += `Total attempts: ${evidence.totalCallAttempts} calls, ${evidence.totalSMSSent} texts\n`;
    text += `Days since received: ${evidence.daysSinceReceived}\n`;

    if (evidence.additionalInfo) {
      text += `\nNotes: ${evidence.additionalInfo}`;
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

export default MotivatedSellersConnector;
