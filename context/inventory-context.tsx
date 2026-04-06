import React, { createContext, useContext, useMemo, useState } from 'react';

export interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string;
  createdAt: string;
}

export interface Godown {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface StockEntry {
  productId: string;
  godownId: string;
  quantity: number;
}

export interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'transfer';
  productId: string;
  fromGodownId?: string;
  toGodownId?: string;
  quantity: number;
  notes: string;
  date: string;
}

interface InventoryContextValue {
  products: Product[];
  godowns: Godown[];
  stock: StockEntry[];
  movements: StockMovement[];
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => string;
  deleteProduct: (id: string) => void;
  addGodown: (g: Omit<Godown, 'id' | 'createdAt'>) => string;
  deleteGodown: (id: string) => void;
  addStockIn: (productId: string, godownId: string, qty: number, notes: string) => void;
  addStockOut: (productId: string, godownId: string, qty: number, notes: string) => boolean;
  transferStock: (productId: string, fromId: string, toId: string, qty: number, notes: string) => boolean;
  getStock: (productId: string, godownId: string) => number;
}

const sampleProducts: Product[] = [
  { id: 'p1', name: 'Cement (50kg)', sku: 'CEM-50', unit: 'Bags', category: 'Building Materials', createdAt: '2025-01-15' },
  { id: 'p2', name: 'TMT Steel Bar 12mm', sku: 'STL-12', unit: 'Pieces', category: 'Steel', createdAt: '2025-01-15' },
  { id: 'p3', name: 'Bricks (Red)', sku: 'BRK-RED', unit: 'Pieces', category: 'Building Materials', createdAt: '2025-02-01' },
];

const sampleGodowns: Godown[] = [
  { id: 'g1', name: 'Main Warehouse', location: 'Industrial Area, Sector 5', createdAt: '2025-01-10' },
  { id: 'g2', name: 'Site Store - Project A', location: 'Construction Site, Phase 2', createdAt: '2025-01-20' },
];

const sampleStock: StockEntry[] = [
  { productId: 'p1', godownId: 'g1', quantity: 500 },
  { productId: 'p1', godownId: 'g2', quantity: 120 },
  { productId: 'p2', godownId: 'g1', quantity: 1000 },
  { productId: 'p3', godownId: 'g1', quantity: 5000 },
  { productId: 'p3', godownId: 'g2', quantity: 2000 },
];

const sampleMovements: StockMovement[] = [
  { id: 'm1', type: 'in', productId: 'p1', toGodownId: 'g1', quantity: 500, notes: 'Initial stock', date: '2025-01-15' },
  { id: 'm2', type: 'transfer', productId: 'p1', fromGodownId: 'g1', toGodownId: 'g2', quantity: 120, notes: 'Site requirement', date: '2025-02-01' },
];

const InventoryContext = createContext<InventoryContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [godowns, setGodowns] = useState<Godown[]>(sampleGodowns);
  const [stock, setStock] = useState<StockEntry[]>(sampleStock);
  const [movements, setMovements] = useState<StockMovement[]>(sampleMovements);

  const value = useMemo<InventoryContextValue>(
    () => ({
      products,
      godowns,
      stock,
      movements,
      addProduct: (p) => {
        const id = uid();
        setProducts((prev) => [...prev, { ...p, id, createdAt: now() }]);
        return id;
      },
      deleteProduct: (id) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setStock((prev) => prev.filter((s) => s.productId !== id));
      },
      addGodown: (g) => {
        const id = uid();
        setGodowns((prev) => [...prev, { ...g, id, createdAt: now() }]);
        return id;
      },
      deleteGodown: (id) => {
        setGodowns((prev) => prev.filter((g) => g.id !== id));
        setStock((prev) => prev.filter((s) => s.godownId !== id));
      },
      getStock: (productId, godownId) => {
        const entry = stock.find((s) => s.productId === productId && s.godownId === godownId);
        return entry?.quantity ?? 0;
      },
      addStockIn: (productId, godownId, qty, notes) => {
        setStock((prev) => {
          const idx = prev.findIndex((s) => s.productId === productId && s.godownId === godownId);
          if (idx < 0) {
            return [...prev, { productId, godownId, quantity: qty }];
          }
          return prev.map((s, i) => (i === idx ? { ...s, quantity: s.quantity + qty } : s));
        });
        setMovements((prev) => [
          { id: uid(), type: 'in', productId, toGodownId: godownId, quantity: qty, notes, date: now() },
          ...prev,
        ]);
      },
      addStockOut: (productId, godownId, qty, notes) => {
        const current = stock.find((s) => s.productId === productId && s.godownId === godownId);
        if (!current || current.quantity < qty) {
          return false;
        }
        setStock((prev) =>
          prev.map((s) =>
            s.productId === productId && s.godownId === godownId
              ? { ...s, quantity: s.quantity - qty }
              : s
          )
        );
        setMovements((prev) => [
          { id: uid(), type: 'out', productId, fromGodownId: godownId, quantity: qty, notes, date: now() },
          ...prev,
        ]);
        return true;
      },
      transferStock: (productId, fromId, toId, qty, notes) => {
        const current = stock.find((s) => s.productId === productId && s.godownId === fromId);
        if (!current || current.quantity < qty || fromId === toId) {
          return false;
        }
        setStock((prev) => {
          const next = prev.map((s) =>
            s.productId === productId && s.godownId === fromId
              ? { ...s, quantity: s.quantity - qty }
              : s
          );
          const toIdx = next.findIndex((s) => s.productId === productId && s.godownId === toId);
          if (toIdx < 0) {
            next.push({ productId, godownId: toId, quantity: qty });
          } else {
            next[toIdx] = { ...next[toIdx], quantity: next[toIdx].quantity + qty };
          }
          return next;
        });
        setMovements((prev) => [
          { id: uid(), type: 'transfer', productId, fromGodownId: fromId, toGodownId: toId, quantity: qty, notes, date: now() },
          ...prev,
        ]);
        return true;
      },
    }),
    [godowns, movements, products, stock]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error('useInventory must be used inside InventoryProvider');
  }
  return ctx;
}
