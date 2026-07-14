CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'social-sync-sweep',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--d82f9ea9-ba91-493d-93a4-8014f3f4913a.lovable.app/api/public/cron/social-sync',
    headers := '{"Content-Type":"application/json","apikey":"sb_publishable_1EAUUVo27Q7xB78gM7jO-w_3CJNQu0G"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);