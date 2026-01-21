import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { membersApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { TreePine, Users, Calendar, Camera, Heart, User } from 'lucide-react';

export default function LandingPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await membersApi.getAllPublic();
            setMembers(response.data);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="hero-section relative flex flex-col">
                {/* Navigation */}
                <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
                    <div className="flex items-center gap-2">
                        <TreePine className="h-8 w-8 text-[#D4A017]" />
                        <span className="font-serif text-xl font-bold text-[#FAF0E6]">
                            The Barbour Connection
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button 
                                variant="ghost" 
                                className="text-[#FAF0E6] hover:bg-white/10 hover:text-[#FAF0E6]"
                                data-testid="nav-login-btn"
                            >
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button 
                                className="rounded-full bg-[#D4A017] text-[#2C1B10] hover:bg-[#B8890F] px-6"
                                data-testid="nav-register-btn"
                            >
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <div className="animate-fade-in-up max-w-4xl">
                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF0E6] tracking-tight mb-6">
                            The Barbour <span className="text-[#D4A017]">Connection</span>
                        </h1>
                        <p className="text-lg text-[#FAF0E6]/80 max-w-2xl mx-auto mb-8">
                            Bring generations together. Create lasting memories, plan reunions, 
                            and preserve your family's unique story for years to come.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register">
                                <Button 
                                    size="lg"
                                    className="btn-primary text-lg px-8 py-6"
                                    data-testid="hero-get-started-btn"
                                >
                                    Start Your Tree
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button 
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-2 border-[#FAF0E6] text-[#FAF0E6] hover:bg-[#FAF0E6] hover:text-[#4A3728] px-8 py-6"
                                    data-testid="hero-signin-btn"
                                >
                                    Welcome Back
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 animate-bounce">
                        <div className="w-6 h-10 border-2 border-[#FAF0E6]/50 rounded-full flex justify-center pt-2">
                            <div className="w-1.5 h-3 bg-[#FAF0E6]/70 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 lg:px-12 bg-[#FAF0E6]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3728] mb-4">
                            Everything Your Family Needs
                        </h2>
                        <p className="text-[#5D4037] max-w-2xl mx-auto">
                            A beautifully crafted space to celebrate your heritage and create new traditions together.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="family-card family-card-accent p-6 animate-fade-in-up stagger-1" data-testid="feature-tree">
                            <div className="w-12 h-12 bg-[#8A9A5B]/20 rounded-xl flex items-center justify-center mb-4">
                                <TreePine className="h-6 w-6 text-[#8A9A5B]" />
                            </div>
                            <h3 className="font-serif text-xl font-semibold text-[#4A3728] mb-2">
                                Family Tree
                            </h3>
                            <p className="text-[#5D4037] text-sm">
                                Build and visualize your family tree with beautiful, interactive diagrams.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="family-card family-card-accent p-6 animate-fade-in-up stagger-2" data-testid="feature-members">
                            <div className="w-12 h-12 bg-[#8A9A5B]/20 rounded-xl flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-[#8A9A5B]" />
                            </div>
                            <h3 className="font-serif text-xl font-semibold text-[#4A3728] mb-2">
                                Member Profiles
                            </h3>
                            <p className="text-[#5D4037] text-sm">
                                Rich profiles with bios, photos, and stories for every family member.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="family-card family-card-accent p-6 animate-fade-in-up stagger-3" data-testid="feature-calendar">
                            <div className="w-12 h-12 bg-[#8A9A5B]/20 rounded-xl flex items-center justify-center mb-4">
                                <Calendar className="h-6 w-6 text-[#8A9A5B]" />
                            </div>
                            <h3 className="font-serif text-xl font-semibold text-[#4A3728] mb-2">
                                Event Calendar
                            </h3>
                            <p className="text-[#5D4037] text-sm">
                                Plan reunions, birthdays, and celebrations with an intuitive calendar.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="family-card family-card-accent p-6 animate-fade-in-up stagger-4" data-testid="feature-photos">
                            <div className="w-12 h-12 bg-[#8A9A5B]/20 rounded-xl flex items-center justify-center mb-4">
                                <Camera className="h-6 w-6 text-[#8A9A5B]" />
                            </div>
                            <h3 className="font-serif text-xl font-semibold text-[#4A3728] mb-2">
                                Photo Albums
                            </h3>
                            <p className="text-[#5D4037] text-sm">
                                Collect and share precious memories in beautiful photo galleries.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Family Members Preview Section */}
            {members.length > 0 && (
                <section className="py-20 px-6 lg:px-12 bg-[#FFF8F0]" data-testid="family-preview-section">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3728] mb-4">
                                Meet The Barbour Family
                            </h2>
                            <p className="text-[#5D4037] max-w-2xl mx-auto">
                                Our growing family tree, connected through generations of love and memories.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {members.slice(0, 12).map((member, index) => (
                                <div 
                                    key={member.id}
                                    className="flex flex-col items-center text-center animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    data-testid={`preview-member-${member.id}`}
                                >
                                    {member.photo_url ? (
                                        <img 
                                            src={member.photo_url} 
                                            alt={member.name}
                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#D4A017] shadow-lg mb-3"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#8A9A5B]/20 flex items-center justify-center border-4 border-[#D4A017] shadow-lg mb-3">
                                            <User className="h-8 w-8 sm:h-10 sm:w-10 text-[#8A9A5B]" />
                                        </div>
                                    )}
                                    <h3 className="font-serif font-semibold text-[#4A3728] text-sm sm:text-base">
                                        {member.name}
                                    </h3>
                                    <p className="text-[#8A9A5B] text-xs sm:text-sm">
                                        {member.relationship}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {members.length > 12 && (
                            <div className="text-center mt-8">
                                <p className="text-[#5D4037]">
                                    And {members.length - 12} more family members...
                                </p>
                            </div>
                        )}

                        <div className="text-center mt-10">
                            <Link to="/register">
                                <Button 
                                    className="btn-primary"
                                    data-testid="join-family-btn"
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Join Our Family
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20 px-6 lg:px-12 relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1627203030417-33b1129033d0?crop=entropy&cs=srgb&fm=jpg&q=85')`,
                    }}
                />
                <div className="absolute inset-0 bg-[#4A3728]/85" />
                
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <Heart className="h-12 w-12 text-[#D4A017] mx-auto mb-6" />
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF0E6] mb-4">
                        Start Building Your Legacy Today
                    </h2>
                    <p className="text-[#FAF0E6]/80 mb-8 max-w-xl mx-auto">
                        Join families who are preserving their stories and strengthening their bonds across generations.
                    </p>
                    <Link to="/register">
                        <Button 
                            size="lg"
                            className="rounded-full bg-[#D4A017] text-[#2C1B10] hover:bg-[#B8890F] px-10 py-6 text-lg font-serif"
                            data-testid="cta-create-tree-btn"
                        >
                            Create Your Family Tree
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 bg-[#4A3728] text-[#FAF0E6]/70">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <TreePine className="h-6 w-6 text-[#D4A017]" />
                        <span className="font-serif font-semibold text-[#FAF0E6]">The Barbour Connection</span>
                    </div>
                    <div className="text-sm text-center md:text-right">
                        <p>Site Admin: Samantha Smith</p>
                        <p>Developed by Derrick Mitchell</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
