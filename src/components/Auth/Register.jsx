import { useState } from 'react';
import { auth } from '../../firebase/config';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const Register = ({ onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please complete all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/editor');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Something went wrong while creating your account.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      navigate('/editor');
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Google sign-in failed. Please try again.';

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'The Google window was closed before finishing.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized in Firebase. Add it under Authentication settings.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'The sign-in request was cancelled.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans">
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          {/* New Full Logo */}
          <img src="/vido-logo.png" alt="ViDo Logo" className="w-56 h-auto object-contain" />
        </div>

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2 flex items-center gap-2">
              Get Started <span className="text-3xl">🚀</span>
            </h1>
            <p className="text-gray-500">Create your account to start designing</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Full Name*
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#0F172A] focus:border-transparent outline-none transition bg-white"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Email Address*
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#0F172A] focus:border-transparent outline-none transition bg-white"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#0F172A] focus:border-transparent outline-none transition bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Confirm Password*
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#0F172A] focus:border-transparent outline-none transition bg-white"
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0F172A] text-white font-medium rounded-xl hover:bg-[#1e293b] transform hover:-translate-y-0.5 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-200 mt-2"
            >
              {loading ? 'Creating...' : 'Register'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-400 font-medium">Or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 bg-[#0F172A] text-white font-medium rounded-xl hover:bg-[#1e293b] transition flex items-center justify-center gap-3 disabled:opacity-70 shadow-lg shadow-slate-200"
          >
            <FaGoogle className="text-white" size={18} />
            Sign up with Google
          </button>

          {/* Switch to Login */}
          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#0F172A] font-bold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Image/Illustration (Matched to Login) */}
      <div className="w-full lg:w-1/2 p-4 lg:p-6 hidden lg:block h-screen sticky top-0">
        <div className="w-full h-full rounded-[40px] overflow-hidden relative">
          <img
            src="/auth-illustration.png"
            alt="Design Innovation"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;