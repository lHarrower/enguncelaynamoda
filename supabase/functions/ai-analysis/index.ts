// supabase/functions/ai-analysis/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

// A simple map to translate Cloudinary tags to our internal categories.
const TAG_TO_CATEGORY_MAP: Record<string, { main: string; sub: string }> = {
  // Sub-categories
  't-shirt': { main: 'Tops', sub: 'T-shirt' },
  'shirt': { main: 'Tops', sub: 'Shirt' },
  'blouse': { main: 'Tops', sub: 'Blouse' },
  'sweater': { main: 'Tops', sub: 'Sweater' },
  'jeans': { main: 'Bottoms', sub: 'Jeans' },
  'pants': { main: 'Bottoms', sub: 'Pants' },
  'skirt': { main: 'Bottoms', sub: 'Skirt' },
  'dress': { main: 'Dresses', sub: 'Dress' },
  // ... this list can be enriched over time.
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are not set.');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { imageUrl, itemId } = await req.json();
    if (!imageUrl || !itemId) { 
      throw new Error('imageUrl and itemId are required.'); 
    }

    // Check if we already have cached AI analysis for this item
    const { data: existingItem, error: fetchError } = await supabase
      .from('wardrobeItems')
      .select('ai_cache')
      .eq('id', itemId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Database error: ${fetchError.message}`);
    }
    
    // If we have cached data, skip Cloudinary API call
    if (existingItem?.ai_cache) {
      return new Response(JSON.stringify({ success: true, itemId, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get Cloudinary credentials
    const cloudinaryUrl = Deno.env.get('CLOUDINARY_URL');
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    if (!cloudinaryUrl || !cloudName) { 
      throw new Error('Cloudinary environment variables are not set.'); 
    }

    // Call Cloudinary API
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('upload_preset', 'aynamoda_preset');
    formData.append('detection', 'aws_rek_tagging');
    formData.append('colors', 'true');

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json();
      throw new Error(`Cloudinary API error: ${errorData.error.message}`);
    }

    const analysisResult = await cloudinaryResponse.json();
    
    // Process the analysis result
    const detectedTags = analysisResult.info?.detection?.aws_rek_tagging?.data?.map((t: any) => t.tag.toLowerCase()) || [];
    
    let mainCategory = 'Uncategorized';
    let subCategory = 'Uncategorized';

    for (const tag of detectedTags) {
      if (TAG_TO_CATEGORY_MAP[tag]) {
        mainCategory = TAG_TO_CATEGORY_MAP[tag].main;
        subCategory = TAG_TO_CATEGORY_MAP[tag].sub;
        break;
      }
    }
    
    const dominantColors = analysisResult.colors?.map((color: any) => color[0]) || [];

    // Update the wardrobe item with AI analysis results and cache
    const { error: updateError } = await supabase
      .from('wardrobeItems')
      .update({
        ai_cache: analysisResult, // Store complete Cloudinary response
        mainCategory,
        subCategory,
        dominantColors,
        // Don't update user overrides if they exist
        is_user_edited: false
      })
      .eq('id', itemId);
      
    if (updateError) {
      throw new Error(`Failed to update wardrobe item: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ success: true, itemId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});