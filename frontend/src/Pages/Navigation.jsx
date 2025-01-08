import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SlSocialInstagram } from "react-icons/sl";

const NavigationBar = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            navigate("/homepage");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white font-bold text-2xl flex items-center">
                    <div>Share Hub</div>
                    <SlSocialInstagram className="ml-4" />
                </div>

                <div className="flex space-x-4">
                    <Link 
                        to={user ? "/homepage" : "/"}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                        Home
                    </Link>
                    <Link 
                        to="/my-friends" 
                        className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                        Friends
                    </Link>
                    <Link 
                        to="/all-users" 
                        className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                        All Users
                    </Link>
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={toggleDropdown}
                                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                            >
                                {user.username}
                                <svg
                                    className={`ml-2 h-5 w-5 transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-400 rounded-md shadow-lg z-20">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/posts"
                                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Post
                                    </Link>
                                    <Link
                                        to="/my-posts" // Link for My Posts
                                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        My Posts
                                    </Link>
                                    {user.is_Admin === 1 && (
                                        <>
                                            <Link
                                                to="/admin/manage-users"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                Manage Users
                                            </Link>
                                            <Link
                                                to="/admin/manage-posts"
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                Manage Posts
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;
