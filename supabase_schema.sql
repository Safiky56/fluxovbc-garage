-- ====================================================================
-- FLUXO GARAGE - Esquema de Base de Datos para Supabase
-- Script 100% seguro y re-ejecutable (Idempotente)
-- ====================================================================

-- 1. Crear tabla de órdenes de trabajo si no existe
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number BIGSERIAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    owner_name TEXT NOT NULL,
    owner_phone TEXT DEFAULT '',
    owner_email TEXT DEFAULT '',
    plate TEXT NOT NULL,
    vehicle_brand TEXT DEFAULT '',
    vehicle_model TEXT DEFAULT '',
    vehicle_year TEXT DEFAULT '',
    vehicle_color TEXT DEFAULT '',
    km TEXT DEFAULT '0',
    fuel_level TEXT DEFAULT '1/2',
    issue TEXT NOT NULL,
    technical_diagnosis TEXT DEFAULT '',
    stage INTEGER DEFAULT 0,
    mechanic_name TEXT DEFAULT 'Carlos Méndez (Jefe de Taller)',
    checklist JSONB DEFAULT '{"bodywork":true,"lights":true,"glass":true,"tires":true,"interior":true,"tools":true,"docs":true}'::jsonb,
    parts JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'Bs',
    notes TEXT DEFAULT ''
);

-- 2. Índices de aceleración de búsqueda
CREATE INDEX IF NOT EXISTS idx_orders_plate ON public.orders (plate);
CREATE INDEX IF NOT EXISTS idx_orders_stage ON public.orders (stage);
CREATE INDEX IF NOT EXISTS idx_orders_owner ON public.orders (owner_name);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at DESC);

-- 3. Habilitar seguridad por fila (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores si existían (para evitar errores si se vuelve a correr)
DROP POLICY IF EXISTS "Lectura pública de órdenes" ON public.orders;
DROP POLICY IF EXISTS "Permitir inserción de órdenes" ON public.orders;
DROP POLICY IF EXISTS "Permitir actualización de órdenes" ON public.orders;
DROP POLICY IF EXISTS "Permitir eliminación de órdenes" ON public.orders;
DROP POLICY IF EXISTS "Permitir todo a usuarios anon" ON public.orders;

-- Política de acceso total para la aplicación
CREATE POLICY "Permitir todo a usuarios anon" 
ON public.orders FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Insertar datos demo iniciales (evita duplicados con ON CONFLICT)
INSERT INTO public.orders (id, owner_name, owner_phone, plate, vehicle_brand, vehicle_model, vehicle_year, vehicle_color, km, fuel_level, issue, technical_diagnosis, stage, parts, total_amount)
VALUES 
(
    'OT-2408',
    'Diego Molina',
    '+591 71234567',
    '4587-KLP',
    'Toyota',
    'Corolla',
    '2017',
    'Plata Metalizado',
    '86.240',
    '3/4',
    'Ruido metálico en suspensión delantera derecha al pasar baches.',
    'Bieleta de barra estabilizadora con holgura excesiva y buje desgastado. Se requiere reemplazo de par de bieletas.',
    1,
    '[{"id":"p1","description":"Bieleta estabilizadora delantera (Par)","type":"part","quantity":1,"unit_price":180,"total":180},{"id":"p2","description":"Mano de obra desmontaje y alineación","type":"service","quantity":1,"unit_price":120,"total":120}]'::jsonb,
    300.00
),
(
    'OT-2411',
    'Valeria Paz',
    '+591 76543210',
    '3021-RST',
    'Suzuki',
    'Vitara AllGrip',
    '2020',
    'Blanco Perlado',
    '54.890',
    'Lleno',
    'Mantenimiento preventivo programado de 60.000 km.',
    'Inspección de 25 puntos completada. Cambio de fluidos y filtros de alta pureza.',
    2,
    '[{"id":"p1","description":"Filtro de aceite original","type":"part","quantity":1,"unit_price":65,"total":65},{"id":"p2","description":"Aceite sintético 5W-30 (4L)","type":"part","quantity":1,"unit_price":290,"total":290},{"id":"p3","description":"Filtro de aire de motor","type":"part","quantity":1,"unit_price":85,"total":85},{"id":"p4","description":"Servicio de inspección y afinado","type":"service","quantity":1,"unit_price":150,"total":150}]'::jsonb,
    590.00
),
(
    'OT-2413',
    'Jorge Luna',
    '+591 78901234',
    '1190-ABC',
    'Nissan',
    'Versa Drive',
    '2019',
    'Gris Grafito',
    '71.120',
    '1/4',
    'Chirrido agudo al frenar a baja velocidad.',
    'Pastillas de freno delanteras al 15% de vida útil. Discos en buen estado con rectificado preventivo.',
    3,
    '[{"id":"p1","description":"Juego de pastillas cerámicas delanteras","type":"part","quantity":1,"unit_price":420,"total":420},{"id":"p2","description":"Líquido de frenos DOT-4","type":"part","quantity":1,"unit_price":60,"total":60},{"id":"p3","description":"Mano de obra y purgado de frenos","type":"service","quantity":1,"unit_price":180,"total":180}]'::jsonb,
    660.00
),
(
    'OT-2414',
    'Camila Suarez',
    '+591 72345678',
    '2845-XYD',
    'Hyundai',
    'Tucson 2.0',
    '2021',
    'Rojo Carmesí',
    '38.450',
    '1/2',
    'Luz de Check Engine encendida en tablero.',
    'Escaneo OBD-II muestra código P0135: calentador del sensor de O2 banco 1. Se cambió sensor y se borraron fallas con escáner.',
    5,
    '[{"id":"p1","description":"Sensor de Oxígeno Primario Bosch","type":"part","quantity":1,"unit_price":580,"total":580},{"id":"p2","description":"Diagnóstico computarizado escáner","type":"service","quantity":1,"unit_price":150,"total":150}]'::jsonb,
    730.00
)
ON CONFLICT (id) DO NOTHING;
