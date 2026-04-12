import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  createGodownRecord,
  createProductRecord,
  createStockInRecord,
  createStockOutRecord,
  deleteGodownRecord,
  deleteProductRecord,
  fetchInventorySnapshot,
  transferStockRecord,
} from '@/lib/inventory-api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string;
  createdAt: string;
  userId?: string | null;
}

export interface Godown {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  userId?: string | null;
}

export interface StockEntry {
  id: string;
  productId: string;
  godownId: string;
  quantity: number;
  userId?: string | null;
}

export interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'transfer';
  productId: string;
  fromGodownId?: string | null;
  toGodownId?: string | null;
  quantity: number;
  notes: string;
  date: string;
  userId?: string | null;
}

interface InventoryContextValue {
  products: Product[];
  godowns: Godown[];
  stock: StockEntry[];
  movements: StockMovement[];
  loading: boolean;
  isMutating: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => Promise<string>;
  deleteProduct: (id: string) => Promise<void>;
  addGodown: (g: Omit<Godown, 'id' | 'createdAt'>) => Promise<string>;
  deleteGodown: (id: string) => Promise<void>;
  addStockIn: (productId: string, godownId: string, qty: number, notes: string) => Promise<void>;
  addStockOut: (productId: string, godownId: string, qty: number, notes: string) => Promise<boolean>;
  transferStock: (productId: string, fromId: string, toId: string, qty: number, notes: string) => Promise<boolean>;
  getStock: (productId: string, godownId: string) => number;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshInventory = useCallback(async () => {
    try {
      setError(null);
      const snapshot = await fetchInventorySnapshot();
      setProducts(snapshot.products);
      setGodowns(snapshot.godowns);
      setStock(snapshot.stock);
      setMovements(snapshot.movements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load inventory data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshInventory();
  }, [refreshInventory]);

  const value = useMemo<InventoryContextValue>(
    () => ({
      products,
      godowns,
      stock,
      movements,
      loading,
      isMutating,
      error,
      refreshInventory,
      addProduct: async (product) => {
        setIsMutating(true);
        try {
          setError(null);
          const createdProduct = await createProductRecord(product);
          setProducts((prev) => [createdProduct, ...prev]);
          return createdProduct.id;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to add product.';
          setError(message);
          throw err;
        } finally {
          setIsMutating(false);
        }
      },
      deleteProduct: async (id) => {
        setIsMutating(true);
        try {
          setError(null);
          await deleteProductRecord(id);
          setProducts((prev) => prev.filter((product) => product.id !== id));
          setStock((prev) => prev.filter((entry) => entry.productId !== id));
          setMovements((prev) => prev.filter((movement) => movement.productId !== id));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to delete product.';
          setError(message);
          throw err;
        } finally {
          setIsMutating(false);
        }
      },
      addGodown: async (godown) => {
        setIsMutating(true);
        try {
          setError(null);
          const createdGodown = await createGodownRecord(godown);
          setGodowns((prev) => [createdGodown, ...prev]);
          return createdGodown.id;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to add godown.';
          setError(message);
          throw err;
        } finally {
          setIsMutating(false);
        }
      },
      deleteGodown: async (id) => {
        setIsMutating(true);
        try {
          setError(null);
          await deleteGodownRecord(id);
          setGodowns((prev) => prev.filter((godown) => godown.id !== id));
          setStock((prev) => prev.filter((entry) => entry.godownId !== id));
          setMovements((prev) =>
            prev.filter(
              (movement) => movement.fromGodownId !== id && movement.toGodownId !== id
            )
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to delete godown.';
          setError(message);
          throw err;
        } finally {
          setIsMutating(false);
        }
      },
      getStock: (productId, godownId) => {
        const entry = stock.find((item) => item.productId === productId && item.godownId === godownId);
        return entry?.quantity ?? 0;
      },
      addStockIn: async (productId, godownId, qty, notes) => {
        setIsMutating(true);
        try {
          setError(null);
          const result = await createStockInRecord(productId, godownId, qty, notes);
          setStock((prev) => {
            const index = prev.findIndex((item) => item.id === result.stockEntry.id);
            if (index === -1) {
              return [...prev, result.stockEntry];
            }
            return prev.map((item, itemIndex) => (itemIndex === index ? result.stockEntry : item));
          });
          setMovements((prev) => [result.movement, ...prev]);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to add stock.';
          setError(message);
          throw err;
        } finally {
          setIsMutating(false);
        }
      },
      addStockOut: async (productId, godownId, qty, notes) => {
        setIsMutating(true);
        try {
          setError(null);
          const result = await createStockOutRecord(productId, godownId, qty, notes);
          if (!result) {
            return false;
          }

          setStock((prev) =>
            prev.map((item) => (item.id === result.stockEntry.id ? result.stockEntry : item))
          );
          setMovements((prev) => [result.movement, ...prev]);
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to remove stock.';
          setError(message);
          throw err;
        } finally {
          setIsMutating(false);
        }
      },
      transferStock: async (productId, fromId, toId, qty, notes) => {
        setIsMutating(true);
        try {
          setError(null);
          const result = await transferStockRecord(productId, fromId, toId, qty, notes);
          if (!result) {
            return false;
          }

          setStock((prev) => {
            const next = [...prev];
            [result.fromStockEntry, result.toStockEntry].forEach((entry) => {
              const index = next.findIndex((item) => item.id === entry.id);
              if (index === -1) {
                next.push(entry);
              } else {
                next[index] = entry;
              }
            });
            return next;
          });
          setMovements((prev) => [result.movement, ...prev]);
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to transfer stock.';
          setError(message);
          throw err;
        } finally {
          setIsMutating(false);
        }
      },
    }),
    [error, godowns, isMutating, loading, movements, products, refreshInventory, stock]
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
