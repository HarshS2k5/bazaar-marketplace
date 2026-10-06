import { Category, ItemCondition } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: 'Tv', description: 'Gadgets, audio, cameras & home tech' },
  { id: 'phones', name: 'Phones', icon: 'Smartphone', description: 'Smartphones, smartwatches & accessories' },
  { id: 'computers', name: 'Computers', icon: 'Laptop', description: 'Laptops, desktops, monitors & PC parts' },
  { id: 'gaming', name: 'Gaming', icon: 'Gamepad2', description: 'Consoles, video games & controllers' },
  { id: 'vehicles', name: 'Vehicles', icon: 'Car', description: 'Cars, motorcycles, scooters & auto parts' },
  { id: 'bikes', name: 'Bicycles', icon: 'Bike', description: 'Road bikes, mountain bikes & accessories' },
  { id: 'furniture', name: 'Furniture', icon: 'Armchair', description: 'Sofas, beds, tables, chairs & storage' },
  { id: 'clothing', name: 'Fashion & Clothing', icon: 'Shirt', description: 'Menswear, womenswear, shoes & bags' },
  { id: 'books', name: 'Books & Media', icon: 'BookOpen', description: 'Novels, textbooks, comics & vinyl' },
  { id: 'sports', name: 'Sports & Fitness', icon: 'Trophy', description: 'Gym equipment, sports gear & outdoor' },
  { id: 'home-garden', name: 'Home & Garden', icon: 'Home', description: 'Kitchen, garden tools & home decor' },
  { id: 'other', name: 'Other', icon: 'Package', description: 'Miscellaneous items & collectibles' },
];

export const CONDITIONS: ItemCondition[] = [
  'Brand New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
];

export const SAFETY_TIPS = [
  'Meet in a safe, public, and well-lit location (e.g. coffee shop, shopping center).',
  'Inspect the item thoroughly in person before handing over payment.',
  'Never transfer money in advance via UPI, bank transfer, or wire before meeting.',
  'Never share your passwords, OTPs, PINs, or banking details with any buyer or seller.',
  'If a deal sounds too good to be true, it likely is. Trust your instincts.',
  'Report suspicious users or fraudulent listings immediately using the Report button.',
];
