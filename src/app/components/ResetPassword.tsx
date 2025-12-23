import { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound } from 'lucide-react';

interface ResetPasswordProps {
  onReset: (newPassword: string) => void;
  onBack: () => void;
}

export default function ResetPassword({ onReset, onBack }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert('Password should be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      alert('Passwords do not match.');
      return;
    }
    onReset(password);
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
              <KeyRound className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Create a new password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="new-password" className="block text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Update Password
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
