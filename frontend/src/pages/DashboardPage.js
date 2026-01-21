import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { membersApi, eventsApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
    Users, 
    Calendar, 
    Plus, 
    TreePine,
    ArrowRight,
    User
} from 'lucide-react';
import { format, parseISO, isAfter, startOfToday } from 'date-fns';

export default function DashboardPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [membersRes, eventsRes] = await Promise.all([
                membersApi.getAll(),
                eventsApi.getAll()
            ]);
            setMembers(membersRes.data);
            setEvents(eventsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const upcomingEvents = events
        .filter(e => isAfter(parseISO(e.event_date), startOfToday()))
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .slice(0, 3);

    const recentMembers = members.slice(0, 4);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-[#4A3728] font-serif text-xl">
                    Loading your family...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in" data-testid="dashboard-page">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-[#4A3728] p-8 lg:p-12">
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1554230253-017daba2b631?crop=entropy&cs=srgb&fm=jpg&q=85')`,
                        backgroundSize: 'cover',
                    }}
                />
                <div className="relative z-10">
                    <h1 className="font-serif text-3xl lg:text-4xl font-bold text-[#FAF0E6] mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-[#FAF0E6]/80 text-lg mb-6">
                        Your family tree is growing. Keep nurturing those connections.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/members">
                            <Button className="rounded-full bg-[#D4A017] text-[#2C1B10] hover:bg-[#B8890F] px-6" data-testid="add-member-btn">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Family Member
                            </Button>
                        </Link>
                        <Link to="/calendar">
                            <Button variant="outline" className="rounded-full border-[#FAF0E6] text-[#FAF0E6] hover:bg-[#FAF0E6] hover:text-[#4A3728]" data-testid="plan-event-btn">
                                <Calendar className="h-4 w-4 mr-2" />
                                Plan Reunion
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="family-card family-card-accent" data-testid="stats-members">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#5D4037] text-sm">Family Members</p>
                                <p className="font-serif text-3xl font-bold text-[#4A3728]">{members.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#8A9A5B]/20 rounded-xl flex items-center justify-center">
                                <Users className="h-6 w-6 text-[#8A9A5B]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="family-card family-card-accent" data-testid="stats-events">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#5D4037] text-sm">Upcoming Events</p>
                                <p className="font-serif text-3xl font-bold text-[#4A3728]">{upcomingEvents.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#D4A017]/20 rounded-xl flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-[#D4A017]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="family-card family-card-accent col-span-2" data-testid="stats-tree">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#5D4037] text-sm">Your Family Tree</p>
                                <p className="font-serif text-lg font-semibold text-[#4A3728]">
                                    {members.length > 0 ? 'Growing strong' : 'Ready to plant'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-[#8A9A5B]/20 rounded-xl flex items-center justify-center">
                                <TreePine className="h-6 w-6 text-[#8A9A5B]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Members */}
                <Card className="family-card" data-testid="recent-members-section">
                    <CardHeader className="border-b border-[#E6D0B3]">
                        <div className="flex items-center justify-between">
                            <CardTitle className="font-serif text-xl text-[#4A3728]">
                                Recent Members
                            </CardTitle>
                            <Link to="/members" className="text-[#8A9A5B] text-sm font-medium hover:underline flex items-center">
                                View all <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {recentMembers.length > 0 ? (
                            <div className="space-y-4">
                                {recentMembers.map((member) => (
                                    <Link 
                                        key={member.id} 
                                        to={`/members/${member.id}`}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#FAF0E6] transition-colors"
                                        data-testid={`member-item-${member.id}`}
                                    >
                                        {member.photo_url ? (
                                            <img 
                                                src={member.photo_url} 
                                                alt={member.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-[#D4A017]"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-[#8A9A5B]/20 flex items-center justify-center">
                                                <User className="h-6 w-6 text-[#8A9A5B]" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-[#4A3728]">{member.name}</p>
                                            <p className="text-sm text-[#5D4037]">{member.relationship}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state py-8">
                                <div className="empty-state-icon">
                                    <Users className="h-8 w-8 text-[#8A9A5B]" />
                                </div>
                                <p className="text-[#5D4037] mb-4">No family members yet</p>
                                <Link to="/members">
                                    <Button className="btn-primary" data-testid="add-first-member-btn">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Member
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="family-card" data-testid="upcoming-events-section">
                    <CardHeader className="border-b border-[#E6D0B3]">
                        <div className="flex items-center justify-between">
                            <CardTitle className="font-serif text-xl text-[#4A3728]">
                                Upcoming Events
                            </CardTitle>
                            <Link to="/calendar" className="text-[#8A9A5B] text-sm font-medium hover:underline flex items-center">
                                View calendar <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {upcomingEvents.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingEvents.map((event) => (
                                    <div 
                                        key={event.id}
                                        className="p-4 rounded-lg bg-[#FAF0E6] border-l-4 border-[#D4A017]"
                                        data-testid={`event-item-${event.id}`}
                                    >
                                        <p className="font-semibold text-[#4A3728]">{event.title}</p>
                                        <p className="text-sm text-[#5D4037] mt-1">
                                            {format(parseISO(event.event_date), 'EEEE, MMMM d, yyyy')}
                                            {event.event_time && ` at ${event.event_time}`}
                                        </p>
                                        {event.location && (
                                            <p className="text-sm text-[#8A9A5B] mt-1">{event.location}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state py-8">
                                <div className="empty-state-icon">
                                    <Calendar className="h-8 w-8 text-[#8A9A5B]" />
                                </div>
                                <p className="text-[#5D4037] mb-4">No upcoming events</p>
                                <Link to="/calendar">
                                    <Button className="btn-primary" data-testid="add-first-event-btn">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Event
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
