import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { membersApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
    ArrowLeft, 
    User,
    TreePine,
    Image,
    X
} from 'lucide-react';

export default function PublicAlbumPage() {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        fetchMember();
    }, [id]);

    const fetchMember = async () => {
        try {
            const response = await membersApi.getOnePublic(id);
            setMember(response.data);
        } catch (error) {
            console.error('Failed to fetch member:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF0E6] flex items-center justify-center">
                <div className="animate-pulse text-[#4A3728] font-serif text-xl">
                    Loading album...
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-screen bg-[#FAF0E6] flex flex-col items-center justify-center p-6">
                <h1 className="font-serif text-2xl text-[#4A3728] mb-4">Member not found</h1>
                <Link to="/">
                    <Button className="btn-primary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF0E6]">
            {/* Header */}
            <header className="bg-[#4A3728] py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <TreePine className="h-8 w-8 text-[#D4A017]" />
                        <span className="font-serif text-xl font-bold text-[#FAF0E6]">
                            The Barbour Connection
                        </span>
                    </Link>
                    <Link to="/">
                        <Button 
                            variant="outline" 
                            className="border-[#FAF0E6] text-[#FAF0E6] hover:bg-[#FAF0E6] hover:text-[#4A3728]"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Member Info */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col items-center text-center mb-12">
                    {member.photo_url ? (
                        <img 
                            src={member.photo_url} 
                            alt={member.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-[#D4A017] shadow-lg mb-4"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-[#8A9A5B]/20 flex items-center justify-center border-4 border-[#D4A017] shadow-lg mb-4">
                            <User className="h-12 w-12 text-[#8A9A5B]" />
                        </div>
                    )}
                    <h1 className="font-serif text-3xl font-bold text-[#4A3728]">
                        {member.name}
                    </h1>
                    <p className="text-[#8A9A5B] font-medium mt-1">{member.relationship}</p>
                    {member.bio && (
                        <p className="text-[#5D4037] mt-4 max-w-2xl">{member.bio}</p>
                    )}
                </div>

                {/* Photo Album */}
                <div className="mb-8">
                    <h2 className="font-serif text-2xl font-bold text-[#4A3728] text-center mb-8">
                        Photo Album
                    </h2>

                    {member.photos && member.photos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {member.photos.map((photo) => (
                                <div 
                                    key={photo.id}
                                    className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative shadow-md hover:shadow-xl transition-shadow"
                                    onClick={() => setSelectedPhoto(photo)}
                                    data-testid={`album-photo-${photo.id}`}
                                >
                                    <img 
                                        src={photo.photo_url} 
                                        alt={photo.caption || 'Family photo'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {photo.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-sm truncate">{photo.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card className="family-card">
                            <CardContent className="py-16">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-[#8A9A5B]/15 rounded-full flex items-center justify-center mb-4">
                                        <Image className="h-10 w-10 text-[#8A9A5B]" />
                                    </div>
                                    <h3 className="font-serif text-xl text-[#4A3728] mb-2">
                                        No Photos Yet
                                    </h3>
                                    <p className="text-[#5D4037]">
                                        {member.name}'s photo album is empty.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Join CTA */}
                <div className="text-center py-8 border-t border-[#E6D0B3]">
                    <p className="text-[#5D4037] mb-4">
                        Want to add your own photos and connect with the family?
                    </p>
                    <Link to="/register">
                        <Button className="btn-primary">
                            Join The Barbour Connection
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Photo Modal */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div 
                        className="max-w-4xl max-h-[90vh] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={selectedPhoto.photo_url} 
                            alt={selectedPhoto.caption || 'Family photo'}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                        />
                        {selectedPhoto.caption && (
                            <p className="text-white text-center mt-4 text-lg">
                                {selectedPhoto.caption}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-[#4A3728] py-4 px-6 text-[#FAF0E6]/70">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
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
