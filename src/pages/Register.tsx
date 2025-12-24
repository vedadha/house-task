import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import type { UserProfile } from '../domain/models';

interface RegisterProps {
  onRegister: (user: UserProfile & { password: string }) => void;
  onBack: () => void;
}

const AVATAR_OPTIONS = [
  '👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👶',
  '🧒', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '🧔'
];

const COLOR_OPTIONS = [
  '#FF6B9D', '#4A90E2', '#FFC107', '#9C27B0', '#4CAF50',
  '#FF5722', '#00BCD4', '#FF9800', '#E91E63', '#3F51B5',
];

export default function Register({ onRegister, onBack }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const handleSubmit = () => {
    if (name && email && password) {
      const newUser: UserProfile & { password: string } = {
        id: Date.now().toString(),
        name,
        email,
        avatar: selectedAvatar,
        color: selectedColor,
        password, // Include password for API call
      };
      onRegister(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
              <CheckCircle className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">
              {step === 1 ? 'Enter your details' : 'Choose your avatar'}
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div
              className={`flex-1 h-1 rounded-full transition-all ${
                step >= 1 ? 'bg-indigo-500' : 'bg-gray-200'
              }`}
            />
            <div
              className={`flex-1 h-1 rounded-full transition-all ${
                step >= 2 ? 'bg-indigo-500' : 'bg-gray-200'
              }`}
            />
          </div>

          {/* Step 1: Account Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name || !email || !password}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Avatar Selection */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-gray-700 mb-3">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                        selectedAvatar === avatar
                          ? 'bg-indigo-100 border-2 border-indigo-500 scale-110'
                          : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-3">
                  Choose Color
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`aspect-square rounded-full transition-all ${
                        selectedColor === color
                          ? 'scale-125 ring-2 ring-offset-2'
                          : 'hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: color,
                        ringColor: color,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: selectedColor + '20' }}
                >
                  {selectedAvatar}
                </div>
                <div>
                  <div className="text-gray-900">{name}</div>
                  <div className="text-gray-500">{email}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6">
            <button
              onClick={onBack}
              className="text-indigo-600 hover:text-indigo-700"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
