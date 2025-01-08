import { useEffect, useState } from 'react';
import { MY_FRIENDS, TOGGLE_FRIENDSHIP } from '../urls';
import { Link, useNavigate } from 'react-router-dom';

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.user_id : null;

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        fetch(`${MY_FRIENDS}?user_id=${userId}`, { credentials: 'include' })
            .then(response => response.json())
            .then(data => setFriends(data))
            .catch(error => console.error('Error fetching friends:', error));
    }, [userId, navigate]);

    const removeFriend = (friendId) => {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('target_user_id', friendId);

        fetch(`${TOGGLE_FRIENDSHIP}${userId}/`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'removed') {
                // Remove the friend from the state
                setFriends(friends.filter(friend => friend.user_id !== friendId));
            }
        })
        .catch(error => console.error('Error removing friend:', error));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
            <h2 className="text-2xl font-bold mb-4">My Friends</h2>
            {friends.length === 0 ? ( // Check if there are no friends
                <div className="text-center">
                    <p className="mb-4">You have no friends yet.</p>
                    <Link to="/all-users" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Make Friends
                    </Link>
                </div>
            ) : (
                <ul className="w-full max-w-md space-y-2">
                    {friends.map(friend => (
                        <li key={friend.user_id} className="flex justify-between items-center p-4 bg-white shadow rounded">
                            <div>
                                <Link to={`/other-user/${friend.user_id}`} className="font-bold text-green-500 hover:underline">
                                    {friend.username}
                                </Link>
                            </div>
                            <button
                                onClick={() => removeFriend(friend.user_id)}
                                className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Friends;
