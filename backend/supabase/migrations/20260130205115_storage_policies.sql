create policy "Allow public to upload images"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'images'::text));

create policy "Allow public to delete images"
on "storage"."objects"
as permissive
for delete
to public
using ((bucket_id = 'images'::text));

create policy "Allow public to read images"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'images'::text));
