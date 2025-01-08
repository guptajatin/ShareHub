import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { POST_DETAILS, ADD_COMMENT, DELETE_COMMENT } from '../urls';

const PostDetails = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [showLikedUsers, setShowLikedUsers] = useState(false);
    const [showCommentUsers, setShowCommentUsers] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setCurrentUserId(user.user_id);
        } else {
            console.error('User not logged in');
        }
    }, []);

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                const response = await fetch(`${POST_DETAILS}${postId}/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch post details');
                }
                const data = await response.json();
                setPost(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchPostDetails();
    }, [postId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await fetch(ADD_COMMENT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id: postId, comment: newComment, current_user_id: currentUserId }),
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPost(updatedPost);
                setNewComment('');
            } else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        console.log("Handle delete: ", commentId)
        try {
            const response = await fetch(DELETE_COMMENT, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment_id: commentId, current_user_id: currentUserId }), // Include user ID here
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPost(updatedPost);
            } else {
                console.error('Failed to delete comment');
            }
        } catch (error) {
            console.error(error);
        }
    };


    if (!post) return <div className="text-center p-4">Loading...</div>;

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.post_desc}</h1>

            <p className="text-gray-600 mb-2">
                Posted by:  
                <strong>
                    <Link
                        to={`/other-user/${post.posted_by_id}`}
                        className="text-blue-500 hover:underline"
                    >
                        {" " + post.posted_by}
                    </Link>
                </strong>
            </p>

            {/* <p className="text-gray-600 mb-2"><strong>Posted by: {post.posted_by}</strong></p> */}
            {/* Render media (either image or video) */}
            {post.is_video ? (
                <video src={`/posts/${post.post_link}`} controls className="w-full h-72 object-cover rounded mt-4 shadow-md" />
            ) : (
                <img src={`/posts/${post.post_link}`} alt={post.post_desc} className="w-full h-72 object-cover rounded mt-4 shadow-md" />
            )}

            {/* Likes Button */}
            <button
                className="mt-4 mr-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-300"
                onClick={() => setShowLikedUsers(!showLikedUsers)}
            >
                Likes: {post.like_count}
            </button>

            {/* Comments Button */}
            <button
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-300"
                onClick={() => setShowCommentUsers(!showCommentUsers)}
            >
                Comments: {post.comment_count}
            </button>

            {/* Show Liked Users */}
            {showLikedUsers && (
                <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-inner">
                    <h2 className="font-semibold text-lg text-gray-800">Liked By:</h2>
                    <ul className="mt-2 space-y-1">
                        {post.liked_users.map((username, index) => (
                            <li key={index} className="text-gray-700">
                                {username}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Show Comment Users */}
            {showCommentUsers && (
                <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-inner">
                    <h2 className="font-semibold text-lg text-gray-800">Comments:</h2>
                    <ul className="mt-2 space-y-2">
                        {post.comment_users.map((comment) => (
                            <li key={comment.user_id} className="p-3 border rounded-md flex justify-between items-center bg-white">
                                <span className="text-gray-700">
                                    {comment.username}: <strong>{comment.comment}</strong>
                                </span>
                                {comment.user_id === currentUserId && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.comment_id)} // Assuming comment_id is the ID of the comment
                                        className="ml-2 text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Add Comment */}
            <div className="mt-6">
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows="3"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button
                    onClick={handleAddComment}
                    className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                    Add Comment
                </button>
            </div>
        </div>
    );
};

export default PostDetails;
