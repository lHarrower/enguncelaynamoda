// File: supabase/functions/analyze-products/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';

// Helper function to ask a question to the VQA model
const askQuestionToAI = async (imageUrl: string, question: string): Promise<string> => {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/dandelin/vilt-b32-finetuned-vqa',
    {
      headers: { Authorization: `Bearer ${Deno.env.get('HUGGINGFACE_TOKEN')}` },
      method: 'POST',
      body: JSON.stringify({
        inputs: {
          text: question,
          image: imageUrl,
        },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Hugging Face API failed with status ${response.status}`);
  }
  const result = await response.json();
  if (result && Array.isArray(result) && result.length > 0 && result[0].answer) {
    return result[0].answer;
  }
  return 'unknown';
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // 1. Fetch all products where category is not yet analyzed
    const { data: products, error: fetchError } = await supabaseClient
      .from('products')
      .select('id, image_url')
      .is('category', null)
      .not('image_url', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    const errors: string[] = [];
    let processedCount = 0;

    // 2. Loop through each product and analyze it
    for (const product of products) {
      try {
        console.log(`Analyzing product ID: ${product.id}`);

        // Introduce a delay to avoid rate-limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const categoryQuestion =
          'What is the category of this clothing item? (e.g., t-shirt, dress, jeans, coat, shoes)';
        const colorQuestion =
          'What are the main colors of this clothing item as a comma separated list?';

        // SSRF guard: only allow Supabase Storage public URLs
        try {
          const u = new URL(product.image_url);
          const allowed =
            new URL(Deno.env.get('SUPABASE_URL')!).hostname.split('.')[0] + '.supabase.co';
          if (!u.hostname.includes(allowed) || !u.pathname.includes('/storage/v1/object/public/')) {
            throw new Error('Disallowed image_url host');
          }
        } catch {
          throw new Error('Invalid or unauthorized image_url');
        }

        const category = await askQuestionToAI(product.image_url, categoryQuestion);
        const colorsText = await askQuestionToAI(product.image_url, colorQuestion);

        const colorsArray = colorsText
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);

        // 3. Update the product record in the database
        const { error: updateError } = await supabaseClient
          .from('products')
          .update({
            category: category,
            colors: colorsArray,
            description: category, // Use category as description for now
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`Successfully updated product ID: ${product.id} with category: ${category}`);
        processedCount++;
      } catch (e) {
        const errorMessage = `Product ${product.id}: Analysis or update failed: ${e.message}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    // 4. Return a summary response
    const responsePayload = {
      message: 'Product analysis complete.',
      processed_count: processedCount,
      failed_count: errors.length,
      total_products_to_process: products.length,
      errors: errors,
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
