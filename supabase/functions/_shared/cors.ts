// CORS headers configuration for Supabase Edge Functions
// Centralized CORS headers for Edge Functions
// In production, restrict to a single allowed origin via ALLOWED_ORIGIN env var.
const allowedOrigin =
  typeof Deno !== 'undefined' && Deno.env?.get ? Deno.env.get('ALLOWED_ORIGIN') || '*' : '*';

export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
} as const;
