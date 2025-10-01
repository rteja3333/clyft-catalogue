import { useEffect, useState, useCallback } from "react";
import { fetchCategories, fetchItems } from "../services/firestoreService";

export function useFetchData(enabled: boolean) {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, its] = await Promise.all([fetchCategories(), fetchItems()]);
      setCategories(cats);
      setItems(its);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { categories, items, loading, refresh: load };
}
