import React, { useState, useEffect } from 'react';
import { eventsApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import { 
    Plus, 
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Edit,
    Trash2
} from 'lucide-react';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { toast } from 'sonner';

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await eventsApi.getAll();
            setEvents(response.data);
        } catch (error) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    // Get events for the selected date
    const selectedDateEvents = events.filter(event => 
        isSameDay(parseISO(event.event_date), selectedDate)
    );

    // Get dates that have events for the calendar highlights
    const eventDates = events.map(e => parseISO(e.event_date));

    const openAddModal = (date = selectedDate) => {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            event_date: format(date, 'yyyy-MM-dd'),
            event_time: '',
            location: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date,
            event_time: event.event_time || '',
            location: event.location || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.event_date) {
            toast.error('Please fill in required fields');
            return;
        }

        setSubmitting(true);
        try {
            if (editingEvent) {
                await eventsApi.update(editingEvent.id, formData);
                toast.success('Event updated successfully');
            } else {
                await eventsApi.create(formData);
                toast.success('Event created successfully');
            }
            setIsModalOpen(false);
            fetchEvents();
        } catch (error) {
            toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (event) => {
        if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
            return;
        }

        try {
            await eventsApi.delete(event.id);
            toast.success('Event deleted');
            fetchEvents();
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    // Custom modifier for dates with events
    const modifiers = {
        hasEvent: eventDates
    };

    const modifiersStyles = {
        hasEvent: {
            fontWeight: 'bold',
            backgroundColor: 'rgba(212, 160, 23, 0.2)',
            borderRadius: '50%'
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-[#4A3728] font-serif text-xl">
                    Loading calendar...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in" data-testid="calendar-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-[#4A3728]">
                        Event Calendar
                    </h1>
                    <p className="text-[#5D4037] mt-1">
                        Plan your family reunions and celebrations
                    </p>
                </div>
                <Button 
                    onClick={() => openAddModal()}
                    className="btn-primary"
                    data-testid="add-event-btn"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <Card className="family-card lg:col-span-2" data-testid="calendar-card">
                    <CardContent className="p-6">
                        <div className="paper-texture rounded-xl p-4">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                modifiers={modifiers}
                                modifiersStyles={modifiersStyles}
                                className="w-full"
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                    month: "space-y-4 w-full",
                                    caption: "flex justify-center pt-1 relative items-center",
                                    caption_label: "font-serif text-xl font-semibold text-[#4A3728]",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-[#8A9A5B]/20 rounded-lg transition-colors",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex w-full",
                                    head_cell: "text-[#5D4037] rounded-md w-full font-medium text-sm py-2",
                                    row: "flex w-full mt-2",
                                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full aspect-square",
                                    day: "h-full w-full p-0 font-normal rounded-lg hover:bg-[#8A9A5B]/20 transition-colors flex items-center justify-center",
                                    day_selected: "bg-[#4A3728] text-[#FAF0E6] hover:bg-[#4A3728] hover:text-[#FAF0E6] font-semibold",
                                    day_today: "border-2 border-[#D4A017] font-semibold",
                                    day_outside: "text-[#5D4037]/40",
                                    day_disabled: "text-[#5D4037]/30",
                                    day_hidden: "invisible",
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Date Events */}
                <Card className="family-card" data-testid="events-list">
                    <CardHeader className="border-b border-[#E6D0B3]">
                        <CardTitle className="font-serif text-xl text-[#4A3728] flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-[#8A9A5B]" />
                            {format(selectedDate, 'MMMM d, yyyy')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {selectedDateEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateEvents.map((event) => (
                                    <div 
                                        key={event.id}
                                        className="p-4 rounded-lg bg-[#FAF0E6] border-l-4 border-[#D4A017] group"
                                        data-testid={`event-card-${event.id}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-[#4A3728]">{event.title}</h3>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(event)}
                                                    className="h-8 w-8 p-0 text-[#8A9A5B] hover:text-[#8A9A5B] hover:bg-[#8A9A5B]/20"
                                                    data-testid={`edit-event-${event.id}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(event)}
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-500 hover:bg-red-50"
                                                    data-testid={`delete-event-${event.id}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-[#5D4037] mt-2">{event.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-3 mt-3 text-sm text-[#5D4037]">
                                            {event.event_time && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-[#8A9A5B]" />
                                                    {event.event_time}
                                                </span>
                                            )}
                                            {event.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4 text-[#8A9A5B]" />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state py-8">
                                <div className="empty-state-icon">
                                    <CalendarIcon className="h-8 w-8 text-[#8A9A5B]" />
                                </div>
                                <p className="text-[#5D4037] mb-4">No events on this day</p>
                                <Button 
                                    onClick={() => openAddModal(selectedDate)}
                                    variant="outline"
                                    className="border-[#4A3728] text-[#4A3728] hover:bg-[#4A3728] hover:text-[#FAF0E6]"
                                    data-testid="add-event-for-date-btn"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Event
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Events List */}
            <Card className="family-card" data-testid="upcoming-events-card">
                <CardHeader className="border-b border-[#E6D0B3]">
                    <CardTitle className="font-serif text-xl text-[#4A3728]">
                        All Upcoming Events
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {events.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {events
                                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                                .map((event) => (
                                    <div 
                                        key={event.id}
                                        className="p-4 rounded-lg bg-[#FAF0E6] border border-[#E6D0B3] hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => {
                                            setSelectedDate(parseISO(event.event_date));
                                        }}
                                        data-testid={`upcoming-event-${event.id}`}
                                    >
                                        <p className="text-sm text-[#8A9A5B] font-medium">
                                            {format(parseISO(event.event_date), 'EEE, MMM d, yyyy')}
                                        </p>
                                        <h3 className="font-semibold text-[#4A3728] mt-1">{event.title}</h3>
                                        {event.location && (
                                            <p className="text-sm text-[#5D4037] mt-1 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {event.location}
                                            </p>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <div className="empty-state py-12">
                            <div className="empty-state-icon">
                                <CalendarIcon className="h-8 w-8 text-[#8A9A5B]" />
                            </div>
                            <h3 className="font-serif text-xl text-[#4A3728] mb-2">
                                No Events Planned
                            </h3>
                            <p className="text-[#5D4037] mb-6 max-w-sm">
                                Start planning your family reunions and celebrations
                            </p>
                            <Button 
                                onClick={() => openAddModal()}
                                className="btn-primary"
                                data-testid="add-first-event-btn"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Event
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#FFF8F0] border-[#E6D0B3] max-w-lg" data-testid="event-modal">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#4A3728]">
                            {editingEvent ? 'Edit Event' : 'Create Event'}
                        </DialogTitle>
                        <DialogDescription className="text-[#5D4037]">
                            {editingEvent 
                                ? 'Update the event details'
                                : 'Plan a new family event or reunion'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-[#4A3728]">Event Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                placeholder="Family Reunion 2024"
                                data-testid="event-title-input"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="event_date" className="text-[#4A3728]">Date *</Label>
                                <Input
                                    id="event_date"
                                    type="date"
                                    value={formData.event_date}
                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                    className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                    data-testid="event-date-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="event_time" className="text-[#4A3728]">Time</Label>
                                <Input
                                    id="event_time"
                                    type="time"
                                    value={formData.event_time}
                                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                                    className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                    data-testid="event-time-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-[#4A3728]">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                placeholder="Grandma's House, 123 Oak Street"
                                data-testid="event-location-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[#4A3728]">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B] min-h-[100px]"
                                placeholder="Annual family gathering with potluck dinner..."
                                data-testid="event-description-input"
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="border-[#4A3728] text-[#4A3728]"
                                data-testid="cancel-event-btn"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary"
                                data-testid="save-event-btn"
                            >
                                {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
