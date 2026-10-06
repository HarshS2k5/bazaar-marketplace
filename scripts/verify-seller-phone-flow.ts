import { getListings, getListingById, getSellerListings, createListing, getUserFavorites, toggleFavorite } from '../lib/data/listings';
import { formatPhone, cleanPhoneForDialer } from '../lib/utils';
import { Profile } from '../types';

async function runVerification() {
  console.log('====================================================');
  console.log('STARTING SELLER PHONE NUMBER DATA FLOW VERIFICATION');
  console.log('====================================================\n');

  // Test 1: Verify Initial / Fresh Recommendations Listings have unique phone numbers
  console.log('TEST 1: Verifying Initial Fresh Recommendations have distinct phone numbers...');
  const initialListings = await getListings();
  const phoneNumbersFound = new Set<string>();
  const sellerIdsFound = new Set<string>();

  for (const item of initialListings) {
    const sellerPhone = item.seller?.phone || item.phone;
    const sellerId = item.seller_id;
    console.log(`- Listing: "${item.title.slice(0, 35)}..."`);
    console.log(`  Seller ID: ${sellerId}`);
    console.log(`  Seller Phone: ${sellerPhone}`);
    console.log(`  Formatted Phone: ${formatPhone(sellerPhone)}`);
    console.log(`  Dialer URL: tel:${cleanPhoneForDialer(sellerPhone)}`);

    if (!sellerPhone) {
      throw new Error(`Listing ${item.id} has no seller phone!`);
    }
    if (phoneNumbersFound.has(sellerPhone)) {
      throw new Error(`DUPLICATE PHONE DETECTED in initial listings: ${sellerPhone}`);
    }
    phoneNumbersFound.add(sellerPhone);
    sellerIdsFound.add(sellerId);
  }
  console.log(`✓ TEST 1 PASSED: All ${initialListings.length} initial listings have completely distinct seller IDs and phone numbers.\n`);

  // Test 2: Create 3 distinct seller accounts with different phone numbers
  console.log('TEST 2: Creating 3 different seller accounts with unique phone numbers...');
  const sellerA: Profile = {
    id: 'user-seller-aaa-111',
    name: 'Seller Anita Roy',
    email: 'anita@example.com',
    phone: '+91 98200 11111',
    location: 'Bandra, Mumbai',
    role: 'user',
  };

  const sellerB: Profile = {
    id: 'user-seller-bbb-222',
    name: 'Seller Balram Singh',
    email: 'balram@example.com',
    phone: '+91 98450 22222',
    location: 'Whitefield, Bengaluru',
    role: 'user',
  };

  const sellerC: Profile = {
    id: 'user-seller-ccc-333',
    name: 'Seller Chetan Verma',
    email: 'chetan@example.com',
    phone: '+91 98110 33333',
    location: 'Rohini, New Delhi',
    role: 'user',
  };

  // Create listings for each seller
  const listingA = await createListing(
    {
      seller_id: sellerA.id,
      title: 'Listing A - Vintage Analog Turntable',
      description: 'Well-maintained vinyl player with audio technica cartridge.',
      price: 14500,
      category: 'electronics',
      condition: 'Like New',
      location: sellerA.location || '',
      phone: sellerA.phone || '',
      status: 'approved',
      seller: sellerA,
      images: [],
    },
    ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80']
  );

  const listingB = await createListing(
    {
      seller_id: sellerB.id,
      title: 'Listing B - Ergonomic Office Chair',
      description: 'Mesh high-back chair with adjustable armrests and lumbar support.',
      price: 8900,
      category: 'furniture',
      condition: 'Excellent',
      location: sellerB.location || '',
      phone: sellerB.phone || '',
      status: 'approved',
      seller: sellerB,
      images: [],
    },
    ['https://images.unsplash.com/photo-1580481077194-436f456bb7d7?auto=format&fit=crop&w=800&q=80']
  );

  const listingC = await createListing(
    {
      seller_id: sellerC.id,
      title: 'Listing C - Canon 50mm f/1.8 Prime Lens',
      description: 'Sharp portrait lens with lens hood and UV filter.',
      price: 7500,
      category: 'electronics',
      condition: 'Brand New',
      location: sellerC.location || '',
      phone: sellerC.phone || '',
      status: 'approved',
      seller: sellerC,
      images: [],
    },
    ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80']
  );

  console.log(`✓ Created Listing A: ID=${listingA.id}, Seller=${listingA.seller?.name}, Phone=${listingA.seller?.phone}`);
  console.log(`✓ Created Listing B: ID=${listingB.id}, Seller=${listingB.seller?.name}, Phone=${listingB.seller?.phone}`);
  console.log(`✓ Created Listing C: ID=${listingC.id}, Seller=${listingC.seller?.name}, Phone=${listingC.seller?.phone}`);
  console.log('✓ TEST 2 PASSED: 3 distinct listings created.\n');

  // Test 3: Verify Fresh Recommendations includes newly posted items with correct phone numbers
  console.log('TEST 3: Verifying Fresh Recommendations mapping...');
  const freshListings = await getListings();
  const fetchedA = freshListings.find((l) => l.id === listingA.id);
  const fetchedB = freshListings.find((l) => l.id === listingB.id);
  const fetchedC = freshListings.find((l) => l.id === listingC.id);

  if (!fetchedA || fetchedA.seller?.phone !== '+91 98200 11111') {
    throw new Error(`Fresh Recommendations: Listing A phone mismatch! Expected +91 98200 11111, got ${fetchedA?.seller?.phone}`);
  }
  if (!fetchedB || fetchedB.seller?.phone !== '+91 98450 22222') {
    throw new Error(`Fresh Recommendations: Listing B phone mismatch! Expected +91 98450 22222, got ${fetchedB?.seller?.phone}`);
  }
  if (!fetchedC || fetchedC.seller?.phone !== '+91 98110 33333') {
    throw new Error(`Fresh Recommendations: Listing C phone mismatch! Expected +91 98110 33333, got ${fetchedC?.seller?.phone}`);
  }
  console.log('✓ TEST 3 PASSED: Fresh Recommendations correctly returns individual seller phone numbers.\n');

  // Test 4: Verify Search results query mapping
  console.log('TEST 4: Verifying Search Results mapping...');
  const searchResultsA = await getListings({ query: 'Turntable' });
  const searchItemA = searchResultsA.find((l) => l.id === listingA.id);
  if (!searchItemA || searchItemA.seller?.phone !== '+91 98200 11111') {
    throw new Error('Search Results: Failed to return seller A phone');
  }

  const searchResultsB = await getListings({ query: 'Office Chair' });
  const searchItemB = searchResultsB.find((l) => l.id === listingB.id);
  if (!searchItemB || searchItemB.seller?.phone !== '+91 98450 22222') {
    throw new Error('Search Results: Failed to return seller B phone');
  }
  console.log('✓ TEST 4 PASSED: Search results correctly isolate seller phone numbers.\n');

  // Test 5: Verify Category page mapping
  console.log('TEST 5: Verifying Category Page mapping...');
  const furnitureCategory = await getListings({ category: 'furniture' });
  const furnitureItem = furnitureCategory.find((l) => l.id === listingB.id);
  if (!furnitureItem || furnitureItem.seller?.phone !== '+91 98450 22222') {
    throw new Error('Category Page: Failed to return seller B phone for furniture');
  }
  console.log('✓ TEST 5 PASSED: Category query preserves specific seller phone.\n');

  // Test 6: Verify Listing Detail Page
  console.log('TEST 6: Verifying Listing Detail Page (getListingById)...');
  const detailA = await getListingById(listingA.id);
  const detailB = await getListingById(listingB.id);
  const detailC = await getListingById(listingC.id);

  if (!detailA || detailA.seller?.phone !== '+91 98200 11111') {
    throw new Error(`Detail Page A mismatch: ${detailA?.seller?.phone}`);
  }
  if (!detailB || detailB.seller?.phone !== '+91 98450 22222') {
    throw new Error(`Detail Page B mismatch: ${detailB?.seller?.phone}`);
  }
  if (!detailC || detailC.seller?.phone !== '+91 98110 33333') {
    throw new Error(`Detail Page C mismatch: ${detailC?.seller?.phone}`);
  }
  console.log('✓ TEST 6 PASSED: Detail pages return individual seller phones.\n');

  // Test 7: Verify Call Seller button dialer links
  console.log('TEST 7: Verifying Call Seller Button dialer links...');
  const dialerA = `tel:${cleanPhoneForDialer(detailA.seller?.phone)}`;
  const dialerB = `tel:${cleanPhoneForDialer(detailB.seller?.phone)}`;
  const dialerC = `tel:${cleanPhoneForDialer(detailC.seller?.phone)}`;

  if (dialerA !== 'tel:+919820011111') throw new Error(`Dialer A failed: ${dialerA}`);
  if (dialerB !== 'tel:+919845022222') throw new Error(`Dialer B failed: ${dialerB}`);
  if (dialerC !== 'tel:+919811033333') throw new Error(`Dialer C failed: ${dialerC}`);
  console.log(`✓ Dialer A: ${dialerA}`);
  console.log(`✓ Dialer B: ${dialerB}`);
  console.log(`✓ Dialer C: ${dialerC}`);
  console.log('✓ TEST 7 PASSED: Call Seller buttons open exact respective device dialers.\n');

  // Test 8: Verify Seller Dashboard query (getSellerListings)
  console.log('TEST 8: Verifying Seller Dashboard query (getSellerListings)...');
  const sellerAListings = await getSellerListings(sellerA.id);
  const sellerBListings = await getSellerListings(sellerB.id);
  const sellerCListings = await getSellerListings(sellerC.id);

  if (sellerAListings.length === 0 || sellerAListings[0].phone !== '+91 98200 11111') {
    throw new Error('Seller A dashboard query failed to return correct phone');
  }
  if (sellerBListings.length === 0 || sellerBListings[0].phone !== '+91 98450 22222') {
    throw new Error('Seller B dashboard query failed to return correct phone');
  }
  if (sellerCListings.length === 0 || sellerCListings[0].phone !== '+91 98110 33333') {
    throw new Error('Seller C dashboard query failed to return correct phone');
  }
  console.log('✓ TEST 8 PASSED: Seller dashboards display exact seller-specific phones.\n');

  // Test 9: Verify Favorites mapping (getUserFavorites)
  console.log('TEST 9: Verifying Favorites mapping...');
  const buyerId = 'test-buyer-uuid-999';
  await toggleFavorite(listingA.id, buyerId);
  await toggleFavorite(listingC.id, buyerId);

  const buyerFavorites = await getUserFavorites(buyerId);
  const favA = buyerFavorites.find((l) => l.id === listingA.id);
  const favC = buyerFavorites.find((l) => l.id === listingC.id);

  if (!favA || favA.seller?.phone !== '+91 98200 11111') {
    throw new Error('Favorites: Failed to preserve seller A phone');
  }
  if (!favC || favC.seller?.phone !== '+91 98110 33333') {
    throw new Error('Favorites: Failed to preserve seller C phone');
  }
  console.log('✓ TEST 9 PASSED: Wishlist / Favorites correctly preserve distinct seller phone numbers.\n');

  // Test 10: Verify Fallback Behavior when phone is unavailable
  console.log('TEST 10: Verifying Fallback Behavior when seller has no phone number...');
  const noPhoneSeller: Profile = {
    id: 'user-seller-no-phone',
    name: 'Seller Without Phone',
    email: 'nophone@example.com',
    phone: null,
    location: 'Goa',
    role: 'user',
  };

  const noPhoneListing = await createListing(
    {
      seller_id: noPhoneSeller.id,
      title: 'Listing Without Phone',
      description: 'An item where the seller has not provided a phone number.',
      price: 2000,
      category: 'books',
      condition: 'Good',
      location: 'Goa',
      phone: '',
      status: 'approved',
      seller: noPhoneSeller,
      images: [],
    },
    ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80']
  );

  const fetchedNoPhone = await getListingById(noPhoneListing.id);
  if (fetchedNoPhone?.phone !== null && fetchedNoPhone?.phone !== '') {
    throw new Error(`Expected null or empty phone for no-phone listing, got: ${fetchedNoPhone?.phone}`);
  }
  const formattedUnavailable = formatPhone(fetchedNoPhone?.phone);
  const dialerUnavailable = cleanPhoneForDialer(fetchedNoPhone?.phone);

  if (formattedUnavailable !== 'Phone number unavailable') {
    throw new Error(`Expected 'Phone number unavailable', got '${formattedUnavailable}'`);
  }
  if (dialerUnavailable !== '') {
    throw new Error(`Expected empty dialer string, got '${dialerUnavailable}'`);
  }
  console.log(`✓ Missing phone format output: "${formattedUnavailable}"`);
  console.log(`✓ Missing phone dialer output: "${dialerUnavailable}"`);
  console.log('✓ TEST 10 PASSED: Fallback behavior strictly enforces "Phone number unavailable" and disables dialer.\n');

  console.log('====================================================');
  console.log('ALL 10 TESTS PASSED SUCCESSFULLY! 100% VERIFIED!');
  console.log('====================================================');
}

runVerification().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
