// src/lib/queryProducts.ts
import { supabase } from "@/integrations/supabase/client";

export async function queryProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, category, description, like_count")
    .eq("is_active", true)
    .order("like_count", { ascending: false })
    .limit(15);

  if (error) throw error;
  return data;
}
