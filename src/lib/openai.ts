
import { toast } from "sonner";

// Define the response structure
interface ExtractedAppointmentData {
  appointmentDate: string | null;
  appointmentTime: string | null;
  confidence: number;
  suggestedResponse: string | null;
}

/**
 * Extracts appointment date and time from a transcript using OpenAI API
 */
export async function extractAppointmentDetails(transcript: string): Promise<ExtractedAppointmentData> {
  // Default values in case of error
  const defaultResponse: ExtractedAppointmentData = {
    appointmentDate: null,
    appointmentTime: null,
    confidence: 0,
    suggestedResponse: null
  };

  if (!transcript || transcript.trim().length < 50) {
    toast.error("Transcript is too short to analyze");
    return defaultResponse;
  }

  try {
    // Prepare the system prompt
    const systemPrompt = `
      You are an AI trained to extract appointment date and time information from conversation transcripts.
      Analyze the transcript and find any mention of scheduling an appointment.
      
      Extract the following details:
      1. Appointment date (in YYYY-MM-DD format, return null if not found)
      2. Appointment time (in HH:MM format using 24-hour time, return null if not found)
      3. Confidence level (0-100 percent, how confident you are in the extraction)
      4. A suggested confirmation response that the agent could use
      
      If multiple dates or times are mentioned, choose the one most likely to be the final agreed appointment.
    `;

    // Use import.meta.env for Vite environment variables instead of process.env
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    if (!apiKey) {
      console.error("OpenAI API key is missing");
      toast.error("OpenAI API key is not configured");
      return defaultResponse;
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
            content: transcript
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
      const extractedData = await extractAppointmentDetails(call.transcript);
      
      if (extractedData.appointmentDate || extractedData.appointmentTime) {
        // We have appointment data - update in database
        const { data, error } = await fetch('/api/update-appointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            call_id: call.call_id,
            agent_id: agentId,
            appointment_date: extractedData.appointmentDate,
            appointment_time: extractedData.appointmentTime,
            appointment_status: 'in-process', // Default status for extracted appointments
            confidence: extractedData.confidence
          })
        }).then(res => res.json());
        
        if (error) {
          console.error("Failed to save appointment data:", error);
          return null;
        }
        
        return {
          ...call,
          appointment_date: extractedData.appointmentDate,
          appointment_time: extractedData.appointmentTime,
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
