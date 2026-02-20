// src/app/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const router = useRouter();

  const isAr = lang === 'ar';

  const handleJoin = () => {
    if (!joinCode.trim() || !nickname.trim()) return;
    router.push(`/join/${joinCode.toUpperCase()}?nickname=${encodeURIComponent(nickname)}`);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isAr ? 'rtl font-arabic' : 'ltr'}`}>
      {/* Background hexagon pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hex" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,1 19,5.5 19,14.5 10,19 1,14.5 1,5.5" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#hex)"/>
        </svg>
      </div>

      {/* Language switcher */}
      <div className="absolute top-6 right-6 flex gap-2">
        <button onClick={() => setLang('ar')} className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${lang === 'ar' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
          عربي
        </button>
        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
          EN
        </button>
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4 relative">
            <svg viewBox="0 0 100 115" className="w-24 h-24">
              <polygon points="50,5 95,28.75 95,86.25 50,110 5,86.25 5,28.75" fill="url(#logoGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6"/>
                  <stop offset="50%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#EF4444"/>
                </linearGradient>
              </defs>
              <text x="50" y="68" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="Cairo">؟</text>
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent mb-2">
            {isAr ? 'هيكس الألغاز' : 'HexQuiz'}
          </h1>
          <p className="text-white/50 text-lg">
            {isAr ? 'لعبة الأسئلة التنافسية على شبكة الأضلاع السداسية' : 'Competitive trivia on a hex grid'}
          </p>
        </div>

        {/* Main actions */}
        <div className="space-y-4">
          {!showJoin ? (
            <>
              <button
                onClick={() => setShowJoin(true)}
                className="w-full btn-primary text-lg py-4 rounded-2xl"
              >
                {isAr ? '🎮 الانضمام للعبة' : '🎮 Join a Game'}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/host" className="btn-ghost text-center py-4 rounded-2xl block">
                  {isAr ? '🏠 إنشاء غرفة' : '🏠 Host Game'}
                </Link>
                <Link href="/admin" className="btn-ghost text-center py-4 rounded-2xl block">
                  {isAr ? '⚙️ الإدارة' : '⚙️ Admin'}
                </Link>
              </div>

              <div className="mt-8 p-4 glass-card rounded-2xl text-left">
                <h3 className={`font-semibold mb-3 text-white/70 ${isAr ? 'text-right' : ''}`}>
                  {isAr ? 'كيف تلعب؟' : 'How to play?'}
                </h3>
                <div className={`space-y-2 text-sm text-white/50 ${isAr ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 flex-row-reverse justify-end">
                    <span className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center text-xs text-blue-400 font-bold flex-shrink-0">ز</span>
                    <span>{isAr ? 'الفريق الأزرق يصل عمودياً' : 'Blue team connects vertically'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse justify-end">
                    <span className="w-6 h-6 rounded-full bg-red-600/30 flex items-center justify-center text-xs text-red-400 font-bold flex-shrink-0">ح</span>
                    <span>{isAr ? 'الفريق الأحمر يصل أفقياً' : 'Red team connects horizontally'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse justify-end">
                    <span className="w-6 h-6 rounded-full bg-amber-600/30 flex items-center justify-center text-xs text-amber-400 font-bold flex-shrink-0">س</span>
                    <span>{isAr ? 'أجب بشكل صحيح لتملك الخلية' : 'Answer correctly to capture the cell'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-6 rounded-2xl space-y-4 animate-slide-up">
              <h2 className="text-xl font-bold mb-4">{isAr ? 'انضمام للعبة' : 'Join Game'}</h2>
              
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={isAr ? 'اسمك في اللعبة' : 'Your nickname'}
                className="input-field text-center text-lg"
                autoFocus
              />

              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={isAr ? 'رمز الغرفة (6 أحرف)' : 'Room code (6 chars)'}
                className="input-field text-center text-lg tracking-widest font-mono uppercase"
                maxLength={6}
              />

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowJoin(false)} className="btn-ghost">
                  {isAr ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={handleJoin}
                  disabled={!joinCode.trim() || !nickname.trim()}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAr ? 'انضمام' : 'Join'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-white/20 text-sm">
          {isAr ? 'مصمم للتلفاز والجوال' : 'Designed for TV & Mobile'}
        </p>
      </div>
    </div>
  );
}
