import { supabase } from '@/lib/supabase';

import type { Godown, Product, StockEntry, StockMovement } from '@/context/inventory-context';

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string;
  created_at: string;
  user_id: string | null;
};

type GodownRow = {
  id: string;
  name: string;
  location: string;
  created_at: string;
  user_id: string | null;
};

type StockRow = {
  id: string;
  product_id: string;
  godown_id: string;
  quantity: number;
  user_id: string | null;
};

type StockMovementRow = {
  id: string;
  type: 'in' | 'out' | 'transfer';
  product_id: string;
  from_godown_id: string | null;
  to_godown_id: string | null;
  quantity: number;
  notes: string;
  created_at: string;
  user_id: string | null;
};

const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  unit: row.unit,
  category: row.category,
  createdAt: row.created_at,
  userId: row.user_id,
});

const mapGodown = (row: GodownRow): Godown => ({
  id: row.id,
  name: row.name,
  location: row.location,
  createdAt: row.created_at,
  userId: row.user_id,
});

const mapStock = (row: StockRow): StockEntry => ({
  id: row.id,
  productId: row.product_id,
  godownId: row.godown_id,
  quantity: row.quantity,
  userId: row.user_id,
});

const mapMovement = (row: StockMovementRow): StockMovement => ({
  id: row.id,
  type: row.type,
  productId: row.product_id,
  fromGodownId: row.from_godown_id,
  toGodownId: row.to_godown_id,
  quantity: row.quantity,
  notes: row.notes,
  date: row.created_at,
  userId: row.user_id,
});

const unwrap = <T>(error: { message: string } | null, data: T, fallbackMessage: string) => {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }

  return data;
};

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
};

async function getStockEntry(productId: string, godownId: string) {
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from('ios_stock')
    .select('id, product_id, godown_id, quantity, user_id')
    .eq('product_id', productId)
    .eq('godown_id', godownId)
    .eq('user_id', user_id)
    .maybeSingle<StockRow>();

  if (error) {
    throw new Error(error.message || 'Unable to load stock entry.');
  }

  return data;
}

async function saveStockEntry(productId: string, godownId: string, quantity: number) {
  const existing = await getStockEntry(productId, godownId);
  const user_id = await getUserId();

  if (existing) {
    const { data, error } = await supabase
      .from('ios_stock')
      .update({ quantity })
      .eq('id', existing.id)
      .eq('user_id', user_id)
      .select('id, product_id, godown_id, quantity, user_id')
      .single<StockRow>();

    return mapStock(unwrap(error, data, 'Unable to update stock quantity.'));
  }

  const { data, error } = await supabase
    .from('ios_stock')
    .insert({ product_id: productId, godown_id: godownId, quantity, user_id })
    .select('id, product_id, godown_id, quantity, user_id')
    .single<StockRow>();

  return mapStock(unwrap(error, data, 'Unable to create stock quantity.'));
}

async function createMovement(row: {
  type: 'in' | 'out' | 'transfer';
  productId: string;
  fromGodownId?: string | null;
  toGodownId?: string | null;
  quantity: number;
  notes: string;
}) {
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from('ios_stock_movements')
    .insert({
      type: row.type,
      product_id: row.productId,
      from_godown_id: row.fromGodownId ?? null,
      to_godown_id: row.toGodownId ?? null,
      quantity: row.quantity,
      notes: row.notes,
      user_id,
    })
    .select('id, type, product_id, from_godown_id, to_godown_id, quantity, notes, created_at, user_id')
    .single<StockMovementRow>();

  return mapMovement(unwrap(error, data, 'Unable to record stock movement.'));
}

export async function fetchInventorySnapshot() {
  const user_id = await getUserId();
  const [productsResponse, godownsResponse, stockResponse, movementsResponse] = await Promise.all([
    supabase.from('ios_products').select('id, name, sku, unit, category, created_at, user_id').eq('user_id', user_id).order('created_at', { ascending: false }),
    supabase.from('ios_godowns').select('id, name, location, created_at, user_id').eq('user_id', user_id).order('created_at', { ascending: false }),
    supabase.from('ios_stock').select('id, product_id, godown_id, quantity, user_id').eq('user_id', user_id),
    supabase.from('ios_stock_movements').select('id, type, product_id, from_godown_id, to_godown_id, quantity, notes, created_at, user_id').eq('user_id', user_id).order('created_at', { ascending: false }),
  ]);

  const products = unwrap(productsResponse.error, (productsResponse.data ?? []) as ProductRow[], 'Unable to load products.').map(mapProduct);
  const godowns = unwrap(godownsResponse.error, (godownsResponse.data ?? []) as GodownRow[], 'Unable to load godowns.').map(mapGodown);
  const stock = unwrap(stockResponse.error, (stockResponse.data ?? []) as StockRow[], 'Unable to load stock.').map(mapStock);
  const movements = unwrap(movementsResponse.error, (movementsResponse.data ?? []) as StockMovementRow[], 'Unable to load stock movements.').map(mapMovement);

  return { products, godowns, stock, movements };
}

export async function createProductRecord(product: Omit<Product, 'id' | 'createdAt'>) {
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from('ios_products')
    .insert({
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      category: product.category,
      user_id,
    })
    .select('id, name, sku, unit, category, created_at, user_id')
    .single<ProductRow>();

  return mapProduct(unwrap(error, data, 'Unable to create product.'));
}

export async function deleteProductRecord(id: string) {
  const user_id = await getUserId();

  const stockDelete = await supabase.from('ios_stock').delete().eq('product_id', id).eq('user_id', user_id);
  unwrap(stockDelete.error, true, 'Unable to delete product stock entries.');

  const movementDelete = await supabase.from('ios_stock_movements').delete().eq('product_id', id).eq('user_id', user_id);
  unwrap(movementDelete.error, true, 'Unable to delete product movements.');

  const productDelete = await supabase.from('ios_products').delete().eq('id', id).eq('user_id', user_id);
  unwrap(productDelete.error, true, 'Unable to delete product.');
}

export async function createGodownRecord(godown: Omit<Godown, 'id' | 'createdAt'>) {
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from('ios_godowns')
    .insert({
      name: godown.name,
      location: godown.location,
      user_id,
    })
    .select('id, name, location, created_at, user_id')
    .single<GodownRow>();

  return mapGodown(unwrap(error, data, 'Unable to create godown.'));
}

export async function deleteGodownRecord(id: string) {
  const user_id = await getUserId();

  const stockDelete = await supabase.from('ios_stock').delete().eq('godown_id', id).eq('user_id', user_id);
  unwrap(stockDelete.error, true, 'Unable to delete godown stock entries.');

  const outboundMovementDelete = await supabase.from('ios_stock_movements').delete().eq('from_godown_id', id).eq('user_id', user_id);
  unwrap(outboundMovementDelete.error, true, 'Unable to delete stock movements from this godown.');

  const inboundMovementDelete = await supabase.from('ios_stock_movements').delete().eq('to_godown_id', id).eq('user_id', user_id);
  unwrap(inboundMovementDelete.error, true, 'Unable to delete stock movements to this godown.');

  const godownDelete = await supabase.from('ios_godowns').delete().eq('id', id).eq('user_id', user_id);
  unwrap(godownDelete.error, true, 'Unable to delete godown.');
}

export async function createStockInRecord(productId: string, godownId: string, quantity: number, notes: string) {
  const existing = await getStockEntry(productId, godownId);
  const stockEntry = await saveStockEntry(productId, godownId, (existing?.quantity ?? 0) + quantity);
  const movement = await createMovement({
    type: 'in',
    productId,
    toGodownId: godownId,
    quantity,
    notes,
  });

  return { stockEntry, movement };
}

export async function createStockOutRecord(productId: string, godownId: string, quantity: number, notes: string) {
  const existing = await getStockEntry(productId, godownId);

  if (!existing || existing.quantity < quantity) {
    return null;
  }

  const stockEntry = await saveStockEntry(productId, godownId, existing.quantity - quantity);
  const movement = await createMovement({
    type: 'out',
    productId,
    fromGodownId: godownId,
    quantity,
    notes,
  });

  return { stockEntry, movement };
}

export async function transferStockRecord(
  productId: string,
  fromId: string,
  toId: string,
  quantity: number,
  notes: string
) {
  if (fromId === toId) {
    return null;
  }

  const fromEntry = await getStockEntry(productId, fromId);
  if (!fromEntry || fromEntry.quantity < quantity) {
    return null;
  }

  const toEntry = await getStockEntry(productId, toId);

  const fromStockEntry = await saveStockEntry(productId, fromId, fromEntry.quantity - quantity);
  const toStockEntry = await saveStockEntry(productId, toId, (toEntry?.quantity ?? 0) + quantity);
  const movement = await createMovement({
    type: 'transfer',
    productId,
    fromGodownId: fromId,
    toGodownId: toId,
    quantity,
    notes,
  });

  return { fromStockEntry, toStockEntry, movement };
}
