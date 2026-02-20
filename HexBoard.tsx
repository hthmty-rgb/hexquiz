// src/components/HexBoard.tsx
'use client';
import { useGameStore } from '@/store/gameStore';
import { useSocket } from '@/hooks/useSocket';
import { HexCell } from '@/types';

const HEX_SIZE = 36;
const HEX_H = HEX_SIZE * 2;
const HEX_W = Math.sqrt(3) * HEX_SIZE;

interface HexBoardProps {
  roomCode: string;
  isHost: boolean;
}

export default function HexBoard({ roomCode, isHost }: HexBoardProps) {
  const socket = useSocket();
  const grid = useGameStore(s => s.grid);
  const currentCell = useGameStore(s => s.currentCell);
  const currentQuestion = useGameStore(s => s.currentQuestion);
  const language = useGameStore(s => s.settings.language);
  const showLetterHint = useGameStore(s => s.settings.showLetterHint);
  const status = useGameStore(s => s.status);

  if (!grid) return (
    <div className="flex items-center justify-center w-full h-64">
      <div className="text-white/30">Loading board...</div>
    </div>
  );

  const n = grid.size;
  const totalW = (n + 0.5) * HEX_W + 20;
  const totalH = n * HEX_H * 0.75 + HEX_H * 0.25 + 20;

  const handleCellClick = (cell: HexCell) => {
    if (!isHost || cell.owner || currentQuestion || status !== 'playing') return;
    socket.emit('select_cell', { roomCode, cellId: cell.id });
  };

  const getCellPos = (row: number, col: number) => {
    const x = 10 + col * HEX_W + (row % 2 === 0 ? 0 : HEX_W / 2);
    const y = 10 + row * HEX_H * 0.75;
    return { x, y };
  };

  const getHexPoints = (cx: number, cy: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push(`${cx + HEX_SIZE * 0.95 * Math.cos(angle)},${cy + HEX_SIZE * 0.95 * Math.sin(angle)}`);
    }
    return points.join(' ');
  };

  const getCellColor = (cell: HexCell) => {
    if (cell.id === currentCell) return '#F59E0B';
    if (cell.owner === 'red') return '#EF4444';
    if (cell.owner === 'blue') return '#3B82F6';
    return '#1E293B';
  };

  const getCellStroke = (cell: HexCell) => {
    if (cell.id === currentCell) return '#FCD34D';
    if (cell.owner === 'red') return '#DC2626';
    if (cell.owner === 'blue') return '#2563EB';
    return '#334155';
  };

  const getCellGlow = (cell: HexCell) => {
    if (cell.id === currentCell) return 'drop-shadow(0 0 8px rgba(245,158,11,0.8))';
    if (cell.owner === 'red') return 'drop-shadow(0 0 6px rgba(239,68,68,0.6))';
    if (cell.owner === 'blue') return 'drop-shadow(0 0 6px rgba(59,130,246,0.6))';
    return 'none';
  };

  const getLetter = (cell: HexCell) => {
    if (!showLetterHint) return '?';
    return language === 'AR' ? cell.letterAr : cell.letterEn;
  };

  const isClickable = isHost && !cell?.owner && !currentQuestion && status === 'playing';

  return (
    <div className="flex flex-col items-center">
      {/* Direction indicators */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-2 text-blue-400">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>↕ {language === 'AR' ? 'أزرق: عمودي' : 'Blue: Vertical'}</span>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>↔ {language === 'AR' ? 'أحمر: أفقي' : 'Red: Horizontal'}</span>
        </div>
      </div>

      {/* Edge indicators */}
      <div className="flex items-center mb-1">
        <div className="h-2 w-48 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-50" />
      </div>

      <div className="flex items-center">
        <div className="w-2 h-48 rounded-full bg-gradient-to-b from-red-600 to-red-400 opacity-50 mr-2" />
        
        <svg
          width={Math.min(totalW, 700)}
          height={Math.min(totalH, 600)}
          viewBox={`0 0 ${totalW} ${totalH}`}
          style={{ maxWidth: '100%', maxHeight: '60vh' }}
        >
          <defs>
            <filter id="glow-red">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-blue">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {grid.cells.map(cell => {
            const { x, y } = getCellPos(cell.row, cell.col);
            const canClick = isHost && !cell.owner && !currentQuestion && status === 'playing';
            const isSelected = cell.id === currentCell;

            return (
              <g key={cell.id} 
                onClick={() => canClick && handleCellClick(cell)}
                style={{ cursor: canClick ? 'pointer' : 'default' }}
              >
                <polygon
                  points={getHexPoints(x, y)}
                  fill={getCellColor(cell)}
                  stroke={getCellStroke(cell)}
                  strokeWidth={isSelected ? 2 : 1}
                  style={{ 
                    filter: getCellGlow(cell),
                    transition: 'fill 0.3s ease, filter 0.3s ease',
                  }}
                  className={canClick ? 'hover:brightness-150' : ''}
                />
                
                {/* Letter */}
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fill={cell.owner ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}
                  fontSize={language === 'AR' ? 14 : 13}
                  fontWeight="700"
                  fontFamily={language === 'AR' ? 'Cairo, sans-serif' : 'DM Sans, sans-serif'}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {getLetter(cell)}
                </text>

                {/* Used indicator for host */}
                {isSelected && (
                  <circle cx={x + HEX_SIZE * 0.5} cy={y - HEX_SIZE * 0.5} r={5} fill="#FCD34D" />
                )}
              </g>
            );
          })}
        </svg>

        <div className="w-2 h-48 rounded-full bg-gradient-to-b from-red-600 to-red-400 opacity-50 ml-2" />
      </div>

      <div className="flex items-center mt-1">
        <div className="h-2 w-48 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-50" />
      </div>

      {isHost && !currentQuestion && status === 'playing' && (
        <p className="mt-4 text-white/30 text-sm">
          {language === 'AR' ? '← انقر على خلية لاختيار سؤال' : '← Click a cell to select a question'}
        </p>
      )}
    </div>
  );
}
