
import { GoogleAuthProvider, signInWithPopup, getAuth, deleteUser } from 'firebase/auth';
import { app } from '../firebaseConfig';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signInSuccess } from "../redux/user/userSlice";
import toast from 'react-hot-toast';
import { GoogleLogo } from './ui/GoogleLogo';
import { useState } from 'react';
export default function OAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleGoogleClick = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            setLoading(true);
            const resultsFromGoogle = await signInWithPopup(auth, provider);
            const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({
                    name: resultsFromGoogle.user.displayName,
                    email: resultsFromGoogle.user.email,
                    googlePhotoUrl: resultsFromGoogle.user.photoURL,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setLoading(false);
                console.log(data.data.user);
                dispatch(signInSuccess(data.data.user));
                navigate('/');
            } else {
                // If the response is not OK, delete the user from Firebase Authentication
                await deleteUser(resultsFromGoogle.user);
                setLoading(false);
                toast.error(`Please use a college email address ending with ${process.env.REACT_APP_ALLOWED_EMAIL_DOMAIN}`);
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            toast.error('An error occurred during sign-in. Please try again.');
        }
    };

    return (
        <button
            onClick={handleGoogleClick}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
         >
            {loading ? <div className='spinner'></div>:(  <>
                    <GoogleLogo />
                    <span className="ml-2">Continue with Google</span>
                </>)
            }
        </button>

    );
}
