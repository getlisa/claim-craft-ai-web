
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcript, referenceDate } = await req.json()
    
    if (!transcript || transcript.trim().length < 50) {
      return new Response(
        JSON.stringify({ 
          error: 'Transcript is too short to analyze',
          appointmentDate: null,
          appointmentTime: null,
          clientName: null,
          clientAddress: null,
          clientEmail: null,
          confidence: 0,
          suggestedResponse: null
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          appointmentDate: null,
          appointmentTime: null,
          clientName: null,
          clientAddress: null,
          clientEmail: null,
          confidence: 0,
          suggestedResponse: null
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use provided reference date or fall back to today
    const baseDate = referenceDate ? new Date(referenceDate) : new Date()
    const currentDate = baseDate.toISOString().split('T')[0] // YYYY-MM-DD format
    
    console.log('Processing transcript:', transcript.substring(0, 100) + '...')
    console.log('Reference date:', currentDate)
    
    const systemPrompt = `
      You are an AI trained to extract appointment information and contact details from conversation transcripts.
      Analyze the transcript carefully and find ANY mention of scheduling an appointment and contact information.
      
      Reference date for this call is ${currentDate}.
      
      When you encounter relative dates like "tomorrow", "next Monday", "in two days", etc., 
      calculate the actual date based on the reference date (${currentDate}).
      
      IMPORTANT FOR EMAIL EXTRACTION:
      Look very carefully for email addresses in the transcript. They can appear in many forms:
      - "my email is john@example.com"
      - "you can reach me at john.doe@company.com" 
      - "send it to john_doe@gmail.com"
      - "email me at john123@hotmail.com"
      - Any text matching email pattern: letters/numbers/symbols@domain.extension
      - Sometimes people spell it out: "john at gmail dot com"
      - Sometimes it's mentioned without explicit context: "yeah it's sarah.johnson@outlook.com"
      
      Extract the following details in JSON format:
      1. Appointment date (in YYYY-MM-DD format, return null if not found)
      2. Appointment time (in HH:MM format using 24-hour time, return null if not found)
      3. Client name (full name if available, return null if not found)
      4. Client address (street address, city, state, etc., return null if not found or incomplete)
      5. Client email (ANY email address mentioned in the conversation, return null if not found)
      6. Confidence level (0-100 percent, how confident you are in the extraction)
      7. A suggested confirmation response that the agent could use
      
      If multiple dates, times, or emails are mentioned, choose the one most likely to be the final agreed appointment or primary contact.
      
      Be very thorough in searching for emails - scan the entire transcript multiple times.
      
      Return the data in JSON format with the following structure:
      {
        "appointmentDate": "YYYY-MM-DD or null",
        "appointmentTime": "HH:MM or null", 
        "clientName": "string or null",
        "clientAddress": "string or null",
        "clientEmail": "string or null",
        "confidence": number,
        "suggestedResponse": "string or null"
      }
    `

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Extract appointment details and contact information from this transcript and respond with JSON: ${transcript}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(error.error?.message || "Failed to extract appointment details")
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    
    console.log('Extraction result:', result)
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in extract-appointment function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze transcript',
        appointmentDate: null,
        appointmentTime: null,
        clientName: null,
        clientAddress: null,
        clientEmail: null,
        confidence: 0,
        suggestedResponse: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
