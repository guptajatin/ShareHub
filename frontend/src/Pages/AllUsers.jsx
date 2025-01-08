import { useEffect, useState } from 'react';
import { ALL_USERS, TOGGLE_FRIENDSHIP } from '../urls';
import { useNavigate, Link } from 'react-router-dom';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.user_id : null;

    useEffect(() => {
        if (!userId) {
            navigate('/login'); // Redirect to login if no user is logged in
            return;
        }

        fetch(`${ALL_USERS}?user_id=${userId}`, { credentials: 'include' })
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    }, [userId, navigate]);

    const toggleFriendStatus = (targetUserId) => {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('target_user_id', targetUserId);
    
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
            setUsers(users.map(user =>
                user.user_id === targetUserId ? { ...user, is_friend: data.status === 'added' } : user
            ));
        })
        .catch(error => console.error('Error toggling friendship:', error));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
            <h2 className="text-2xl font-bold mb-4">All Users</h2>
            <ul className="w-full max-w-md space-y-2">
                {users.map(user => (
                    <li key={user.user_id} className="flex justify-between items-center p-4 bg-white shadow rounded">
                        <div>
                            <Link to={`/other-user/${user.user_id}`} className="font-bold text-green-500 hover:underline">
                                {user.username}
                            </Link>
                        </div>
                        <button
                            onClick={() => toggleFriendStatus(user.user_id)}
                            className={`ml-4 px-4 py-2 rounded ${
                                user.is_friend ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                            } hover:bg-opacity-80`}
                        >
                            {user.is_friend ? 'Friend' : 'Add Friend'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AllUsers;
