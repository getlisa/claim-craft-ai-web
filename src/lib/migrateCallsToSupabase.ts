
import { supabase } from "./supabase";

export const fetchCallsFromApi = async (agentId: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  
  if (!apiUrl || !apiKey) {
    throw new Error("API URL or API Key not configured in environment variables.");
  }
  
  try {
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
    throw new Error(error.message || "Failed to fetch calls from API");
  }
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
