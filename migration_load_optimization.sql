-- ==========================================================
-- HAIR STUDIO PWA - МИГРАЦИЯ ДЛЯ МАСШТАБИРОВАНИЯ И НАГРУЗКИ (1+ ГОД)
-- Файл: migration_load_optimization.sql
-- 
-- Содержит:
-- 1. Защиту от спама и Rate-Limiting в RPC create_public_booking
-- 2. Высокоскоростные составные индексы для быстродействия при 50 000+ записей
-- 3. Включение таблицы booking_requests в публикацию Supabase Realtime
-- 4. Хранимую процедуру автоматической архивации/очистки старых данных
-- ==========================================================

-- ==========================================================
-- 1. ВЫСОКОСКОРОСТНЫЕ ИНДЕКСЫ
-- ==========================================================

-- Быстрый поиск слотов мастера по датам (используется при расчете свободных окон)
CREATE INDEX IF NOT EXISTS idx_master_busy_slots_master_date 
  ON public.master_busy_slots (master_id, date);

-- Быстрая фильтрация заявок по мастеру, статусу и дате
CREATE INDEX IF NOT EXISTS idx_booking_requests_master_status_date 
  ON public.booking_requests (master_id, status, date);

-- Индекс для мгновенной проверки Rate-Limiting по телефону клиента
CREATE INDEX IF NOT EXISTS idx_booking_requests_phone_created 
  ON public.booking_requests (client_phone, created_at);

-- Индекс для сортировки каталога услуг мастера
CREATE INDEX IF NOT EXISTS idx_master_services_master_sort 
  ON public.master_services (master_id, sort_order);

-- Индекс для логов платежей
CREATE INDEX IF NOT EXISTS idx_subscription_payments_master_date 
  ON public.subscription_payments (master_id, created_at DESC);


-- ==========================================================
-- 2. ЗАЩИЩЕННЫЙ RPC: create_public_booking С RATE-LIMITING
-- ==========================================================
CREATE OR REPLACE FUNCTION public.create_public_booking(
    p_master_id UUID,
    p_client_name TEXT,
    p_client_phone TEXT,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_service_names TEXT,
    p_duration_min INT DEFAULT 60,
    p_client_note TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
    v_master public.masters%ROWTYPE;
    v_booking_id UUID;
    v_is_sub_valid BOOLEAN := FALSE;
    v_recent_attempts INT;
    v_clean_phone TEXT;
BEGIN
    -- 1. Валидация входных данных
    IF length(trim(COALESCE(p_client_name, ''))) < 2 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Укажите ваше имя (минимум 2 символа)');
    END IF;

    v_clean_phone := regexp_replace(COALESCE(p_client_phone, ''), '\D', '', 'g');
    IF length(v_clean_phone) < 10 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Укажите корректный номер телефона');
    END IF;

    IF p_date < CURRENT_DATE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Нельзя записаться на прошедшую дату');
    END IF;

    IF p_date > CURRENT_DATE + interval '90 days' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Онлайн-запись открыта максимум на 90 дней вперед');
    END IF;

    -- 2. Anti-Spam Rate-Limiting: не более 4 заявок с одного номера за последний час
    SELECT count(*) INTO v_recent_attempts
    FROM public.booking_requests
    WHERE client_phone = trim(p_client_phone)
      AND created_at > (now() - interval '1 hour');

    IF v_recent_attempts >= 4 THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Слишком много заявок с данного номера. Пожалуйста, подождите немного перед повторной попыткой.'
        );
    END IF;

    -- 3. Проверка существования и активности мастера
    SELECT * INTO v_master FROM public.masters WHERE id = p_master_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Мастер не найден');
    END IF;

    IF v_master.is_active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Мастер временно не принимает онлайн-записи');
    END IF;

    -- 4. Проверка активности подписки мастера
    IF v_master.subscription_status IN ('active', 'lifetime') THEN
        v_is_sub_valid := TRUE;
    ELSIF v_master.subscription_status = 'trial' AND (v_master.trial_ends_at IS NULL OR v_master.trial_ends_at >= now()) THEN
        v_is_sub_valid := TRUE;
    ELSIF v_master.subscription_ends_at IS NOT NULL AND v_master.subscription_ends_at >= now() THEN
        v_is_sub_valid := TRUE;
    END IF;

    IF NOT v_is_sub_valid THEN
        RETURN jsonb_build_object('success', false, 'error', 'Онлайн-запись к данному мастеру временно приостановлена');
    END IF;

    -- 5. Защита от наложения записей (двойное бронирование)
    IF EXISTS (
        SELECT 1 FROM public.booking_requests b
        WHERE b.master_id = p_master_id
          AND b.date = p_date
          AND b.status IN ('pending', 'confirmed')
          AND (b.start_time, b.end_time) OVERLAPS (p_start_time, p_end_time)
    ) OR EXISTS (
        SELECT 1 FROM public.master_busy_slots s
        WHERE s.master_id = p_master_id
          AND s.date = p_date
          AND (s.start_time, s.end_time) OVERLAPS (p_start_time, p_end_time)
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Выбранное время уже занято, выберите другой слот');
    END IF;

    -- 6. Вставка новой заявки
    INSERT INTO public.booking_requests (
        master_id,
        client_name,
        client_phone,
        date,
        start_time,
        end_time,
        service_names,
        duration_min,
        client_note,
        status
    ) VALUES (
        p_master_id,
        trim(p_client_name),
        trim(p_client_phone),
        p_date,
        p_start_time,
        p_end_time,
        trim(p_service_names),
        COALESCE(p_duration_min, 60),
        COALESCE(trim(p_client_note), ''),
        'pending'
    ) RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object('success', true, 'booking_id', v_booking_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_public_booking(UUID, TEXT, TEXT, DATE, TIME, TIME, TEXT, INT, TEXT) TO anon, authenticated, service_role;


-- ==========================================================
-- 3. ВКЛЮЧЕНИЕ REALTIME ДЛЯ ОНЛАЙН-ЗАЯВОК
-- ==========================================================
DO $$
BEGIN
  -- Добавляем таблицу в публикацию realtime, если еще не добавлена
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'booking_requests'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_requests;
    END IF;
  END IF;
END $$;


-- ==========================================================
-- 4. ХРАНИМАЯ ПРОЦЕДУРА АРХИВАЦИИ И ОЧИСТКИ СТАРЫХ ДАННЫХ
-- ==========================================================
CREATE OR REPLACE FUNCTION public.archive_old_booking_data(p_days_to_keep INT DEFAULT 180)
RETURNS JSONB AS $$
DECLARE
    v_deleted_slots INT := 0;
    v_deleted_cancelled INT := 0;
    v_cutoff_date DATE;
BEGIN
    v_cutoff_date := CURRENT_DATE - p_days_to_keep;

    -- 1. Удаление устаревших занятых слотов (история расписания в облаке не нужна)
    DELETE FROM public.master_busy_slots
    WHERE date < v_cutoff_date;
    GET DIAGNOSTICS v_deleted_slots = ROW_COUNT;

    -- 2. Удаление отмененных или отклоненных заявок старше срока хранения
    DELETE FROM public.booking_requests
    WHERE date < v_cutoff_date
      AND status IN ('rejected', 'cancelled');
    GET DIAGNOSTICS v_deleted_cancelled = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'cutoff_date', v_cutoff_date,
        'deleted_past_slots', v_deleted_slots,
        'deleted_cancelled_requests', v_deleted_cancelled
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.archive_old_booking_data(INT) TO authenticated, service_role;
