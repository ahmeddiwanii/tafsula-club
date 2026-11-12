'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, X } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
}

interface PostWithDetails {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  status: string;
  approvalStatus: string;
  author: User;
  approvedBy?: User;
  createdAt: string;
  taggedUserIds?: string;
  comments?: Comment[];
  likes?: { userId: string }[];
}

interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt?: string;
}

interface PostsComponentProps {
  posts: PostWithDetails[];
  onRefreshAction?: () => Promise<void>;
  canApprove?: boolean;
}

export function PostsComponent({ posts, onRefreshAction, canApprove = false }: PostsComponentProps) {
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState<PostWithDetails | null>(null);
  const [showCommentModal, setShowCommentModal] = useState<PostWithDetails | null>(null);
  const [showViewsModal, setShowViewsModal] = useState<{ post: PostWithDetails; views: any[] } | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    taggedUserIds: [] as string[],
  });
  const [approvalComment, setApprovalComment] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});

  // Fetch user's liked posts on mount
  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const res = await fetch('/api/posts/likes/user');
        if (res.ok) {
          const data = await res.json();
          setLikedPosts(new Set(data.likedPostIds));
        }
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      }
    };
    fetchLikedPosts();
  }, []);

  const createPost = async () => {
    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostData),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewPostData({ title: '', content: '', taggedUserIds: [] });
        if (onRefreshAction) {
          await onRefreshAction();
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const approvePost = async (action: 'approve' | 'reject') => {
    if (!showApprovalModal) return;

    try {
      const res = await fetch(`/api/posts/approve/${showApprovalModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          comment: approvalComment,
        }),
      });

      if (res.ok) {
        setShowApprovalModal(null);
        setApprovalComment('');
        if (onRefreshAction) {
          await onRefreshAction();
        }
      }
    } catch (error) {
      console.error('Error processing post:', error);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const res = await fetch('/api/posts/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.liked) {
          setLikedPosts((prev) => new Set([...prev, postId]));
        } else {
          setLikedPosts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const addComment = async () => {
    if (!showCommentModal || !commentContent.trim()) return;

    try {
      const res = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: showCommentModal.id,
          content: commentContent,
        }),
      });

      if (res.ok) {
        setCommentContent('');
        setShowCommentModal(null);
        if (onRefreshAction) {
          await onRefreshAction();
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
    // Track post view
    trackPostView(postId);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const trackPostView = async (postId: string) => {
    try {
      await fetch('/api/posts/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const fetchPostViews = async (post: PostWithDetails) => {
    try {
      const res = await fetch(`/api/posts/views?postId=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setShowViewsModal({ post, views: data.views });
      }
    } catch (error) {
      console.error('Error fetching views:', error);
    }
  };

  const addReply = async (commentId: string) => {
    if (!replyContent[commentId]?.trim()) return;

    try {
      const res = await fetch(`/api/posts/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent[commentId] }),
      });

      if (res.ok) {
        setReplyContent({ ...replyContent, [commentId]: '' });
        if (onRefreshAction) {
          await onRefreshAction();
        }
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      <Button
        onClick={() => setShowCreateModal(true)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Create Post
      </Button>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create a New Post</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  value={newPostData.title}
                  onChange={(e) =>
                    setNewPostData({ ...newPostData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newPostData.content}
                  onChange={(e) =>
                    setNewPostData({ ...newPostData, content: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-32"
                  placeholder="Share your thoughts..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={createPost}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Post
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card
            key={post.id}
            className={`p-6 border-2 transition-all hover:shadow-lg ${
              post.approvalStatus === 'pending' ? 'border-yellow-200 bg-yellow-50' : ''
            } ${post.approvalStatus === 'rejected' ? 'border-red-200 bg-red-50' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600">
                  by {post.author.name} •{' '}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={
                    post.approvalStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : post.approvalStatus === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {post.approvalStatus === 'approved' ? 'Approved' : 
                   post.approvalStatus === 'rejected' ? 'Rejected' : 
                   'Pending Approval'}
                </Badge>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{post.content}</p>

            <div className="flex gap-4 text-gray-600 text-sm">
              <button 
                onClick={() => likePost(post.id)}
                className={`flex items-center gap-1 transition-colors ${
                  likedPosts.has(post.id) ? 'text-red-600' : 'hover:text-red-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                Like {post.likes && post.likes.length > 0 && `(${post.likes.length})`}
              </button>
              <button 
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Comments {post.comments && post.comments.length > 0 && `(${post.comments.length})`}
              </button>
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Comments Section */}
            {expandedComments.has(post.id) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-4 mb-4">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">
                              {comment.author.name}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{comment.content}</p>
                        
                        {/* Reply Toggle */}
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mb-2"
                        >
                          {expandedReplies.has(comment.id) ? 'Hide replies' : 'View replies'}
                        </button>

                        {/* Replies Section */}
                        {expandedReplies.has(comment.id) && (
                          <div className="mt-3 space-y-3 border-l-2 border-gray-200 pl-3">
                            {/* Display existing replies would go here */}
                            <div className="mt-3">
                              <textarea
                                value={replyContent[comment.id] || ''}
                                onChange={(e) =>
                                  setReplyContent({
                                    ...replyContent,
                                    [comment.id]: e.target.value,
                                  })
                                }
                                placeholder="Reply to this comment..."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                              />
                              <button
                                onClick={() => addReply(comment.id)}
                                className="mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>

                {/* Add Comment Form */}
                <div className="border-t border-gray-200 pt-4">
                  <textarea
                    value={commentContent && showCommentModal?.id === post.id ? commentContent : ''}
                    onChange={(e) => {
                      setCommentContent(e.target.value);
                      setShowCommentModal(post);
                    }}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => {
                        setShowCommentModal(post);
                        addComment();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Actions for HR */}
            {canApprove && post.approvalStatus === 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <Button
                  onClick={() => setShowApprovalModal(post)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => setShowApprovalModal(post)}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
              </div>
            )}

            {/* View Count Button for HR */}
            {canApprove && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => fetchPostViews(post)}
                  variant="outline"
                  className="text-sm"
                >
                  View Viewers
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Approve or Reject Post</h3>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900">
                {showApprovalModal.title}
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                {showApprovalModal.content}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add a comment..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => approvePost('approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                onClick={() => approvePost('reject')}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  setShowApprovalModal(null);
                  setApprovalComment('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Views Modal for HR */}
      {showViewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">People Who Viewed This Post</h3>
              <button
                onClick={() => setShowViewsModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                {showViewsModal.post.title}
              </h4>
              <p className="text-xs text-gray-600">
                Total views: {showViewsModal.views.length}
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {showViewsModal.views.length > 0 ? (
                showViewsModal.views.map((view) => (
                  <div key={view.id} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium text-sm text-gray-900">
                      {view.user.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {view.user.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Viewed: {new Date(view.viewedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No views yet
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setShowViewsModal(null)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Comment Modal - Removed, using inline comments instead */}
    </div>
  );
}
