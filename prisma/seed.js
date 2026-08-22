const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Seeding GlobeTrotter database...\n');

  // Clear existing data
  await prisma.activity.deleteMany();
  await prisma.activityTemplate.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      firstName: 'Admin',
      lastName: 'GlobeTrotter',
      email: 'admin@globetrotter.com',
      passwordHash: adminPassword,
      role: 'admin',
      city: 'San Francisco',
      country: 'USA',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      firstName: 'Arjun',
      lastName: 'Patel',
      email: 'arjun@demo.com',
      passwordHash: userPassword,
      role: 'user',
      city: 'Ahmedabad',
      country: 'India',
    },
  });

  console.log('✅ Users created');

  // Create 20 cities
  const citiesData = [
    { name: 'Paris', country: 'France', region: 'Europe', costIndex: 1.8, popularity: 95, description: 'The City of Light, known for the Eiffel Tower, world-class cuisine, and romantic ambiance.', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
    { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 1.6, popularity: 92, description: 'A dazzling blend of ultramodern and traditional, from neon-lit skyscrapers to historic temples.', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
    { name: 'New York', country: 'USA', region: 'North America', costIndex: 2.0, popularity: 94, description: 'The city that never sleeps — iconic skyline, Broadway, Central Park, and endless energy.', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
    { name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 0.6, popularity: 88, description: 'Tropical paradise with stunning beaches, rice terraces, and vibrant spiritual culture.', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
    { name: 'London', country: 'UK', region: 'Europe', costIndex: 1.9, popularity: 93, description: 'Historic capital with royal palaces, world-class museums, and iconic landmarks like Big Ben.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
    { name: 'Dubai', country: 'UAE', region: 'Middle East', costIndex: 1.7, popularity: 90, description: 'Futuristic cityscape with the tallest buildings, luxury shopping, and desert adventures.', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
    { name: 'Barcelona', country: 'Spain', region: 'Europe', costIndex: 1.3, popularity: 87, description: 'Gaudí architecture, Mediterranean beaches, and vibrant nightlife in Catalonia\'s capital.', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efed6?w=800' },
    { name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 1.4, popularity: 91, description: 'The Eternal City — Colosseum, Vatican, ancient ruins, and the best pasta you\'ll ever taste.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
    { name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 0.5, popularity: 86, description: 'Ornate temples, floating markets, vibrant street food, and buzzing nightlife.', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800' },
    { name: 'Sydney', country: 'Australia', region: 'Oceania', costIndex: 1.7, popularity: 85, description: 'Harbor city with the iconic Opera House, stunning beaches, and laid-back vibes.', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800' },
    { name: 'Istanbul', country: 'Turkey', region: 'Europe', costIndex: 0.8, popularity: 84, description: 'Where East meets West — stunning mosques, bazaars, and Bosphorus views.', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800' },
    { name: 'Prague', country: 'Czech Republic', region: 'Europe', costIndex: 0.9, popularity: 82, description: 'Fairy-tale city with Gothic architecture, cobblestone streets, and legendary beer.', imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800' },
    { name: 'Marrakech', country: 'Morocco', region: 'Africa', costIndex: 0.5, popularity: 80, description: 'Vibrant souks, stunning palaces, and the magical Jemaa el-Fnaa square.', imageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800' },
    { name: 'Kyoto', country: 'Japan', region: 'Asia', costIndex: 1.4, popularity: 83, description: 'Ancient capital with thousands of temples, serene gardens, and geisha culture.', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
    { name: 'Lisbon', country: 'Portugal', region: 'Europe', costIndex: 1.0, popularity: 81, description: 'Colorful hillside capital with vintage trams, pastéis de nata, and Atlantic views.', imageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800' },
    { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', costIndex: 1.5, popularity: 86, description: 'Canal-lined city famous for cycling, tulips, Van Gogh, and liberal culture.', imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800' },
    { name: 'Cape Town', country: 'South Africa', region: 'Africa', costIndex: 0.7, popularity: 79, description: 'Table Mountain backdrop, stunning coastlines, vineyards, and diverse culture.', imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800' },
    { name: 'Goa', country: 'India', region: 'Asia', costIndex: 0.3, popularity: 78, description: 'Sun-soaked beaches, Portuguese heritage, seafood shacks, and legendary parties.', imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800' },
    { name: 'Jaipur', country: 'India', region: 'Asia', costIndex: 0.3, popularity: 77, description: 'The Pink City — majestic forts, vibrant bazaars, and rich Rajasthani culture.', imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800' },
    { name: 'Singapore', country: 'Singapore', region: 'Asia', costIndex: 1.6, popularity: 89, description: 'Garden city of the future — Marina Bay Sands, hawker centers, and multicultural harmony.', imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800' },
  ];

  const cities = [];
  for (const cityData of citiesData) {
    const city = await prisma.city.create({
      data: { id: uuidv4(), ...cityData },
    });
    cities.push(city);
  }
  console.log(`✅ ${cities.length} cities created`);

  // Create activity templates (5 per city for first 10 cities)
  const activityCategories = [
    { category: 'sightseeing', icon: '🏛️' },
    { category: 'food', icon: '🍽️' },
    { category: 'adventure', icon: '🧗' },
    { category: 'culture', icon: '🎭' },
    { category: 'nightlife', icon: '🌙' },
  ];

  const cityActivities = {
    'Paris': [
      { name: 'Eiffel Tower Visit', category: 'sightseeing', estimatedCost: 25, estimatedDuration: 120, description: 'Ascend the iconic iron lattice tower for breathtaking Paris views.' },
      { name: 'French Bistro Experience', category: 'food', estimatedCost: 45, estimatedDuration: 90, description: 'Savor classic French cuisine at a charming Parisian bistro.' },
      { name: 'Seine River Cruise', category: 'adventure', estimatedCost: 15, estimatedDuration: 60, description: 'Glide past illuminated landmarks on an evening river cruise.' },
      { name: 'Louvre Museum Tour', category: 'culture', estimatedCost: 17, estimatedDuration: 180, description: 'Explore the world\'s largest art museum, home to the Mona Lisa.' },
      { name: 'Moulin Rouge Show', category: 'nightlife', estimatedCost: 87, estimatedDuration: 150, description: 'Witness the legendary cabaret show in Montmartre.' },
    ],
    'Tokyo': [
      { name: 'Senso-ji Temple', category: 'sightseeing', estimatedCost: 0, estimatedDuration: 90, description: 'Visit Tokyo\'s oldest and most significant Buddhist temple.' },
      { name: 'Tsukiji Outer Market Food Tour', category: 'food', estimatedCost: 35, estimatedDuration: 120, description: 'Sample the freshest sushi, tamagoyaki, and street food.' },
      { name: 'Mount Fuji Day Trip', category: 'adventure', estimatedCost: 80, estimatedDuration: 480, description: 'Journey to Japan\'s iconic volcanic peak for hiking and views.' },
      { name: 'Teamlab Borderless', category: 'culture', estimatedCost: 30, estimatedDuration: 120, description: 'Immerse yourself in stunning digital art installations.' },
      { name: 'Shibuya Nightlife Crawl', category: 'nightlife', estimatedCost: 50, estimatedDuration: 180, description: 'Experience Tokyo\'s vibrant bars and clubs in Shibuya district.' },
    ],
    'New York': [
      { name: 'Statue of Liberty & Ellis Island', category: 'sightseeing', estimatedCost: 24, estimatedDuration: 240, description: 'Ferry to the iconic statue and explore immigration history.' },
      { name: 'NYC Pizza Walking Tour', category: 'food', estimatedCost: 40, estimatedDuration: 150, description: 'Taste the best slices across Manhattan\'s legendary pizzerias.' },
      { name: 'Central Park Bike Ride', category: 'adventure', estimatedCost: 15, estimatedDuration: 120, description: 'Cycle through 843 acres of urban oasis.' },
      { name: 'Broadway Show', category: 'culture', estimatedCost: 120, estimatedDuration: 150, description: 'Catch a world-class theatrical performance on Broadway.' },
      { name: 'Rooftop Bar Hopping', category: 'nightlife', estimatedCost: 60, estimatedDuration: 180, description: 'Sip cocktails with panoramic skyline views.' },
    ],
    'Bali': [
      { name: 'Uluwatu Temple Sunset', category: 'sightseeing', estimatedCost: 5, estimatedDuration: 120, description: 'Watch a stunning sunset and Kecak dance at the cliffside temple.' },
      { name: 'Balinese Cooking Class', category: 'food', estimatedCost: 25, estimatedDuration: 180, description: 'Learn to cook authentic Balinese dishes with local ingredients.' },
      { name: 'White Water Rafting', category: 'adventure', estimatedCost: 30, estimatedDuration: 180, description: 'Raft through scenic gorges of the Ayung River.' },
      { name: 'Tirta Empul Purification', category: 'culture', estimatedCost: 3, estimatedDuration: 90, description: 'Experience a traditional Balinese water purification ritual.' },
      { name: 'Beach Club Party', category: 'nightlife', estimatedCost: 40, estimatedDuration: 240, description: 'Dance at a world-famous Seminyak beach club.' },
    ],
    'London': [
      { name: 'Tower of London', category: 'sightseeing', estimatedCost: 33, estimatedDuration: 180, description: 'Explore the historic fortress and see the Crown Jewels.' },
      { name: 'Borough Market Food Tour', category: 'food', estimatedCost: 30, estimatedDuration: 120, description: 'Sample artisan foods at London\'s oldest food market.' },
      { name: 'Thames Speedboat Ride', category: 'adventure', estimatedCost: 45, estimatedDuration: 50, description: 'Blast down the Thames on a high-speed RIB boat.' },
      { name: 'West End Musical', category: 'culture', estimatedCost: 70, estimatedDuration: 150, description: 'Enjoy a top musical at London\'s famed West End.' },
      { name: 'Soho Pub Crawl', category: 'nightlife', estimatedCost: 40, estimatedDuration: 180, description: 'Hop between historic pubs in London\'s vibrant Soho district.' },
    ],
    'Dubai': [
      { name: 'Burj Khalifa Observation Deck', category: 'sightseeing', estimatedCost: 40, estimatedDuration: 90, description: 'Stand atop the world\'s tallest building for incredible views.' },
      { name: 'Al Fahidi Heritage District', category: 'culture', estimatedCost: 5, estimatedDuration: 120, description: 'Explore the historic neighborhood with traditional wind-tower architecture.' },
      { name: 'Desert Safari', category: 'adventure', estimatedCost: 65, estimatedDuration: 360, description: 'Dune bashing, camel rides, and dinner under the stars.' },
      { name: 'Dubai Mall Food Court', category: 'food', estimatedCost: 20, estimatedDuration: 60, description: 'Global cuisines in the world\'s largest shopping mall.' },
      { name: 'Marina Yacht Party', category: 'nightlife', estimatedCost: 100, estimatedDuration: 180, description: 'Cruise Dubai Marina on a luxury yacht at night.' },
    ],
    'Barcelona': [
      { name: 'Sagrada Familia', category: 'sightseeing', estimatedCost: 26, estimatedDuration: 120, description: 'Marvel at Gaudí\'s unfinished masterpiece basilica.' },
      { name: 'La Boqueria Market', category: 'food', estimatedCost: 20, estimatedDuration: 90, description: 'Feast on fresh juices, jamón ibérico, and tapas.' },
      { name: 'Kayaking Costa Brava', category: 'adventure', estimatedCost: 35, estimatedDuration: 180, description: 'Paddle along stunning Mediterranean coves.' },
      { name: 'Flamenco Show', category: 'culture', estimatedCost: 40, estimatedDuration: 90, description: 'Experience passionate flamenco in an intimate tablao.' },
      { name: 'Gothic Quarter Bar Hopping', category: 'nightlife', estimatedCost: 30, estimatedDuration: 180, description: 'Explore hidden bars in Barcelona\'s medieval quarter.' },
    ],
    'Rome': [
      { name: 'Colosseum & Roman Forum', category: 'sightseeing', estimatedCost: 18, estimatedDuration: 180, description: 'Walk through ancient gladiatorial arenas and ruins.' },
      { name: 'Trastevere Food Tour', category: 'food', estimatedCost: 55, estimatedDuration: 180, description: 'Eat your way through Rome\'s most charming neighborhood.' },
      { name: 'Vespa Tour', category: 'adventure', estimatedCost: 70, estimatedDuration: 180, description: 'Zip through Roman streets on an iconic Italian scooter.' },
      { name: 'Vatican Museums & Sistine Chapel', category: 'culture', estimatedCost: 17, estimatedDuration: 240, description: 'Witness Michelangelo\'s masterpieces and centuries of papal art.' },
      { name: 'Aperitivo in Testaccio', category: 'nightlife', estimatedCost: 15, estimatedDuration: 120, description: 'Enjoy Italian cocktail culture in Rome\'s foodie district.' },
    ],
    'Bangkok': [
      { name: 'Grand Palace & Wat Phra Kaew', category: 'sightseeing', estimatedCost: 15, estimatedDuration: 150, description: 'Explore the dazzling royal complex and Emerald Buddha.' },
      { name: 'Chinatown Street Food', category: 'food', estimatedCost: 10, estimatedDuration: 120, description: 'Devour pad thai, mango sticky rice, and more on Yaowarat Road.' },
      { name: 'Floating Market Tour', category: 'adventure', estimatedCost: 20, estimatedDuration: 240, description: 'Navigate canals and shop from traditional floating vendors.' },
      { name: 'Thai Boxing Match', category: 'culture', estimatedCost: 30, estimatedDuration: 180, description: 'Watch thrilling Muay Thai at Rajadamnern Stadium.' },
      { name: 'Khao San Road Party', category: 'nightlife', estimatedCost: 15, estimatedDuration: 180, description: 'Join the backpacker street party on famous Khao San Road.' },
    ],
    'Singapore': [
      { name: 'Marina Bay Sands Skypark', category: 'sightseeing', estimatedCost: 23, estimatedDuration: 60, description: 'Panoramic views from the iconic ship-shaped rooftop.' },
      { name: 'Hawker Center Feast', category: 'food', estimatedCost: 8, estimatedDuration: 90, description: 'Michelin-starred chicken rice and laksa for just a few dollars.' },
      { name: 'Gardens by the Bay Night Walk', category: 'adventure', estimatedCost: 20, estimatedDuration: 120, description: 'Walk among Supertrees in a dazzling light show.' },
      { name: 'Peranakan Heritage Tour', category: 'culture', estimatedCost: 15, estimatedDuration: 120, description: 'Discover the unique Straits Chinese culture in Katong.' },
      { name: 'Clarke Quay Nightlife', category: 'nightlife', estimatedCost: 40, estimatedDuration: 180, description: 'Riverfront bars and clubs in Singapore\'s party district.' },
    ],
  };

  let templateCount = 0;
  for (const [cityName, activities] of Object.entries(cityActivities)) {
    const city = cities.find(c => c.name === cityName);
    if (!city) continue;
    for (const act of activities) {
      await prisma.activityTemplate.create({
        data: { id: uuidv4(), cityId: city.id, ...act },
      });
      templateCount++;
    }
  }
  console.log(`✅ ${templateCount} activity templates created`);

  // Create sample trips for demo user
  const paris = cities.find(c => c.name === 'Paris');
  const rome = cities.find(c => c.name === 'Rome');
  const barcelona = cities.find(c => c.name === 'Barcelona');
  const bali = cities.find(c => c.name === 'Bali');
  const tokyo = cities.find(c => c.name === 'Tokyo');

  const trip1 = await prisma.trip.create({
    data: {
      id: uuidv4(),
      userId: demoUser.id,
      name: 'European Dream Tour',
      description: 'A magical 10-day journey through the best of Europe — Paris, Barcelona, and Rome!',
      startDate: new Date('2026-09-15'),
      endDate: new Date('2026-09-25'),
      budget: 3500,
      isPublic: true,
      shareSlug: 'european-dream-2026',
      status: 'planning',
      coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    },
  });

  // Add stops to trip1
  const stop1 = await prisma.stop.create({
    data: {
      id: uuidv4(), tripId: trip1.id, cityId: paris.id, orderIndex: 0,
      arrivalDate: new Date('2026-09-15'), departureDate: new Date('2026-09-18'),
      transportCost: 150, accommodationCost: 450, mealBudgetPerDay: 50,
    },
  });

  const stop2 = await prisma.stop.create({
    data: {
      id: uuidv4(), tripId: trip1.id, cityId: barcelona.id, orderIndex: 1,
      arrivalDate: new Date('2026-09-18'), departureDate: new Date('2026-09-21'),
      transportCost: 80, accommodationCost: 300, mealBudgetPerDay: 35,
    },
  });

  const stop3 = await prisma.stop.create({
    data: {
      id: uuidv4(), tripId: trip1.id, cityId: rome.id, orderIndex: 2,
      arrivalDate: new Date('2026-09-21'), departureDate: new Date('2026-09-25'),
      transportCost: 60, accommodationCost: 400, mealBudgetPerDay: 40,
    },
  });

  // Add activities to stops
  const parisTemplates = await prisma.activityTemplate.findMany({ where: { cityId: paris.id } });
  for (const tmpl of parisTemplates.slice(0, 3)) {
    await prisma.activity.create({
      data: {
        id: uuidv4(), stopId: stop1.id, templateId: tmpl.id,
        name: tmpl.name, category: tmpl.category, cost: tmpl.estimatedCost,
        durationMinutes: tmpl.estimatedDuration, date: new Date('2026-09-16'),
      },
    });
  }

  const barcelonaTemplates = await prisma.activityTemplate.findMany({ where: { cityId: barcelona.id } });
  for (const tmpl of barcelonaTemplates.slice(0, 2)) {
    await prisma.activity.create({
      data: {
        id: uuidv4(), stopId: stop2.id, templateId: tmpl.id,
        name: tmpl.name, category: tmpl.category, cost: tmpl.estimatedCost,
        durationMinutes: tmpl.estimatedDuration, date: new Date('2026-09-19'),
      },
    });
  }

  const romeTemplates = await prisma.activityTemplate.findMany({ where: { cityId: rome.id } });
  for (const tmpl of romeTemplates.slice(0, 3)) {
    await prisma.activity.create({
      data: {
        id: uuidv4(), stopId: stop3.id, templateId: tmpl.id,
        name: tmpl.name, category: tmpl.category, cost: tmpl.estimatedCost,
        durationMinutes: tmpl.estimatedDuration, date: new Date('2026-09-22'),
      },
    });
  }

  // Create a second trip
  const trip2 = await prisma.trip.create({
    data: {
      id: uuidv4(),
      userId: demoUser.id,
      name: 'Bali Paradise Escape',
      description: 'A week of beaches, temples, and adventure in Bali.',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-08'),
      budget: 1200,
      isPublic: true,
      shareSlug: 'bali-paradise-2026',
      status: 'planning',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    },
  });

  await prisma.stop.create({
    data: {
      id: uuidv4(), tripId: trip2.id, cityId: bali.id, orderIndex: 0,
      arrivalDate: new Date('2026-11-01'), departureDate: new Date('2026-11-08'),
      transportCost: 50, accommodationCost: 350, mealBudgetPerDay: 20,
    },
  });

  // Third trip (completed) for variety
  const trip3 = await prisma.trip.create({
    data: {
      id: uuidv4(),
      userId: demoUser.id,
      name: 'Tokyo Adventure',
      description: 'Exploring the neon-lit streets and ancient temples of Tokyo.',
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-03-17'),
      budget: 2800,
      isPublic: true,
      shareSlug: 'tokyo-adventure-2026',
      status: 'completed',
      coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    },
  });

  await prisma.stop.create({
    data: {
      id: uuidv4(), tripId: trip3.id, cityId: tokyo.id, orderIndex: 0,
      arrivalDate: new Date('2026-03-10'), departureDate: new Date('2026-03-17'),
      transportCost: 200, accommodationCost: 700, mealBudgetPerDay: 40,
    },
  });

  console.log('✅ Sample trips created');
  console.log('\n🎉 Seeding complete!\n');
  console.log('Demo Accounts:');
  console.log('  Admin: admin@globetrotter.com / admin123');
  console.log('  User:  arjun@demo.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
