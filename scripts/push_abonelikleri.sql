-- =============================================================================
--  KONUT PANEL — PUSH ABONELİKLERİ TABLOSU
--
--  Supabase > SQL Editor'e yapıştırıp çalıştırın. Bir kez yeterlidir.
--
--  NE İŞE YARAR
--  Her cihaz, bildirim izni verdiğinde tarayıcıdan benzersiz bir "abonelik"
--  üretir. Sunucu bildirim gönderirken bu kaydı kullanır. Kayıt yoksa
--  uygulama kapalıyken bildirim gönderilemez.
-- =============================================================================

create table if not exists public.push_abonelikleri (
  id            uuid primary key default gen_random_uuid(),
  kullanici_id  uuid not null references auth.users(id) on delete cascade,
  endpoint      text not null unique,          -- cihazın push adresi
  p256dh        text not null,                 -- şifreleme anahtarı
  auth          text not null,                 -- kimlik doğrulama gizi
  cihaz_adi     text,                          -- teşhis için user-agent
  olusturuldu   timestamptz not null default now(),
  guncellendi   timestamptz not null default now()
);

create index if not exists push_abonelikleri_kullanici_idx
  on public.push_abonelikleri (kullanici_id);

-- =============================================================================
--  GÜVENLİK (RLS)
--  Kullanıcı yalnızca kendi cihaz kayıtlarını görebilir ve silebilir.
--  Yazma işlemi Netlify fonksiyonu üzerinden service_role ile yapılır,
--  o yüzden istemciye insert/update yetkisi verilmez.
-- =============================================================================

alter table public.push_abonelikleri enable row level security;

drop policy if exists "kendi aboneliklerini gorur" on public.push_abonelikleri;
create policy "kendi aboneliklerini gorur"
  on public.push_abonelikleri for select
  using (auth.uid() = kullanici_id);

drop policy if exists "kendi aboneligini siler" on public.push_abonelikleri;
create policy "kendi aboneligini siler"
  on public.push_abonelikleri for delete
  using (auth.uid() = kullanici_id);
