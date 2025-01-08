import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GET_USER_DETAILS, UPDATE_USER } from '../urls';

const UserDetails = () => {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [editable, setEditable] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        DOB: '',
        bio: '',
        address: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');

    const fetchUserDetails = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            const user_id = userData.user_id;

            axios
                .get(`${GET_USER_DETAILS}${user_id}/`)
                .then((response) => {
                    setUserDetails(response.data);
                    setFormData({
                        first_name: response.data.first_name,
                        last_name: response.data.last_name,
                        DOB: response.data.DOB,
                        bio: response.data.bio || '',
                        address: response.data.address || ''
                    });
                })
                .catch((error) => {
                    console.error('Error fetching user details:', error);
                });
        }
    };
    // Fetch user details when component mounts
    useEffect(() => {
        fetchUserDetails();
    }, []);

    const handleEditToggle = () => {
        setEditable(!editable);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            const userData = JSON.parse(storedUser);
            const user_id = userData.user_id;

            axios
                .put(`${UPDATE_USER}${user_id}/`, { ...formData, password })
                .then((response) => {
                    setUserDetails(response.data);
                    setEditable(false);
                    setShowPasswordModal(false);
                    setPassword('');
                    alert('User details updated successfully!');
                    fetchUserDetails()
                    navigate('/profile');
                })
                .catch((error) => {
                    console.error(error)
                    alert(error?.response?.data?.error)
                    setPassword('');
                });
        } else {
            alert('Could not retrieve user information.');
        }
    };

    if (!userDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">User Details</h2>
            {editable ? (
                <form onSubmit={handleSaveClick} className="space-y-4">
                    <div className="flex flex-col">
                        <label className="text-gray-700">First Name:</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Last Name:</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Date of Birth:</label>
                        <input
                            type="date"
                            name="DOB"
                            value={formData.DOB}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Bio:</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md h-24"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-gray-700">Address:</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex justify-between">
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={handleEditToggle}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4 text-gray-700">
                    <p>Username: <strong>{userDetails.username}</strong></p>
                    <p>Email: <strong>{userDetails.email}</strong></p>
                    <p>First Name: <strong>{userDetails.first_name}</strong></p>
                    <p>Last Name: <strong>{userDetails.last_name}</strong></p>
                    <p>Date of Birth: <strong>{userDetails.DOB}</strong></p>
                    <p>Bio: <strong>{userDetails.bio ? userDetails.bio : "Add bio"}</strong></p>
                    <p>Address: <strong>{userDetails.address ? userDetails.address : "Add address"}</strong></p>

                    <button onClick={handleEditToggle} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Edit Details
                    </button>
                </div>
            )}

            {/* Password Confirmation Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Enter Password to Confirm</h3>
                        <form onSubmit={handlePasswordSubmit}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="p-2 border border-gray-300 rounded-md w-full mb-4"
                                required
                                autoComplete="new-password"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetails;
