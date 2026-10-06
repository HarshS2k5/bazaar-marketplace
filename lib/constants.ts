import { Category, ItemCondition } from '@/types';

export const CATEGORIES: Category[] = [
  { 
    id: 'electronics', 
    name: 'Electronics', 
    icon: 'Tv', 
    description: 'Gadgets, audio, cameras & home tech',
    subcategories: ['Headphones & Audio', 'Cameras & Lenses', 'TVs & Video', 'Smart Home', 'Wearables']
  },
  { 
    id: 'phones', 
    name: 'Phones', 
    icon: 'Smartphone', 
    description: 'Smartphones, smartwatches & accessories',
    subcategories: ['iPhones', 'Android Phones', 'Smartwatches', 'Phone Cases & Chargers', 'Tablets']
  },
  { 
    id: 'computers', 
    name: 'Computers', 
    icon: 'Laptop', 
    description: 'Laptops, desktops, monitors & PC parts',
    subcategories: ['Laptops', 'Desktops', 'Monitors', 'PC Components', 'Printers & Accessories']
  },
  { 
    id: 'gaming', 
    name: 'Gaming', 
    icon: 'Gamepad2', 
    description: 'Consoles, video games & controllers',
    subcategories: ['PlayStation', 'Xbox', 'Nintendo', 'PC Gaming Gear', 'Physical Game Discs']
  },
  { 
    id: 'vehicles', 
    name: 'Vehicles', 
    icon: 'Car', 
    description: 'Cars, motorcycles, scooters & auto parts',
    subcategories: ['Motorcycles', 'Scooters', 'Cars', 'Spare Parts', 'Helmets & Riding Gear']
  },
  { 
    id: 'bikes', 
    name: 'Bicycles', 
    icon: 'Bike', 
    description: 'Road bikes, mountain bikes & accessories',
    subcategories: ['Mountain Bikes', 'Road Bikes', 'Hybrid & City Bikes', 'Kids Bikes', 'Cycling Accessories']
  },
  { 
    id: 'furniture', 
    name: 'Furniture', 
    icon: 'Armchair', 
    description: 'Sofas, beds, tables, chairs & storage',
    subcategories: ['Sofas & Couches', 'Dining Tables & Chairs', 'Beds & Mattresses', 'Desks & Office Chairs', 'Wardrobes & Storage']
  },
  { 
    id: 'clothing', 
    name: 'Fashion & Clothing', 
    icon: 'Shirt', 
    description: 'Menswear, womenswear, shoes & bags',
    subcategories: ['Men Fashion', 'Women Fashion', 'Shoes & Sneakers', 'Watches & Jewelry', 'Bags & Luggage']
  },
  { 
    id: 'books', 
    name: 'Books & Media', 
    icon: 'BookOpen', 
    description: 'Novels, textbooks, comics & vinyl',
    subcategories: ['Fiction & Novels', 'Non-Fiction', 'Textbooks & Study', 'Comics & Graphic Novels', 'Music & Vinyl']
  },
  { 
    id: 'sports', 
    name: 'Sports & Fitness', 
    icon: 'Trophy', 
    description: 'Gym equipment, sports gear & outdoor',
    subcategories: ['Gym & Weights', 'Cricket & Football Gear', 'Yoga & Fitness', 'Camping & Trekking', 'Racquet Sports']
  },
  { 
    id: 'home-garden', 
    name: 'Home & Garden', 
    icon: 'Home', 
    description: 'Kitchen, garden tools & home decor',
    subcategories: ['Kitchen Appliances', 'Home Decor', 'Garden & Outdoor', 'Lighting', 'Cookware']
  },
  { 
    id: 'other', 
    name: 'Other', 
    icon: 'Package', 
    description: 'Miscellaneous items & collectibles',
    subcategories: ['Collectibles & Art', 'Musical Instruments', 'Pet Supplies', 'Tools & Machinery', 'Antiques']
  },
];

export const CONDITIONS: ItemCondition[] = [
  'Brand New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
];

export const POPULAR_SEARCH_TERMS = [
  'iPhone 14',
  'PlayStation 5',
  'Mountain Bike',
  'MacBook Pro',
  'Sony Headphones',
  'Dining Table',
  'Canon Camera',
  'Royal Enfield',
];

export const POPULAR_LOCATIONS = [
  'Mumbai',
  'Bengaluru',
  'New Delhi',
  'Pune',
  'Chennai',
  'Hyderabad',
  'Kolkata',
  'Ahmedabad',
];

export const SAFETY_TIPS = [
  'Meet in a safe, public, and well-lit location (e.g. coffee shop, shopping center).',
  'Inspect the item thoroughly in person before handing over payment.',
  'Never transfer money in advance via UPI, bank transfer, or wire before meeting.',
  'Never share your passwords, OTPs, PINs, or banking details with any buyer or seller.',
  'If a deal sounds too good to be true, it likely is. Trust your instincts.',
  'Report suspicious users or fraudulent listings immediately using the Report button.',
];
