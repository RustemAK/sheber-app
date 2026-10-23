-- ==========================================================
-- HAIR STUDIO PWA - ПОЛНАЯ ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ CRM (ФАЗА 2)
-- Файл: migration_cloud_crm.sql
-- 
-- Содержит:
-- 1. Таблицы облачной синхронизации клиентов, записей и расходов мастера
-- 2. Строгую изоляцию данных мастеров через Row Level Security (RLS)
-- 3. Индексы ускорения выборок
-- 4. Настройку еженедельной автоочистки через pg_cron
-- ==========================================================

-- 1. ТАБЛИЦА КЛИЕНТОВ МАСТЕРА
CREATE TABLE IF NOT EXISTS public.master_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
    local_id BIGINT,
    name TEXT NOT NULL,
    phone TEXT,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_uq_master_client_phone ON public.master_clients(master_id, phone) WHERE phone IS NOT NULL AND phone != '';

-- 2. ТАБЛИЦА ВСЕХ ЗАПИСЕЙ И ИСТОРИИ МАСТЕРА
CREATE TABLE IF NOT EXISTS public.master_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
    local_id BIGINT,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    services JSONB DEFAULT '[]'::jsonb,
    total_price INT DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    materials_used TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. ТАБЛИЦА УЧЕТА РАСХОДОВ И ЗАКУПОК МАТЕРИАЛОВ
CREATE TABLE IF NOT EXISTS public.master_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
    local_id BIGINT,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Расходники',
    amount INT NOT NULL DEFAULT 0,
    quantity TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. СОСТАВНЫЕ ИНДЕКСЫ
CREATE INDEX IF NOT EXISTS idx_master_clients_master 
  ON public.master_clients(master_id);

CREATE INDEX IF NOT EXISTS idx_master_appointments_master_date 
  ON public.master_appointments(master_id, date);

CREATE INDEX IF NOT EXISTS idx_master_expenses_master_date 
  ON public.master_expenses(master_id, date);

-- 5. ROW LEVEL SECURITY (RLS) - ПОЛНАЯ ИЗОЛЯЦИЯ ДАННЫХ
ALTER TABLE public.master_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_expenses ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если существовали
DROP POLICY IF EXISTS "Masters can manage own clients" ON public.master_clients;
DROP POLICY IF EXISTS "Masters can manage own appointments" ON public.master_appointments;
DROP POLICY IF EXISTS "Masters can manage own expenses" ON public.master_expenses;

-- Новые политики для авторизованных мастеров
CREATE POLICY "Masters can manage own clients" 
  ON public.master_clients FOR ALL 
  USING (
    master_id IN (SELECT id FROM public.masters WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    master_id IN (SELECT id FROM public.masters WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Masters can manage own appointments" 
  ON public.master_appointments FOR ALL 
  USING (
    master_id IN (SELECT id FROM public.masters WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    master_id IN (SELECT id FROM public.masters WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Masters can manage own expenses" 
  ON public.master_expenses FOR ALL 
  USING (
    master_id IN (SELECT id FROM public.masters WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    master_id IN (SELECT id FROM public.masters WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

GRANT ALL ON public.master_clients TO authenticated, service_role;
GRANT ALL ON public.master_appointments TO authenticated, service_role;
GRANT ALL ON public.master_expenses TO authenticated, service_role;

-- 6. АВТОМАТИЧЕСКИЙ ПЛАНИРОВЩИК PG_CRON
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Если расширение есть, настраиваем еженедельный вызов в 03:00 UTC воскресенья
    PERFORM cron.unschedule('weekly-archive-old-bookings') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-archive-old-bookings');
    PERFORM cron.schedule(
        'weekly-archive-old-bookings',
        '0 3 * * 0',
        $cron$ SELECT public.archive_old_booking_data(180); $cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Игнорируем ошибку если pg_cron недоступен на данном тарифе
  RAISE NOTICE 'pg_cron setup skipped: %', SQLERRM;
END $$;
