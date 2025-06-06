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
 * Extracts appointment date, time, client info, and email from a transcript using Supabase Edge Function
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
    console.log("Transcript too short for analysis:", transcript.length);
    toast.error("Transcript is too short to analyze");
    return defaultResponse;
  }

  try {
    // Use provided reference date or fall back to today
    const baseDate = referenceDate || new Date();
    
    console.log("Extracting from transcript:", transcript.substring(0, 200) + "...");
    
    // Call the secure Supabase Edge Function instead of OpenAI directly
    const { data, error } = await supabase.functions.invoke('extract-appointment', {
      body: {
        transcript: transcript,
        referenceDate: baseDate.toISOString()
      }
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message || "Failed to extract appointment details");
    }

    if (data.error) {
      console.error("Edge function returned error:", data.error);
      throw new Error(data.error);
    }
    
    console.log("Extraction result:", data);
    
    // Log specifically about email extraction
    if (data.clientEmail) {
      console.log("✅ Email extracted successfully:", data.clientEmail);
    } else {
      console.log("❌ No email found in transcript");
      // Let's also check if there are any obvious email patterns in the transcript
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const foundEmails = transcript.match(emailRegex);
      if (foundEmails) {
        console.log("🔍 But regex found these email patterns:", foundEmails);
      }
    }
    
    return {
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      clientName: data.clientName,
      clientAddress: data.clientAddress,
      clientEmail: data.clientEmail,
      confidence: data.confidence || 0,
      suggestedResponse: data.suggestedResponse
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
            client_email: extractedData.clientEmail,
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
          client_email: extractedData.clientEmail,
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
