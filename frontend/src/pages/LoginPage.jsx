import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowLeft, UserCheck } from 'lucide-react';
import { loginUser, clearAuthError } from '../store/authSlice.js';
import BigButton from '../components/common/BigButton.jsx';
import { getTranslation } from '../utils/i18n.js';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const { isLoading, error } = useSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    const res = await dispatch(loginUser({ identifier: identifier.trim(), password }));
    if (res.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  const handleDemoLogin = async () => {
    // Quick Demo account for 1-click test
    const res = await dispatch(loginUser({ identifier: 'demo@bolkhata.com', password: 'password123' }));
    if (res.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          type="button"
          className="p-2 rounded-2xl bg-white border border-warm-300 text-slate-700 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black text-slate-900">
          {getTranslation(language, 'login')}
        </h2>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">
            {getTranslation(language, 'phoneOrEmail')}:
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. 9876543210"
            required
            className="w-full p-3.5 rounded-2xl bg-white border border-warm-300 text-base font-semibold text-slate-900 focus:outline-none focus:border-brand-500 shadow-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">
            {getTranslation(language, 'password')}:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full p-3.5 rounded-2xl bg-white border border-warm-300 text-base font-semibold text-slate-900 focus:outline-none focus:border-brand-500 shadow-sm"
          />
        </div>

        <div className="pt-2">
          <BigButton
            type="submit"
            disabled={isLoading || !identifier || !password}
            variant="primary"
            icon={LogIn}
            size="xl"
            className="w-full"
          >
            {isLoading ? 'Checking...' : getTranslation(language, 'login')}
          </BigButton>
        </div>
      </form>

      {/* Demo Account 1-Tap Login */}
      <div className="pt-2">
        <button
          onClick={handleDemoLogin}
          type="button"
          className="w-full py-3 px-4 rounded-2xl bg-warm-200 hover:bg-warm-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <UserCheck size={16} />
          <span>Quick Demo Login (1-Tap Test)</span>
        </button>
      </div>

      <div className="text-center pt-3">
        <Link
          to="/register"
          className="text-sm font-bold text-brand-700 hover:underline"
        >
          {getTranslation(language, 'newToApp')}
        </Link>
      </div>
    </div>
  );
}

