
/// <reference types="vite/client" />

declare module "@/lib/migrateCallsToSupabase" {
  interface CallData {
    call_id: string;
    agent_id: string;
    appointment_status?: string;
    appointment_date?: string;
    appointment_time?: string;
    notes?: string;
    from_number?: string;
    [key: string]: any;
  }
}
