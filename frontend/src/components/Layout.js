import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
    TreePine, 
    LayoutDashboard, 
    Users, 
    Calendar, 
    LogOut, 
    User,
    Menu,
    X,
    MessageSquare
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/members', label: 'Members', icon: Users },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/forum', label: 'Forum', icon: MessageSquare },
];

export default function Layout({ children }) {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#FAF0E6]">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-[#E6D0B3]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <TreePine className="h-8 w-8 text-[#8A9A5B]" />
                            <span className="font-serif text-xl font-bold text-[#4A3728]">
                                The Barbour Connection
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                            isActive 
                                                ? 'bg-[#4A3728] text-[#FAF0E6]' 
                                                : 'text-[#5D4037] hover:bg-[#4A3728]/10'
                                        }`}
                                        data-testid={`nav-${item.label.toLowerCase()}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="flex items-center gap-2 text-[#4A3728] hover:bg-[#4A3728]/10"
                                        data-testid="user-menu-trigger"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#8A9A5B] flex items-center justify-center text-white font-semibold">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="hidden sm:flex flex-col items-start">
                                            <span className="font-medium">{user?.name}</span>
                                            {isAdmin && (
                                                <span className="text-xs text-[#D4A017] font-semibold">Administrator</span>
                                            )}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-[#FFF8F0] border-[#E6D0B3]">
                                    <DropdownMenuItem className="text-[#5D4037]">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>{user?.email}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[#E6D0B3]" />
                                    <DropdownMenuItem 
                                        onClick={handleLogout}
                                        className="text-red-600 cursor-pointer"
                                        data-testid="logout-btn"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-[#4A3728]"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                data-testid="mobile-menu-toggle"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-[#E6D0B3] bg-[#FFF8F0] animate-fade-in">
                        <nav className="px-4 py-4 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                            isActive 
                                                ? 'bg-[#4A3728] text-[#FAF0E6]' 
                                                : 'text-[#5D4037] hover:bg-[#4A3728]/10'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-140px)]">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-[#4A3728] py-4 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[#FAF0E6]/70 text-sm">
                    <div className="flex items-center gap-2">
                        <TreePine className="h-5 w-5 text-[#D4A017]" />
                        <span className="font-serif text-[#FAF0E6]">The Barbour Connection</span>
                    </div>
                    <p>Developed by Derrick Mitchell</p>
                </div>
            </footer>
        </div>
    );
}
