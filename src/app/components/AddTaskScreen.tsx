import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sofa, ChefHat, Bed, Bath, TreePine, Clock, Calendar } from 'lucide-react';
import type { Task, Category } from '../App';

interface AddTaskScreenProps {
  categories: Category[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onBack: () => void;
}

const CATEGORY_ICONS = {
  Sofa,
  ChefHat,
  Bed,
  Bath,
  TreePine,
};

export default function AddTaskScreen({
  categories,
  onAddTask,
  onBack,
}: AddTaskScreenProps) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && categoryId) {
      onAddTask({
        title: title.trim(),
        categoryId,
        frequency,
        completedBy: [],
        rating: 1,
      });
      setTitle('');
      setCategoryId(categories[0]?.id || '');
      setFrequency('daily');
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-gray-900">Add New Task</h1>
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <label htmlFor="title" className="block text-gray-700 mb-3">
              Task Name
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-lg"
              placeholder="e.g., Clean the kitchen"
              autoFocus
              required
            />
          </div>

          {/* Category Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <label className="block text-gray-700 mb-3">Category</label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => {
                const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS];
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(category.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      categoryId === category.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      {IconComponent && <IconComponent className="w-5 h-5 text-gray-700" />}
                    </div>
                    <span className="text-gray-900">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <label className="block text-gray-700 mb-3">Frequency</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  frequency === 'daily'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Daily</span>
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  frequency === 'weekly'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Weekly</span>
              </button>
            </div>
          </div>

          {/* Preview */}
          {title && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white"
            >
              <p className="text-blue-100 mb-2">Preview</p>
              <div className="flex items-center gap-3">
                {categoryId && (() => {
                  const category = categories.find((c) => c.id === categoryId);
                  const IconComponent = category ? CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS] : null;
                  return (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                    </div>
                  );
                })()}
                <div>
                  <p className="text-xl font-semibold">{title}</p>
                  <p className="text-blue-100">
                    {categories.find((c) => c.id === categoryId)?.name} • {frequency === 'daily' ? 'Daily' : 'Weekly'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title.trim() || !categoryId}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Task
          </button>
        </form>
      </motion.div>
    </div>
  );
}
