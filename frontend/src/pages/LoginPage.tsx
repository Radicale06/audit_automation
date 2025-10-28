import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronLeft } from 'lucide-react';
import BackToDashboard from '../components/BackToDashboard';
import { useToast } from '../context/ToastContext';
import { useDispatch } from 'react-redux';
import { authService } from '../api/authService';
import { handleApiError } from '../api/errorUtils';
import { setCredentials } from '../redux/AuthReducer';

const LoginPage = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: ''  
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
  const { token } = data;
  dispatch(setCredentials({ token }));
  showToast('Connexion réussie', undefined, { type: 'success' });
    } catch (err) {
      const apiError = handleApiError(err);
  showToast('Connexion échouée', apiError.message, { type: 'error' });
  throw new Error(apiError.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 relative">
      

      <div className="absolute top-4 left-4 flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-100 rounded-lg transition-all duration-200 border border-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Retour</span>
        </Link>

        {localStorage.getItem('isLoggedIn') && <BackToDashboard />}
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-xl p-8 rounded-xl shadow-elevation-3 relative z-10">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-red-500 rounded-xl">
            <img src="/logo.png" alt="HAT Security" className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Connexion</h2>
          <p className="mt-2 text-gray-300">Accédez à votre espace sécurisé</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Adresse email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Mot de passe"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="text-red-400 hover:text-red-300 transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="text-sm">
              <Link to="/signup" className="text-red-400 hover:text-red-300 transition-colors">
                Créer un compte
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
