// services/intelligence/src/utils/notifier.ts
// Telegram push notification layer — surfaces intelligence events to Corey automatically
//
// Required Railway env vars:
//   TELEGRAM_BOT_TOKEN — bot token from BotFather
//   TELEGRAM_CHAT_ID   — set to 8031111945 (Corey's chat ID)
//
// Never throws — on failure logs warning and continues

const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Send a Telegram message to Corey's chat.
 * Uses TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID env vars.
 * Silent failure — never throws.
 */
export async function sendTelegram(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID ?? '8031111945';

  if (!token) {
    console.warn('[notifier] TELEGRAM_BOT_TOKEN not set — skipping notification');
    return;
  }

  try {
    const url = `${TELEGRAM_API}/bot${token}/sendMessage`;
    const body = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '(no body)');
      console.warn(`[notifier] Telegram API error ${response.status}: ${text.slice(0, 200)}`);
      return;
    }

    console.log('[notifier] Telegram notification sent');
  } catch (err) {
    console.warn('[notifier] Failed to send Telegram notification:', (err as Error).message);
  }
}
