-- Képek a munkákhoz + bővített pályázat mezők
alter table public.jobs
  add column if not exists image_urls text[] not null default '{}';

alter table public.job_bids
  add column if not exists availability_duration text,
  add column if not exists contact_shared boolean not null default false;

alter table public.job_bids
  alter column price drop not null;
