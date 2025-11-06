// src/lib/supabase-helpers.ts
import { supabase } from "@/integrations/supabase/client";

// ✅ Helper for product_likes table
export const queryProductLikes = {
  select: (columns: string) => {
    return supabase.from("product_likes").select(columns);
  },
  insert: (data: any | any[]) => {
    const safeData = Array.isArray(data) ? data : [data];
    return supabase.from("product_likes").insert(safeData);
  },
};

// ✅ Helper for admin_twofactor table
export const queryAdminTwoFactor = {
  select: (columns: string) => {
    return supabase.from("admin_twofactor").select(columns);
  },
  insert: (data: any | any[]) => {
    const safeData = Array.isArray(data) ? data : [data];
    return supabase.from("admin_twofactor").insert(safeData);
  },
};

// ✅ Helper for products table
export const queryProducts = {
  select: (columns: string) => {
    return supabase.from("products").select(columns);
  },
};

// ✅ RPC wrapper
export const callRpc = (functionName: string, params: any) => {
  return supabase.rpc(functionName, params);
};
