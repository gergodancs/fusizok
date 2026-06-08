-- Meglévő megosztott kapcsolatok státuszának szinkronizálása
UPDATE public.job_bids
SET status = 'accepted'
WHERE contact_shared = true
  AND status = 'pending';
