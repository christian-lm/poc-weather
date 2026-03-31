-- ============================================================
-- V4__seed_stress_data.sql
--
-- Stress-test seed data: ~100 new sensors with diverse profiles
-- and ~450K metric rows covering edge cases that are invisible
-- with the small initial dataset from V3.
--
-- Sensor naming convention:
--   WX-{ZONE}-{City}      → normal sensors by climate zone
--   EDGE-{TYPE}-{Label}   → edge-case sensors by behaviour
-- ============================================================


-- ============================================================
-- SECTION 1: SENSOR REGISTRATION
-- ============================================================

-- 1a. Normal — Tropical (10 sensors)
INSERT INTO sensors (name, location) VALUES
    ('WX-TRP-Singapore',    'Changi, Singapore'),
    ('WX-TRP-Bangkok',      'Don Mueang, Bangkok, Thailand'),
    ('WX-TRP-Mumbai',       'Colaba, Mumbai, India'),
    ('WX-TRP-Rio',          'Galeao, Rio de Janeiro, Brazil'),
    ('WX-TRP-Lagos',        'Ikeja, Lagos, Nigeria'),
    ('WX-TRP-Havana',       'Jose Marti, Havana, Cuba'),
    ('WX-TRP-Jakarta',      'Kemayoran, Jakarta, Indonesia'),
    ('WX-TRP-Manila',       'NAIA, Manila, Philippines'),
    ('WX-TRP-Nairobi',      'Wilson Airport, Nairobi, Kenya'),
    ('WX-TRP-Honolulu',     'Daniel K. Inouye, Honolulu, HI, USA');

-- 1b. Normal — Arctic / Cold (8 sensors)
INSERT INTO sensors (name, location) VALUES
    ('WX-ARC-Reykjavik',    'Keflavik, Reykjavik, Iceland'),
    ('WX-ARC-Tromso',       'Langnes, Tromso, Norway'),
    ('WX-ARC-Murmansk',     'Murmashi, Murmansk, Russia'),
    ('WX-ARC-Fairbanks',    'Fairbanks Intl, Alaska, USA'),
    ('WX-ARC-Yellowknife',  'Yellowknife Airport, NWT, Canada'),
    ('WX-ARC-Nuuk',         'Nuuk Airport, Greenland'),
    ('WX-ARC-Longyearbyen', 'Svalbard Airport, Longyearbyen, Norway'),
    ('WX-ARC-Norilsk',      'Alykel, Norilsk, Russia');

-- 1c. Normal — Desert (7 sensors)
INSERT INTO sensors (name, location) VALUES
    ('WX-DSR-Dubai',        'Dubai Intl, UAE'),
    ('WX-DSR-Phoenix',      'Sky Harbor, Phoenix, AZ, USA'),
    ('WX-DSR-Riyadh',       'King Khalid, Riyadh, Saudi Arabia'),
    ('WX-DSR-Cairo',        'Cairo Intl, Egypt'),
    ('WX-DSR-AliceSprings', 'Alice Springs Airport, NT, Australia'),
    ('WX-DSR-Atacama',      'Atacama Desert Station, Chile'),
    ('WX-DSR-Ouarzazate',   'Ouarzazate Airport, Morocco');

-- 1d. Normal — Coastal (10 sensors)
INSERT INTO sensors (name, location) VALUES
    ('WX-CST-Sydney',       'Kingsford Smith, Sydney, Australia'),
    ('WX-CST-Lisbon',       'Humberto Delgado, Lisbon, Portugal'),
    ('WX-CST-CapeTown',     'Cape Town Intl, South Africa'),
    ('WX-CST-SanFrancisco', 'SFO, San Francisco, CA, USA'),
    ('WX-CST-Vancouver',    'YVR, Vancouver, BC, Canada'),
    ('WX-CST-Barcelona',    'El Prat, Barcelona, Spain'),
    ('WX-CST-Naples',       'Capodichino, Naples, Italy'),
    ('WX-CST-Montevideo',   'Carrasco, Montevideo, Uruguay'),
    ('WX-CST-Busan',        'Gimhae, Busan, South Korea'),
    ('WX-CST-Riga',         'Riga Intl, Latvia');

-- 1e. Normal — Mountain (8 sensors)
INSERT INTO sensors (name, location) VALUES
    ('WX-MTN-Zurich',       'Zurich Kloten, Switzerland (432m)'),
    ('WX-MTN-Cusco',        'Alejandro Velasco, Cusco, Peru (3400m)'),
    ('WX-MTN-Kathmandu',    'Tribhuvan, Kathmandu, Nepal (1338m)'),
    ('WX-MTN-LaPaz',        'El Alto, La Paz, Bolivia (4061m)'),
    ('WX-MTN-Bogota',       'El Dorado, Bogota, Colombia (2547m)'),
    ('WX-MTN-Denver',       'Denver Intl, CO, USA (1655m)'),
    ('WX-MTN-Innsbruck',    'Kranebitten, Innsbruck, Austria (579m)'),
    ('WX-MTN-Lhasa',        'Gonggar, Lhasa, Tibet (3570m)');

-- 1f. Normal — Temperate (7 sensors)
INSERT INTO sensors (name, location) VALUES
    ('WX-TMP-London',       'Heathrow, London, United Kingdom'),
    ('WX-TMP-Paris',        'Charles de Gaulle, Paris, France'),
    ('WX-TMP-Tokyo',        'Narita, Tokyo, Japan'),
    ('WX-TMP-Berlin',       'Brandenburg, Berlin, Germany'),
    ('WX-TMP-Toronto',      'Pearson, Toronto, ON, Canada'),
    ('WX-TMP-Melbourne',    'Tullamarine, Melbourne, Australia'),
    ('WX-TMP-BuenosAires',  'Ezeiza, Buenos Aires, Argentina');

-- 1g. Edge — Offline / Gap (8 sensors)
INSERT INTO sensors (name, location) VALUES
    ('EDGE-GAP-Oslo',       'Gardermoen, Oslo, Norway'),
    ('EDGE-GAP-Helsinki',   'Vantaa, Helsinki, Finland'),
    ('EDGE-GAP-Warsaw',     'Chopin, Warsaw, Poland'),
    ('EDGE-GAP-Prague',     'Vaclav Havel, Prague, Czechia'),
    ('EDGE-GAP-Zurich',     'Zurich Flughafen, Switzerland'),
    ('EDGE-GAP-Vienna',     'Schwechat, Vienna, Austria'),
    ('EDGE-GAP-Brussels',   'Zaventem, Brussels, Belgium'),
    ('EDGE-GAP-Amsterdam',  'Schiphol, Amsterdam, Netherlands');

-- 1h. Edge — Newly registered (5 sensors)
INSERT INTO sensors (name, location) VALUES
    ('EDGE-NEW-Station01',  'Test Lab A, Dublin, Ireland'),
    ('EDGE-NEW-Station02',  'Test Lab B, Cork, Ireland'),
    ('EDGE-NEW-Station03',  'Test Lab C, Galway, Ireland'),
    ('EDGE-NEW-Station04',  'Test Lab D, Limerick, Ireland'),
    ('EDGE-NEW-Station05',  'Test Lab E, Waterford, Ireland');

-- 1i. Edge — Ghost sensors (5) — registered, never send data
INSERT INTO sensors (name, location) VALUES
    ('EDGE-GHOST-Phantom01', 'Warehouse 13, Area 51, NV, USA'),
    ('EDGE-GHOST-Phantom02', 'Decommissioned Lab, Pripyat, Ukraine'),
    ('EDGE-GHOST-Phantom03', 'Storage Unit 7B, Reykjavik, Iceland'),
    ('EDGE-GHOST-Phantom04', 'Undeployed Kit, Cork, Ireland'),
    ('EDGE-GHOST-Phantom05', 'Returned Defective, Dublin, Ireland');

-- 1j. Edge — Partial metric sensors (5)
INSERT INTO sensors (name, location) VALUES
    ('EDGE-PART-TempOnly',   'Greenhouse A, Kew Gardens, London, UK'),
    ('EDGE-PART-TempHumid',  'Greenhouse B, Kew Gardens, London, UK'),
    ('EDGE-PART-WindPress',  'Rooftop Unit, Wind Tower, Chicago, IL, USA'),
    ('EDGE-PART-PrecipOnly', 'Rain Gauge, Cherrapunji, Meghalaya, India'),
    ('EDGE-PART-NoTemp',     'Underground Lab, CERN, Geneva, Switzerland');

-- 1k. Edge — Extreme values (5)
INSERT INTO sensors (name, location) VALUES
    ('EDGE-XTRM-Antarctic',  'Vostok Station, Antarctica'),
    ('EDGE-XTRM-DeathVlly',  'Furnace Creek, Death Valley, CA, USA'),
    ('EDGE-XTRM-Hurricane',  'Eye Wall Station, Caribbean Sea'),
    ('EDGE-XTRM-BoneDry',    'Dry Valleys, McMurdo, Antarctica'),
    ('EDGE-XTRM-SteamVent',  'Geyser Basin, Yellowstone, WY, USA');

-- 1l. Edge — Spike / Anomaly (5)
INSERT INTO sensors (name, location) VALUES
    ('EDGE-SPIKE-Detroit',   'Industrial Zone, Detroit, MI, USA'),
    ('EDGE-SPIKE-Shenzhen',  'Power Plant, Shenzhen, Guangdong, China'),
    ('EDGE-SPIKE-NorthSea',  'Offshore Rig, North Sea'),
    ('EDGE-SPIKE-Outback',   'Desert Road, Outback, NT, Australia'),
    ('EDGE-SPIKE-Yakutsk',   'Frozen Lake, Yakutsk, Sakha, Russia');

-- 1m. Edge — High-frequency (5)
INSERT INTO sensors (name, location) VALUES
    ('EDGE-HFREQ-Turb01',   'Wind Farm Alpha, Galway Bay, Ireland'),
    ('EDGE-HFREQ-Turb02',   'Wind Farm Beta, Donegal, Ireland'),
    ('EDGE-HFREQ-Turb03',   'Solar Farm, Seville, Spain'),
    ('EDGE-HFREQ-Turb04',   'Tidal Station, Bay of Fundy, NS, Canada'),
    ('EDGE-HFREQ-Turb05',   'Geothermal Plant, Krafla, Iceland');

-- 1n. Edge — Stale sensors (5)
INSERT INTO sensors (name, location) VALUES
    ('EDGE-STALE-Retired01', 'Old Observatory, Greenwich, London, UK'),
    ('EDGE-STALE-Retired02', 'Closed Station, Tempelhof, Berlin, DE'),
    ('EDGE-STALE-Retired03', 'Abandoned Post, Chernobyl Excl. Zone, UA'),
    ('EDGE-STALE-Retired04', 'Mothballed Buoy, Bermuda Triangle'),
    ('EDGE-STALE-Retired05', 'Legacy Site, Cape Canaveral, FL, USA');

-- 1o. Edge — Duplicate timestamps (3)
INSERT INTO sensors (name, location) VALUES
    ('EDGE-DUP-MIT',         'Multi-Reader Hub, MIT, Cambridge, MA, USA'),
    ('EDGE-DUP-Stanford',    'Dual-Antenna Post, Stanford, CA, USA'),
    ('EDGE-DUP-JPL',         'Redundant Array, JPL, Pasadena, CA, USA');

-- 1p. Edge — Boundary values (4)
INSERT INTO sensors (name, location) VALUES
    ('EDGE-BOUND-Zero',      'Calibration Lab, NIST, Gaithersburg, MD'),
    ('EDGE-BOUND-Negative',  'Sub-Zero Chamber, PTB, Braunschweig, DE'),
    ('EDGE-BOUND-Overflow',  'Stress Test Rig, Sandia, Albuquerque, NM'),
    ('EDGE-BOUND-Precision', 'Metrology Lab, NPL, Teddington, UK');

-- 1q. Edge — Long name / location (5)
--     sensor.name  = VARCHAR(100)  → padded to exactly 100 chars
--     sensor.location = VARCHAR(255) → padded to exactly 255 chars
INSERT INTO sensors (name, location) VALUES
    (RPAD('EDGE-LONG-Alpha-Amazon-Rainforest-Deep-Basin-Monitoring-Installation-Unit-', 100, 'A'),
     RPAD('Remote Weather Station Located Deep Within The Amazon Rainforest Basin Near Tributaries Of Multiple River Systems Surrounded By Dense Tropical Vegetation And Diverse Wildlife Habitats In South America-', 255, 'A')),
    (RPAD('EDGE-LONG-Bravo-Kilimanjaro-Eastern-Slopes-High-Altitude-Research-Stn-', 100, 'B'),
     RPAD('High-Altitude Atmospheric Research Facility On The Eastern Slopes Of Mount Kilimanjaro Tanzania Africa Continental Weather Pattern Observation Post-', 255, 'B')),
    (RPAD('EDGE-LONG-Charlie-Mid-Atlantic-Ridge-Deep-Ocean-Hydrothermal-Monitor-', 100, 'C'),
     RPAD('Deep Ocean Hydrothermal Vent Monitoring Station Near The Mid-Atlantic Ridge Between Iceland And Azores Submarine Geological Survey Installation-', 255, 'C')),
    (RPAD('EDGE-LONG-Delta-ISS-Columbus-Module-Exterior-Payload-Weather-Sensor-', 100, 'D'),
     RPAD('International Space Station External Payload Facility Columbus Module Exterior Weather Sensor Array For Low Earth Orbit Environmental Monitoring System-', 255, 'D')),
    (RPAD('EDGE-LONG-Echo-Trans-Siberian-Railway-Automated-Weather-Station-Post-', 100, 'E'),
     RPAD('Trans-Siberian Railway Automated Weather Station Kilometer Post 5642 Between Novosibirsk And Irkutsk Continuous Rail Corridor Climate Data Collection Point-', 255, 'E'));


-- ============================================================
-- SECTION 2: METRICS — Normal sensors (50 sensors, 30 days hourly)
-- All 5 metric types including precipitation.
-- ~50 sensors × 5 metrics × ~721 hours = ~180,250 rows
-- ============================================================

-- 2a. Tropical — warm & humid, afternoon rain bursts
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 28.0 + 4.0 * sin(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 3.0 - 1.5) + (s.id % 5) * 0.4
        WHEN 'humidity'      THEN 82.0 + 8.0 * cos(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 6.0 - 3.0)
        WHEN 'wind_speed'    THEN 10.0 + 5.0 * sin(extract(hour FROM ts) * pi() / 8.0)
                                   + (random() * 4.0 - 2.0)
        WHEN 'pressure'      THEN 1008.0 + 3.0 * sin(extract(doy FROM ts) * pi() / 180.0)
                                   + (random() * 2.0 - 1.0)
        WHEN 'precipitation' THEN GREATEST(0.0,
                                   8.0 * random() - 3.0
                                   + 4.0 * (CASE WHEN extract(hour FROM ts) BETWEEN 14 AND 18
                                                  THEN 1.0 ELSE 0.0 END) * random())
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'WX-TRP-%';

-- 2b. Arctic — deep cold, moderate humidity, strong winds, light snow
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN -15.0 + 10.0 * sin(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 4.0 - 2.0)
                                   + 3.0 * sin(extract(doy FROM ts) * pi() / 365.0)
        WHEN 'humidity'      THEN 60.0 + 15.0 * cos(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 8.0 - 4.0)
        WHEN 'wind_speed'    THEN 25.0 + 12.0 * sin(extract(hour FROM ts) * pi() / 6.0)
                                   + (random() * 8.0 - 4.0)
        WHEN 'pressure'      THEN 1005.0 + 8.0 * sin(extract(doy FROM ts) * pi() / 180.0)
                                   + (random() * 4.0 - 2.0)
        WHEN 'precipitation' THEN GREATEST(0.0, 2.0 * random() - 0.5)
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'WX-ARC-%';

-- 2c. Desert — scorching days, cold nights, very low humidity, almost no rain
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 35.0 + 15.0 * sin((extract(hour FROM ts) - 6.0) * pi() / 12.0)
                                   + (random() * 3.0 - 1.5)
        WHEN 'humidity'      THEN 15.0 + 8.0 * cos(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 4.0 - 2.0)
        WHEN 'wind_speed'    THEN 18.0 + 10.0 * sin(extract(hour FROM ts) * pi() / 6.0)
                                   + (random() * 6.0 - 3.0)
        WHEN 'pressure'      THEN 1012.0 + 3.0 * sin(extract(doy FROM ts) * pi() / 180.0)
                                   + (random() * 2.0 - 1.0)
        WHEN 'precipitation' THEN GREATEST(0.0, 0.5 * random() - 0.4)
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'WX-DSR-%';

-- 2d. Coastal — mild, humid, sea breeze, occasional heavy showers
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 18.0 + 6.0 * sin(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 2.0 - 1.0)
                                   + 2.0 * sin(extract(doy FROM ts) * 2.0 * pi() / 365.0)
        WHEN 'humidity'      THEN 70.0 + 12.0 * cos(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 5.0 - 2.5)
        WHEN 'wind_speed'    THEN 20.0 + 8.0 * sin(extract(hour FROM ts) * pi() / 6.0)
                                   + (random() * 6.0 - 3.0)
        WHEN 'pressure'      THEN 1013.0 + 5.0 * sin(extract(doy FROM ts) * pi() / 180.0)
                                   + (random() * 3.0 - 1.5)
        WHEN 'precipitation' THEN GREATEST(0.0,
                                   4.0 * random() - 1.5
                                   + (CASE WHEN random() > 0.85 THEN 10.0 * random() ELSE 0.0 END))
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'WX-CST-%';

-- 2e. Mountain — cool, variable pressure, high wind, orographic rain
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 5.0 + 8.0 * sin(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 4.0 - 2.0)
                                   + 5.0 * sin(extract(doy FROM ts) * 2.0 * pi() / 365.0)
        WHEN 'humidity'      THEN 55.0 + 20.0 * cos(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 8.0 - 4.0)
        WHEN 'wind_speed'    THEN 30.0 + 15.0 * sin(extract(hour FROM ts) * pi() / 6.0)
                                   + (random() * 10.0 - 5.0)
        WHEN 'pressure'      THEN 850.0 + 10.0 * sin(extract(doy FROM ts) * pi() / 180.0)
                                   + (random() * 5.0 - 2.5)
        WHEN 'precipitation' THEN GREATEST(0.0,
                                   3.0 * random() - 1.0
                                   + (CASE WHEN random() > 0.8 THEN 5.0 * random() ELSE 0.0 END))
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'WX-MTN-%';

-- 2f. Temperate — moderate four-season climate
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 12.0 + 7.0 * sin(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 3.0 - 1.5)
                                   + 4.0 * sin(extract(doy FROM ts) * 2.0 * pi() / 365.0)
        WHEN 'humidity'      THEN 68.0 + 12.0 * cos(extract(hour FROM ts) * pi() / 12.0)
                                   + (random() * 6.0 - 3.0)
        WHEN 'wind_speed'    THEN 15.0 + 8.0 * sin(extract(hour FROM ts) * pi() / 8.0)
                                   + (random() * 5.0 - 2.5)
        WHEN 'pressure'      THEN 1013.0 + 6.0 * sin(extract(doy FROM ts) * pi() / 180.0)
                                   + (random() * 3.0 - 1.5)
        WHEN 'precipitation' THEN GREATEST(0.0,
                                   3.0 * random() - 1.0
                                   + (CASE WHEN random() > 0.75 THEN 8.0 * random() ELSE 0.0 END))
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'WX-TMP-%';


-- ============================================================
-- SECTION 3: METRICS — Gap / Offline sensors (8)
-- Normal temperate data with deterministic multi-hour and
-- multi-day gaps unique to each sensor.
-- ============================================================
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 10.0 + 6.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 3.0 - 1.5)
        WHEN 'humidity'      THEN 70.0 + 10.0 * cos(extract(hour FROM ts) * pi() / 12.0) + (random() * 5.0 - 2.5)
        WHEN 'wind_speed'    THEN 15.0 + 7.0 * sin(extract(hour FROM ts) * pi() / 8.0) + (random() * 4.0 - 2.0)
        WHEN 'pressure'      THEN 1012.0 + 5.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 2.0 - 1.0)
        WHEN 'precipitation' THEN GREATEST(0.0, 2.0 * random() - 0.8)
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-GAP-%'
  AND NOT (
      extract(hour FROM ts) BETWEEN 1 AND 5
      AND extract(dow FROM ts) = (s.id % 7)
  )
  AND NOT (
      ts BETWEEN NOW() - INTERVAL '20 days' + (s.id % 8) * INTERVAL '1 day'
             AND NOW() - INTERVAL '17 days' + (s.id % 8) * INTERVAL '1 day'
  );


-- ============================================================
-- SECTION 4: METRICS — Newly registered sensors (5)
-- Only the last 2 hours of data at 5-minute resolution.
-- ============================================================
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 11.0 + 3.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 2.0 - 1.0)
        WHEN 'humidity'      THEN 75.0 + 5.0 * cos(extract(hour FROM ts) * pi() / 12.0) + (random() * 3.0 - 1.5)
        WHEN 'wind_speed'    THEN 12.0 + 4.0 * sin(extract(hour FROM ts) * pi() / 8.0)  + (random() * 2.0 - 1.0)
        WHEN 'pressure'      THEN 1013.0 + 2.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 1.0 - 0.5)
        WHEN 'precipitation' THEN GREATEST(0.0, 1.5 * random() - 0.5)
    END
FROM generate_series(NOW() - INTERVAL '2 hours', NOW(), INTERVAL '5 minutes') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-NEW-%';


-- ============================================================
-- SECTION 5: Ghost sensors — NO metrics inserted.
-- EDGE-GHOST-* sensors exist in the sensors table but have zero
-- rows in sensor_metrics. Tests null-handling in latest-all,
-- query builder, and dashboard card rendering.
-- ============================================================
-- (intentionally empty)


-- ============================================================
-- SECTION 6: METRICS — Partial metric sensors (5)
-- Each sensor reports only a subset of metric types.
-- ============================================================

-- TempOnly: only temperature
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT ts, s.id, 'temperature',
    8.0 + 5.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 2.0 - 1.0)
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
WHERE s.name = 'EDGE-PART-TempOnly';

-- TempHumid: temperature + humidity
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature' THEN 12.0 + 4.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 2.0 - 1.0)
        WHEN 'humidity'    THEN 80.0 + 8.0 * cos(extract(hour FROM ts) * pi() / 12.0) + (random() * 4.0 - 2.0)
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity')) AS mt(metric_type)
WHERE s.name = 'EDGE-PART-TempHumid';

-- WindPress: wind_speed + pressure
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'wind_speed' THEN 20.0 + 10.0 * sin(extract(hour FROM ts) * pi() / 6.0) + (random() * 5.0 - 2.5)
        WHEN 'pressure'   THEN 1010.0 + 5.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 2.0 - 1.0)
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('wind_speed'), ('pressure')) AS mt(metric_type)
WHERE s.name = 'EDGE-PART-WindPress';

-- PrecipOnly: only precipitation (heavy monsoon pattern)
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT ts, s.id, 'precipitation',
    GREATEST(0.0,
        15.0 * random() - 5.0
        + 10.0 * (CASE WHEN extract(hour FROM ts) BETWEEN 12 AND 20 THEN 1.0 ELSE 0.0 END) * random())
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
WHERE s.name = 'EDGE-PART-PrecipOnly';

-- NoTemp: everything except temperature
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'humidity'      THEN 65.0 + 10.0 * cos(extract(hour FROM ts) * pi() / 12.0) + (random() * 5.0 - 2.5)
        WHEN 'wind_speed'    THEN 18.0 + 8.0 * sin(extract(hour FROM ts) * pi() / 8.0)   + (random() * 4.0 - 2.0)
        WHEN 'pressure'      THEN 1011.0 + 4.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 2.0 - 1.0)
        WHEN 'precipitation' THEN GREATEST(0.0, 4.0 * random() - 1.5)
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name = 'EDGE-PART-NoTemp';


-- ============================================================
-- SECTION 7: METRICS — Extreme value sensors (5)
-- Values at physical extremes or beyond normal ranges.
-- ============================================================
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE s.name
        WHEN 'EDGE-XTRM-Antarctic' THEN
            CASE mt.metric_type
                WHEN 'temperature'   THEN -60.0 + 20.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 5.0 - 2.5)
                WHEN 'humidity'      THEN 5.0 + 10.0 * random()
                WHEN 'wind_speed'    THEN 40.0 + 20.0 * random()
                WHEN 'pressure'      THEN 980.0 + 5.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 3.0 - 1.5)
                WHEN 'precipitation' THEN GREATEST(0.0, 0.5 * random() - 0.3)
            END
        WHEN 'EDGE-XTRM-DeathVlly' THEN
            CASE mt.metric_type
                WHEN 'temperature'   THEN 45.0 + 10.0 * sin((extract(hour FROM ts) - 6.0) * pi() / 12.0) + (random() * 3.0 - 1.5)
                WHEN 'humidity'      THEN 5.0 + 5.0 * random()
                WHEN 'wind_speed'    THEN 8.0 + 15.0 * random()
                WHEN 'pressure'      THEN 1000.0 + 3.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 2.0 - 1.0)
                WHEN 'precipitation' THEN 0.0
            END
        WHEN 'EDGE-XTRM-Hurricane' THEN
            CASE mt.metric_type
                WHEN 'temperature'   THEN 26.0 + 2.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 1.5 - 0.75)
                WHEN 'humidity'      THEN 95.0 + 5.0 * random()
                WHEN 'wind_speed'    THEN 150.0 + 100.0 * random()
                WHEN 'pressure'      THEN 920.0 + 30.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 10.0 - 5.0)
                WHEN 'precipitation' THEN 30.0 + 50.0 * random()
            END
        WHEN 'EDGE-XTRM-BoneDry' THEN
            CASE mt.metric_type
                WHEN 'temperature'   THEN 20.0 + 15.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 3.0 - 1.5)
                WHEN 'humidity'      THEN 0.5 + 1.5 * random()
                WHEN 'wind_speed'    THEN 5.0 + 3.0 * random()
                WHEN 'pressure'      THEN 1015.0 + 2.0 * random()
                WHEN 'precipitation' THEN 0.0
            END
        WHEN 'EDGE-XTRM-SteamVent' THEN
            CASE mt.metric_type
                WHEN 'temperature'   THEN 80.0 + 20.0 * random()
                WHEN 'humidity'      THEN 98.0 + 2.0 * random()
                WHEN 'wind_speed'    THEN 2.0 + 3.0 * random()
                WHEN 'pressure'      THEN 1015.0 + 3.0 * sin(extract(doy FROM ts) * pi() / 180.0)
                WHEN 'precipitation' THEN GREATEST(0.0, 5.0 * random() - 2.0)
            END
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-XTRM-%';


-- ============================================================
-- SECTION 8: METRICS — Spike / Anomaly sensors (5)
-- Normal baseline data + injected anomalous spikes that create
-- additional rows at specific timestamps with wild values.
-- ============================================================

-- 8a. Normal baseline (30 days hourly)
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 12.0 + 5.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 2.0 - 1.0)
        WHEN 'humidity'      THEN 65.0 + 10.0 * cos(extract(hour FROM ts) * pi() / 12.0) + (random() * 4.0 - 2.0)
        WHEN 'wind_speed'    THEN 14.0 + 6.0 * sin(extract(hour FROM ts) * pi() / 8.0)  + (random() * 3.0 - 1.5)
        WHEN 'pressure'      THEN 1013.0 + 4.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 2.0 - 1.0)
        WHEN 'precipitation' THEN GREATEST(0.0, 2.0 * random() - 0.5)
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-SPIKE-%';

-- 8b. Inject anomalous spikes (10 spikes per sensor, each 3 days apart)
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    spike_time, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 200.0 + 100.0 * random()
        WHEN 'humidity'      THEN 150.0 + 50.0  * random()
        WHEN 'wind_speed'    THEN 500.0 + 200.0 * random()
        WHEN 'pressure'      THEN 600.0 - 200.0 * random()
        WHEN 'precipitation' THEN 200.0 + 100.0 * random()
    END
FROM (
    SELECT NOW() - (n * INTERVAL '3 days') - INTERVAL '7 hours' AS spike_time
    FROM generate_series(0, 9) AS n
) spikes
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-SPIKE-%';


-- ============================================================
-- SECTION 9: METRICS — High-frequency sensors (5)
-- 10-second intervals for the last 24 hours.
-- ~8,640 timestamps × 5 sensors × 5 metrics = ~216,000 rows
-- ============================================================
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 10.0 + 3.0 * sin(extract(epoch FROM ts) * pi() / 43200.0)
                                   + (random() * 0.5 - 0.25)
        WHEN 'humidity'      THEN 72.0 + 5.0 * cos(extract(epoch FROM ts) * pi() / 43200.0)
                                   + (random() * 1.0 - 0.5)
        WHEN 'wind_speed'    THEN 20.0 + 10.0 * sin(extract(epoch FROM ts) * pi() / 3600.0)
                                   + (random() * 2.0 - 1.0)
        WHEN 'pressure'      THEN 1013.0 + 2.0 * sin(extract(epoch FROM ts) * pi() / 86400.0)
                                   + (random() * 0.5 - 0.25)
        WHEN 'precipitation' THEN GREATEST(0.0, 0.1 * random() - 0.05)
    END
FROM generate_series(NOW() - INTERVAL '24 hours', NOW(), INTERVAL '10 seconds') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-HFREQ-%';


-- ============================================================
-- SECTION 10: METRICS — Stale sensors (5)
-- Data only from 25–30 days ago. Nothing recent.
-- ============================================================
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 9.0 + 5.0 * sin(extract(hour FROM ts) * pi() / 12.0)  + (random() * 2.0 - 1.0)
        WHEN 'humidity'      THEN 70.0 + 8.0 * cos(extract(hour FROM ts) * pi() / 12.0) + (random() * 4.0 - 2.0)
        WHEN 'wind_speed'    THEN 16.0 + 7.0 * sin(extract(hour FROM ts) * pi() / 8.0)  + (random() * 3.0 - 1.5)
        WHEN 'pressure'      THEN 1012.0 + 4.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 2.0 - 1.0)
        WHEN 'precipitation' THEN GREATEST(0.0, 2.5 * random() - 1.0)
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days', INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-STALE-%';


-- ============================================================
-- SECTION 11: METRICS — Duplicate timestamp sensors (3)
-- Two passes insert overlapping timestamps with different values.
-- The hypertable has no UNIQUE constraint so both rows coexist,
-- but JPA's @IdClass(time, sensorId, metricType) gets confused.
-- ============================================================

-- Pass 1: 7 days of normal hourly data
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 11.0 + 4.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 2.0 - 1.0)
        WHEN 'humidity'      THEN 68.0 + 8.0 * cos(extract(hour FROM ts) * pi() / 12.0) + (random() * 4.0 - 2.0)
        WHEN 'wind_speed'    THEN 13.0 + 5.0 * sin(extract(hour FROM ts) * pi() / 8.0)  + (random() * 3.0 - 1.5)
        WHEN 'pressure'      THEN 1013.0 + 3.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 1.5 - 0.75)
        WHEN 'precipitation' THEN GREATEST(0.0, 2.0 * random() - 0.8)
    END
FROM generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-DUP-%';

-- Pass 2: same 7 days at 6-hour intervals (creates true duplicates at every 6th hour)
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 11.0 + 4.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 6.0 - 3.0)
        WHEN 'humidity'      THEN 68.0 + 8.0 * cos(extract(hour FROM ts) * pi() / 12.0) + (random() * 10.0 - 5.0)
        WHEN 'wind_speed'    THEN 13.0 + 5.0 * sin(extract(hour FROM ts) * pi() / 8.0)  + (random() * 8.0 - 4.0)
        WHEN 'pressure'      THEN 1013.0 + 3.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 4.0 - 2.0)
        WHEN 'precipitation' THEN GREATEST(0.0, 5.0 * random() - 2.0)
    END
FROM generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '6 hours') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-DUP-%';


-- ============================================================
-- SECTION 12: METRICS — Boundary value sensors (4)
-- Explicit edge values: zero, negative, very large, high precision.
-- ============================================================

-- All metrics exactly 0.0
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type, 0.0
FROM generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name = 'EDGE-BOUND-Zero';

-- All metrics negative (physically impossible for most)
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN -40.0 - 10.0 * random()
        WHEN 'humidity'      THEN -5.0  * random()
        WHEN 'wind_speed'    THEN -10.0 * random()
        WHEN 'pressure'      THEN -100.0 * random()
        WHEN 'precipitation' THEN -20.0 * random()
    END
FROM generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name = 'EDGE-BOUND-Negative';

-- Very large values (tests number formatting and chart scaling)
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 99999.99
        WHEN 'humidity'      THEN 1e10
        WHEN 'wind_speed'    THEN 1e12
        WHEN 'pressure'      THEN 1e15
        WHEN 'precipitation' THEN 9.999e100
    END
FROM generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name = 'EDGE-BOUND-Overflow';

-- High-precision decimals (tests rounding and display)
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 12.345678901234
        WHEN 'humidity'      THEN 67.891011121314
        WHEN 'wind_speed'    THEN 15.161718192021
        WHEN 'pressure'      THEN 1013.22232425262
        WHEN 'precipitation' THEN 0.000000001
    END
FROM generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name = 'EDGE-BOUND-Precision';


-- ============================================================
-- SECTION 13: METRICS — Long name sensors (5)
-- Normal metric data; the edge case is in the sensor name/location
-- field lengths (100 and 255 chars), not the metric values.
-- ============================================================
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts, s.id, mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature'   THEN 15.0 + 7.0 * sin(extract(hour FROM ts) * pi() / 12.0) + (random() * 3.0 - 1.5)
        WHEN 'humidity'      THEN 65.0 + 12.0 * cos(extract(hour FROM ts) * pi() / 12.0) + (random() * 5.0 - 2.5)
        WHEN 'wind_speed'    THEN 14.0 + 6.0 * sin(extract(hour FROM ts) * pi() / 8.0)  + (random() * 4.0 - 2.0)
        WHEN 'pressure'      THEN 1013.0 + 5.0 * sin(extract(doy FROM ts) * pi() / 180.0) + (random() * 2.0 - 1.0)
        WHEN 'precipitation' THEN GREATEST(0.0, 3.0 * random() - 1.0)
    END
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 hour') AS ts
CROSS JOIN sensors s
CROSS JOIN (VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure'), ('precipitation')) AS mt(metric_type)
WHERE s.name LIKE 'EDGE-LONG-%';


-- ============================================================
-- DATA VOLUME SUMMARY (approximate)
-- ============================================================
-- Normal:   50 sensors × 5 metrics × 721 hrs       ≈ 180,250
-- Gap:       8 sensors × 5 metrics × ~550 hrs       ≈  22,000
-- New:       5 sensors × 5 metrics × 25 intervals   ≈     625
-- Ghost:     5 sensors × 0                           =       0
-- Partial:   5 sensors × mixed metrics × 721 hrs    ≈   7,200
-- Extreme:   5 sensors × 5 metrics × 721 hrs        ≈  18,025
-- Spike:     5 sensors × 5 metrics × 721 + 10 spikes≈  18,275
-- HFreq:     5 sensors × 5 metrics × 8,641 pts      ≈ 216,025
-- Stale:     5 sensors × 5 metrics × 121 hrs        ≈   3,025
-- Dup:       3 sensors × 5 metrics × (169+29) hrs   ≈   2,970
-- Boundary:  4 sensors × 5 metrics × 169 hrs        ≈   3,380
-- Long:      5 sensors × 5 metrics × 721 hrs        ≈  18,025
-- ─────────────────────────────────────────────────────────────
-- TOTAL (V4 only)                                    ≈ 489,800
-- Plus V3 existing                                   ≈  14,400
-- GRAND TOTAL                                        ≈ 504,200
