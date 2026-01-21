import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, X, Edit } from "lucide-react";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

interface ProgressEvent {
  id?: number;
  start_date: string;
  end_date: string;
  title: string;
  remarks?: string;
}

interface CalendarEvent {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  remarks?: string;
}

interface ProgressCalendarDialog {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number | null;
  seriesNo?: string;
  progresses: ProgressEvent[];
  onAddProgress: (data: Omit<ProgressEvent, "id">) => Promise<void>;
  onUpdateProgress: (
    progressId: number,
    data: Omit<ProgressEvent, "id">
  ) => Promise<void>;
  onDeleteProgress: (progressId: number) => Promise<void>;
  userRole?: string[];
}

export function ProgressCalendarDialog({
  open,
  onOpenChange,
  reportId,
  seriesNo,
  progresses,
  onAddProgress,
  onUpdateProgress,
  onDeleteProgress,
  userRole = [],
}: ProgressCalendarDialog) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start_date: "",
    end_date: "",
    remarks: "",
  });

  // ------------------------
  // FIXED ROLE LOGIC
  // ------------------------
  const hasHod = userRole.includes("hod");
  const hasPurchasing = userRole.includes("purchasing");
  const isAdmin = userRole.includes("admin");

  // Block any case where HOD appears
  const isBlocked = hasHod;

  // Allow:
  // - Admin ALWAYS
  // - Purchasing only (no HOD)
  const canManageEvents = isAdmin || (hasPurchasing && !hasHod);
  // ------------------------

  // Convert API progresses to calendar events
  useEffect(() => {
    if (progresses) {
      const calendarEvents = progresses.map((progress) => ({
        id: progress.id,
        title: progress.title,
        start: new Date(progress.start_date),
        end: new Date(progress.end_date),
        remarks: progress.remarks,
      }));
      setEvents(calendarEvents);
    }
  }, [progresses]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (!canManageEvents) return;

    setNewEvent({
      title: "",
      start_date: moment(start).format("YYYY-MM-DD"),
      end_date: moment(end).format("YYYY-MM-DD"),
      remarks: "",
    });
    setSelectedEvent(null);
    setIsEditing(false);
    setShowEventForm(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditing(false);
    setShowEventForm(true);
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;

    setNewEvent({
      title: selectedEvent.title,
      start_date: moment(selectedEvent.start).format("YYYY-MM-DD"),
      end_date: moment(selectedEvent.end).format("YYYY-MM-DD"),
      remarks: selectedEvent.remarks || "",
    });
    setIsEditing(true);
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start_date || !newEvent.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await onAddProgress({
        title: newEvent.title,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
        remarks: newEvent.remarks || undefined,
      });

      toast.success("Event added successfully");
      setShowEventForm(false);
      setNewEvent({ title: "", start_date: "", end_date: "", remarks: "" });
    } catch {
      toast.error("Failed to add event");
    }
  };

  const handleUpdateEvent = async () => {
    if (
      !selectedEvent?.id ||
      !newEvent.title ||
      !newEvent.start_date ||
      !newEvent.end_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await onUpdateProgress(selectedEvent.id, {
        title: newEvent.title,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
        remarks: newEvent.remarks || undefined,
      });

      toast.success("Event updated successfully");
      setShowEventForm(false);
      setSelectedEvent(null);
      setIsEditing(false);
      setNewEvent({ title: "", start_date: "", end_date: "", remarks: "" });
    } catch {
      toast.error("Failed to update event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;

    try {
      await onDeleteProgress(selectedEvent.id);
      toast.success("Event deleted successfully");
      setShowEventForm(false);
      setSelectedEvent(null);
      setIsEditing(false);
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const handleClose = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
    setIsEditing(false);
    setNewEvent({ title: "", start_date: "", end_date: "", remarks: "" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewEvent({ title: "", start_date: "", end_date: "", remarks: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Progress Calendar - PR #{seriesNo || reportId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Calendar */}
          <div className="h-[500px] bg-white rounded-lg p-4 border">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              selectable={canManageEvents}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              views={["month", "week", "day"]}
              defaultView="month"
            />
          </div>

          {/* Event Form */}
          {showEventForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {selectedEvent && !isEditing
                    ? "Event Details"
                    : selectedEvent && isEditing
                    ? "Edit Event"
                    : "Add New Event"}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selectedEvent && !isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label>Title</Label>
                    <p className="text-sm mt-1">{selectedEvent.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <p className="text-sm mt-1">
                        {moment(selectedEvent.start).format("YYYY-MM-DD")}
                      </p>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <p className="text-sm mt-1">
                        {moment(selectedEvent.end).format("YYYY-MM-DD")}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.remarks && (
                    <div>
                      <Label>Remarks</Label>
                      <p className="text-sm mt-1">{selectedEvent.remarks}</p>
                    </div>
                  )}

                  {canManageEvents && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleEditEvent}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Event
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteEvent}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Event
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      placeholder="e.g., For Technical Review"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newEvent.start_date}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            start_date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newEvent.end_date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, end_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={newEvent.remarks}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, remarks: e.target.value })
                      }
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateEvent} className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Event
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleAddEvent} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
