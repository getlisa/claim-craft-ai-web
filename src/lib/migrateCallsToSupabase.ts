
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CallData {
  call_id: string;
  call_status: string;
  start_timestamp: string;
  end_timestamp?: string;
  agent_id: string;
  transcript?: string;
  user_sentiment?: string;
  call_successful?: boolean;
  appointment_status?: string;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
}

export const saveCallToSupabase = async (call: CallData): Promise<boolean> => {
  try {
    // Check if call already exists
    const { data: existingCall, error: checkError } = await supabase
      .from('call_logs')
      .select('id')
      .eq('call_id', call.call_id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error("Error checking call existence:", checkError);
      return false;
    }
    
    if (existingCall) {
      // Update existing call
      const { error: updateError } = await supabase
        .from('call_logs')
        .update(call)
        .eq('id', existingCall.id);
        
      if (updateError) {
        console.error("Error updating call:", updateError);
        return false;
      }
      
      return true;
    } else {
      // Insert new call
      const { error: insertError } = await supabase
        .from('call_logs')
        .insert([call]);
        
      if (insertError) {
        console.error("Error inserting call:", insertError);
        return false;
      }
      
      return true;
    }
  } catch (error) {
    console.error("Unexpected error saving call:", error);
    return false;
  }
};

export const fetchCallsFromApi = async (agentId: string): Promise<CallData[]> => {
  const apiKey = 'key_a1bb2ca857089316392d48972a6f'; 
  const apiUrl = 'https://api.retellai.com/v2/list-calls';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        filter_criteria: { agent_id: [agentId] },
        limit: 10
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching calls from API:", error);
    throw error;
  }
};

export const migrateCallsToSupabase = async (agentId: string): Promise<void> => {
  try {
    toast.info("Starting call data migration...");
    
    const calls = await fetchCallsFromApi(agentId);
    
    if (calls.length === 0) {
      toast.info("No calls found to migrate");
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const call of calls) {
      // Prepare call data with additional fields
      const callData: CallData = {
        ...call,
        agent_id: agentId,
        // Extract sentiment if available
        user_sentiment: call.call_analysis?.user_sentiment || undefined,
        call_successful: call.call_analysis?.call_successful || undefined,
      };
      
      const success = await saveCallToSupabase(callData);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    if (failCount === 0) {
      toast.success(`Successfully migrated ${successCount} calls to database`);
    } else {
      toast.warning(`Migrated ${successCount} calls, but ${failCount} failed`);
    }
  } catch (error: any) {
    console.error("Migration error:", error);
    toast.error(`Migration failed: ${error.message || "Unknown error"}`);
  }
};
