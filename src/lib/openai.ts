
import { toast } from "sonner";
import { supabase } from "./supabase";
import { addDays, format } from "date-fns";

// Update response structure with new email field
interface ExtractedAppointmentData {
  appointmentDate: string | null;
  appointmentTime: string | null;
  clientName: string | null;
  clientAddress: string | null;
  clientEmail: string | null; // New field for email
  confidence: number;
  suggestedResponse: string | null;
}

/**
 * Extracts appointment date, time, client info, and email from a transcript using OpenAI API
 */
export async function extractAppointmentDetails(transcript: string, referenceDate?: Date): Promise<ExtractedAppointmentData> {
  // Default values in case of error
  const defaultResponse: ExtractedAppointmentData = {
    appointmentDate: null,
    appointmentTime: null,
    clientName: null,
    clientAddress: null,
    clientEmail: null,
    confidence: 0,
    suggestedResponse: null
  };

  if (!transcript || transcript.trim().length < 50) {
    toast.error("Transcript is too short to analyze");
    return defaultResponse;
  }

  try {
    // Use provided reference date or fall back to today
    const baseDate = referenceDate || new Date();
    const currentDate = format(baseDate, 'yyyy-MM-dd');
    
    // Updated system prompt to extract email addresses as well
    const systemPrompt = `
      You are an AI trained to extract appointment information and contact details from conversation transcripts.
      Analyze the transcript and find any mention of scheduling an appointment and contact information.
      
      Reference date for this call is ${currentDate}.
      
      When you encounter relative dates like "tomorrow", "next Monday", "in two days", etc., 
      calculate the actual date based on the reference date (${currentDate}).
      
      Extract the following details in JSON format:
      1. Appointment date (in YYYY-MM-DD format, return null if not found)
      2. Appointment time (in HH:MM format using 24-hour time, return null if not found)
      3. Client name (full name if available, return null if not found)
      4. Client address (street address, city, state, etc., return null if not found or incomplete)
      5. Client email (email address if mentioned, return null if not found)
      6. Confidence level (0-100 percent, how confident you are in the extraction)
      7. A suggested confirmation response that the agent could use
      
      For email extraction, look for patterns like:
      - "my email is..."
      - "you can reach me at..."
      - "send it to..."
      - Any text that follows standard email format (name@domain.com)
      
      If multiple dates, times, or emails are mentioned, choose the one most likely to be the final agreed appointment or primary contact.
      
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
    `;

    // Check for API key in localStorage first (temporary storage for testing)
    let apiKey = localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY || '';
    
    if (!apiKey) {
      console.error("OpenAI API key is missing");
      toast.error("OpenAI API key is not configured");
      
      // Prompt user for API key
      apiKey = prompt("Please enter your OpenAI API key to extract appointment details:") || '';
      
      if (apiKey) {
        // Store temporarily in localStorage
        localStorage.setItem('openai_api_key', apiKey);
        toast.success("API key saved temporarily");
      } else {
        return defaultResponse;
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to extract appointment details");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      appointmentDate: result.appointmentDate,
      appointmentTime: result.appointmentTime,
      clientName: result.clientName,
      clientAddress: result.clientAddress,
      clientEmail: result.clientEmail, // New field
      confidence: result.confidence || 0,
      suggestedResponse: result.suggestedResponse
    };
  } catch (error) {
    console.error("Error extracting appointment details:", error);
    toast.error("Failed to analyze transcript");
    return defaultResponse;
  }
}

// Automatically process and save appointment data from call transcript
export async function processCallTranscript(call: any, agentId: string) {
  if (!call.transcript || !agentId) return null;
  
  try {
    // Only process if no appointment data exists yet
    if (!call.appointment_date && !call.appointment_time) {
      // Convert the call's start timestamp to a Date object to use as reference
      const callDate = call.start_timestamp 
        ? new Date(typeof call.start_timestamp === 'number' ? call.start_timestamp : Number(call.start_timestamp))
        : new Date();
      
      const extractedData = await extractAppointmentDetails(call.transcript, callDate);
      
      if (extractedData.appointmentDate || extractedData.appointmentTime || extractedData.clientEmail) {
        // We have appointment or contact data - update in Supabase database directly
        // Include the new client email field
        const { data, error } = await supabase
          .from('call_logs')
          .upsert({
            call_id: call.call_id,
            agent_id: agentId,
            appointment_date: extractedData.appointmentDate,
            appointment_time: extractedData.appointmentTime,
            client_name: extractedData.clientName,
            client_address: extractedData.clientAddress,
            client_email: extractedData.clientEmail, // New field
            appointment_status: 'in-process', // Default status for extracted appointments
            from_number: call.from_number || "",
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (error) {
          console.error("Failed to save appointment data:", error);
          return null;
        }
        
        return {
          ...call,
          appointment_date: extractedData.appointmentDate,
          appointment_time: extractedData.appointmentTime,
          client_name: extractedData.clientName,
          client_address: extractedData.clientAddress,
          client_email: extractedData.clientEmail, // New field
          appointment_status: 'in-process',
          confidence: extractedData.confidence,
          suggestedResponse: extractedData.suggestedResponse
        };
      }
    }
    
    return null; // No changes
  } catch (error) {
    console.error("Error processing transcript:", error);
    return null;
  }
}
