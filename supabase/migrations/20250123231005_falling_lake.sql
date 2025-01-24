/*
  # Add cron schedule for trend fetching

  1. Setup
    - Enable pg_cron extension
    - Create cron job to fetch trends daily

  2. Details
    - Schedule: Daily at 00:00 UTC
    - Calls the edge function to fetch new trends
    - Includes error logging
*/

-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION fetch_trends_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url text := rtrim(current_setting('app.settings.services_http_url'), '/') || '/functions/v1/fetch-trends';
  service_role_key text := current_setting('app.settings.service_role_key');
BEGIN
  -- Call the edge function using the service role key
  PERFORM
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Authorization', concat('Bearer ', service_role_key),
        'Content-Type', 'application/json'
      ),
      body := '{}'
    );
EXCEPTION
  WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO _cron.job_run_details (job_id, run_time, error_message)
    VALUES (0, now(), SQLERRM);
END;
$$;

-- Schedule the cron job to run daily at midnight UTC
SELECT cron.schedule(
  'fetch-trends-daily',           -- unique job name
  '0 0 * * *',                   -- cron schedule (daily at midnight UTC)
  'SELECT fetch_trends_cron();'   -- SQL to execute
);