import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/user/userSlice';
import toast from 'react-hot-toast';

export const useSessionCheck = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);

    // Verify both token and user data validity
    const verifySession = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/auth/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await response.json();
            
            // Verify if the logged-in user matches the stored user
            if (currentUser && data.data.userId !== currentUser.userId) {
                throw new Error('User session mismatch');
            }
            
            return true;
        } catch (error) {
            // Show user-friendly error messages
            if (error.message === 'User session mismatch') {
                toast.error('Session error: Please login again');
            } else if (error.response?.status === 401) {
                toast.error('Session expired: Please login again');
            } else {
                toast.error('Authentication error: Please try again');
            }
            
            dispatch(logout());
            navigate('/login');
            return false;
        }
    }, [dispatch, navigate, currentUser]);

    // Set up hourly checks
    useEffect(() => {
        let intervalId;

        const runSessionCheck = async () => {
            if (currentUser) {
                await verifySession();
            }
        };

        // Initial check
        runSessionCheck();

        // 30 min interval 
        intervalId = setInterval(runSessionCheck, 30*60*1000);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [verifySession, currentUser]);

    // Return authentication status and user validity
    return {
        isAuthenticated: !!currentUser,
        isValidUser: !!(currentUser && currentUser.userId),
        currentUser
    };
};