// src/app/host/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GameSettings, BoardSize, Language, Difficulty } from '@/types';
import { useGameStore } from '@/store/gameStore';

const CATEGORIES = ['science', 'history', 'geography', 'sports', 'technology', 'culture'];
const CAT_LABELS_AR: Record<string, string> = {
  science: 'علوم', history: 'تاريخ', geography: 'جغرافيا',
  sports: 'رياضة', technology: 'تقنية', culture: 'ثقافة وفنون',
};
const CAT_LABELS_EN: Record<string, string> = {
  science: 'Science', history: 'History', geography: 'Geography',
  sports: 'Sports', technology: 'Technology', culture: 'Culture & Arts',
};

export default function HostPage() {
  const router = useRouter();
  const store = useGameStore();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [loading, setLoading] = useState(false);
  const [hostEmail, setHostEmail] = useState('demo@hexgame.com');
  const [hostPassword, setHostPassword] = useState('demo1234');
  const [loggedIn, setLoggedIn] = useState(false);
  const [hostData, setHostData] = useState<{ id: string; name: string } | null>(null);
  const [authError, setAuthError] = useState('');

  const [settings, setSettings] = useState<GameSettings>({
    boardSize: 'medium',
    language: 'AR',
    categories: [],
    difficulty: 'all',
    timerSeconds: 30,
    buzzMode: true,
    showLetterHint: true,
    showQuestionToAll: true,
    soundEnabled: true,
  });

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const handleLogin = async () => {
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: hostEmail, password: hostPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || 'Login failed'); return; }
      setHostData({ id: data.hostId, name: data.name });
      store.setHostId(data.hostId);
      store.setIsHost(true);
      setLoggedIn(true);
    } catch {
      setAuthError('Connection error');
    }
  };

  const toggleCategory = (cat: string) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const createRoom = async () => {
    if (!hostData) return;
    setLoading(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: hostData.id, settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      store.setRoomCode(data.roomCode);
      store.setSettings(settings);
      store.setLanguage(settings.language as Language);
      router.push(`/game/${data.roomCode}?role=host&hostId=${hostData.id}`);
    } catch (e) {
      alert('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isAr ? 'rtl font-arabic' : 'ltr'}`} dir={dir}>
        <div className="max-w-md w-full glass-card p-8 rounded-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {isAr ? 'دخول المضيف' : 'Host Login'}
            </h1>
            <p className="text-white/40 text-sm">{isAr ? 'ادخل بيانات حسابك لإنشاء غرفة' : 'Sign in to create a game room'}</p>
          </div>
          
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            <button onClick={() => setLang('ar')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'ar' ? 'bg-blue-600 text-white' : 'text-white/50'}`}>عربي</button>
            <button onClick={() => setLang('en')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-white/50'}`}>English</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
              <input value={hostEmail} onChange={e => setHostEmail(e.target.value)} className="input-field" type="email" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">{isAr ? 'كلمة المرور' : 'Password'}</label>
              <input value={hostPassword} onChange={e => setHostPassword(e.target.value)} className="input-field" type="password" />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button onClick={handleLogin} className="w-full btn-primary py-4 text-lg">
              {isAr ? 'دخول' : 'Sign In'}
            </button>
            <p className="text-center text-white/30 text-xs">{isAr ? 'تجريبي: demo@hexgame.com / demo1234' : 'Demo: demo@hexgame.com / demo1234'}</p>
          </div>

          <div className="text-center">
            <Link href="/" className="text-white/40 hover:text-white/60 text-sm">← {isAr ? 'رجوع' : 'Back to home'}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isAr ? 'rtl font-arabic' : 'ltr'}`} dir={dir}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{isAr ? 'إعداد الغرفة' : 'Room Setup'}</h1>
            <p className="text-white/40">{isAr ? `مرحباً، ${hostData?.name}` : `Hello, ${hostData?.name}`}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLang(isAr ? 'en' : 'ar')} className="btn-ghost text-sm py-2 px-4">
              {isAr ? 'EN' : 'عربي'}
            </button>
            <Link href="/admin" className="btn-ghost text-sm py-2 px-4">
              {isAr ? 'الإدارة' : 'Admin'}
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Board Size */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-semibold text-white/70 mb-4">{isAr ? 'حجم اللوحة' : 'Board Size'}</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['small', 'medium', 'large'] as BoardSize[]).map(s => (
                <button key={s} onClick={() => setSettings(p => ({...p, boardSize: s}))}
                  className={`py-3 rounded-xl font-medium transition-all ${settings.boardSize === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                  {isAr ? {small: 'صغير', medium: 'متوسط', large: 'كبير'}[s] : {small: '7×7', medium: '9×9', large: '11×11'}[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-semibold text-white/70 mb-4">{isAr ? 'لغة اللعبة' : 'Game Language'}</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['AR', 'EN', 'BOTH'] as Language[]).map(l => (
                <button key={l} onClick={() => setSettings(p => ({...p, language: l}))}
                  className={`py-3 rounded-xl font-medium transition-all ${settings.language === l ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                  {l === 'AR' ? 'عربي' : l === 'EN' ? 'English' : 'كلاهما / Both'}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-semibold text-white/70 mb-4">{isAr ? 'الفئات (اتركها فارغة للكل)' : 'Categories (leave empty for all)'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${settings.categories.includes(cat) ? 'bg-amber-500/30 border border-amber-500/50 text-amber-300' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                  {isAr ? CAT_LABELS_AR[cat] : CAT_LABELS_EN[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Timer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-semibold text-white/70 mb-4">{isAr ? 'الصعوبة' : 'Difficulty'}</h3>
              <div className="space-y-2">
                {(['all', 'easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button key={d} onClick={() => setSettings(p => ({...p, difficulty: d}))}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${settings.difficulty === d ? 'bg-green-600/50 text-green-300 border border-green-500/50' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                    {isAr ? {all: 'الكل', easy: 'سهل', medium: 'متوسط', hard: 'صعب'}[d] : d}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="font-semibold text-white/70 mb-3">{isAr ? 'المؤقت' : 'Timer'}</h3>
                <div className="flex items-center gap-3">
                  <input type="range" min="10" max="120" step="5" value={settings.timerSeconds}
                    onChange={e => setSettings(p => ({...p, timerSeconds: parseInt(e.target.value)}))}
                    className="flex-1 accent-blue-500" />
                  <span className="text-blue-400 font-bold min-w-[3rem] text-center">{settings.timerSeconds}s</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white/70 mb-3">{isAr ? 'وضع اللعب' : 'Game Mode'}</h3>
                <div className="space-y-2">
                  <button onClick={() => setSettings(p => ({...p, buzzMode: true}))}
                    className={`w-full py-2 rounded-lg text-sm transition-all ${settings.buzzMode ? 'bg-blue-600/50 text-blue-300 border border-blue-500/50' : 'bg-white/5 text-white/60'}`}>
                    {isAr ? '⚡ وضع الاستجابة السريعة' : '⚡ Buzz Mode'}
                  </button>
                  <button onClick={() => setSettings(p => ({...p, buzzMode: false}))}
                    className={`w-full py-2 rounded-lg text-sm transition-all ${!settings.buzzMode ? 'bg-blue-600/50 text-blue-300 border border-blue-500/50' : 'bg-white/5 text-white/60'}`}>
                    {isAr ? '🔄 وضع الأدوار' : '🔄 Turn Mode'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-semibold text-white/70 mb-4">{isAr ? 'خيارات إضافية' : 'Options'}</h3>
            <div className="space-y-3">
              {[
                { key: 'showLetterHint', ar: 'إظهار تلميح الحرف الأول', en: 'Show first letter hint' },
                { key: 'showQuestionToAll', ar: 'إظهار السؤال لجميع اللاعبين', en: 'Show question to all players' },
                { key: 'soundEnabled', ar: 'تأثيرات صوتية', en: 'Sound effects' },
              ].map(({ key, ar, en }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-white/70">{isAr ? ar : en}</span>
                  <div onClick={() => setSettings(p => ({...p, [key]: !p[key as keyof GameSettings]}))}
                    className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${(settings as any)[key] ? 'bg-blue-600' : 'bg-white/20'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${(settings as any)[key] ? 'left-7' : 'left-1'}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Create button */}
          <button onClick={createRoom} disabled={loading}
            className="w-full btn-primary py-5 text-xl rounded-2xl disabled:opacity-50">
            {loading ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? '🚀 إنشاء الغرفة' : '🚀 Create Room')}
          </button>
        </div>
      </div>
    </div>
  );
}
