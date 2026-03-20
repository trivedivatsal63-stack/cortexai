// lib/supabase/server.ts
// This is your SERVER-SIDE client — use only in API routes
import { createClient } from '@supabase/supabase-js';

export function createSupabaseServerClient(clerkUserId: string) {
    const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role bypasses RLS
        {
            auth: { persistSession: false }
        }
    );

    // Set the user context for RLS policies
    // We'll use service role + manual userId check in queries instead
    return { client, userId: clerkUserId };
}