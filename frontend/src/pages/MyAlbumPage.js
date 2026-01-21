import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi, uploadApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
    User,
    Image,
    Upload,
    X,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function MyAlbumPage() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoData, setPhotoData] = useState({ photo_url: '', caption: '' });
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            const response = await authApi.getPhotos();
            setPhotos(response.data);
        } catch (error) {
            console.error('Failed to fetch photos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await uploadApi.upload(file);
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            setPhotoData({ ...photoData, photo_url: `${backendUrl}${response.data.url}` });
            toast.success('Photo uploaded!');
        } catch (error) {
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleAddPhoto = async (e) => {
        e.preventDefault();
        if (!photoData.photo_url) {
            toast.error('Please upload a photo');
            return;
        }

        setSubmitting(true);
        try {
            await authApi.addPhoto(photoData);
            toast.success('Photo added to your album!');
            setIsModalOpen(false);
            setPhotoData({ photo_url: '', caption: '' });
            fetchPhotos();
        } catch (error) {
            toast.error('Failed to add photo');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;

        try {
            await authApi.deletePhoto(photoId);
            toast.success('Photo deleted');
            fetchPhotos();
        } catch (error) {
            toast.error('Failed to delete photo');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-[#4A3728] font-serif text-xl">
                    Loading your album...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in" data-testid="my-album-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {user?.photo_url ? (
                        <img 
                            src={user.photo_url} 
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-[#D4A017]"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-[#8A9A5B]/20 flex items-center justify-center border-4 border-[#D4A017]">
                            <User className="h-8 w-8 text-[#8A9A5B]" />
                        </div>
                    )}
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-[#4A3728]">
                            My Photo Album
                        </h1>
                        <p className="text-[#5D4037]">
                            {photos.length} photo{photos.length !== 1 ? 's' : ''} in your personal album
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                    data-testid="add-photo-btn"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Photo
                </Button>
            </div>

            {/* Photo Gallery */}
            {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map((photo) => (
                        <div 
                            key={photo.id}
                            className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative shadow-md hover:shadow-xl transition-shadow"
                            data-testid={`my-photo-${photo.id}`}
                        >
                            <img 
                                src={photo.photo_url} 
                                alt={photo.caption || 'My photo'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onClick={() => setSelectedPhoto(photo)}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhoto(photo.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                data-testid={`delete-my-photo-${photo.id}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
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
                                Your Album is Empty
                            </h3>
                            <p className="text-[#5D4037] mb-6 max-w-sm">
                                Start adding photos to your personal album
                            </p>
                            <Button 
                                onClick={() => setIsModalOpen(true)}
                                className="btn-primary"
                                data-testid="add-first-photo-btn"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Photo
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Photo Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#FFF8F0] border-[#E6D0B3] max-w-md" data-testid="add-photo-modal">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#4A3728]">
                            Add Photo
                        </DialogTitle>
                        <DialogDescription className="text-[#5D4037]">
                            Upload a photo to your personal album
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPhoto} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[#4A3728]">Photo *</Label>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                    data-testid="my-album-photo-input"
                                />
                                {!photoData.photo_url ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full border-[#D7C0A0] text-[#4A3728] hover:bg-[#8A9A5B]/10 h-24"
                                        data-testid="my-album-upload-btn"
                                    >
                                        {uploading ? (
                                            <>Uploading...</>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Upload className="h-8 w-8 mb-2" />
                                                <span>Click to Upload Photo</span>
                                            </div>
                                        )}
                                    </Button>
                                ) : (
                                    <div className="relative">
                                        <img 
                                            src={photoData.photo_url} 
                                            alt="Preview" 
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPhotoData({ ...photoData, photo_url: '' })}
                                            className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500 text-white hover:bg-red-600 rounded-full"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caption" className="text-[#4A3728]">Caption (Optional)</Label>
                            <Input
                                id="caption"
                                value={photoData.caption}
                                onChange={(e) => setPhotoData({ ...photoData, caption: e.target.value })}
                                className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                placeholder="Add a caption..."
                                data-testid="my-album-caption-input"
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setPhotoData({ photo_url: '', caption: '' });
                                }}
                                className="border-[#4A3728] text-[#4A3728]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !photoData.photo_url}
                                className="btn-primary"
                                data-testid="save-my-photo-btn"
                            >
                                {submitting ? 'Adding...' : 'Add to Album'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Photo Viewer Modal */}
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
                            alt={selectedPhoto.caption || 'My photo'}
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
        </div>
    );
}
