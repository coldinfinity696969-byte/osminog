/**
 * OSMINOG — обработчик заявок с формы лендинга.
 * Cloudflare Worker (бесплатный). Принимает POST с формы,
 * создаёт лид в Битрикс24 и шлёт уведомление в Telegram-группу.
 *
 * Переменные окружения (Settings → Variables, задать в Cloudflare):
 *   BITRIX_WEBHOOK — URL входящего вебхука Битрикс24, напр.:
 *                    https://XXX.bitrix24.ru/rest/1/ТОКЕН/
 *   TG_TOKEN       — токен Telegram-бота от @BotFather
 *   TG_CHAT        — id группы (напр. -1001234567890)
 *   ALLOW_ORIGIN   — https://<домен-сайта> (или * на время теста)
 */
export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });

    let d;
    try { d = await request.json(); } catch (e) { return json({ ok: false, error: 'bad json' }, 400, cors); }

    const name = (d.name || '').toString().slice(0, 200).trim();
    const phone = (d.phone || '').toString().slice(0, 100).trim();
    const message = (d.message || '').toString().slice(0, 2000).trim();
    const niche = (d.niche || 'сайт').toString().slice(0, 100);
    const page = (d.page || '').toString().slice(0, 300);
    if (!name && !phone) return json({ ok: false, error: 'empty' }, 400, cors);

    const results = {};

    // --- 1. Битрикс24: создание лида ---
    if (env.BITRIX_WEBHOOK) {
      try {
        const url = env.BITRIX_WEBHOOK.replace(/\/+$/, '') + '/crm.lead.add.json';
        const body = {
          fields: {
            TITLE: 'Заявка с лендинга OSMINOG (' + niche + ')',
            NAME: name,
            COMMENTS: 'Задача: ' + (message || '—') + '\nСтраница: ' + page,
            SOURCE_ID: 'WEB',
            PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
          },
        };
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        results.bitrix = r.ok;
      } catch (e) { results.bitrix = false; }
    }

    // --- 2. Telegram: уведомление в группу ---
    if (env.TG_TOKEN && env.TG_CHAT) {
      try {
        const text =
          '🐙 <b>Новая заявка с лендинга</b>\n' +
          '<b>Ниша:</b> ' + esc(niche) + '\n' +
          '<b>Имя:</b> ' + esc(name) + '\n' +
          '<b>Телефон:</b> ' + esc(phone) + '\n' +
          '<b>Задача:</b> ' + esc(message || '—') + '\n' +
          '<b>Страница:</b> ' + esc(page);
        const r = await fetch('https://api.telegram.org/bot' + env.TG_TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: env.TG_CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true }),
        });
        results.telegram = r.ok;
      } catch (e) { results.telegram = false; }
    }

    return json({ ok: true, results }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
