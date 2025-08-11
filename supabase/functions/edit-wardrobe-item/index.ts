import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not set.');
    }
    
    // Create client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Parse request body
  const { itemId, name, tags, colors, category, subcategory } = await req.json();
    
    if (!itemId) {
      throw new Error('itemId is required');
    }
    
    // Validate that at least one field is being updated
    if (!name && !tags && !colors && !category && !subcategory) {
      throw new Error('At least one field must be provided for update');
    }
    
    // Validate dominantColors format if provided
    if (colors && !Array.isArray(colors)) {
      throw new Error('colors must be an array of strings');
    }
    
    // First, verify that the user owns this item
    const { data: item, error: fetchError } = await supabase
  .from('wardrobe_items')
      .select('user_id')
      .eq('id', itemId)
      .single();
      
    if (fetchError || !item) {
      throw new Error('Item not found');
    }
    
    if (item.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this item');
    }
    
    // Build update object dynamically
  const updateData: any = {};
  if (typeof name === 'string') updateData.name = name;
  if (Array.isArray(tags)) updateData.tags = tags;
  if (Array.isArray(colors)) updateData.colors = colors;
  if (typeof category === 'string') updateData.category = category.toLowerCase();
  if (typeof subcategory === 'string') updateData.subcategory = subcategory.toLowerCase();
    
    // Update the wardrobe item with user overrides
    const { error: updateError } = await supabase
  .from('wardrobe_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('user_id', user.id); // Extra safety check
      
    if (updateError) {
      throw new Error(`Failed to update wardrobe item: ${updateError.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        itemId,
        updated: {
          name: typeof name === 'string',
          tags: Array.isArray(tags),
          colors: Array.isArray(colors),
          category: typeof category === 'string',
          subcategory: typeof subcategory === 'string',
        }
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 400;
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
      }
    );
  }
}); 