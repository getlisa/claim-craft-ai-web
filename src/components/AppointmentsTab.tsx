
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Play, Filter, Search } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  // Process calls data to extract only scheduled appointments
  useEffect(() => {
    if (initialCalls.length > 0) {
      const scheduledAppointments = initialCalls.filter(call => 
        call.appointment_status === 'scheduled' && call.appointment_date
      ).sort((a, b) => {
        // Sort by appointment date, most recent first
        const dateA = new Date(`${a.appointment_date} ${a.appointment_time || '00:00'}`).getTime();
        const dateB = new Date(`${b.appointment_date} ${b.appointment_time || '00:00'}`).getTime();
        return dateA - dateB; // Ascending order (upcoming first)
      });
      
      setAppointments(scheduledAppointments);
      setFilteredAppointments(scheduledAppointments);
      setIsLoading(false);
    } else {
      setIsLoading(initialLoading);
    }
  }, [initialCalls, initialLoading]);

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
        appointment.appointment_status.toLowerCase() === statusFilter.toLowerCase()
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
    
    setFilteredAppointments(result);
  }, [appointments, searchQuery, statusFilter, dateFilter]);

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

  const playRecording = (callId: string) => {
    // In a real implementation, this would play the recording
    console.log(`Playing recording for call ${callId}`);
    toast.info(`Playing recording for call ${callId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-lg text-gray-600">Loading appointments...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Scheduled Appointments</h1>
        <p className="text-muted-foreground">
          View and manage all your upcoming appointments
        </p>
      </div>
      
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
            
            <Button 
              variant="outline" 
              className="flex-shrink-0"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No Appointments Found</h3>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              {appointments.length > 0 
                ? "No appointments match your current filters." 
                : "You don't have any scheduled appointments yet."}
            </p>
            <Button 
              onClick={() => refreshCalls && refreshCalls()}
              className="mt-4"
              variant="outline"
            >
              Refresh Data
            </Button>
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
                          {appointment.appointment_status}
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
                          onClick={() => playRecording(appointment.call_id)}
                        >
                          <Play className="h-4 w-4 text-purple-600" />
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

      <div className="flex justify-center mt-6">
        <Button 
          onClick={() => refreshCalls && refreshCalls()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-2 rounded-full shadow-lg transition-all flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              <span>Refresh Appointments</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AppointmentsTab;
