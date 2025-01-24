/*
  # Create tables for tracking TikTok trends

  1. New Tables
    - `trends`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `engagement` (bigint)
      - `created_at` (timestamp)
    - `trend_history`
      - `id` (uuid, primary key)
      - `trend_id` (uuid, foreign key)
      - `engagement` (bigint)
      - `captured_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
    - Add policies for service role to write data
*/

-- Create trends table
CREATE TABLE IF NOT EXISTS trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  engagement bigint,
  created_at timestamptz DEFAULT now()
);

-- Create trend history table for tracking engagement over time
CREATE TABLE IF NOT EXISTS trend_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid REFERENCES trends(id) ON DELETE CASCADE,
  engagement bigint,
  captured_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_history ENABLE ROW LEVEL SECURITY;

-- Policies for trends table
CREATE POLICY "Allow public read access to trends"
  ON trends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to insert trends"
  ON trends
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policies for trend history table
CREATE POLICY "Allow public read access to trend history"
  ON trend_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to insert trend history"
  ON trend_history
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS trends_category_idx ON trends(category);
CREATE INDEX IF NOT EXISTS trends_created_at_idx ON trends(created_at);
CREATE INDEX IF NOT EXISTS trend_history_trend_id_idx ON trend_history(trend_id);
CREATE INDEX IF NOT EXISTS trend_history_captured_at_idx ON trend_history(captured_at);