// AYNAMODA AI Analysis Function - Security Hardened Version
// This function performs AI-powered clothing analysis with strict security controls

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

// Comprehensive clothing tag mapping for AI categorization
const TAG_TO_CATEGORY_MAP: Record<string, { main: string; sub: string }> = {
  // Tops
  't-shirt': { main: 'Tops', sub: 'T-shirt' },
  'shirt': { main: 'Tops', sub: 'Shirt' },
  'blouse': { main: 'Tops', sub: 'Blouse' },
  'sweater': { main: 'Tops', sub: 'Sweater' },
  'hoodie': { main: 'Tops', sub: 'Hoodie' },
  'tank top': { main: 'Tops', sub: 'Tank Top' },
  'crop top': { main: 'Tops', sub: 'Crop Top' },
  
  // Bottoms
  'jeans': { main: 'Bottoms', sub: 'Jeans' },
  'pants': { main: 'Bottoms', sub: 'Pants' },
  'trousers': { main: 'Bottoms', sub: 'Trousers' },
  'skirt': { main: 'Bottoms', sub: 'Skirt' },
  'shorts': { main: 'Bottoms', sub: 'Shorts' },
  'leggings': { main: 'Bottoms', sub: 'Leggings' },
  
  // Dresses
  'dress': { main: 'Dresses', sub: 'Dress' },
  'gown': { main: 'Dresses', sub: 'Gown' },
  
  // Outerwear
  'jacket': { main: 'Outerwear', sub: 'Jacket' },
  'coat': { main: 'Outerwear', sub: 'Coat' },
  'blazer': { main: 'Outerwear', sub: 'Blazer' },
  'cardigan': { main: 'Outerwear', sub: 'Cardigan' },
  
  // Shoes
  'shoe': { main: 'Shoes', sub: 'Shoes' },
  'sneaker': { main: 'Shoes', sub: 'Sneakers' },
  'boot': { main: 'Shoes', sub: 'Boots' },
  'heel': { main: 'Shoes', sub: 'Heels' },
  'sandal': { main: 'Shoes', sub: 'Sandals' },
};

/**
 * Validates that the imageUrl comes from our Supabase Storage domain
 * This prevents SSRF attacks by only allowing our own storage URLs
 */
function validateImageUrl(imageUrl: string, supabaseUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    const supabaseHost = new URL(supabaseUrl).hostname;
    
    // Extract project reference from Supabase URL (e.g., abc123.supabase.co)
    const projectRef = supabaseHost.split('.')[0];
    
    // Allow URLs from our Supabase storage domain
    const allowedPattern = `${projectRef}.supabase.co`;
    
    // Validate the URL is from our Supabase storage
    if (!url.hostname.includes(allowedPattern) || !url.pathname.includes('/storage/v1/object/public/')) {
      console.error(`[Security] Rejected imageUrl from unauthorized source: ${imageUrl}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`[Security] Invalid imageUrl format: ${imageUrl}`, error);
    return false;
  }
}

/**
 * Extracts dominant colors from Cloudinary response and formats them as hex codes
 */
function extractDominantColors(cloudinaryResponse: any): string[] {
  try {
    const colors = cloudinaryResponse.colors || [];
    return colors.map((color: any) => {
      if (Array.isArray(color) && color.length > 0) {
        return color[0]; // First element is usually the hex code
      }
      return color;
    }).filter((color: string) => color && typeof color === 'string');
  } catch (error) {
    console.error('[AI Analysis] Error extracting colors:', error);
    return [];
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // SECURITY: Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    // Initialize Supabase client with user authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // SECURITY: Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[Security] Authentication failed:', authError);
      throw new Error('Invalid authentication');
    }
    
    console.log(`[AI Analysis] Authenticated user: ${user.id}`);
    
    // Parse and validate request body
    const { imageUrl, itemId } = await req.json();
    
    if (!imageUrl || !itemId) { 
      throw new Error('Missing required parameters: imageUrl and itemId');
    }

    // SECURITY: Validate imageUrl against SSRF attacks
    if (!validateImageUrl(imageUrl, supabaseUrl)) {
      throw new Error('Invalid or unauthorized image URL');
    }
    
    console.log(`[AI Analysis] Processing item ${itemId} for user ${user.id}`);
    
    // SECURITY: Verify ownership of the wardrobe item
    const { data: item, error: fetchError } = await supabase
      .from('wardrobeItems')
      .select('user_id, ai_cache')
      .eq('id', itemId)
      .single();
      
    if (fetchError || !item) {
      console.error('[Security] Item not found:', fetchError);
      throw new Error('Wardrobe item not found');
    }
    
    if (item.user_id !== user.id) {
      console.error(`[Security] Unauthorized access attempt: user ${user.id} tried to access item owned by ${item.user_id}`);
      throw new Error('Unauthorized: You do not own this item');
    }
    
    // CACHING: Check if AI analysis already exists
    if (item.ai_cache && Object.keys(item.ai_cache).length > 0) {
      console.log(`[AI Analysis] Cache hit for item ${itemId}`);
      return new Response(JSON.stringify({ 
        success: true, 
        itemId, 
        cached: true,
        message: 'Using cached AI analysis'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Validate Cloudinary configuration
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')!;
    if (!cloudName) {
      throw new Error('Cloudinary configuration is missing');
    }
    
    console.log(`[AI Analysis] Calling Cloudinary API for item ${itemId}`);

    // Prepare Cloudinary API request
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('upload_preset', 'aynamoda_preset');
    formData.append('detection', 'aws_rek_tagging');
    formData.append('colors', 'true');
    
    // Call Cloudinary API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { 
        method: 'POST', 
        body: formData,
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json().catch(() => ({}));
      console.error('[AI Analysis] Cloudinary error:', errorData);
      throw new Error(`AI analysis service error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const analysisResult = await cloudinaryResponse.json();
    console.log(`[AI Analysis] Cloudinary analysis completed for item ${itemId}`);
    
    // Process AI analysis results
    const detectedTags = analysisResult.info?.detection?.aws_rek_tagging?.data?.map(
      (t: any) => t.tag.toLowerCase()
    ) || [];
    
    let aiMainCategory = 'Uncategorized';
    let aiSubCategory = 'Uncategorized';

    // Match detected tags to our category mapping
    for (const tag of detectedTags) {
      if (TAG_TO_CATEGORY_MAP[tag]) {
        aiMainCategory = TAG_TO_CATEGORY_MAP[tag].main;
        aiSubCategory = TAG_TO_CATEGORY_MAP[tag].sub;
        break;
      }
    }
    
    const aiDominantColors = extractDominantColors(analysisResult);
    
    console.log(`[AI Analysis] Results for item ${itemId}:`, {
      category: aiMainCategory,
      subCategory: aiSubCategory,
      colors: aiDominantColors.length,
      tags: detectedTags.length
    });

    // CRITICAL: Update ONLY the AI-specific columns
    const { error: updateError } = await supabase
      .from('wardrobeItems')
      .update({
        ai_cache: analysisResult,           // Store complete Cloudinary response
        ai_main_category: aiMainCategory,   // AI-generated main category
        ai_sub_category: aiSubCategory,     // AI-generated sub category  
        ai_dominant_colors: aiDominantColors, // AI-extracted colors
        // IMPORTANT: Do NOT touch user_* or main columns
      })
      .eq('id', itemId)
      .eq('user_id', user.id); // Extra security check
      
    if (updateError) {
      console.error('[AI Analysis] Database update failed:', updateError);
      throw new Error(`Failed to save AI analysis: ${updateError.message}`);
    }

    console.log(`[AI Analysis] Successfully saved AI analysis for item ${itemId}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      itemId,
      analysis: {
        mainCategory: aiMainCategory,
        subCategory: aiSubCategory,
        dominantColors: aiDominantColors,
        detectedTags: detectedTags.slice(0, 5) // Return first 5 tags for debugging
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error: any) {
    console.error('[AI Analysis] Error:', error);
    
    // Determine appropriate HTTP status code
    let status = 400;
    if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
      status = 401;
    } else if (error.message.includes('not found')) {
      status = 404;
    } else if (error.name === 'AbortError') {
      status = 408; // Request timeout
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'AI analysis failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    });
  }
});