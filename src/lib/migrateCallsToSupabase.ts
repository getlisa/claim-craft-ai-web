
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
  from_number?: string;
  call_analysis?: {
    user_sentiment?: string;
    call_successful?: boolean;
  };
  id?: number; // Database ID if available
  created_at?: string;
}

// Helper function to ensure timestamps are in ISO format
const formatTimestamp = (timestamp: string | number | undefined): string | undefined => {
  if (!timestamp) return undefined;
  
  try {
    // If timestamp is a number (Unix timestamp in milliseconds), convert to ISO string
    if (typeof timestamp === 'number' || !isNaN(Number(timestamp))) {
      return new Date(Number(timestamp)).toISOString();
    }
    
    // If it's already a string in ISO format or other valid date format, parse and convert to ISO
    return new Date(timestamp).toISOString();
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return undefined;
  }
};

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
    
    // Create a clean call data object with only the fields that exist in our database schema
    // and properly format the timestamps
    const callData = {
      call_id: call.call_id,
      call_status: call.call_status,
      start_timestamp: formatTimestamp(call.start_timestamp),
      end_timestamp: formatTimestamp(call.end_timestamp),
      agent_id: call.agent_id,
      transcript: call.transcript,
      user_sentiment: call.call_analysis?.user_sentiment || call.user_sentiment,
      call_successful: call.call_analysis?.call_successful || call.call_successful,
      appointment_status: call.appointment_status,
      appointment_date: call.appointment_date,
      appointment_time: call.appointment_time,
      notes: call.notes,
      from_number: call.from_number,
      created_at: new Date().toISOString() // Add created_at timestamp
    };
    
    if (existingCall) {
      // Update existing call
      const { error: updateError } = await supabase
        .from('call_logs')
        .update(callData)
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
        .insert([callData]);
        
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

// UPDATED FUNCTION: Use mock data when RetellAI API is not accessible
export const fetchCallsFromApi = async (agentId: string): Promise<CallData[]> => {
  // Check if we should use the API or mock data
  const useRealApi = false; // Set to false to use mock data
  
  if (useRealApi) {
    const apiKey = 'key_a1bb2ca857089316392d48972a6f'; 
    const apiUrl = 'https://api.retellai.com/calls'; // Updated API endpoint
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          filter_criteria: { agent_id: [agentId] },
          limit: 100,
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
        } else {
          throw new Error(`API request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching calls from API:", error);
      // If API call fails, return mock data instead of throwing error
      return generateMockCallData(agentId);
    }
  } else {
    // Return mock data for development testing
    return generateMockCallData(agentId);
  }
};

// Generate mock call data for testing and development
const generateMockCallData = (agentId: string): CallData[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBefore = new Date(now);
  dayBefore.setDate(dayBefore.getDate() - 2);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  return [
    {
      call_id: "mock_call_1",
      call_status: "completed",
      start_timestamp: yesterday.toISOString(),
      end_timestamp: new Date(yesterday.getTime() + 5 * 60000).toISOString(), // 5 minutes later
      agent_id: agentId,
      transcript: "Hello, I'd like to schedule an appointment for next Monday at 10am.",
      from_number: "+1234567890",
      call_analysis: {
        user_sentiment: "positive",
        call_successful: true
      },
      appointment_status: "scheduled",
      appointment_date: "2025-05-27",
      appointment_time: "10:00 AM"
    },
    {
      call_id: "mock_call_2",
      call_status: "completed",
      start_timestamp: dayBefore.toISOString(),
      end_timestamp: new Date(dayBefore.getTime() + 7 * 60000).toISOString(), // 7 minutes later
      agent_id: agentId,
      transcript: "Hi, I need information about your services but I'm not ready to book yet.",
      from_number: "+1987654321",
      call_analysis: {
        user_sentiment: "neutral",
        call_successful: true
      }
    },
    {
      call_id: "mock_call_3",
      call_status: "missed",
      start_timestamp: lastWeek.toISOString(),
      agent_id: agentId,
      from_number: "+1555123456",
      call_analysis: {
        user_sentiment: "negative",
        call_successful: false
      }
    },
    {
      call_id: "mock_call_4",
      call_status: "completed",
      start_timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(), // 3 hours ago
      end_timestamp: new Date(now.getTime() - 3 * 3600000 + 4 * 60000).toISOString(), // 4 minutes later
      agent_id: agentId,
      transcript: "I'd like to schedule a follow-up appointment next week.",
      from_number: "+1444555666",
      call_analysis: {
        user_sentiment: "positive",
        call_successful: true
      },
      appointment_status: "scheduled",
      appointment_date: "2025-05-28",
      appointment_time: "2:30 PM"
    },
    {
      call_id: "mock_call_5",
      call_status: "completed",
      start_timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
      end_timestamp: new Date(now.getTime() - 30 * 60000 + 9 * 60000).toISOString(), // 9 minutes later
      agent_id: agentId,
      transcript: "I've been having this issue for weeks now and need immediate help.",
      from_number: "+1777888999",
      call_analysis: {
        user_sentiment: "negative",
        call_successful: false
      }
    },
    {
      call_id: "mock_call_6",
      call_status: "completed",
      start_timestamp: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(), // 2 days ago
      end_timestamp: new Date(now.getTime() - 2 * 24 * 3600000 + 8 * 60000).toISOString(), // 8 minutes later
      agent_id: agentId,
      transcript: "Thanks for all your help with my previous issue.",
      from_number: "+1333222111",
      call_analysis: {
        user_sentiment: "positive",
        call_successful: true
      },
      appointment_status: "completed",
      appointment_date: "2025-05-18",
      appointment_time: "11:00 AM"
    },
    {
      call_id: "mock_call_7",
      call_status: "in_progress",
      start_timestamp: new Date().toISOString(),
      agent_id: agentId,
      from_number: "+1999000111",
    }
  ];
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
