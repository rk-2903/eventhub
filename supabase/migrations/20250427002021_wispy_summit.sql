/*
  # Event Management Schema

  1. New Tables
    - `events`
      - Event details including name, description, type, pricing model
      - Foreign key to organizer profile
    - `batches`
      - Batch/session information for events
      - Schedule and capacity details
    - `registrations`
      - User event registrations
      - Links users, events, and batches
    - `discounts`
      - Discount offers for events
      - Includes percentage, type, and validity

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for:
      - Organizers can manage their events
      - Users can view available events
      - Users can manage their registrations
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('regular', 'intermediate', 'advanced', 'summer')),
  price_type text NOT NULL CHECK (price_type IN ('hourly', 'weekly', 'monthly')),
  base_price decimal(10,2) NOT NULL CHECK (base_price >= 0),
  min_hours int CHECK (min_hours > 0),
  min_weeks int CHECK (min_weeks > 0),
  min_months int CHECK (min_months > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  schedule text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  working_days text[] NOT NULL,
  capacity int NOT NULL CHECK (capacity > 0),
  enrolled int DEFAULT 0 CHECK (enrolled >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT enrolled_not_exceed_capacity CHECK (enrolled <= capacity)
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  hours_registered int,
  weeks_registered int,
  months_registered int,
  total_amount decimal(10,2) NOT NULL,
  discount_applied decimal(10,2) DEFAULT 0,
  final_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_registration_period CHECK (
    CASE
      WHEN hours_registered IS NOT NULL THEN hours_registered > 0
      WHEN weeks_registered IS NOT NULL THEN weeks_registered > 0
      WHEN months_registered IS NOT NULL THEN months_registered > 0
      ELSE false
    END
  )
);

-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('seasonal', 'bulk', 'early_bird')),
  percentage decimal(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  min_registration_value decimal(10,2),
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (valid_until >= valid_from)
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  -- TO authenticated
  USING (true);

CREATE POLICY "Organizers can manage their events"
  ON events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = events.organizer_id
      AND user_id = auth.uid()
      AND role IN ('org', 'admin')
    )
  );

-- Policies for batches
CREATE POLICY "Events are viewable by everyone2" ON events 
  FOR SELECT USING (true);

CREATE POLICY "Organizers can manage their batches"
  ON batches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = e.organizer_id
      WHERE e.id = batches.event_id
      AND p.user_id = auth.uid()
      AND p.role IN ('org', 'admin')
    )
  );

-- Policies for registrations
CREATE POLICY "Users can view their registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can view registrations for their events"
  ON registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = e.organizer_id
      WHERE e.id = registrations.event_id
      AND p.user_id = auth.uid()
      AND p.role IN ('org', 'admin')
    )
  );

-- Policies for discounts
CREATE POLICY "Discounts are viewable by everyone"
  ON discounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizers can manage their discounts"
  ON discounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN profiles p ON p.id = e.organizer_id
      WHERE e.id = discounts.event_id
      AND p.user_id = auth.uid()
      AND p.role IN ('org', 'admin')
    )
  );

-- Insert sample data
DO $$
DECLARE
  org1_id uuid;
  regular_event_id uuid;
  advanced_event_id uuid;
  summer_event_id uuid;
BEGIN
  -- Get organizer ID
  SELECT id INTO org1_id FROM profiles WHERE role = 'org' LIMIT 1;

  -- Insert events
  INSERT INTO events (
    organizer_id,
    name,
    description,
    event_type,
    price_type,
    base_price,
    min_hours,
    min_weeks,
    min_months
  ) VALUES 
  (
    org1_id,
    'Regular Drawing Course',
    'Learn fundamental drawing techniques suitable for beginners',
    'regular',
    'hourly',
    25.00,
    2,
    NULL,
    NULL
  ) RETURNING id INTO regular_event_id;

  INSERT INTO events (
    organizer_id,
    name,
    description,
    event_type,
    price_type,
    base_price,
    min_hours,
    min_weeks,
    min_months
  ) VALUES 
  (
    org1_id,
    'Advanced Drawing Workshop',
    'Advanced techniques for experienced artists',
    'advanced',
    'weekly',
    150.00,
    NULL,
    4,
    NULL
  ) RETURNING id INTO advanced_event_id;

  INSERT INTO events (
    organizer_id,
    name,
    description,
    event_type,
    price_type,
    base_price,
    min_hours,
    min_weeks,
    min_months
  ) VALUES 
  (
    org1_id,
    'Summer Drawing Program',
    'Intensive summer program covering various drawing styles',
    'summer',
    'monthly',
    500.00,
    NULL,
    NULL,
    1
  ) RETURNING id INTO summer_event_id;

  -- Insert batches
  INSERT INTO batches (
    event_id,
    name,
    schedule,
    start_time,
    end_time,
    working_days,
    capacity
  ) VALUES 
  (
    regular_event_id,
    'Morning Batch',
    'Monday-Wednesday-Friday',
    '09:00',
    '11:00',
    ARRAY['Monday', 'Wednesday', 'Friday'],
    15
  ),
  (
    regular_event_id,
    'Evening Batch',
    'Tuesday-Thursday',
    '17:00',
    '19:00',
    ARRAY['Tuesday', 'Thursday'],
    12
  ),
  (
    advanced_event_id,
    'Weekend Intensive',
    'Saturday-Sunday',
    '10:00',
    '15:00',
    ARRAY['Saturday', 'Sunday'],
    10
  ),
  (
    summer_event_id,
    'Full Day Program',
    'Monday to Friday',
    '09:00',
    '16:00',
    ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    20
  );

  -- Insert discounts
  INSERT INTO discounts (
    event_id,
    name,
    description,
    discount_type,
    percentage,
    min_registration_value,
    valid_from,
    valid_until
  ) VALUES 
  (
    regular_event_id,
    'Early Bird Special',
    'Book early and save 15%',
    'early_bird',
    15.00,
    100.00,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
  ),
  (
    advanced_event_id,
    'Summer Sale',
    'Special summer discount',
    'seasonal',
    20.00,
    NULL,
    '2025-06-01',
    '2025-08-31'
  ),
  (
    summer_event_id,
    'Bulk Registration',
    'Register for 3 or more months and save 25%',
    'bulk',
    25.00,
    1000.00,
    CURRENT_DATE,
    '2025-12-31'
  );
END;
$$;