import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Users } from 'lucide-react';
import type { RecentUser } from '../domain/models';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onShowRegister: () => void;
  onRequestPasswordReset: (email: string) => void;
  recentUsers: RecentUser[];
}

export default function Login({
  onLogin,
  onShowRegister,
  onRequestPasswordReset,
  recentUsers,
}: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
              <CheckCircle className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to manage your household tasks</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="text-center mb-6">
            <button
              onClick={() => {
                const targetEmail = email || prompt('Enter your email for password reset');
                if (targetEmail) {
                  onRequestPasswordReset(targetEmail);
                }
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </button>
          </div>

          {recentUsers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-3">
                <Users className="w-4 h-4" />
                <p>Recent accounts</p>
              </div>
              <div className="space-y-2">
                {recentUsers.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => setEmail(user.email)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: user.color + '20' }}
                    >
                      {user.avatar}
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-gray-900">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={onShowRegister}
              className="text-blue-600 hover:text-blue-700"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
