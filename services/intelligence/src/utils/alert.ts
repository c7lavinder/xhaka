// services/intelligence/src/utils/alert.ts
// Raw fetch Telegram alert — no external deps, DRY_RUN aware

const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Send a Telegram alert to Corey.
 * Uses raw fetch — no external deps.
 * @param message - Markdown-formatted string
 */
export async function sendAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[alert] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping alert');
    return;
  }

  if (process.env.DRY_RUN === 'true') {
    console.log('[alert] DRY_RUN — would send:', message);
    return;
  }

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[alert] Telegram API error:', res.status, text);
    }
  } catch (err) {
    console.error('[alert] fetch failed:', (err as Error).message);
  }
}
