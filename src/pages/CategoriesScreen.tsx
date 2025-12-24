import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Sofa, ChefHat, Bed, Bath, TreePine, Pencil, Trash, Check, X, ChevronDown } from 'lucide-react';
import type { Category, Task, UserProfile } from '../domain/models';
import TaskCard from '../ui/TaskCard';

interface CategoriesScreenProps {
  categories: Category[];
  tasks: Task[];
  householdUsers: UserProfile[];
  currentUser: UserProfile;
  isTaskCompleted: (task: Task, userId: string) => boolean;
  onToggleTask: (taskId: string, userId: string) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const CATEGORY_ICONS = {
  Sofa,
  ChefHat,
  Bed,
  Bath,
  TreePine,
};

const ICON_OPTIONS = [
  { name: 'Sofa', label: 'Living Room' },
  { name: 'ChefHat', label: 'Kitchen' },
  { name: 'Bed', label: 'Bedroom' },
  { name: 'Bath', label: 'Bathroom' },
  { name: 'TreePine', label: 'Outdoor' },
];

const COLOR_OPTIONS = [
  '#E3F2FD', '#FFF3E0', '#F3E5F5', '#E0F2F1', '#E8F5E9',
  '#FCE4EC', '#FFF9C4', '#E0E0E0', '#FFEBEE', '#E8EAF6',
];

export default function CategoriesScreen({
  categories,
  tasks,
  householdUsers,
  currentUser,
  isTaskCompleted,
  onToggleTask,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onDeleteTask,
}: CategoriesScreenProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Sofa');
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_OPTIONS[0]);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory({
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        color: newCategoryColor,
      });
      setNewCategoryName('');
      setNewCategoryIcon('Sofa');
      setNewCategoryColor(COLOR_OPTIONS[0]);
      setShowAddCategory(false);
    }
  };

  const handleUpdateCategory = (categoryId: string, name: string, icon: string, color: string) => {
    if (name.trim()) {
      onUpdateCategory(categoryId, { name: name.trim(), icon, color });
      setEditingCategory(null);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="p-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-gray-900">Categories</h1>
        <button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showAddCategory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl p-4 mb-4 border-2 border-blue-200"
        >
          <h3 className="text-gray-900 mb-3">New Category</h3>
          
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            className="w-full px-4 py-2 border border-gray-200 rounded-xl mb-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />

          <div className="mb-3">
            <label className="block text-gray-700 mb-2">Icon</label>
            <div className="flex gap-2">
              {ICON_OPTIONS.map((option) => {
                const IconComponent = CATEGORY_ICONS[option.name as keyof typeof CATEGORY_ICONS];
                return (
                  <button
                    key={option.name}
                    onClick={() => setNewCategoryIcon(option.name)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      newCategoryIcon === option.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewCategoryColor(color)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    newCategoryColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowAddCategory(false);
                setNewCategoryName('');
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((category) => {
          const categoryTasks = tasks.filter((task) => task.categoryId === category.id);
          const isExpanded = expandedCategory === category.id;
          const isEditing = editingCategory === category.id;
          const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS];

          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Category Header */}
              <div className="p-4">
                {isEditing ? (
                  <CategoryEditForm
                    category={category}
                    onSave={handleUpdateCategory}
                    onCancel={() => setEditingCategory(null)}
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      {IconComponent && <IconComponent className="w-6 h-6 text-gray-700" />}
                    </div>
                    
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex-1 flex items-center justify-between"
                    >
                      <div className="text-left">
                        <h3 className="text-gray-900">{category.name}</h3>
                        <p className="text-gray-500">
                          {categoryTasks.length} {categoryTasks.length === 1 ? 'task' : 'tasks'}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => setEditingCategory(category.id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${category.name}" and all its tasks?`)) {
                          onDeleteCategory(category.id);
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tasks */}
              {isExpanded && !isEditing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 pb-4 space-y-3"
                >
                  {categoryTasks.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No tasks in this category</p>
                  ) : (
                    categoryTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        category={category}
                        currentUser={currentUser}
                        householdUsers={householdUsers}
                        isTaskCompleted={isTaskCompleted}
                        onToggleTask={onToggleTask}
                        onUpdateTask={() => {}}
                        onDeleteTask={onDeleteTask}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CategoryEditFormProps {
  category: Category;
  onSave: (categoryId: string, name: string, icon: string, color: string) => void;
  onCancel: () => void;
}

function CategoryEditForm({ category, onSave, onCancel }: CategoryEditFormProps) {
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon);
  const [color, setColor] = useState(category.color);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
        autoFocus
      />

      <div className="flex gap-2">
        {ICON_OPTIONS.map((option) => {
          const IconComponent = CATEGORY_ICONS[option.name as keyof typeof CATEGORY_ICONS];
          return (
            <button
              key={option.name}
              onClick={() => setIcon(option.name)}
              className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                icon === option.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <IconComponent className="w-4 h-4 mx-auto" />
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-lg transition-all ${
              color === c ? 'ring-2 ring-blue-500 ring-offset-1' : ''
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
        >
          <X className="w-4 h-4 inline mr-1" />
          Cancel
        </button>
        <button
          onClick={() => onSave(category.id, name, icon, color)}
          disabled={!name.trim()}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50"
        >
          <Check className="w-4 h-4 inline mr-1" />
          Save
        </button>
      </div>
    </div>
  );
}
