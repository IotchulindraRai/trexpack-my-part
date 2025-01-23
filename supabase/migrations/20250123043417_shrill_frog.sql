/*
  # Initial Schema for TraxPack

  1. New Tables
    - `luggage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `tag_number` (text, unique)
      - `description` (text)
      - `status` (text)
      - `current_location` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tracking_updates`
      - `id` (uuid, primary key)
      - `luggage_id` (uuid, references luggage)
      - `location` (text)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations based on user authentication
*/

-- Create luggage table
CREATE TABLE IF NOT EXISTS luggage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  tag_number text UNIQUE NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'registered',
  current_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tracking_updates table
CREATE TABLE IF NOT EXISTS tracking_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  luggage_id uuid REFERENCES luggage ON DELETE CASCADE NOT NULL,
  location text NOT NULL,
  status text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE luggage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;

-- Policies for luggage table
CREATE POLICY "Users can view their own luggage"
  ON luggage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create luggage"
  ON luggage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own luggage"
  ON luggage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own luggage"
  ON luggage
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for tracking_updates table
CREATE POLICY "Users can view updates for their luggage"
  ON tracking_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM luggage
      WHERE luggage.id = tracking_updates.luggage_id
      AND luggage.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create updates for their luggage"
  ON tracking_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM luggage
      WHERE luggage.id = tracking_updates.luggage_id
      AND luggage.user_id = auth.uid()
    )
  );

-- Function to update luggage status
CREATE OR REPLACE FUNCTION update_luggage_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE luggage
  SET 
    current_location = NEW.location,
    status = NEW.status,
    updated_at = now()
  WHERE id = NEW.luggage_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update luggage status on new tracking update
CREATE TRIGGER update_luggage_status_trigger
AFTER INSERT ON tracking_updates
FOR EACH ROW
EXECUTE FUNCTION update_luggage_status();