import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, ShoppingCart, Pencil, Check, X, RotateCcw, Share2 } from 'lucide-react';
import type { GroceryItem } from '../domain/models';

interface GroceriesScreenProps {
  items: GroceryItem[];
  onAdd: (item: Omit<GroceryItem, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<GroceryItem>) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onAddAgain: (selected: GroceryItem[]) => void;
  onPreviewAddAgain: () => Promise<GroceryItem[]>;
}

export default function GroceriesScreen({
  items,
  onAdd,
  onUpdate,
  onDelete,
  onClear,
  onAddAgain,
  onPreviewAddAgain,
}: GroceriesScreenProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editNote, setEditNote] = useState('');
  const [showAddAgain, setShowAddAgain] = useState(false);
  const [addAgainItems, setAddAgainItems] = useState<GroceryItem[]>([]);
  const [selectedAddAgain, setSelectedAddAgain] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!showAddAgain) return;
    const load = async () => {
      const preview = await onPreviewAddAgain();
      setAddAgainItems(preview);
      const next: Record<string, boolean> = {};
      preview.forEach((item) => {
        next[item.id] = true;
      });
      setSelectedAddAgain(next);
    };
    load();
  }, [showAddAgain, onPreviewAddAgain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      quantity: Math.max(1, quantity),
      note: note.trim(),
      completed: false,
    });
    setName('');
    setQuantity(1);
    setNote('');
  };

  const startEdit = (item: GroceryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setEditNote(item.note);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditQuantity(1);
    setEditNote('');
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdate(id, {
      name: editName.trim(),
      quantity: Math.max(1, editQuantity),
      note: editNote.trim(),
    });
    cancelEdit();
  };

  const remaining = items.filter((item) => !item.completed).length;
  const buildShareText = () => {
    const lines = items.map((item) => {
      const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
      const note = item.note ? ` (${item.note})` : '';
      return `- ${item.name}${qty}${note}`;
    });
    return ['Grocery list', ...lines].join('\n');
  };

  const handleShare = async () => {
    const text = buildShareText();
    if (!text.trim()) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Grocery list', text });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert('List copied to clipboard.');
    } catch {
      alert(text);
    }
  };

  return (
    <div className="p-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-gray-900">Groceries</h1>
          <p className="text-gray-500">{remaining} remaining</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddAgain(true)}
            className="h-10 w-10 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center shadow-sm"
            title="Add again"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="h-10 w-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
            title="Share list"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm mb-6 space-y-4">
        <div>
          <label htmlFor="grocery-name" className="block text-gray-700 mb-2">
            Item
          </label>
          <input
            id="grocery-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            placeholder="e.g., Milk"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="grocery-qty" className="block text-gray-700 mb-2">
              Quantity
            </label>
            <input
              id="grocery-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
          </div>
          <div>
            <label htmlFor="grocery-note" className="block text-gray-700 mb-2">
              Note
            </label>
            <input
              id="grocery-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              placeholder="Optional"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </form>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-gray-900">List</h2>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear the entire grocery list?')) {
                onClear();
              }
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No grocery items yet.</div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              layout
              className={`rounded-2xl border p-4 shadow-sm bg-white transition-all ${
                item.completed ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onUpdate(item.id, { completed: !item.completed })}
                  className={`mt-1 h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                    item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                  }`}
                >
                  {item.completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min={1}
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                        />
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                          placeholder="Note"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="flex-1 py-2 rounded-lg bg-emerald-500 text-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`text-gray-900 ${item.completed ? 'line-through' : ''}`}>
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Qty: {item.quantity}
                        {item.note ? ` · ${item.note}` : ''}
                      </div>
                    </>
                  )}
                </div>
                {editingId !== item.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {editingId === item.id && (
                  <button
                    onClick={cancelEdit}
                    className="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showAddAgain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-gray-900">Add again</h2>
                <p className="text-sm text-gray-500">Choose items to restore</p>
              </div>
              <button
                onClick={() => setShowAddAgain(false)}
                className="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto px-5 py-4 space-y-2">
              {addAgainItems.length === 0 ? (
                <div className="text-sm text-gray-500">No previous list found.</div>
              ) : (
                addAgainItems.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-all ${
                      selectedAddAgain[item.id]
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={Boolean(selectedAddAgain[item.id])}
                      onChange={() =>
                        setSelectedAddAgain((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                    />
                    <span
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedAddAgain[item.id]
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {selectedAddAgain[item.id] && (
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      )}
                    </span>
                    <div className="flex-1">
                      <div className="text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        Qty: {item.quantity}
                        {item.note ? ` · ${item.note}` : ''}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
              <button
                onClick={() => setShowAddAgain(false)}
                className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const hasSelection = Object.values(selectedAddAgain).some(Boolean);
                  if (!hasSelection) {
                    alert('Select at least one item.');
                    return;
                  }
                  const selectedItems = addAgainItems.filter(
                    (item) => selectedAddAgain[item.id]
                  );
                  onAddAgain(selectedItems);
                  setShowAddAgain(false);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Add selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
