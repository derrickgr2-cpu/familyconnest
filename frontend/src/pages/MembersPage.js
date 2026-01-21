import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { membersApi, uploadApi } from '../lib/api';
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
    Plus, 
    Search, 
    User,
    Edit,
    Trash2,
    X,
    Upload,
    ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const relationshipOptions = [
    'Self', 'Spouse', 'Parent', 'Child', 'Sibling', 
    'Grandparent', 'Grandchild', 'Aunt/Uncle', 'Cousin', 
    'Niece/Nephew', 'In-Law', 'Other'
];

export default function MembersPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        relationship: '',
        birth_date: '',
        bio: '',
        photo_url: '',
        parent_id: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await membersApi.getAll();
            setMembers(response.data);
        } catch (error) {
            toast.error('Failed to load family members');
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.relationship.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddModal = () => {
        setEditingMember(null);
        setFormData({
            name: '',
            relationship: '',
            birth_date: '',
            bio: '',
            photo_url: '',
            parent_id: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            relationship: member.relationship,
            birth_date: member.birth_date || '',
            bio: member.bio || '',
            photo_url: member.photo_url || '',
            parent_id: member.parent_id || ''
        });
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await uploadApi.upload(file);
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            setFormData({ ...formData, photo_url: `${backendUrl}${response.data.url}` });
            toast.success('Photo uploaded!');
        } catch (error) {
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.relationship) {
            toast.error('Please fill in required fields');
            return;
        }

        setSubmitting(true);
        try {
            if (editingMember) {
                await membersApi.update(editingMember.id, formData);
                toast.success('Member updated successfully');
            } else {
                await membersApi.create(formData);
                toast.success('Member added successfully');
            }
            setIsModalOpen(false);
            fetchMembers();
        } catch (error) {
            toast.error(editingMember ? 'Failed to update member' : 'Failed to add member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (member) => {
        if (!window.confirm(`Are you sure you want to remove ${member.name} from the family tree?`)) {
            return;
        }

        try {
            await membersApi.delete(member.id);
            toast.success('Member removed from family tree');
            fetchMembers();
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-[#4A3728] font-serif text-xl">
                    Loading family members...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in" data-testid="members-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-[#4A3728]">
                        Family Members
                    </h1>
                    <p className="text-[#5D4037] mt-1">
                        {members.length} member{members.length !== 1 ? 's' : ''} in your family tree
                    </p>
                </div>
                <Button 
                    onClick={openAddModal}
                    className="btn-primary"
                    data-testid="add-member-btn"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5D4037]" />
                <Input
                    placeholder="Search by name or relationship..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                    data-testid="search-members-input"
                />
            </div>

            {/* Members Grid */}
            {filteredMembers.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMembers.map((member) => (
                        <Card 
                            key={member.id} 
                            className="family-card card-hover overflow-hidden group"
                            data-testid={`member-card-${member.id}`}
                        >
                            <div className="h-2 bg-[#8A9A5B]" />
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    {member.photo_url ? (
                                        <img 
                                            src={member.photo_url} 
                                            alt={member.name}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-[#D4A017] mb-4"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-[#8A9A5B]/20 flex items-center justify-center border-4 border-[#D4A017] mb-4">
                                            <User className="h-10 w-10 text-[#8A9A5B]" />
                                        </div>
                                    )}
                                    <h3 className="font-serif text-lg font-semibold text-[#4A3728] mb-1">
                                        {member.name}
                                    </h3>
                                    <span className="badge badge-primary mb-3">
                                        {member.relationship}
                                    </span>
                                    {member.birth_date && (
                                        <p className="text-sm text-[#5D4037]">
                                            Born: {member.birth_date}
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link to={`/members/${member.id}`}>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="border-[#4A3728] text-[#4A3728] hover:bg-[#4A3728] hover:text-[#FAF0E6]"
                                                data-testid={`view-member-${member.id}`}
                                            >
                                                View
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => openEditModal(member)}
                                            className="border-[#8A9A5B] text-[#8A9A5B] hover:bg-[#8A9A5B] hover:text-white"
                                            data-testid={`edit-member-${member.id}`}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleDelete(member)}
                                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                            data-testid={`delete-member-${member.id}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="family-card">
                    <CardContent className="py-16">
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <User className="h-8 w-8 text-[#8A9A5B]" />
                            </div>
                            <h3 className="font-serif text-xl text-[#4A3728] mb-2">
                                {searchQuery ? 'No members found' : 'Start Your Family Tree'}
                            </h3>
                            <p className="text-[#5D4037] mb-6 max-w-sm">
                                {searchQuery 
                                    ? 'Try adjusting your search query'
                                    : 'Add your first family member to begin building your legacy'
                                }
                            </p>
                            {!searchQuery && (
                                <Button onClick={openAddModal} className="btn-primary" data-testid="add-first-member-btn">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Member
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#FFF8F0] border-[#E6D0B3] max-w-lg" data-testid="member-modal">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#4A3728]">
                            {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                        </DialogTitle>
                        <DialogDescription className="text-[#5D4037]">
                            {editingMember 
                                ? 'Update the details of this family member'
                                : 'Add a new member to your family tree'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[#4A3728]">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                    placeholder="Full name"
                                    data-testid="member-name-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="relationship" className="text-[#4A3728]">Relationship *</Label>
                                <Select
                                    value={formData.relationship}
                                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                                >
                                    <SelectTrigger className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]" data-testid="member-relationship-select">
                                        <SelectValue placeholder="Select relationship" />
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
                                <Label htmlFor="birth_date" className="text-[#4A3728]">Birth Date</Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                    className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                    data-testid="member-birthdate-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parent_id" className="text-[#4A3728]">Parent</Label>
                                <Select
                                    value={formData.parent_id}
                                    onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? '' : value })}
                                >
                                    <SelectTrigger className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]" data-testid="member-parent-select">
                                        <SelectValue placeholder="Select parent" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#FFF8F0] border-[#E6D0B3]">
                                        <SelectItem value="none">None</SelectItem>
                                        {members
                                            .filter(m => m.id !== editingMember?.id)
                                            .map((m) => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photo_url" className="text-[#4A3728]">Photo</Label>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                    data-testid="member-photo-file-input"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full border-[#D7C0A0] text-[#4A3728] hover:bg-[#8A9A5B]/10"
                                    data-testid="member-photo-upload-btn"
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
                            <Label htmlFor="bio" className="text-[#4A3728]">Bio</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B] min-h-[100px]"
                                placeholder="Share something special about this family member..."
                                data-testid="member-bio-input"
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="border-[#4A3728] text-[#4A3728]"
                                data-testid="cancel-member-btn"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary"
                                data-testid="save-member-btn"
                            >
                                {submitting ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
