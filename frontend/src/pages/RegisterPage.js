import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploadApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { TreePine, Mail, Lock, User, ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await uploadApi.uploadPublic(file);
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            setPhotoUrl(`${backendUrl}${response.data.url}`);
            toast.success('Photo uploaded!');
        } catch (error) {
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !email || !password || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register(email, password, name, photoUrl);
            toast.success('Welcome to The Barbour Connection!');
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1627203030417-33b1129033d0?crop=entropy&cs=srgb&fm=jpg&q=85')`,
                    }}
                />
                <div className="absolute inset-0 bg-[#4A3728]/70" />
                <div className="relative z-10 flex flex-col justify-between p-12 text-[#FAF0E6]">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Home</span>
                    </Link>
                    <div>
                        <TreePine className="h-16 w-16 text-[#D4A017] mb-6" />
                        <h1 className="font-serif text-4xl font-bold mb-4">
                            Plant the Seeds of Your Legacy
                        </h1>
                        <p className="text-[#FAF0E6]/80 text-lg">
                            Create an account to start building your family tree and preserving precious memories.
                        </p>
                    </div>
                    <p className="text-sm text-[#FAF0E6]/60">
                        © 2024 The Barbour Connection
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#FAF0E6]">
                <div className="w-full max-w-md">
                    {/* Mobile back link */}
                    <Link 
                        to="/" 
                        className="lg:hidden flex items-center gap-2 text-[#5D4037] mb-8 hover:text-[#4A3728]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Home</span>
                    </Link>

                    <Card className="border-[#E6D0B3] bg-[#FFF8F0] shadow-lg" data-testid="register-card">
                        <CardHeader className="text-center pb-2">
                            <div className="lg:hidden flex justify-center mb-4">
                                <TreePine className="h-10 w-10 text-[#8A9A5B]" />
                            </div>
                            <CardTitle className="font-serif text-2xl text-[#4A3728]">
                                Create Account
                            </CardTitle>
                            <CardDescription className="text-[#5D4037]">
                                Start your family journey today
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[#4A3728]">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5D4037]" />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Smith"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-10 border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                            data-testid="register-name-input"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[#4A3728]">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5D4037]" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                            data-testid="register-email-input"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[#4A3728]">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5D4037]" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                            data-testid="register-password-input"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-[#4A3728]">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5D4037]" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10 border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                            data-testid="register-confirm-password-input"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#4A3728]">Profile Photo (Optional)</Label>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept="image/*"
                                            className="hidden"
                                            data-testid="register-photo-file-input"
                                        />
                                        {!photoUrl ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="w-full border-[#D7C0A0] text-[#4A3728] hover:bg-[#8A9A5B]/10"
                                                data-testid="register-photo-upload-btn"
                                            >
                                                {uploading ? (
                                                    <>Uploading...</>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Upload Profile Photo
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-[#FAF0E6] rounded-lg border border-[#D7C0A0]">
                                                <img 
                                                    src={photoUrl} 
                                                    alt="Profile preview" 
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-[#D4A017]"
                                                />
                                                <span className="text-sm text-[#5D4037] flex-1">Photo uploaded</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPhotoUrl('')}
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary"
                                    data-testid="register-submit-btn"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            </form>
                            <div className="mt-6 text-center">
                                <p className="text-[#5D4037] text-sm">
                                    Already have an account?{' '}
                                    <Link 
                                        to="/login" 
                                        className="text-[#8A9A5B] font-semibold hover:underline"
                                        data-testid="goto-login-link"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
