// src/app/game/[code]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { useSocket } from '@/hooks/useSocket';
import HexBoard from '@/components/HexBoard';
import QuestionPanel from '@/components/QuestionPanel';
import PlayerPanel from '@/components/PlayerPanel';
import QuestionHistoryPanel from '@/components/QuestionHistoryPanel';
import WinScreen from '@/components/WinScreen';
import LobbyView from '@/components/LobbyView';
import PresenterMode from '@/components/PresenterMode';
import QRCodePanel from '@/components/QRCodePanel';
import TimerRing from '@/components/TimerRing';

export default function GamePage({ params }: { params: { code: string } }) {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'player';
  const hostId = searchParams.get('hostId') || '';
  const nickname = searchParams.get('nickname') || 'Player';
  const socket = useSocket();
  const store = useGameStore();
  const [presenterMode, setPresenterMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [joined, setJoined] = useState(false);

  const isHost = role === 'host';
  const isAr = store.settings.language !== 'EN';

  useEffect(() => {
    if (joined) return;
    setJoined(true);
    store.setRoomCode(params.code);
    store.setIsHost(isHost);
    if (isHost) store.setHostId(hostId);
    store.setNickname(nickname);

    socket.emit('join_room', {
      roomCode: params.code,
      nickname: isHost ? 'Host' : nickname,
      role,
      hostId: isHost ? hostId : undefined,
    });
    
    socket.on('connect', () => {
      store.setMyId(socket.id || '');
    });
    if (socket.id) store.setMyId(socket.id);
  }, []);

  if (store.status === 'lobby') {
    return <LobbyView roomCode={params.code} isHost={isHost} />;
  }

  if (store.winner) {
    return <WinScreen winner={store.winner} isHost={isHost} roomCode={params.code} />;
  }

  if (presenterMode) {
    return <PresenterMode onExit={() => setPresenterMode(false)} />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isAr ? 'rtl font-arabic' : 'ltr'}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="text-sm text-white/40">{isAr ? 'الغرفة:' : 'Room:'}</div>
          <div className="font-mono font-bold text-amber-400 text-lg tracking-widest">{params.code}</div>
        </div>
        
        {/* Team scores */}
        <div className="flex items-center gap-4">
          <TeamScore team="red" />
          <div className="text-white/20">vs</div>
          <TeamScore team="blue" />
        </div>

        <div className="flex gap-2">
          {isHost && (
            <>
              <button onClick={() => setShowQR(!showQR)} className="btn-ghost text-xs py-1.5 px-3">
                QR
              </button>
              <button onClick={() => setShowHistory(!showHistory)} className="btn-ghost text-xs py-1.5 px-3">
                {isAr ? 'السجل' : 'History'}
              </button>
              <button onClick={() => setPresenterMode(true)} className="btn-ghost text-xs py-1.5 px-3">
                📺
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main game area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - players */}
        <div className="w-48 flex-shrink-0 border-r border-white/10 p-3 hidden lg:block">
          <PlayerPanel />
        </div>

        {/* Center - hex board */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
          {store.currentQuestion && (
            <div className="mb-4 w-full max-w-2xl">
              <TimerRing seconds={store.settings.timerSeconds} />
            </div>
          )}
          <HexBoard roomCode={params.code} isHost={isHost} />
        </div>

        {/* Right panel - question + history */}
        <div className="w-72 flex-shrink-0 border-l border-white/10 flex flex-col hidden lg:flex">
          <QuestionPanel roomCode={params.code} isHost={isHost} />
          {showHistory && (
            <div className="flex-1 border-t border-white/10 overflow-hidden">
              <QuestionHistoryPanel />
            </div>
          )}
        </div>
      </div>

      {/* Mobile question panel */}
      {store.currentQuestion && (
        <div className="lg:hidden border-t border-white/10 bg-black/50">
          <QuestionPanel roomCode={params.code} isHost={isHost} compact />
        </div>
      )}

      {/* QR overlay */}
      {showQR && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowQR(false)}>
          <div onClick={e => e.stopPropagation()}>
            <QRCodePanel roomCode={params.code} onClose={() => setShowQR(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function TeamScore({ team }: { team: 'red' | 'blue' }) {
  const grid = useGameStore(s => s.grid);
  const count = grid?.cells.filter(c => c.owner === team).length || 0;
  const isAr = useGameStore(s => s.settings.language !== 'EN');

  return (
    <div className={`flex items-center gap-2 ${team === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
      <div className="w-3 h-3 rounded-full" style={{ background: team === 'red' ? '#EF4444' : '#3B82F6' }} />
      <span className="font-bold text-lg">{count}</span>
      <span className="text-white/30 text-xs">{isAr ? (team === 'red' ? 'أحمر' : 'أزرق') : team}</span>
    </div>
  );
}
