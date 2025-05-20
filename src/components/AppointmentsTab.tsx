
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Play, Square, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface AppointmentsTabProps {
  initialCalls?: any[];
  initialLoading?: boolean;
  dataLoaded?: boolean;
  refreshCalls?: () => Promise<void>;
}

const AppointmentsTab = ({
  initialCalls = [],
  initialLoading = false,
  dataLoaded = false,
  refreshCalls
}: AppointmentsTabProps) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { agentId } = useAuth();

  // Directly fetch appointments from database to ensure data is visible
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      
      if (!agentId) {
        toast.error("No agent ID found");
        setIsLoading(false);
        return;
      }
      
      // Fetch all calls that have appointment data
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('agent_id', agentId)
        .not('appointment_date', 'is', null);
      
      if (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
        setIsLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        // Sort by appointment date, most recent first
        const sorted = data.sort((a, b) => {
          const dateA = new Date(`${a.appointment_date} ${a.appointment_time || '00:00'}`).getTime();
          const dateB = new Date(`${b.appointment_date} ${b.appointment_time || '00:00'}`).getTime();
          return dateA - dateB; // Ascending order (upcoming first)
        });
        
        setAppointments(sorted);
        setFilteredAppointments(sorted);
        console.log("Loaded appointments:", sorted);
      } else {
        console.log("No appointments found in database");
        setAppointments([]);
        setFilteredAppointments([]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error in fetchAppointments:", err);
      toast.error("Failed to load appointments");
      setIsLoading(false);
    }
  };

  // Process calls data to extract only scheduled appointments
  useEffect(() => {
    if (initialCalls && initialCalls.length > 0) {
      console.log("Processing initialCalls:", initialCalls);
      const scheduledAppointments = initialCalls.filter(call => 
        call.appointment_date
      ).sort((a, b) => {
        // Sort by appointment date, most recent first
        const dateA = new Date(`${a.appointment_date} ${a.appointment_time || '00:00'}`).getTime();
        const dateB = new Date(`${b.appointment_date} ${b.appointment_time || '00:00'}`).getTime();
        return dateA - dateB; // Ascending order (upcoming first)
      });
      
      console.log("Filtered appointments:", scheduledAppointments);
      setAppointments(scheduledAppointments);
      setFilteredAppointments(scheduledAppointments);
      setIsLoading(false);
    } else if (dataLoaded) {
      // If no initial calls but data is loaded, fetch directly
      console.log("No initialCalls, fetching from database directly");
      fetchAppointments();
    } else {
      setIsLoading(initialLoading);
    }
  }, [initialCalls, initialLoading, dataLoaded]);

  // Apply filters
  useEffect(() => {
    let result = [...appointments];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(appointment => 
        (appointment.call_id && appointment.call_id.toLowerCase().includes(query)) ||
        (appointment.caller_phone_number && appointment.caller_phone_number.toLowerCase().includes(query)) ||
        (appointment.notes && appointment.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(appointment => 
        appointment.appointment_status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      result = result.filter(appointment => {
        if (!appointment.appointment_date) return false;
        
        const appointmentDate = new Date(appointment.appointment_date);
        appointmentDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return appointmentDate.getTime() === today.getTime();
          case 'tomorrow':
            return appointmentDate.getTime() === tomorrow.getTime();
          case 'week':
            return appointmentDate >= today && appointmentDate <= nextWeek;
          case 'month':
            return appointmentDate >= today && appointmentDate <= nextMonth;
          default:
            return true;
        }
      });
    }
    
    // Apply time filter
    if (timeFilter !== 'all') {
      result = result.filter(appointment => {
        if (!appointment.appointment_time) return false;
        
        const time = appointment.appointment_time;
        const hour = parseInt(time.split(':')[0]);
        
        switch (timeFilter) {
          case 'morning':
            return hour >= 5 && hour < 12;
          case 'afternoon':
            return hour >= 12 && hour < 17;
          case 'evening':
            return hour >= 17 && hour < 21;
          case 'night':
            return hour >= 21 || hour < 5;
          default:
            return true;
        }
      });
    }
    
    setFilteredAppointments(result);
  }, [appointments, searchQuery, statusFilter, dateFilter, timeFilter]);

  const getAppointmentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-process":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
    };
  }, [audioElement]);

  const toggleRecording = (callId: string, recordingUrl: string) => {
    if (playingRecording === callId) {
      // Stop the currently playing recording
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setPlayingRecording(null);
      setAudioElement(null);
      toast.info(`Stopped recording for call ${callId}`);
    } else {
      // Stop any currently playing recording
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      
      // Play the new recording
      if (recordingUrl) {
        const audio = new Audio(recordingUrl);
        audio.addEventListener('ended', () => {
          setPlayingRecording(null);
          setAudioElement(null);
        });
        
        audio.play().catch(error => {
          console.error("Audio playback error:", error);
          toast.error("Failed to play recording");
          setPlayingRecording(null);
        });
        
        setPlayingRecording(callId);
        setAudioElement(audio);
      } else {
        toast.info(`No recording available for call ${callId}`);
      }
    }
  };

  // Handle refresh button click to update appointment data
  const handleRefresh = async () => {
    if (refreshCalls) {
      await refreshCalls();
    } else {
      await fetchAppointments();
    }
    toast.success("Appointments refreshed");
  };

  return (
    <div>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search appointments..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-process">In Process</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={dateFilter}
              onValueChange={setDateFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={timeFilter}
              onValueChange={setTimeFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Times</SelectItem>
                <SelectItem value="morning">Morning (5am-12pm)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                <SelectItem value="evening">Evening (5pm-9pm)</SelectItem>
                <SelectItem value="night">Night (9pm-5am)</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-shrink-0"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateFilter('all');
                  setTimeFilter('all');
                }}
              >
                Clear Filters
              </Button>
              
              <Button 
                variant="default" 
                className="flex-shrink-0"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="ml-2 text-lg text-gray-600">Loading appointments...</span>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No Appointments Found</h3>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              {appointments.length > 0 
                ? "No appointments match your current filters." 
                : "You don't have any scheduled appointments yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Call ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Appointment Date</TableHead>
                    <TableHead>Recording</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id || appointment.call_id}>
                      <TableCell className="font-medium">
                        {appointment.call_id ? appointment.call_id.substring(0, 8) + "..." : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentStatusColor(appointment.appointment_status)}`}>
                          {appointment.appointment_status || "unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2 text-purple-500" />
                          <span>{appointment.appointment_date} {appointment.appointment_time && `at ${appointment.appointment_time}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="rounded-full w-8 h-8 p-0"
                          onClick={() => toggleRecording(appointment.call_id, appointment.recording_url)}
                        >
                          {playingRecording === appointment.call_id ? (
                            <Square className="h-4 w-4 text-red-600" />
                          ) : (
                            <Play className="h-4 w-4 text-purple-600" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentsTab;
