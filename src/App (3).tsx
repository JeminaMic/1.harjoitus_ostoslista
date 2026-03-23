/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ShoppingBasket, 
  ChevronDown, 
  ChevronUp,
  X,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Category = 'Hevi' | 'Maito & Munat' | 'Liha & Kala' | 'Kuiva-aineet' | 'Pakasteet' | 'Koti & Pesu' | 'Muut';

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: Category;
  completed: boolean;
  createdAt: number;
}

const CATEGORIES: Category[] = [
  'Hevi',
  'Maito & Munat',
  'Liha & Kala',
  'Kuiva-aineet',
  'Pakasteet',
  'Koti & Pesu',
  'Muut'
];

const CATEGORY_COLORS: Record<Category, string> = {
  'Hevi': 'bg-green-100 text-green-700 border-green-200',
  'Maito & Munat': 'bg-blue-100 text-blue-700 border-blue-200',
  'Liha & Kala': 'bg-red-100 text-red-700 border-red-200',
  'Kuiva-aineet': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Pakasteet': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Koti & Pesu': 'bg-purple-100 text-purple-700 border-purple-200',
  'Muut': 'bg-gray-100 text-gray-700 border-gray-200'
};

// --- Main Component ---

export default function App() {
  const [items, setItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('grocery-list-items');
    return saved ? JSON.parse(saved) : [];
  });

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Category>('Hevi');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('grocery-list-items', JSON.stringify(items));
  }, [items]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter(i => i.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  }, [items]);

  // Grouping
  const groupedItems = useMemo(() => {
    const groups: Record<Category, GroceryItem[]> = {} as any;
    CATEGORIES.forEach(cat => {
      groups[cat] = items.filter(item => item.category === cat)
        .sort((a, b) => a.createdAt - b.createdAt);
    });
    return groups;
  }, [items]);

  // Actions
  const addItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      quantity: newItemQty.trim(),
      category: newItemCategory,
      completed: false,
      createdAt: Date.now()
    };

    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemQty('');
    // Keep category for next item as it's often the same aisle
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    if (confirm('Poistetaanko kaikki kerätyt tuotteet?')) {
      setItems(prev => prev.filter(item => !item.completed));
    }
  };

  const currentWeek = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">
                <Calendar size={14} />
                <span>Viikko {currentWeek}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Ostoslista</h1>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-gray-400">
                <span className="text-[#1A1A1A] font-semibold">{stats.completed}</span>
                <span className="mx-1">/</span>
                <span>{stats.total}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-black"
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        {/* Add Item Trigger (Mobile friendly) */}
        {!isFormOpen && (
          <motion.button
            layoutId="add-form"
            onClick={() => setIsFormOpen(true)}
            className="w-full bg-white border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors mb-8"
            id="add-item-trigger"
          >
            <Plus size={20} />
            <span className="font-medium">Lisää tuote...</span>
          </motion.button>
        )}

        {/* Add Item Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              layoutId="add-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
              id="add-item-form-container"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Uusi tuote</h2>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  id="close-form-btn"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={addItem} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Tuote</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Esim. Maitoa"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black outline-none transition-all"
                      id="item-name-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Määrä</label>
                    <input
                      type="text"
                      placeholder="2 kpl"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-lg p-3 focus:ring-2 focus:ring-black outline-none transition-all"
                      id="item-qty-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Kategoria</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewItemCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          newItemCategory === cat 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                        }`}
                        id={`cat-btn-${cat}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="w-full bg-black text-white rounded-xl py-4 font-bold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all mt-4 shadow-lg shadow-black/10"
                  id="submit-item-btn"
                >
                  Lisää listalle
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List Content */}
        <div className="space-y-8">
          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200" id="empty-state">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBasket className="text-gray-300" size={32} />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Lista on tyhjä</h3>
              <p className="text-gray-400 text-sm">Aloita lisäämällä ensimmäinen tuote.</p>
            </div>
          ) : (
            CATEGORIES.map(cat => {
              const catItems = groupedItems[cat];
              if (catItems.length === 0) return null;

              return (
                <section key={cat} className="space-y-3" id={`section-${cat}`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat].split(' ')[0]}`} />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">{cat}</h2>
                    <span className="text-[10px] font-bold text-gray-300 ml-auto">{catItems.length}</span>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <AnimatePresence initial={false}>
                      {catItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`group flex items-center gap-4 p-4 border-b border-gray-50 last:border-none transition-colors ${
                            item.completed ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'
                          }`}
                          id={`item-${item.id}`}
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`flex-shrink-0 transition-all duration-300 ${
                              item.completed ? 'text-green-500 scale-110' : 'text-gray-300 hover:text-gray-400'
                            }`}
                            id={`toggle-${item.id}`}
                          >
                            {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                          </button>

                          <div className="flex-grow min-w-0">
                            <div className={`font-medium truncate transition-all duration-300 ${
                              item.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                            }`}>
                              {item.name}
                            </div>
                            {item.quantity && (
                              <div className={`text-xs transition-all duration-300 ${
                                item.completed ? 'text-gray-300' : 'text-gray-500'
                              }`}>
                                {item.quantity}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => deleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            id={`delete-${item.id}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {stats.completed > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex justify-center"
          >
            <button
              onClick={clearCompleted}
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2"
              id="clear-completed-btn"
            >
              <Trash2 size={14} />
              Tyhjennä kerätyt
            </button>
          </motion.div>
        )}
      </main>

      {/* Floating Summary (Mobile) */}
      {stats.total > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-20 pointer-events-none">
          <div className="bg-black text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Edistyminen</div>
                <div className="text-sm font-bold">{stats.completed} / {stats.total} tuotetta kerätty</div>
              </div>
            </div>
            <div className="text-xl font-black">{stats.percentage}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
