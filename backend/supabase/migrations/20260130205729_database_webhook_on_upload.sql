-- Trigger on storage.objects to call edge function when new file is uploaded
create trigger "on_file_upload"
after insert on "storage"."objects"
for each row
execute function supabase_functions.http_request(
  'https://rizxnhdyduouhjnbwbfj.supabase.co/functions/v1/create-processing-task',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '5000'
);
