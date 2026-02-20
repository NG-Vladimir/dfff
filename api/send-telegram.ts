import type { VercelRequest, VercelResponse } from '@vercel/node';

const TELEGRAM_API = 'https://api.telegram.org/bot';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    const missing = [];
    if (!token) missing.push('TELEGRAM_BOT_TOKEN');
    if (!chatId) missing.push('TELEGRAM_CHAT_ID');
    res.status(500).json({
      error: `Сервер не настроен. Не заданы: ${missing.join(', ')}. Добавьте в Vercel → Settings → Environment Variables и сделайте Redeploy.`,
    });
    return;
  }

  const { text } = req.body as { text?: string };

  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Текст не передан' });
    return;
  }

  try {
    const url = `${TELEGRAM_API}${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: undefined,
      }),
    });

    const data = (await response.json()) as { ok?: boolean; description?: string };

    if (!data.ok) {
      res.status(500).json({ error: data.description || 'Ошибка Telegram API' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
