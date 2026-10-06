-- ========================================================
-- BAZAAR MARKETPLACE - SAMPLE SEED DATA
-- ========================================================

-- Insert system seller profile for catalog items
INSERT INTO public.profiles (id, name, email, phone, location, avatar_url, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Verified Seller', 'seller@bazaar.marketplace', '+91 98000 00001', 'Bandra West, Mumbai', NULL, 'user'),
  ('22222222-2222-2222-2222-222222222222', 'Verified Seller', 'seller@bazaar.marketplace', '+91 98000 00002', 'Indiranagar, Bengaluru', NULL, 'user'),
  ('33333333-3333-3333-3333-333333333333', 'Verified Seller', 'seller@bazaar.marketplace', '+91 98000 00003', 'Connaught Place, New Delhi', NULL, 'user'),
  ('44444444-4444-4444-4444-444444444444', 'Verified Seller', 'seller@bazaar.marketplace', '+91 98000 00004', 'T. Nagar, Chennai', NULL, 'user')
ON CONFLICT (id) DO NOTHING;

-- Insert Listings
INSERT INTO public.listings (id, seller_id, title, slug, description, price, category, condition, location, phone, status, views, created_at)
VALUES
  (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '11111111-1111-1111-1111-111111111111',
    'Apple iPhone 14 Pro - 128GB Space Black (Battery Health 92%)',
    'apple-iphone-14-pro-128gb-space-black-a1b2c3d4',
    'Selling my meticulously used iPhone 14 Pro 128GB in Space Black. Purchased from Apple BKC. Always kept with Spigen case and tempered glass screen protector. No scratches, dents, or defects. Battery health is at 92%. Comes with original USB-C to Lightning cable, original box, and bill. Serious buyers only, please call or WhatsApp.',
    64999,
    'phones',
    'Like New',
    'Bandra West, Mumbai',
    '+91 98201 23456',
    'active',
    342,
    NOW() - INTERVAL '2 days'
  ),
  (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    '22222222-2222-2222-2222-222222222222',
    'Sony PlayStation 5 Disc Edition + 2 DualSense Controllers & God of War Ragnarok',
    'sony-playstation-5-disc-edition-2-controllers-b2c3d4e5',
    'PS5 Disc Edition console in mint condition. Includes 2 original DualSense controllers (White and Midnight Black) and God of War Ragnarok physical disc. Rarely played due to busy work schedule. Under 10 months old. You are welcome to test it at my place before purchasing.',
    42000,
    'gaming',
    'Excellent',
    'Indiranagar, Bengaluru',
    '+91 98450 67890',
    'active',
    512,
    NOW() - INTERVAL '1 day'
  ),
  (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    '33333333-3333-3333-3333-333333333333',
    'Trek Marlin 7 Mountain Bike (Size L, Hydraulic Disc Brakes)',
    'trek-marlin-7-mountain-bike-c3d4e5f6',
    'Authentic Trek Marlin 7 hardtail mountain bike. RockShox suspension fork, Shimano 1x10 drivetrain, Shimano hydraulic disc brakes. Perfect for city commuting and weekend trail rides. Serviced 2 weeks ago with fresh puncture-resistant tires. Includes bottle cage and helmet.',
    38500,
    'bikes',
    'Good',
    'Connaught Place, New Delhi',
    '+91 98112 34567',
    'active',
    188,
    NOW() - INTERVAL '4 days'
  ),
  (
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    '11111111-1111-1111-1111-111111111111',
    'MacBook Pro 14" M2 Pro (16GB RAM, 512GB SSD) Space Gray',
    'macbook-pro-14-m2-pro-16gb-d4e5f6a7',
    'Apple MacBook Pro 14 inch with Apple M2 Pro chip. 16GB unified memory, 512GB fast SSD storage, stunning Liquid Retina XDR display. Battery cycle count only 45 cycles. Comes with MagSafe 3 charger and 67W power adapter. Perfect workhorse for software development and video editing.',
    129000,
    'computers',
    'Like New',
    'Bandra West, Mumbai',
    '+91 98201 23456',
    'active',
    620,
    NOW() - INTERVAL '3 days'
  ),
  (
    'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    '22222222-2222-2222-2222-222222222222',
    'Solid Sheesham Wood 6-Seater Dining Table Set with Cushioned Chairs',
    'solid-sheesham-wood-6-seater-dining-table-e5f6a7b8',
    'Premium solid teak-finished Sheesham wood dining table with 6 matching chairs. Upholstered high-density foam cushions in beige fabric. Relocating abroad, hence selling. The table is sturdy, heavy, and very well maintained with zero wobble.',
    22000,
    'furniture',
    'Excellent',
    'Koramangala, Bengaluru',
    '+91 98450 67890',
    'active',
    145,
    NOW() - INTERVAL '5 days'
  ),
  (
    'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
    '44444444-4444-4444-4444-444444444444',
    'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Silver',
    'sony-wh-1000xm5-wireless-silver-f6a7b8c9',
    'Industry-leading active noise cancellation with 30-hour battery life. Used only on flights during business travel. Complete with original magnetic travel case, 3.5mm audio jack cable, and charging cable. Clean pads, immaculate condition.',
    18500,
    'electronics',
    'Like New',
    'T. Nagar, Chennai',
    '+91 94440 12345',
    'active',
    298,
    NOW() - INTERVAL '12 hours'
  ),
  (
    '07a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c',
    '33333333-3333-3333-3333-333333333333',
    'Royal Enfield Classic 350 Reborn (Stealth Black, Dual Channel ABS)',
    'royal-enfield-classic-350-stealth-black-07a8b9c0',
    '2022 model Royal Enfield Classic 350 Dual Channel ABS in Matte Stealth Black. Only 8,400 kms clocked. Single owner, dealer serviced on time. Fitted with genuine RE touring mirrors and engine crash guard. All documents clear, insurance valid till 2027.',
    175000,
    'vehicles',
    'Excellent',
    'South Delhi, New Delhi',
    '+91 98112 34567',
    'active',
    840,
    NOW() - INTERVAL '6 days'
  ),
  (
    '18b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d',
    '44444444-4444-4444-4444-444444444444',
    'Canon EOS R50 Mirrorless Camera + RF-S 18-45mm IS STM Lens Kit',
    'canon-eos-r50-mirrorless-lens-kit-18b9c0d1',
    'Compact 24.2 MP 4K mirrorless camera. Perfect for content creation, YouTube, and photography. Includes kit lens, SanDisk 64GB Extreme Pro SD card, battery, and charger. Shutter count under 1,200 shots. Pristine glass and sensor.',
    47000,
    'electronics',
    'Brand New',
    'Anna Nagar, Chennai',
    '+91 94440 12345',
    'active',
    215,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Listing Images
INSERT INTO public.listing_images (listing_id, image_url, is_primary, sort_order)
VALUES
  -- iPhone 14 Pro
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80', true, 0),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80', false, 1),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80', false, 2),
  
  -- PS5
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80', true, 0),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80', false, 1),

  -- Trek Marlin 7
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80', true, 0),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80', false, 1),

  -- MacBook Pro
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80', true, 0),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80', false, 1),

  -- Dining Table
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80', true, 0),

  -- Sony Headphones
  ('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80', true, 0),

  -- Royal Enfield
  ('07a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80', true, 0),

  -- Canon EOS R50
  ('18b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80', true, 0);
