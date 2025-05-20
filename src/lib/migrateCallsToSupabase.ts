
import { supabase } from "./supabase";
import { v4 as uuidv4 } from 'uuid';

export interface CallData {
  call_id: string;
  agent_id: string;
  call_status?: string;
  start_timestamp?: string;
  end_timestamp?: string;
  transcript?: string;
  recording_url?: string;
  call_type?: string;
  from_number?: string;
  call_analysis?: any;
  appointment_status?: string;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
  suggestedResponse?: string;
  created_at?: string; // Added created_at to the interface
  updated_at?: string; // Added updated_at to the interface
}

export async function migrateCallsToSupabase(agentId: string) {
  if (!agentId) {
    throw new Error("Agent ID is required to migrate calls");
  }

  try {
    // Fetch calls from the API
    const calls = await fetchCallsFromApi(agentId);

    // Check if calls were actually returned
    if (!calls || calls.length === 0) {
      console.log("No calls to migrate.");
      return;
    }

    // Loop through each call and insert it into Supabase
    for (const call of calls) {
      // Check if the call already exists in Supabase
      const { data, error } = await supabase
        .from('call_logs')
        .select('call_id')
        .eq('call_id', call.call_id);

      if (error) {
        console.error("Error checking if call exists:", error);
        continue; // Skip to the next call
      }

      if (data && data.length > 0) {
        console.log(`Call with ID ${call.call_id} already exists. Skipping.`);
        continue; // Skip to the next call
      }

      // If the call doesn't exist, insert it
      const { error: insertError } = await supabase
        .from('call_logs')
        .insert([
          {
            call_id: call.call_id,
            agent_id: agentId,
            call_status: call.call_status,
            start_timestamp: call.start_timestamp,
            end_timestamp: call.end_timestamp,
            transcript: call.transcript,
            recording_url: call.recording_url,
            call_type: call.call_type,
            from_number: call.from_number,
            call_analysis: call.call_analysis,
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error(`Error inserting call with ID ${call.call_id}:`, insertError);
      } else {
        console.log(`Call with ID ${call.call_id} inserted successfully.`);
      }
    }

    console.log("Call migration completed.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

export async function fetchCallsFromApi(agentId: string) {
  if (!agentId) {
    throw new Error("Agent ID is required to fetch calls");
  }
  
  try {
    // Updated to use the correct API endpoint: /calls instead of /call
    const response = await fetch(`https://api.retellai.com/api/v1/calls?agent_id=${agentId}&limit=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // API key is now automatically added by the fetch interceptor
      }
    });
    
    if (!response.ok) {
      // Improved error handling to check if response is JSON or not
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${errorData.error || response.statusText}`);
      } else {
        // If not JSON, get text for better error message
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    
    // Check if we received an array of calls
    if (!Array.isArray(data)) {
      console.error("API response is not an array:", data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Failed to fetch calls:", error);
    
    // Return empty array instead of throwing to prevent UI crashes
    // and allow the app to still work with local data
    return [];
  }
}

// Function to update call details in Supabase
export const updateCallDetails = async (callId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('call_logs')
      .update(updates)
      .eq('call_id', callId)
      .select(); // Fetch the updated record

    if (error) {
      console.error("Error updating call details:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No call found with the given ID to update.");
      return null;
    }

    console.log("Call details updated successfully:", data[0]);
    return data[0]; // Return the updated record
  } catch (error) {
    console.error("Failed to update call details:", error);
    throw error;
  }
};

// Add the missing saveCallToSupabase function that CallLogsTab.tsx is trying to import
export const saveCallToSupabase = async (callData: CallData): Promise<boolean> => {
  if (!callData.call_id || !callData.agent_id) {
    console.error("Call ID and Agent ID are required");
    return false;
  }

  try {
    // Check if the call already exists in Supabase
    const { data, error } = await supabase
      .from('call_logs')
      .select('id')
      .eq('call_id', callData.call_id)
      .eq('agent_id', callData.agent_id);

    if (error) {
      console.error("Error checking if call exists:", error);
      return false;
    }

    // Clean the data object to remove any fields that don't exist in the database schema
    const cleanedData: CallData = {
      call_id: callData.call_id,
      agent_id: callData.agent_id,
      call_status: callData.call_status,
      start_timestamp: callData.start_timestamp,
      end_timestamp: callData.end_timestamp,
      transcript: callData.transcript,
      recording_url: callData.recording_url,
      call_type: callData.call_type,
      from_number: callData.from_number,
      call_analysis: callData.call_analysis,
      appointment_status: callData.appointment_status,
      appointment_date: callData.appointment_date,
      appointment_time: callData.appointment_time,
      notes: callData.notes,
      updated_at: new Date().toISOString()
    };
    
    let result;
    
    if (data && data.length > 0) {
      // Update the existing record
      result = await supabase
        .from('call_logs')
        .update(cleanedData)
        .eq('id', data[0].id);
    } else {
      // Insert a new record with created_at timestamp
      result = await supabase
        .from('call_logs')
        .insert([{
          ...cleanedData, 
          created_at: new Date().toISOString()
        }]);
    }

    if (result.error) {
      console.error("Failed to save appointment data:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to save call to Supabase:", error);
    return false;
  }
};
