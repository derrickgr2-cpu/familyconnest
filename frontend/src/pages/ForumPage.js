import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { forumApi } from '../lib/api';
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
    Plus, 
    MessageSquare,
    Send,
    Trash2,
    Edit,
    User,
    Clock,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function ForumPage() {
    const { user, isAdmin } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [replyContent, setReplyContent] = useState({});
    const [expandedPosts, setExpandedPosts] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await forumApi.getPosts();
            setPosts(response.data);
        } catch (error) {
            toast.error('Failed to load forum posts');
        } finally {
            setLoading(false);
        }
    };

    const openNewPostModal = () => {
        setEditingPost(null);
        setFormData({ title: '', content: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (post) => {
        setEditingPost(post);
        setFormData({ title: post.title, content: post.content });
        setIsModalOpen(true);
    };

    const handleSubmitPost = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            if (editingPost) {
                await forumApi.updatePost(editingPost.id, formData);
                toast.success('Post updated!');
            } else {
                await forumApi.createPost(formData);
                toast.success('Post created!');
            }
            setIsModalOpen(false);
            fetchPosts();
        } catch (error) {
            toast.error(editingPost ? 'Failed to update post' : 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        
        try {
            await forumApi.deletePost(postId);
            toast.success('Post deleted');
            fetchPosts();
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const handleSubmitReply = async (postId) => {
        const content = replyContent[postId];
        if (!content?.trim()) {
            toast.error('Please enter a reply');
            return;
        }

        try {
            await forumApi.addReply(postId, { content });
            setReplyContent({ ...replyContent, [postId]: '' });
            toast.success('Reply added!');
            fetchPosts();
        } catch (error) {
            toast.error('Failed to add reply');
        }
    };

    const handleDeleteReply = async (postId, replyId) => {
        try {
            await forumApi.deleteReply(postId, replyId);
            toast.success('Reply deleted');
            fetchPosts();
        } catch (error) {
            toast.error('Failed to delete reply');
        }
    };

    const toggleExpanded = (postId) => {
        setExpandedPosts({ ...expandedPosts, [postId]: !expandedPosts[postId] });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-[#4A3728] font-serif text-xl">
                    Loading forum...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in" data-testid="forum-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-[#4A3728]">
                        Family Forum
                    </h1>
                    <p className="text-[#5D4037] mt-1">
                        Share stories, ask questions, and connect with family
                    </p>
                </div>
                <Button 
                    onClick={openNewPostModal}
                    className="btn-primary"
                    data-testid="new-post-btn"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                </Button>
            </div>

            {/* Posts List */}
            {posts.length > 0 ? (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <Card 
                            key={post.id} 
                            className="family-card overflow-hidden"
                            data-testid={`forum-post-${post.id}`}
                        >
                            <div className="h-1 bg-[#8A9A5B]" />
                            <CardContent className="p-6">
                                {/* Post Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-serif text-xl font-semibold text-[#4A3728]">
                                            {post.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-[#5D4037]">
                                            <span className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {post.author_name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {format(parseISO(post.created_at), 'MMM d, yyyy h:mm a')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-4 w-4" />
                                                {post.replies?.length || 0} replies
                                            </span>
                                        </div>
                                    </div>
                                    {(post.author_id === user?.id || isAdmin) && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(post)}
                                                className="h-8 w-8 p-0 text-[#8A9A5B] hover:text-[#8A9A5B] hover:bg-[#8A9A5B]/20"
                                                data-testid={`edit-post-${post.id}`}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeletePost(post.id)}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-500 hover:bg-red-50"
                                                data-testid={`delete-post-${post.id}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Post Content */}
                                <p className="mt-4 text-[#5D4037] whitespace-pre-wrap">
                                    {post.content}
                                </p>

                                {/* Replies Section */}
                                <div className="mt-6 pt-4 border-t border-[#E6D0B3]">
                                    <button
                                        onClick={() => toggleExpanded(post.id)}
                                        className="flex items-center gap-2 text-[#8A9A5B] font-medium hover:text-[#6B7A4A] transition-colors"
                                        data-testid={`toggle-replies-${post.id}`}
                                    >
                                        {expandedPosts[post.id] ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        {post.replies?.length || 0} Replies
                                    </button>

                                    {expandedPosts[post.id] && (
                                        <div className="mt-4 space-y-3">
                                            {/* Existing Replies */}
                                            {post.replies?.map((reply) => (
                                                <div 
                                                    key={reply.id}
                                                    className="p-3 bg-[#FAF0E6] rounded-lg"
                                                    data-testid={`reply-${reply.id}`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-[#5D4037]">{reply.content}</p>
                                                            <p className="text-xs text-[#8A9A5B] mt-1">
                                                                {reply.author_name} • {format(parseISO(reply.created_at), 'MMM d, h:mm a')}
                                                            </p>
                                                        </div>
                                                        {(reply.author_id === user?.id || isAdmin) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteReply(post.id, reply.id)}
                                                                className="h-6 w-6 p-0 text-red-400 hover:text-red-500"
                                                                data-testid={`delete-reply-${reply.id}`}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Reply Input */}
                                            <div className="flex gap-2 mt-3">
                                                <Input
                                                    placeholder="Write a reply..."
                                                    value={replyContent[post.id] || ''}
                                                    onChange={(e) => setReplyContent({ 
                                                        ...replyContent, 
                                                        [post.id]: e.target.value 
                                                    })}
                                                    className="flex-1 border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSubmitReply(post.id);
                                                        }
                                                    }}
                                                    data-testid={`reply-input-${post.id}`}
                                                />
                                                <Button
                                                    onClick={() => handleSubmitReply(post.id)}
                                                    className="bg-[#8A9A5B] hover:bg-[#6B7A4A] text-white"
                                                    data-testid={`submit-reply-${post.id}`}
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
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
                                <MessageSquare className="h-8 w-8 text-[#8A9A5B]" />
                            </div>
                            <h3 className="font-serif text-xl text-[#4A3728] mb-2">
                                No Discussions Yet
                            </h3>
                            <p className="text-[#5D4037] mb-6 max-w-sm">
                                Start a conversation with your family members
                            </p>
                            <Button 
                                onClick={openNewPostModal}
                                className="btn-primary"
                                data-testid="create-first-post-btn"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Start First Discussion
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* New/Edit Post Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#FFF8F0] border-[#E6D0B3] max-w-lg" data-testid="post-modal">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#4A3728]">
                            {editingPost ? 'Edit Post' : 'New Discussion'}
                        </DialogTitle>
                        <DialogDescription className="text-[#5D4037]">
                            {editingPost 
                                ? 'Update your post' 
                                : 'Share something with your family'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPost} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-[#4A3728]">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B]"
                                placeholder="What's on your mind?"
                                data-testid="post-title-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content" className="text-[#4A3728]">Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="border-[#D7C0A0] focus:border-[#8A9A5B] focus:ring-[#8A9A5B] min-h-[150px]"
                                placeholder="Share your thoughts, stories, or questions..."
                                data-testid="post-content-input"
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="border-[#4A3728] text-[#4A3728]"
                                data-testid="cancel-post-btn"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary"
                                data-testid="save-post-btn"
                            >
                                {submitting ? 'Posting...' : editingPost ? 'Update Post' : 'Post'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
