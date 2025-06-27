/*
  # User Management Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `role` (text)
      - `avatar_url` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for:
      - Users can read their own profile
      - Users can update their own profile
      - Organizers can read all profiles
      - Admins have full access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  role text CHECK (role IN ('user', 'org', 'admin')) DEFAULT 'user',
  avatar_url text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role IN ('org', 'admin')
    )
  );

CREATE POLICY "Admins have full access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insert dummy users
DO $$
BEGIN
  -- Insert admin user
  INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'admin@example.com',
    '{"full_name": "Admin User", "role": "admin"}'::jsonb,
    now()
  ) ON CONFLICT DO NOTHING;

  -- Insert organization users
  INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at
  ) VALUES 
  (
    gen_random_uuid(),
    'org1@example.com',
    '{"full_name": "Organization One", "role": "org"}'::jsonb,
    now()
  ),
  (
    gen_random_uuid(),
    'org2@example.com',
    '{"full_name": "Organization Two", "role": "org"}'::jsonb,
    now()
  ) ON CONFLICT DO NOTHING;

  -- Insert regular users
  INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at
  ) VALUES 
  (
    gen_random_uuid(),
    'user1@example.com',
    '{"full_name": "User One", "role": "user"}'::jsonb,
    now()
  ),
  (
    gen_random_uuid(),
    'user2@example.com',
    '{"full_name": "User Two", "role": "user"}'::jsonb,
    now()
  ),
  (
    gen_random_uuid(),
    'user3@example.com',
    '{"full_name": "User Three", "role": "user"}'::jsonb,
    now()
  ) ON CONFLICT DO NOTHING;
END;
$$;