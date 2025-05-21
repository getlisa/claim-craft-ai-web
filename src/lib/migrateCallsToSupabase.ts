
import { supabase } from "./supabase";

export const fetchCallsFromApi = async (agentId: string) => {
  // Use import.meta.env for Vite environment variables
  const apiUrl = import.meta.env.VITE_API_URL || "https://api.example.com/v1";
  const apiKey = import.meta.env.VITE_API_KEY || "demo_key";
  
  try {
    // For development/demo purposes, let's check if we're using default values
    if (apiUrl === "https://api.example.com/v1" || apiKey === "demo_key") {
      console.log("Using demo API configuration - this will simulate calls data for demonstration purposes");
      // Return mock data for demonstration purposes
      return getMockCallsData(agentId);
    }
    
    const response = await fetch(`${apiUrl}/calls?agent_id=${agentId}`, {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching calls from API:", error);
    // For demonstration purposes, return mock data if API call fails
    console.log("Falling back to mock data for demonstration");
    return getMockCallsData(agentId);
  }
};

// Mock data generation function to use when API keys are not available
const getMockCallsData = (agentId: string) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  return [
    {
      call_id: "mock-call-1",
      agent_id: agentId,
      from_number: "+1 (555) 123-4567",
      to_number: "+1 (555) 987-6543",
      start_timestamp: yesterday.toISOString(),
      end_timestamp: new Date(yesterday.getTime() + 320000).toISOString(), // 5 minutes 20 seconds
      call_status: "completed",
      call_type: "inbound",
      transcript: "Hello, this is John Doe. I'm calling to schedule an appointment for a consultation next week if possible.",
      recording_url: "https://example.com/recordings/mock-1.mp3",
      summary: "Client John Doe called to schedule a consultation appointment.",
      call_analysis: {
        call_summary: "Client inquiry about scheduling a consultation",
        user_sentiment: "positive",
        call_successful: true,
        in_voicemail: false
      },
      appointment_status: "scheduled",
      appointment_date: "2025-05-28",
      appointment_time: "14:30",
      client_name: "John Doe",
      client_address: "123 Main St, Anytown, CA 90210",
      notes: "Client prefers afternoon appointments."
    },
    {
      call_id: "mock-call-2",
      agent_id: agentId,
      from_number: "+1 (555) 223-8901",
      to_number: "+1 (555) 987-6543",
      start_timestamp: new Date(now.getTime() - 5400000).toISOString(), // 1.5 hours ago
      end_timestamp: new Date(now.getTime() - 5100000).toISOString(), // 1.5 hours ago + 5 minutes
      call_status: "completed",
      call_type: "inbound",
      transcript: "Hi, this is Sarah from downtown. I was wondering about your services but I'm not ready to schedule yet.",
      recording_url: "https://example.com/recordings/mock-2.mp3",
      summary: "Caller Sarah inquired about services but isn't ready to schedule.",
      call_analysis: {
        call_summary: "General inquiry about services",
        user_sentiment: "neutral",
        call_successful: true,
        in_voicemail: false
      },
      appointment_status: null,
      appointment_date: null,
      appointment_time: null,
      client_name: "Sarah Johnson",
      client_address: null,
      notes: "Follow up in two weeks."
    },
    {
      call_id: "mock-call-3",
      agent_id: agentId,
      from_number: "+1 (555) 876-2233",
      to_number: "+1 (555) 987-6543",
      start_timestamp: new Date(now.getTime() - 172800000).toISOString(), // 2 days ago
      end_timestamp: new Date(now.getTime() - 172560000).toISOString(), // 2 days ago + 4 minutes
      call_status: "missed",
      call_type: "outbound",
      transcript: null,
      recording_url: null,
      summary: null,
      call_analysis: null,
      appointment_status: null,
      appointment_date: null,
      appointment_time: null,
      client_name: null,
      client_address: null,
      notes: null
    }
  ];
};

export interface CallData {
  call_id: string;
  agent_id: string;
  from_number?: string;
  to_number?: string;
  start_timestamp?: string;
  end_timestamp?: string;
  call_status?: string;
  call_type?: string;
  transcript?: string;
  recording_url?: string;
  summary?: string;
  call_analysis?: any;
  appointment_status?: string;
  appointment_date?: string;
  appointment_time?: string;
  client_name?: string;
  client_address?: string;
  notes?: string;
  // Adding these properties to the interface to fix TypeScript errors
  id?: number;
  processed?: boolean;
  confidence?: number;
}

export const saveCallToSupabase = async (callData: CallData): Promise<boolean> => {
  try {
    if (!callData.agent_id) {
      throw new Error("Agent ID is required to save call data.");
    }
    
    const { data: existingData } = await supabase
      .from('call_logs')
      .select('id')
      .eq('call_id', callData.call_id)
      .eq('agent_id', callData.agent_id)
      .single();
    
    const upsertData = {
      call_id: callData.call_id,
      agent_id: callData.agent_id,
      from_number: callData.from_number || null,
      to_number: callData.to_number || null,
      start_timestamp: callData.start_timestamp || null,
      end_timestamp: callData.end_timestamp || null,
      call_status: callData.call_status || null,
      call_type: callData.call_type || null,
      transcript: callData.transcript || null,
      recording_url: callData.recording_url || null,
      summary: callData.summary || null,
      call_analysis: callData.call_analysis || null,
      appointment_status: callData.appointment_status || null,
      appointment_date: callData.appointment_date || null,
      appointment_time: callData.appointment_time || null,
      client_name: callData.client_name || null,
      client_address: callData.client_address || null,
      notes: callData.notes || null,
      updated_at: new Date().toISOString()
    };
    
    let result;
    if (existingData?.id) {
      // Update existing record
      result = await supabase
        .from('call_logs')
        .update(upsertData)
        .eq('id', existingData.id);
    } else {
      // Create new record
      result = await supabase
        .from('call_logs')
        .insert([upsertData]);
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error saving/updating call data in Supabase:", error);
    throw new Error(error.message || "Failed to save/update call data in Supabase");
  }
};
