import { supabase } from '../config/supabase.js';
import { toHttpError } from '../utils/dbErrors.js';

export const LOW_STOCK_THRESHOLD = 5;
const RECENT_LIMIT = 5;

const unwrap = ({ data, count, error }) => {
  if (error) throw toHttpError(error);
  return { data, count };
};

const countRows = (table) => supabase.from(table).select('id', { count: 'exact', head: true });

export async function getDashboardStats() {
  // Las consultas son independientes, así que se ejecutan en paralelo
  const [users, cars, parts, lowStock, inventory, recentCars, recentUsers] = await Promise.all([
    countRows('users'),
    countRows('cars'),
    countRows('parts'),
    supabase
      .from('parts')
      .select('id, name, part_number, brand, stock', { count: 'exact' })
      .lte('stock', LOW_STOCK_THRESHOLD)
      .order('stock', { ascending: true })
      .limit(10),
    supabase.from('parts').select('price, stock'),
    supabase
      .from('cars')
      .select('id, brand, model, year, license_plate, created_at, owner:users(id, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT),
    supabase
      .from('users')
      .select('id, first_name, last_name, phone, email, created_at')
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT),
  ].map((query) => query.then(unwrap)));

  const inventoryValue = inventory.data.reduce(
    (total, part) => total + Number(part.price) * part.stock,
    0,
  );

  return {
    totals: {
      users: users.count,
      cars: cars.count,
      parts: parts.count,
      lowStockParts: lowStock.count,
    },
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    inventoryValue: Number(inventoryValue.toFixed(2)),
    lowStockParts: lowStock.data,
    recentCars: recentCars.data,
    recentUsers: recentUsers.data,
  };
}
