import { useState } from 'react';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const Login = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Fadlan buuxi dhammaan goobaha!');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/editor');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Khalad ayaa dhacay! Hubi email-ka iyo password-ka.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Akoon lama helin. Fadlan samee mid cusub.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password-ku waa qaldan yahay!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email-ku waa qaldan yahay!';
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
      setError('Khalad ayaa dhacay markii la galinaayey Google!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Image with Gradient Overlay */}
      <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 flex">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-8 lg:p-12 w-full">
          <div className="mb-6 lg:mb-8">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <span className="text-3xl lg:text-4xl">🎨</span>
            </div>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold mb-3 lg:mb-4 text-center">Somali AI Design Studio</h1>
          <p className="text-base lg:text-xl text-white/90 text-center max-w-md">
            Baro qaabka loo sameeyo naqshado xirfad leh, adoo isticmaalaya AI si uu kuu caawiyo
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:flex-1 flex items-center justify-center p-6 lg:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Soo dhawoow dib!</h2>
              <p className="text-gray-600">Gali akoonkaaga si aad u sii waddo</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Geli email-kaaga"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Geli password-kaaga"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gali...' : 'Gali'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">Ama</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <FaGoogle className="text-red-500" size={20} />
              Gali Google
            </button>

            {/* Switch to Register */}
            <p className="text-center mt-6 text-sm text-gray-600">
              Ma lihid akoon?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-purple-600 font-semibold hover:text-purple-700"
              >
                Samee mid cusub
              </button>
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mt-8">
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                <FaFacebook className="text-gray-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                <FaTwitter className="text-gray-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                <FaInstagram className="text-gray-600" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;