/**
 * Mock menu data for frontend development without a live backend.
 * Replace with real API calls via apiClient when backend is running.
 */

export const mockCategories = [
  { id: 'cat-1', name: 'Pizza', slug: 'pizza', sort_order: 0 },
  { id: 'cat-2', name: 'Fried Chicken', slug: 'fried-chicken', sort_order: 1 },
  { id: 'cat-3', name: 'Combos', slug: 'combos', sort_order: 2 },
  { id: 'cat-4', name: 'Sides', slug: 'sides', sort_order: 3 },
  { id: 'cat-5', name: 'Drinks', slug: 'drinks', sort_order: 4 },
  { id: 'cat-6', name: 'Deals', slug: 'deals', sort_order: 5 },
]

export const mockMenuItems = [
  // ── Pizza ──────────────────────────────────────────────────────────────────
  {
    id: 'item-1',
    category_id: 'cat-1',
    name: 'Sitara Signature Fire Pizza',
    description: 'Triple-layered dough, our house spice blend, mozzarella, jalapeños, chicken tikka, and a drizzle of neon-red sauce.',
    base_price: 799,
    image_url: null,
    is_available: true,
    is_spicy: true,
    tags: ['bestseller'],
    variants: [
      { id: 'var-1', name: 'Small (6")', price_delta: 0 },
      { id: 'var-2', name: 'Medium (9")', price_delta: 200 },
      { id: 'var-3', name: 'Large (12")', price_delta: 450 },
    ],
    addons: [
      { id: 'add-1', name: 'Extra Cheese', price: 120 },
      { id: 'add-2', name: 'Extra Jalapeños', price: 60 },
      { id: 'add-3', name: 'Stuffed Crust', price: 150 },
    ],
  },
  {
    id: 'item-2',
    category_id: 'cat-1',
    name: 'Midnight BBQ Chicken Pizza',
    description: 'Smoky BBQ base, grilled chicken strips, caramelised onions, and fresh coriander.',
    base_price: 749,
    image_url: null,
    is_available: true,
    is_spicy: false,
    tags: ['new'],
    variants: [
      { id: 'var-4', name: 'Small (6")', price_delta: 0 },
      { id: 'var-5', name: 'Medium (9")', price_delta: 200 },
      { id: 'var-6', name: 'Large (12")', price_delta: 450 },
    ],
    addons: [
      { id: 'add-4', name: 'Extra Cheese', price: 120 },
      { id: 'add-5', name: 'Mushrooms', price: 80 },
    ],
  },
  {
    id: 'item-3',
    category_id: 'cat-1',
    name: 'White Garlic Paneer Pizza',
    description: 'Creamy garlic sauce, golden paneer cubes, capsicum, and oregano.',
    base_price: 699,
    image_url: null,
    is_available: true,
    is_spicy: false,
    tags: ['vegetarian'],
    variants: [
      { id: 'var-7', name: 'Small (6")', price_delta: 0 },
      { id: 'var-8', name: 'Medium (9")', price_delta: 200 },
      { id: 'var-9', name: 'Large (12")', price_delta: 450 },
    ],
    addons: [],
  },

  // ── Fried Chicken ──────────────────────────────────────────────────────────
  {
    id: 'item-4',
    category_id: 'cat-2',
    name: 'Crispy Crunch Bucket',
    description: '6 pieces of our signature double-crunch fried chicken. Juicy inside, explosive crunch outside.',
    base_price: 999,
    image_url: null,
    is_available: true,
    is_spicy: false,
    tags: ['bestseller'],
    variants: [
      { id: 'var-10', name: '6 Pieces', price_delta: 0 },
      { id: 'var-11', name: '12 Pieces', price_delta: 799 },
    ],
    addons: [
      { id: 'add-6', name: 'Garlic Dip', price: 50 },
      { id: 'add-7', name: 'Sriracha Dip', price: 50 },
    ],
  },
  {
    id: 'item-5',
    category_id: 'cat-2',
    name: 'Zinger Stacker Burger',
    description: 'Double crispy fillet, volcano sauce, lettuce, pickles, and our secret slaw.',
    base_price: 649,
    image_url: null,
    is_available: true,
    is_spicy: true,
    tags: ['bestseller', 'new'],
    variants: [],
    addons: [
      { id: 'add-8', name: 'Extra Patty', price: 250 },
      { id: 'add-9', name: 'Cheese Slice', price: 80 },
    ],
  },

  // ── Combos ─────────────────────────────────────────────────────────────────
  {
    id: 'item-6',
    category_id: 'cat-3',
    name: 'Family Feast Combo',
    description: '1 Large Pizza + 6 Crispy Wings + 2 Sides + 4 Drinks. Feeds 4.',
    base_price: 2499,
    image_url: null,
    is_available: true,
    is_spicy: false,
    tags: ['bestseller'],
    variants: [],
    addons: [],
  },
  {
    id: 'item-7',
    category_id: 'cat-3',
    name: 'Duo Deal',
    description: '1 Medium Pizza + 2 Piece Chicken + 1 Large Drink.',
    base_price: 1299,
    image_url: null,
    is_available: true,
    is_spicy: false,
    tags: [],
    variants: [],
    addons: [],
  },

  // ── Sides ──────────────────────────────────────────────────────────────────
  {
    id: 'item-8',
    category_id: 'cat-4',
    name: 'Loaded Neon Fries',
    description: 'Crispy fries topped with cheese sauce, jalapeños, and sriracha drizzle.',
    base_price: 349,
    image_url: null,
    is_available: true,
    is_spicy: true,
    tags: ['new'],
    variants: [
      { id: 'var-12', name: 'Regular', price_delta: 0 },
      { id: 'var-13', name: 'Large', price_delta: 100 },
    ],
    addons: [],
  },
  {
    id: 'item-9',
    category_id: 'cat-4',
    name: 'Coleslaw',
    description: 'Creamy, tangy coleslaw. Pairs perfectly with fried chicken.',
    base_price: 149,
    image_url: null,
    is_available: true,
    is_spicy: false,
    tags: [],
    variants: [],
    addons: [],
  },

  // ── Drinks ─────────────────────────────────────────────────────────────────
  {
    id: 'item-10',
    category_id: 'cat-5',
    name: 'Pepsi',
    description: 'Ice cold Pepsi.',
    base_price: 120,
    image_url: null,
    is_available: true,
    is_spicy: false,
    tags: [],
    variants: [
      { id: 'var-14', name: '330ml Can', price_delta: 0 },
      { id: 'var-15', name: '1.5L Bottle', price_delta: 130 },
    ],
    addons: [],
  },
  {
    id: 'item-11',
    category_id: 'cat-5',
    name: 'Mango Lassi',
    description: 'House-made thick mango lassi. Chilled and refreshing.',
    base_price: 199,
    image_url: null,
    is_available: true,
    is_spicy: false,
    tags: ['new'],
    variants: [],
    addons: [],
  },

  // ── Deals ──────────────────────────────────────────────────────────────────
  {
    id: 'item-12',
    category_id: 'cat-6',
    name: 'Late Night Special',
    description: '1 Large Pizza + Crispy Bucket (6 pcs) + 2 Drinks. Midnight cravings sorted.',
    base_price: 1899,
    image_url: null,
    is_available: true,
    is_spicy: false,
    tags: ['bestseller'],
    variants: [],
    addons: [],
  },
]
