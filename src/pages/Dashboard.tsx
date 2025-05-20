
import { useState, useEffect, useCallback } from "react";
import DashboardTab from "@/components/DashboardTab";
import CallLogsTab from "@/components/CallLogsTab";
import AppointmentsTab from "@/components/AppointmentsTab";
import CalendarTab from "@/components/CalendarTab";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCallsFromApi } from "@/lib/migrateCallsToSupabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { processCallTranscript } from "@/lib/openai";

// Define the Call type to prevent any[] usage
interface Call {
  call_id: string;
  agent_id?: string;
  call_status?: string;
  start_timestamp?: string;
  end_timestamp?: string;
  transcript?: string;
  recording_url?: string;
  call_type?: string;
  from_number?: string;
  appointment_status?: string;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
  call_analysis?: {
    call_summary?: string;
    user_sentiment?: string;
    call_successful?: boolean;
    in_voicemail?: boolean;
  };
  id?: number;
  processed?: boolean; // Track if a call has been processed
  [key: string]: any; // Allow additional fields
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [processedCalls, setProcessedCalls] = useState<Set<string>>(new Set());
  const { agentId, isAuthenticated } = useAuth();

  // Create a fetchCalls function that can be used for initial load and refreshes
  const fetchCalls = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Get calls from API - this might return empty array if API fails
      const apiCalls = await fetchCallsFromApi(agentId);
      
      // Get ALL calls from database
      const { data: dbCalls, error: dbError } = await supabase
        .from('call_logs')
        .select('*')
        .eq('agent_id', agentId);
      
      if (dbError) {
        console.error("Database error:", dbError);
        toast.error("Could not load data from database");
      }
      
      // Create a map of database calls by call_id
      const dbCallsMap = new Map();
      if (dbCalls && dbCalls.length > 0) {
        dbCalls.forEach(dbCall => {
          dbCallsMap.set(dbCall.call_id, dbCall);
        });
      }
      
      // If API calls is empty but we have DB calls, use those
      let mergedCalls: Call[] = [];
      
      if (apiCalls.length === 0 && dbCalls && dbCalls.length > 0) {
        mergedCalls = dbCalls.map(call => ({
          ...call,
          processed: true,
          // Ensure call_status has a value for display
          call_status: call.call_status || "unknown",
          // Ensure timestamps are properly formatted for duration calculations
          start_timestamp: call.start_timestamp || null,
          end_timestamp: call.end_timestamp || null
        }));
        
        if (!initialDataLoaded) {
          toast.info("Using locally stored calls - API connection failed");
        }
      } else {
        // Merge API calls with database data
        mergedCalls = apiCalls.map(apiCall => {
          const dbCall = dbCallsMap.get(apiCall.call_id);
          if (dbCall) {
            return {
              ...apiCall,
              appointment_status: dbCall.appointment_status || apiCall.appointment_status,
              appointment_date: dbCall.appointment_date || apiCall.appointment_date,
              appointment_time: dbCall.appointment_time || apiCall.appointment_time,
              notes: dbCall.notes || apiCall.notes,
              from_number: dbCall.from_number || apiCall.from_number || "",
              id: dbCall.id,
              call_status: apiCall.call_status || dbCall.call_status || "unknown", // Ensure call_status has a value
              start_timestamp: apiCall.start_timestamp || dbCall.start_timestamp || null,
              end_timestamp: apiCall.end_timestamp || dbCall.end_timestamp || null,
              processed: true // Mark calls from DB as processed
            };
          }
          return {
            ...apiCall,
            call_status: apiCall.call_status || "unknown", // Ensure call_status has a value
            start_timestamp: apiCall.start_timestamp || null,
            end_timestamp: apiCall.end_timestamp || null,
            processed: false // Mark new calls as not processed
          };
        });
      }
      
      setCalls(mergedCalls);
      setInitialDataLoaded(true);
      
      // Process transcripts with OpenAI in the background - only for unprocessed calls
      processCallTranscripts(mergedCalls.filter(call => !call.processed));
      
      if (mergedCalls.length === 0) {
        toast.info("No calls found for this agent");
      }
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error("Could not load call data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [agentId, initialDataLoaded]);

  // Process call transcripts to extract appointment details
  const processCallTranscripts = async (callsToProcess: Call[]) => {
    if (!agentId) return;
    
    // Find calls that have transcripts but no appointment data yet and haven't been processed
    const callsNeedingProcessing = callsToProcess.filter(call => 
      call.transcript && 
      !processedCalls.has(call.call_id) && 
      (!call.appointment_date || !call.appointment_time) &&
      !call.processed
    );
    
    if (callsNeedingProcessing.length === 0) return;
    
    // Process calls one by one
    for (const call of callsNeedingProcessing) {
      try {
        const updatedCall = await processCallTranscript(call, agentId);
        
        // Mark as processed regardless of result
        setProcessedCalls(prev => new Set(prev).add(call.call_id));
        
        // Update calls with processed flag
        setCalls(prevCalls => prevCalls.map(c => 
          c.call_id === call.call_id ? { ...c, processed: true } : c
        ));
        
        // If we got updated data, update our state
        if (updatedCall) {
          setCalls(prevCalls => prevCalls.map(c => 
            c.call_id === updatedCall.call_id ? { ...updatedCall, processed: true } : c
          ));
          
          // Show toast notification only for high confidence results
          if (updatedCall.confidence > 70) {
            toast.success(`Appointment detected for ${updatedCall.from_number || 'a call'}`, {
              description: `${updatedCall.appointment_date} at ${updatedCall.appointment_time}`
            });
          }
        }
      } catch (err) {
        console.error("Error processing transcript for call:", call.call_id, err);
      }
    }
  };

  // Load initial data when dashboard mounts and we have an agentId
  useEffect(() => {
    if (agentId && isAuthenticated) {
      fetchCalls();
    }
  }, [agentId, isAuthenticated, fetchCalls]);

  // Function to update a specific call in the calls array
  const updateCall = useCallback((updatedCall: Call) => {
    if (!updatedCall || !updatedCall.call_id) return;
    
    setCalls(prevCalls => prevCalls.map(call => 
      call.call_id === updatedCall.call_id ? { 
        ...call, 
        ...updatedCall, 
        processed: true,
        call_status: updatedCall.call_status || call.call_status || "unknown", // Ensure call_status has a value
        start_timestamp: updatedCall.start_timestamp || call.start_timestamp || null,
        end_timestamp: updatedCall.end_timestamp || call.end_timestamp || null
      } : call
    ));
    
    // Show a feedback toast
    toast.success("Call data updated successfully");
  }, []);

  if (loading && !initialDataLoaded) {
    return (
      <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <p className="mt-4 text-gray-600">Loading your calls...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "dashboard" && 
          <DashboardTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
            refreshCalls={fetchCalls}
            updateCall={updateCall}
          />
        }
        {activeTab === "call-logs" && 
          <CallLogsTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
            refreshCalls={fetchCalls}
            updateCall={updateCall}
          />
        }
        {activeTab === "appointments" && 
          <AppointmentsTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
            refreshCalls={fetchCalls}
            updateCall={updateCall}
          />
        }
        {activeTab === "calendar" && 
          <CalendarTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
            refreshCalls={fetchCalls}
            updateCall={updateCall}
          />
        }
      </div>
    </AppLayout>
  );
};

export default Dashboard;
