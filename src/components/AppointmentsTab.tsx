
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

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
  const [isLoading, setIsLoading] = useState(initialLoading);

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
      setIsLoading(false);
    } else {
      setIsLoading(initialLoading);
    }
  }, [initialCalls, initialLoading]);

  const formatAppointmentDate = (date: string, time: string | undefined) => {
    if (!date) return "Not scheduled";
    
    try {
      let formattedDate = format(new Date(date), "EEEE, MMMM d, yyyy");
      
      if (time) {
        formattedDate += ` at ${time}`;
      }
      
      return formattedDate;
    } catch (error) {
      return "Invalid date";
    }
  };

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

  const getDaysUntilAppointment = (appointmentDate: string) => {
    if (!appointmentDate) return "";
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time part for accurate day calculation
      
      const apptDate = new Date(appointmentDate);
      apptDate.setHours(0, 0, 0, 0);
      
      const diffTime = apptDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
      return `In ${diffDays} days`;
    } catch (error) {
      return "";
    }
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
      
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No Scheduled Appointments</h3>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              You don't have any scheduled appointments yet.
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
                    <TableHead>When</TableHead>
                    <TableHead>Client Contact</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
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
                          <span>{formatAppointmentDate(appointment.appointment_date, appointment.appointment_time)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                          {getDaysUntilAppointment(appointment.appointment_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {appointment.caller_phone_number || "No contact info"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {appointment.notes || "No notes"}
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
