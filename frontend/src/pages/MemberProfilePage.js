import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { membersApi, photosApi, uploadApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { 
    ArrowLeft, 
    User,
    Edit,
    Trash2,
    Plus,
    Calendar,
    Image,
    X,
    Upload
} from 'lucide-react';
import { toast } from 'sonner';

const relationshipOptions = [
    'Self', 'Spouse', 'Parent', 'Child', 'Sibling', 
    'Grandparent', 'Grandchild', 'Aunt/Uncle', 'Cousin', 
    'Niece/Nephew', 'In-Law', 'Other'
];

export default function MemberProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [photoData, setPhotoData] = useState({ photo_url: '', caption: '' });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const editFileInputRef = useRef(null);
    const albumFileInputRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [memberRes, allMembersRes] = await Promise.all([
                membersApi.getOne(id),
                membersApi.getAll()
            ]);
            setMember(memberRes.data);
            setAllMembers(allMembersRes.data);
            setFormData({
                name: memberRes.data.name,
                relationship: memberRes.data.relationship,
                birth_date: memberRes.data.birth_date || '',
                bio: memberRes.data.bio || '',
                photo_url: memberRes.data.photo_url || '',
                parent_id: memberRes.data.parent_id || ''
            });
        } catch (error) {
            toast.error('Failed to load member details');
            navigate('/members');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.relationship) {
            toast.error('Please fill in required fields');
            return;
        }

        setSubmitting(true);
        try {
            await membersApi.update(id, formData);
            toast.success('Member updated successfully');
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to update member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await uploadApi.upload(file);
            setFormData({ ...formData, photo_url: response.data.url });
            toast.success('Photo uploaded!');
        } catch (error) {
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleAlbumFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingPhoto(true);
        try {
            const response = await uploadApi.upload(file);
            setPhotoData({ ...photoData, photo_url: response.data.url });
            toast.success('Photo uploaded!');
        } catch (error) {
            toast.error('Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to remove ${member.name} from the family tree?`)) {
            return;
        }

        try {
            await membersApi.delete(id);
            toast.success('Member removed from family tree');
            navigate('/members');
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    const handleAddPhoto = async (e) => {
        e.preventDefault();
        if (!photoData.photo_url) {
            toast.error('Please enter a photo URL');
            return;
        }

        setSubmitting(true);
        try {
            await photosApi.add(id, photoData);
            toast.success('Photo added successfully');
            setIsPhotoModalOpen(false);
            setPhotoData({ photo_url: '', caption: '' });
            fetchData();
        } catch (error) {
            toast.error('Failed to add photo');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) {
            return;
        }

        try {
            await photosApi.delete(id, photoId);
            toast.success('Photo deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete photo');
        }
    };

    const parentMember = allMembers.find(m => m.id === member?.parent_id);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-[#4A3728] font-serif text-xl">
                    Loading profile...
                </div>
            </div>
        );
    }

    if (!member) {
        return null;
    }

    return (
        <div className="space-y-8 animate-fade-in" data-testid="member-profile-page">
            {/* Back Button */}
            <Link 
                to="/members" 
                className="inline-flex items-center gap-2 text-[#5D4037] hover:text-[#4A3728] transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Members
            </Link>

            {/* Profile Header */}
            <Card className="family-card overflow-hidden" data-testid="profile-header">
                <div className="h-32 bg-gradient-to-r from-[#4A3728] to-[#5D4037] relative">
                    <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1554230253-017daba2b631?crop=entropy&cs=srgb&fm=jpg&q=85')`,
                            backgroundSize: 'cover',
                        }}
                    />
                </div>
                <CardContent className="pt-0 px-8 pb-8">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 relative z-10">
                        {member.photo_url ? (
                            <img 
                                src={member.photo_url} 
                                alt={member.name}
                                className="profile-avatar"
                            />
                        ) : (
                            <div className="w-[120px] h-[120px] rounded-full bg-[#8A9A5B]/20 flex items-center justify-center border-4 border-[#D4A017] shadow-lg">
                                <User className="h-12 w-12 text-[#8A9A5B]" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="font-serif text-3xl font-bold text-[#4A3728]">
                                        {member.name}
                                    </h1>
                                    <span className="badge badge-primary mt-2 inline-block">
                                        {member.relationship}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="border-[#8A9A5B] text-[#8A9A5B] hover:bg-[#8A9A5B] hover:text-white"
                                        data-testid="edit-profile-btn"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleDelete}
                                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                        data-testid="delete-profile-btn"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="family-card" data-testid="member-details">
                        <CardHeader>
                            <CardTitle className="font-serif text-xl text-[#4A3728]">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {member.birth_date && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#D4A017]/20 rounded-lg flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-[#D4A017]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#5D4037]">Birth Date</p>
                                        <p className="font-medium text-[#4A3728]">{member.birth_date}</p>
                                    </div>
                                </div>
                            )}
                            {parentMember && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#8A9A5B]/20 rounded-lg flex items-center justify-center">
                                        <User className="h-5 w-5 text-[#8A9A5B]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#5D4037]">Parent</p>
                                        <Link 
                                            to={`/members/${parentMember.id}`}
                                            className="font-medium text-[#8A9A5B] hover:underline"
                                        >
                                            {parentMember.name}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bio */}
                    <Card className="family-card" data-testid="member-bio">
                        <CardHeader>
                            <CardTitle className="font-serif text-xl text-[#4A3728]">Biography</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {member.bio ? (
                                <p className="text-[#5D4037] whitespace-pre-wrap">{member.bio}</p>
                            ) : (
                                <p className="text-[#5D4037]/60 italic">No biography added yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Photo Album */}
                <div className="lg:col-span-2">
                    <Card className="family-card" data-testid="photo-album">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="font-serif text-xl text-[#4A3728]">
                                Photo Album
                            </CardTitle>
                            <Button
                                onClick={() => setIsPhotoModalOpen(true)}
                                className="btn-primary"
                                data-testid="add-photo-btn"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Photo
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {member.photos && member.photos.length > 0 ? (
                                <div className="photo-grid">
                                    {member.photos.map((photo) => (
                                        <div 
                                            key={photo.id} 
                                            className="photo-item group"
                                            data-testid={`photo-${photo.id}`}
                                        >
                                            <img 
                                                src={photo.photo_url} 
                                                alt={photo.caption || 'Family photo'}
                                            />
                                            <button
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                data-testid={`delete-photo-${photo.id}`}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            {photo.caption && (
                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-sm">{photo.caption}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state py-12">
                                    <div className="empty-state-icon">
                                        <Image className="h-8 w-8 text-[#8A9A5B]" />
                                    </div>
                                    <h3 className="font-serif text-xl text-[#4A3728] mb-2">
                                        No Photos Yet
                                    </h3>
                                    <p className="text-[#5D4037] mb-6 max-w-sm">
                                        Add photos to create a beautiful memory wall for {member.name}
                                    </p>
                                    <Button 
                                        onClick={() => setIsPhotoModalOpen(true)}
                                        className="btn-primary"
                                        data-testid="add-first-photo-btn"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Photo
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-[#FFF8F0] border-[#E6D0B3] max-w-lg" data-testid="edit-modal">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#4A3728]">
                            Edit Member
                        </DialogTitle>
                        <DialogDescription className="text-[#5D4037]">
                            Update {member.name}'s details
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-[#4A3728]">Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                    data-testid="edit-name-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-relationship" className="text-[#4A3728]">Relationship *</Label>
                                <Select
                                    value={formData.relationship}
                                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                                >
                                    <SelectTrigger className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]" data-testid="edit-relationship-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#FFF8F0] border-[#E6D0B3]">
                                        {relationshipOptions.map((rel) => (
                                            <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-birth_date" className="text-[#4A3728]">Birth Date</Label>
                                <Input
                                    id="edit-birth_date"
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                    className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                    data-testid="edit-birthdate-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-parent_id" className="text-[#4A3728]">Parent</Label>
                                <Select
                                    value={formData.parent_id || 'none'}
                                    onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? '' : value })}
                                >
                                    <SelectTrigger className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]" data-testid="edit-parent-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#FFF8F0] border-[#E6D0B3]">
                                        <SelectItem value="none">None</SelectItem>
                                        {allMembers
                                            .filter(m => m.id !== id)
                                            .map((m) => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-photo_url" className="text-[#4A3728]">Photo</Label>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    ref={editFileInputRef}
                                    onChange={handleEditFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                    data-testid="edit-photo-file-input"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => editFileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full border-[#D7C0A0] text-[#4A3728] hover:bg-[#8A9A5B]/10"
                                    data-testid="edit-photo-upload-btn"
                                >
                                    {uploading ? (
                                        <>Uploading...</>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Photo
                                        </>
                                    )}
                                </Button>
                                {formData.photo_url && (
                                    <div className="flex items-center gap-2 p-2 bg-[#FAF0E6] rounded-lg">
                                        <img 
                                            src={formData.photo_url} 
                                            alt="Preview" 
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                        <span className="text-sm text-[#5D4037] truncate flex-1">Photo uploaded</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, photo_url: '' })}
                                            className="h-8 w-8 p-0 text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-bio" className="text-[#4A3728]">Bio</Label>
                            <Textarea
                                id="edit-bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B] min-h-[100px]"
                                data-testid="edit-bio-input"
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="border-[#4A3728] text-[#4A3728]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary"
                                data-testid="save-edit-btn"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Photo Modal */}
            <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
                <DialogContent className="bg-[#FFF8F0] border-[#E6D0B3] max-w-md" data-testid="add-photo-modal">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#4A3728]">
                            Add Photo
                        </DialogTitle>
                        <DialogDescription className="text-[#5D4037]">
                            Add a new photo to {member.name}'s album
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPhoto} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[#4A3728]">Photo *</Label>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    ref={albumFileInputRef}
                                    onChange={handleAlbumFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                    data-testid="album-photo-file-input"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => albumFileInputRef.current?.click()}
                                    disabled={uploadingPhoto}
                                    className="w-full border-[#D7C0A0] text-[#4A3728] hover:bg-[#8A9A5B]/10"
                                    data-testid="album-photo-upload-btn"
                                >
                                    {uploadingPhoto ? (
                                        <>Uploading...</>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Photo
                                        </>
                                    )}
                                </Button>
                                {photoData.photo_url && (
                                    <div className="flex items-center gap-2 p-2 bg-[#FAF0E6] rounded-lg">
                                        <img 
                                            src={photoData.photo_url} 
                                            alt="Preview" 
                                            className="w-12 h-12 rounded object-cover"
                                        />
                                        <span className="text-sm text-[#5D4037] truncate flex-1">Photo ready to add</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPhotoData({ ...photoData, photo_url: '' })}
                                            className="h-8 w-8 p-0 text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caption" className="text-[#4A3728]">Caption</Label>
                            <Input
                                id="caption"
                                value={photoData.caption}
                                onChange={(e) => setPhotoData({ ...photoData, caption: e.target.value })}
                                className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                placeholder="A special moment..."
                                data-testid="photo-caption-input"
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPhotoModalOpen(false)}
                                className="border-[#4A3728] text-[#4A3728]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !photoData.photo_url}
                                className="btn-primary"
                                data-testid="save-photo-btn"
                            >
                                {submitting ? 'Adding...' : 'Add Photo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
