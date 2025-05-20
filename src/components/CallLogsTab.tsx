import { useEffect, useState } from "react";
import { Info, Edit, Calendar, Play, Pause, Headphones, Search, Filter, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "./ui/popover";
import { Separator } from "./ui/separator";
import { saveCallToSupabase, fetchCallsFromApi, CallData } from "@/lib/migrateCallsToSupabase";

interface CallLogsTabProps {
  initialCalls?: any[];
  initialLoading?: boolean;
  dataLoaded?: boolean;
  refreshCalls?: () => Promise<void>;
}

const CallLogsTab = ({
  initialCalls = [],
  initialLoading = false,
  dataLoaded = false,
  refreshCalls
}: CallLogsTabProps) => {
  const [calls, setCalls] = useState<any[]>(initialCalls);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const { agentId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCallData, setEditingCallData] = useState<any>({
    appointment_status: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Advanced filtering state
  const [filters, setFilters] = useState({
    callStatus: "all",
    appointmentStatus: "all",
    dateFrom: "",
    dateTo: "",
    minDuration: "",
    maxDuration: ""
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Update calls when initialCalls changes
  useEffect(() => {
    if (initialCalls.length > 0) {
      setCalls(initialCalls);
      setLoading(false);
    } else if (dataLoaded && !initialLoading) {
      fetchCalls();
    }
  }, [initialCalls, dataLoaded, initialLoading]);
  
  const fetchCalls = async () => {
    if (!agentId) {
      toast.error("No agent ID found for your account");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const apiCalls = await fetchCallsFromApi(agentId);
      const { data: dbCalls, error: dbError } = await supabase
        .from('call_logs')
        .select('*')
        .eq('agent_id', agentId);

      if (dbError) throw dbError;
      
      const dbCallsMap = new Map();
      if (dbCalls && dbCalls.length > 0) {
        dbCalls.forEach(dbCall => {
          dbCallsMap.set(dbCall.call_id, dbCall);
        });
      }
      
      const mergedCalls = apiCalls.map(apiCall => {
        const dbCall = dbCallsMap.get(apiCall.call_id);
        if (dbCall) {
          return {
            ...apiCall,
            appointment_status: dbCall.appointment_status || apiCall.appointment_status,
            appointment_date: dbCall.appointment_date || apiCall.appointment_date,
            appointment_time: dbCall.appointment_time || apiCall.appointment_time,
            notes: dbCall.notes || apiCall.notes,
            from_number: dbCall.from_number || apiCall.from_number || "",
            id: dbCall.id
          };
        }
        return apiCall;
      });
      
      setCalls(mergedCalls);
      
      if (mergedCalls.length > 0) {
        toast.success(`Successfully loaded ${mergedCalls.length} calls`);
      } else {
        toast.info("No calls found for this agent ID");
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'An error occurred while fetching calls');
      toast.error("Failed to load calls");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A";
    try {
      return format(new Date(timestamp), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDuration = (call: any) => {
    if (!call.start_timestamp || !call.end_timestamp) return "N/A";
    
    try {
      const start = new Date(call.start_timestamp).getTime();
      const end = new Date(call.end_timestamp).getTime();
      const durationMs = end - start;
      
      if (isNaN(durationMs) || durationMs < 0) return "N/A";
      
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      return "N/A";
    }
  };

  const getSentimentColor = (sentiment: string | undefined) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      case "neutral":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAppointmentStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-process":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSummary = (call: any) => {
    if (call.call_analysis?.call_summary) {
      return call.call_analysis.call_summary;
    }
    
    if (call.summary) return call.summary;
    
    if (call.quick_summary) return call.quick_summary;
    
    if (call.transcript) {
      const words = call.transcript.split(' ').slice(0, 30);
      return `${words.join(' ')}... [Automatically generated summary]`;
    }
    
    return "No summary available for this call.";
  };

  const toggleAudio = (audioRef: HTMLAudioElement | null) => {
    if (!audioRef) return;
    
    if (audioRef.paused) {
      audioRef.play().then(() => {
        setPlayingAudio(true);
      }).catch(error => {
        console.error("Audio playback error:", error);
        toast.error("Failed to play audio");
        setPlayingAudio(false);
      });
    } else {
      audioRef.pause();
      setPlayingAudio(false);
    }
  };

  const saveCallEdits = async () => {
    if (!selectedCall || !selectedCall.call_id) {
      toast.error("No call selected or call ID missing");
      return;
    }
    
    try {
      const callData: CallData = {
        ...selectedCall,
        agent_id: agentId,
        appointment_status: editingCallData.appointment_status,
        appointment_date: editingCallData.appointment_date,
        appointment_time: editingCallData.appointment_time,
        notes: editingCallData.notes
      };
      
      const success = await saveCallToSupabase(callData);
      
      if (success) {
        toast.success("Call updated successfully");
        
        const updatedSelectedCall = {
          ...selectedCall,
          ...editingCallData
        };
        setSelectedCall(updatedSelectedCall);
        
        setCalls(prevCalls => prevCalls.map(call => 
          call.call_id === selectedCall.call_id 
            ? {
                ...call,
                appointment_status: editingCallData.appointment_status,
                appointment_date: editingCallData.appointment_date,
                appointment_time: editingCallData.appointment_time,
                notes: editingCallData.notes
              } 
            : call
        ));
        
        if (refreshCalls) {
          await refreshCalls();
        }
        
        setEditDialogOpen(false);
      } else {
        toast.error("Failed to update call");
      }
    } catch (error: any) {
      console.error("Error updating call:", error);
      toast.error(error.message || "Failed to update call");
    }
  };

  useEffect(() => {
    if (dialogOpen && selectedCall?.recording_url) {
      const audio = new Audio(selectedCall.recording_url);
      
      const handleAudioEnded = () => setPlayingAudio(false);
      const handleAudioPaused = () => setPlayingAudio(false);
      const handleAudioPlay = () => setPlayingAudio(true);
      
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('pause', handleAudioPaused);
      audio.addEventListener('play', handleAudioPlay);
      
      setAudioElement(audio);
      
      return () => {
        audio.pause();
        audio.removeEventListener('ended', handleAudioEnded);
        audio.removeEventListener('pause', handleAudioPaused);
        audio.removeEventListener('play', handleAudioPlay);
        setAudioElement(null);
        setPlayingAudio(false);
      };
    }
  }, [dialogOpen, selectedCall]);

  const handleRowClick = (call: any) => {
    setSelectedCall(call);
    setDialogOpen(true);
    setActiveTab("summary");
  };

  const handleEditClick = (call: any) => {
    setSelectedCall(call);
    setEditingCallData({
      appointment_status: call.appointment_status || '',
      appointment_date: call.appointment_date || '',
      appointment_time: call.appointment_time || '',
      notes: call.notes || ''
    });
    setEditDialogOpen(true);
  };
  
  const safeValue = (value: string | undefined | null): string => {
    return value || "";
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
    
    if (value && value !== "all") {
      if (!activeFilters.includes(key)) {
        setActiveFilters([...activeFilters, key]);
      }
    } else {
      setActiveFilters(activeFilters.filter(filter => filter !== key));
    }
  };

  const clearFilter = (key: string) => {
    setFilters({
      ...filters,
      [key]: key === "callStatus" || key === "appointmentStatus" ? "all" : ""
    });
    setActiveFilters(activeFilters.filter(filter => filter !== key));
  };

  const clearAllFilters = () => {
    setFilters({
      callStatus: "all",
      appointmentStatus: "all",
      dateFrom: "",
      dateTo: "",
      minDuration: "",
      maxDuration: ""
    });
    setActiveFilters([]);
    setSearchQuery("");
  };
  
  const getFilterLabel = (key: string): string => {
    switch(key) {
      case "callStatus": return "Call Status";
      case "appointmentStatus": return "Appointment Status";
      case "dateFrom": return "Date From";
      case "dateTo": return "Date To";
      case "minDuration": return "Min Duration";
      case "maxDuration": return "Max Duration";
      default: return key;
    }
  };

  const getFilterDisplayValue = (key: string): string => {
    switch(key) {
      case "dateFrom": 
      case "dateTo":
        if (!filters[key]) return "";
        try {
          return new Date(filters[key]).toLocaleDateString();
        } catch (e) {
          return "";
        }
      case "minDuration":
      case "maxDuration":
        return filters[key] ? `${filters[key]} min` : "";
      default:
        return filters[key] === "all" ? "Any" : filters[key];
    }
  };
  
  const filteredCalls = calls.filter(call => {
    if (searchQuery && !JSON.stringify(call).toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (filters.callStatus !== "all" && call.call_status !== filters.callStatus) {
      return false;
    }

    if (filters.appointmentStatus !== "all" && call.appointment_status !== filters.appointmentStatus) {
      return false;
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      const callDate = new Date(call.start_timestamp);
      if (callDate < fromDate) {
        return false;
      }
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59);
      const callDate = new Date(call.start_timestamp);
      if (callDate > toDate) {
        return false;
      }
    }

    if (call.start_timestamp && call.end_timestamp) {
      const start = new Date(call.start_timestamp).getTime();
      const end = new Date(call.end_timestamp).getTime();
      const durationSec = (end - start) / 1000;
      
      if (filters.minDuration && durationSec < parseInt(filters.minDuration) * 60) {
        return false;
      }
      
      if (filters.maxDuration && durationSec > parseInt(filters.maxDuration) * 60) {
        return false;
      }
    }

    return true;
  });

  return (
    <div>
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search calls..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Advanced Filters</h3>
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="call-status">Call Status</Label>
                    <Select 
                      value={filters.callStatus} 
                      onValueChange={(value) => handleFilterChange("callStatus", value)}
                    >
                      <SelectTrigger id="call-status">
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appointment-status">Appointment Status</Label>
                    <Select 
                      value={filters.appointmentStatus} 
                      onValueChange={(value) => handleFilterChange("appointmentStatus", value)}
                    >
                      <SelectTrigger id="appointment-status">
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any status</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in-process">In Process</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="date-from">From Date</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date-to">To Date</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="min-duration">Min Duration (min)</Label>
                      <Input
                        id="min-duration"
                        type="number"
                        min="0"
                        value={filters.minDuration}
                        onChange={(e) => handleFilterChange("minDuration", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-duration">Max Duration (min)</Label>
                      <Input
                        id="max-duration"
                        type="number"
                        min="0"
                        value={filters.maxDuration}
                        onChange={(e) => handleFilterChange("maxDuration", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline"
              onClick={refreshCalls || fetchCalls}
              disabled={loading}
              size="sm"
            >
              Refresh Calls
            </Button>
          </div>
        </div>
        
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <Badge key={filter} variant="outline" className="px-2 py-1 flex items-center gap-1">
                <span className="text-xs font-medium">{getFilterLabel(filter)}: {getFilterDisplayValue(filter)}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter(filter)} 
                />
              </Badge>
            ))}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs ml-1"
            >
              Clear All
            </Button>
          </div>
        )}
        
        {activeFilters.length > 0 && (
          <div className="text-sm text-gray-500 mt-2">
            Showing {filteredCalls.length} of {calls.length} calls
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Appointment Status</TableHead>
              <TableHead>Appointment Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                </TableRow>
              ))
            ) : filteredCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {calls.length === 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <p>No calls found</p>
                      <Button 
                        onClick={fetchCalls}
                        variant="outline"
                        size="sm"
                      >
                        Refresh Calls
                      </Button>
                    </div>
                  ) : (
                    "No matches for your search"
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredCalls.map((call) => {
                return (
                  <TableRow 
                    key={call.id || call.call_id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(call)}
                  >
                    <TableCell className="font-medium">
                      {call.from_number ? call.from_number : (call.call_id ? call.call_id.substring(0, 8) + "..." : "N/A")}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.call_status)}`}>
                        {call.call_status || "unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDate(call.start_timestamp)}
                    </TableCell>
                    <TableCell>
                      {formatDuration(call)}
                    </TableCell>
                    <TableCell>
                      {call.appointment_status ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentStatusColor(call.appointment_status)}`}>
                          {call.appointment_status}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {call.appointment_date ? (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{call.appointment_date} {call.appointment_time}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(call);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(call);
                          }}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Call Details
              {selectedCall && (
                <Badge className={`${getStatusColor(selectedCall.call_status)}`}>
                  {selectedCall?.call_status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCall && (
            <>
              <div className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">From:</span>
                    <span className="font-medium">
                      {selectedCall.from_number || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Call ID:</span>
                    <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded text-xs">{selectedCall.call_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{formatDuration(selectedCall)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Start Time:</span>
                    <span className="font-medium">{formatDate(selectedCall.start_timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">End Time:</span>
                    <span className="font-medium">{formatDate(selectedCall.end_timestamp)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Appointment Status:</span>
                    {selectedCall.appointment_status ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAppointmentStatusColor(selectedCall.appointment_status)}`}>
                        {selectedCall.appointment_status}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Appointment:</span>
                    {selectedCall.appointment_date ? (
                      <span className="font-medium">
                        {selectedCall.appointment_date} {selectedCall.appointment_time}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not scheduled</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="summary">
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="transcript">
                      Transcript
                    </TabsTrigger>
                    <TabsTrigger value="notes">
                      Notes
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="overflow-auto max-h-[50vh] px-1">
                    <div className="space-y-4">
                      {selectedCall.recording_url && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h3 className="font-medium mb-3 text-gray-700 flex items-center gap-2">
                            <Headphones className="h-4 w-4 text-purple-500" />
                            Audio Recording
                          </h3>
                          <div className="flex flex-col gap-3">
                            <audio 
                              controls 
                              src={selectedCall.recording_url}
                              className="w-full rounded-md shadow-sm"
                              ref={(audio) => {
                                if (audio && !audioElement) {
                                  setAudioElement(audio);
                                }
                              }}
                              onPlay={() => setPlayingAudio(true)}
                              onPause={() => setPlayingAudio(false)}
                              onEnded={() => setPlayingAudio(false)}
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium mb-2 text-gray-700">Call Summary</h3>
                        <p className="text-gray-600 whitespace-pre-line">{getSummary(selectedCall)}</p>
                      </div>
                      
                      {selectedCall.user_sentiment && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h3 className="font-medium mb-3 text-gray-700">Sentiment Analysis</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">User Sentiment:</span>
                              <Badge className={getSentimentColor(selectedCall.user_sentiment)}>
                                {selectedCall.user_sentiment}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="transcript" className="overflow-auto max-h-[50vh] px-1">
                    {selectedCall.transcript ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium mb-4 text-gray-700">Transcript</h3>
                        <div className="space-y-4">
                          {selectedCall.transcript.split(/(?<=[.!?])\s+/).filter((line: string) => line.trim().length > 0).map((line: string, index: number) => (
                            <div key={index} className="p-3 rounded-lg bg-white border border-gray-100 shadow-sm hover:border-purple-200 transition-colors">
                              <div className="flex gap-2">
                                <span className="text-purple-500 text-xs font-medium mt-1 bg-purple-50 px-2 py-1 rounded-full">{index + 1}</span>
                                <p className="text-gray-700">{line.trim()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No transcript available for this call.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="notes" className="overflow-auto max-h-[50vh] px-1">
                    {selectedCall.notes ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium mb-2 text-gray-700">Notes</h3>
                        <p className="text-gray-600 whitespace-pre-line">{selectedCall.notes}</p>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No notes available for this call.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setDialogOpen(false);
                  handleEditClick(selectedCall);
                }}>
                  Edit Details
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Call Details</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="appointment-status">Appointment Status</Label>
              <Select 
                value={editingCallData.appointment_status} 
                onValueChange={(value) => setEditingCallData({...editingCallData, appointment_status: value})}
              >
                <SelectTrigger id="appointment-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-process">In Process</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="not-set">Not Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="appointment-date">Appointment Date</Label>
              <Input
                id="appointment-date"
                type="date"
                value={editingCallData.appointment_date}
                onChange={(e) => setEditingCallData({...editingCallData, appointment_date: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="appointment-time">Appointment Time</Label>
              <Input
                id="appointment-time"
                type="time"
                value={editingCallData.appointment_time}
                onChange={(e) => setEditingCallData({...editingCallData, appointment_time: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={editingCallData.notes}
                onChange={(e) => setEditingCallData({...editingCallData, notes: e.target.value})}
                placeholder="Add any notes about this call..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCallEdits}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallLogsTab;
