// supabase/functions/ai-analysis/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Cloudinary AI Content Analysis endpoint
const CLOUDINARY_ANALYSIS_URL = 'https://api.cloudinary.com/v1_1'

console.log('AI Analysis function is up and running!')

// Main function to serve requests
serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  // It's a good practice to handle CORS for all requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    } })
  }

  try {
    // 1. Retrieve Cloudinary secrets securely from environment variables
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY')
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary credentials are not set in Supabase secrets.')
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Expect a POST request with a JSON body containing an imageUrl
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'imageUrl is required in the request body.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    console.log(`Received request to analyze image: ${imageUrl}`)

    // 3. Prepare the request to Cloudinary API
    const analysisEndpoint = `${CLOUDINARY_ANALYSIS_URL}/${cloudName}/image/upload`
    
    // Cloudinary requires Basic Authentication (API Key and Secret)
    const authString = `Basic ${btoa(apiKey + ':' + apiSecret)}`

    console.log('Sending request to Cloudinary...')

    // 4. Make the fetch request to Cloudinary
    const cloudinaryResponse = await fetch(analysisEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authString,
      },
      body: JSON.stringify({
        file: imageUrl,
        // We request the "fashion" model from the AI analysis
        detection: 'fashion',
      }),
    })

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text()
      console.error('Cloudinary API returned an error:', errorText)
      throw new Error(`Cloudinary API error: ${cloudinaryResponse.statusText} - ${errorText}`)
    }

    const analysisData = await cloudinaryResponse.json()
    console.log('Successfully received analysis from Cloudinary.')
    
    // 5. Return the structured analysis data to the app
    return new Response(JSON.stringify({ success: true, analysis: analysisData }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    })

  } catch (error) {
    console.error('An unexpected error occurred:', error.message)
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.', details: error.message }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
   