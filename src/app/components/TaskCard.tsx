import { useState } from 'react';
import { motion } from 'motion/react';
import { Sofa, ChefHat, Bed, Bath, TreePine, Pencil, Trash, Check, X } from 'lucide-react';
import type { User, Task, Category } from '../App';

interface TaskCardProps {
  task: Task;
  category?: Category;
  currentUser: User;
  householdUsers: User[];
  onToggleTask: (taskId: string, userId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const CATEGORY_ICONS = {
  Sofa,
  ChefHat,
  Bed,
  Bath,
  TreePine,
};

export default function TaskCard({
  task,
  category,
  currentUser,
  householdUsers,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const IconComponent = category ? CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS] : null;

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdateTask(task.id, { title: editTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {category && IconComponent && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: category.color }}
          >
            <IconComponent className="w-5 h-5 text-gray-700" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <button
                onClick={handleSaveEdit}
                className="w-9 h-9 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-gray-900 mb-1">{task.title}</h3>
              {category && (
                <p className="text-gray-500">{category.name}</p>
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* User Checkboxes */}
      {!isEditing && (
        <div className="flex gap-2 flex-wrap">
          {householdUsers.map((user) => {
            const isCompleted = task.completedBy.includes(user.id);
            const isCurrentUser = user.id === currentUser.id;

            return (
              <motion.button
                key={user.id}
                onClick={() => {
                  if (isCurrentUser) {
                    onToggleTask(task.id, user.id);
                  }
                }}
                disabled={!isCurrentUser}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-gray-50 border-2 border-gray-200'
                } ${isCurrentUser ? 'ring-2 ring-offset-1 ring-blue-400' : 'opacity-60 cursor-not-allowed'}`}
                style={{
                  borderColor: isCompleted ? user.color : undefined,
                  backgroundColor: isCompleted ? user.color + '15' : undefined,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'border-transparent'
                      : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: isCompleted ? user.color : 'transparent',
                  }}
                >
                  {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span className={`${isCompleted ? 'text-gray-900' : 'text-gray-600'}`}>
                  {user.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
