// src/app/admin/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Question {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  category: string;
  difficulty: string;
  firstLetter?: string;
  usedHistorically?: boolean;
  usedCount?: number;
  createdAt?: string;
}

const CATEGORIES = ['science', 'history', 'geography', 'sports', 'technology', 'culture'];
const CAT_AR: Record<string, string> = { science: 'علوم', history: 'تاريخ', geography: 'جغرافيا', sports: 'رياضة', technology: 'تقنية', culture: 'ثقافة وفنون' };
const DIFF_COLORS: Record<string, string> = { easy: 'text-green-400', medium: 'text-amber-400', hard: 'text-red-400' };

const emptyQuestion = { questionAr: '', questionEn: '', answerAr: '', answerEn: '', category: 'science', difficulty: 'medium', firstLetter: '' };

export default function AdminPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('demo@hexgame.com');
  const [password, setPassword] = useState('demo1234');
  const [loggedIn, setLoggedIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyQuestion);
  const [showForm, setShowForm] = useState(false);
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const login = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setAuthError(data.error); return; }
    setToken(data.token);
    setLoggedIn(true);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    const params = new URLSearchParams({ filter });
    if (categoryFilter) params.append('category', categoryFilter);
    const res = await fetch(`/api/questions?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => { if (loggedIn) fetchQuestions(); }, [loggedIn, filter, categoryFilter]);

  const saveQuestion = async () => {
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/questions/${editingId}` : '/api/questions';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, firstLetter: form.firstLetter || form.answerEn[0]?.toUpperCase() }),
    });
    if (res.ok) {
      setShowForm(false); setEditingId(null); setForm(emptyQuestion);
      fetchQuestions();
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    await fetch(`/api/questions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchQuestions();
  };

  const startEdit = (q: Question) => {
    setForm({ questionAr: q.questionAr, questionEn: q.questionEn, answerAr: q.answerAr, answerEn: q.answerEn, category: q.category, difficulty: q.difficulty, firstLetter: q.firstLetter || '' });
    setEditingId(q.id);
    setShowForm(true);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'questions.json'; a.click();
  };

  const exportCSV = () => {
    const headers = ['questionEn', 'questionAr', 'answerEn', 'answerAr', 'category', 'difficulty', 'firstLetter'];
    const rows = questions.map(q => headers.map(h => `"${(q as any)[h] || ''}"`).join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'questions.csv'; a.click();
  };

  const importJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const qs = Array.isArray(data) ? data : [data];
      let created = 0;
      for (const q of qs) {
        if (!q.questionEn || !q.answerEn) continue;
        const res = await fetch('/api/questions', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(q),
        });
        if (res.ok) created++;
      }
      alert(`Imported ${created} questions`);
      fetchQuestions();
    } catch { setImportError('Invalid JSON file'); }
    if (fileRef.current) fileRef.current.value = '';
  };

  const filtered = questions.filter(q => {
    if (!search) return true;
    const s = search.toLowerCase();
    return q.questionEn.toLowerCase().includes(s) || q.questionAr.includes(search) || q.answerEn.toLowerCase().includes(s);
  });

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-card p-8 rounded-2xl space-y-6">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setLang('ar')} className={`flex-1 py-2 rounded-lg text-sm ${lang === 'ar' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50'}`}>عربي</button>
            <button onClick={() => setLang('en')} className={`flex-1 py-2 rounded-lg text-sm ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50'}`}>English</button>
          </div>
          <h1 className={`text-2xl font-bold text-white ${isAr ? 'font-arabic text-right' : ''}`}>{isAr ? 'لوحة الإدارة' : 'Admin Panel'}</h1>
          <input value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="Email" type="email" />
          <input value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Password" type="password" />
          {authError && <p className="text-red-400 text-sm">{authError}</p>}
          <button onClick={login} className="w-full btn-primary py-3">{isAr ? 'دخول' : 'Login'}</button>
          <p className="text-center text-white/30 text-xs">demo@hexgame.com / demo1234</p>
          <Link href="/" className="block text-center text-white/30 hover:text-white/60 text-sm">← {isAr ? 'الرئيسية' : 'Home'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isAr ? 'rtl font-arabic' : 'ltr'}`} dir={dir}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/40 hover:text-white transition-colors">←</Link>
            <h1 className="text-2xl font-bold text-white">{isAr ? 'إدارة الأسئلة' : 'Question Bank'}</h1>
            <span className="badge bg-white/10 text-white/40">{questions.length} {isAr ? 'سؤال' : 'questions'}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLang(isAr ? 'en' : 'ar')} className="btn-ghost text-sm py-2 px-3">{isAr ? 'EN' : 'عربي'}</button>
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyQuestion); }} className="btn-primary text-sm py-2 px-4">
              + {isAr ? 'إضافة' : 'Add'}
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="glass-card p-4 rounded-2xl mb-6 flex flex-wrap gap-4 items-center">
          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'unused', 'used'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                {f === 'all' ? (isAr ? 'الكل' : 'All') : f === 'used' ? (isAr ? 'مستخدمة' : 'Used') : (isAr ? 'غير مستخدمة' : 'Unused')}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none">
            <option value="">{isAr ? 'كل الفئات' : 'All Categories'}</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{isAr ? CAT_AR[c] : c}</option>)}
          </select>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isAr ? 'بحث...' : 'Search...'}
            className="flex-1 min-w-48 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />

          {/* Import/Export */}
          <div className="flex gap-2">
            <button onClick={exportJSON} className="btn-ghost text-xs py-1.5 px-3">JSON ↓</button>
            <button onClick={exportCSV} className="btn-ghost text-xs py-1.5 px-3">CSV ↓</button>
            <label className="btn-ghost text-xs py-1.5 px-3 cursor-pointer">
              {isAr ? 'استيراد' : 'Import'}
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importJSON} />
            </label>
          </div>
        </div>

        {/* Questions table */}
        {loading ? (
          <div className="text-center py-16 text-white/30">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(q => (
              <div key={q.id} className={`glass-card p-4 rounded-xl flex items-start gap-4 group hover:border-white/20 transition-all ${q.usedHistorically ? 'border-amber-500/20' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-medium ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                    <span className="badge bg-white/10 text-white/50">{isAr ? CAT_AR[q.category] : q.category}</span>
                    {q.firstLetter && <span className="badge bg-blue-500/20 text-blue-300 border-blue-500/30">{q.firstLetter}</span>}
                    {q.usedHistorically && (
                      <span className="badge-used">
                        ✓ {isAr ? `استُخدم ${q.usedCount} مرة` : `Used ${q.usedCount}x`}
                      </span>
                    )}
                    {!q.usedHistorically && <span className="badge-unused">{isAr ? 'جديد' : 'Fresh'}</span>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/80 text-sm font-arabic text-right">{q.questionAr}</p>
                      <p className="text-green-300 text-xs font-arabic text-right mt-1">→ {q.answerAr}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm ltr text-left">{q.questionEn}</p>
                      <p className="text-green-400/70 text-xs ltr text-left mt-1">→ {q.answerEn}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => startEdit(q)} className="text-white/40 hover:text-white transition-colors p-1">✏️</button>
                  <button onClick={() => deleteQuestion(q.id)} className="text-white/40 hover:text-red-400 transition-colors p-1">🗑️</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-white/20">
                {isAr ? 'لا توجد أسئلة' : 'No questions found'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className={`glass-card p-6 rounded-2xl w-full max-w-2xl max-h-screen overflow-y-auto ${isAr ? 'rtl font-arabic' : 'ltr'}`} dir={dir} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">{editingId ? (isAr ? 'تعديل السؤال' : 'Edit Question') : (isAr ? 'إضافة سؤال جديد' : 'Add New Question')}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/50 mb-1 block">{isAr ? 'السؤال (عربي)' : 'Question (Arabic)'}</label>
                <textarea value={form.questionAr} onChange={e => setForm(p => ({...p, questionAr: e.target.value}))}
                  className="input-field font-arabic text-right resize-none h-20" placeholder="أدخل السؤال بالعربية" />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1 block">{isAr ? 'السؤال (إنجليزي)' : 'Question (English)'}</label>
                <textarea value={form.questionEn} onChange={e => setForm(p => ({...p, questionEn: e.target.value}))}
                  className="input-field ltr resize-none h-20" placeholder="Enter question in English" />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1 block">{isAr ? 'الإجابة (عربية)' : 'Answer (Arabic)'}</label>
                <input value={form.answerAr} onChange={e => setForm(p => ({...p, answerAr: e.target.value}))}
                  className="input-field font-arabic text-right" placeholder="الإجابة" />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1 block">{isAr ? 'الإجابة (إنجليزية)' : 'Answer (English)'}</label>
                <input value={form.answerEn} onChange={e => setForm(p => ({...p, answerEn: e.target.value, firstLetter: e.target.value[0]?.toUpperCase() || ''}))}
                  className="input-field ltr" placeholder="Answer" />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1 block">{isAr ? 'الفئة' : 'Category'}</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
                  className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{isAr ? CAT_AR[c] : c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1 block">{isAr ? 'الصعوبة' : 'Difficulty'}</label>
                <select value={form.difficulty} onChange={e => setForm(p => ({...p, difficulty: e.target.value}))}
                  className="input-field">
                  <option value="easy">{isAr ? 'سهل' : 'Easy'}</option>
                  <option value="medium">{isAr ? 'متوسط' : 'Medium'}</option>
                  <option value="hard">{isAr ? 'صعب' : 'Hard'}</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1 block">{isAr ? 'الحرف الأول (اختياري)' : 'First Letter (optional)'}</label>
                <input value={form.firstLetter} onChange={e => setForm(p => ({...p, firstLetter: e.target.value.toUpperCase()}))}
                  className="input-field" placeholder="A" maxLength={1} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 btn-ghost">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={saveQuestion} className="flex-1 btn-primary" disabled={!form.questionAr || !form.questionEn || !form.answerAr || !form.answerEn}>
                {isAr ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
