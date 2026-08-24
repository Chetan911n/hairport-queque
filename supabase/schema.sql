-- Shortcuts Unisex Salon & Academy - Supabase Database Schema & RLS Policies
-- Target Project: Shortcuts Unisex Salon & Academy (Devlali Camp, Nashik)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Services & Pricing Catalog Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Appointments & Bookings Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Customer Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Initial Verified Salon Services
INSERT INTO public.services (name, category, price, description) VALUES
  ('Classic Haircut', 'Hair Cut & Styling', 200.00, 'Precision scissor and clipper work tailored to your face structure.'),
  ('Skin Fade & Precision Cut', 'Precision Cut', 250.00, 'Seamless gradient fade from zero skin, razor finishing.'),
  ('Beard Trim & Sculpt', 'Beard Care', 100.00, 'Sharp razor lines, length trimming & hot oil beard massage.'),
  ('Royal Clean Shave', 'Hot Towel Ritual', 100.00, 'Traditional straight razor shave with essential pre-shave oils & steam towel.'),
  ('Warm Oil Hair Spa & Massage', 'Scalp & Hair Therapy', 300.00, 'Luxurious scalp oil massage & deep conditioning hair spa.'),
  ('Hair & Beard Colouring', 'Colour Artistry', 300.00, 'Ammonia-free global colour coverage & highlights.'),
  ('Skin Cleanup & Facial', 'Skin Therapy', 400.00, 'Deep pore cleansing, exfoliation & face massage.')
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous insert for appointments (Booking form)
CREATE POLICY "Allow public booking creation" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- Allow public read access to services catalog and reviews
CREATE POLICY "Allow public read services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Allow public read reviews" ON public.reviews
  FOR SELECT USING (true);
