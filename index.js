// server/index.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();
const app = express();
app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// In-memory game state (backed by DB for persistence)
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function buildHexGrid(size) {
  const sizes = { small: 7, medium: 9, large: 11 };
  const n = sizes[size] || 9;
  
  const arabicLetters = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];
  const englishLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const cells = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      cells.push({
        id: row * n + col,
        row,
        col,
        owner: null, // null | 'red' | 'blue'
        letterAr: arabicLetters[Math.floor(Math.random() * arabicLetters.length)],
        letterEn: englishLetters[Math.floor(Math.random() * englishLetters.length)],
      });
    }
  }
  return { cells, size: n };
}

// Hex grid neighbor detection (offset coordinates)
function getNeighbors(row, col, gridSize) {
  const isEven = col % 2 === 0;
  const candidates = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
    [isEven ? row - 1 : row + 1, col - 1],
    [isEven ? row - 1 : row + 1, col + 1],
  ];
  return candidates.filter(([r, c]) => r >= 0 && c >= 0 && r < gridSize && c < gridSize);
}

function checkWin(cells, gridSize, team) {
  // Blue: connect top row to bottom row (vertical)
  // Red: connect left col to right col (horizontal)
  const teamCells = cells.filter(c => c.owner === team);
  
  let starts, isEnd;
  if (team === 'blue') {
    starts = teamCells.filter(c => c.row === 0);
    isEnd = (c) => c.row === gridSize - 1;
  } else {
    starts = teamCells.filter(c => c.col === 0);
    isEnd = (c) => c.col === gridSize - 1;
  }

  for (const start of starts) {
    const visited = new Set();
    const queue = [start];
    while (queue.length) {
      const current = queue.shift();
      if (isEnd(current)) return true;
      const key = `${current.row},${current.col}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const neighbors = getNeighbors(current.row, current.col, gridSize);
      for (const [r, c] of neighbors) {
        const neighbor = cells.find(x => x.row === r && x.col === c);
        if (neighbor && neighbor.owner === team) queue.push(neighbor);
      }
    }
  }
  return false;
}

// REST endpoints for game management
app.post('/api/rooms', async (req, res) => {
  const { hostId, settings } = req.body;
  let code;
  let existing;
  do {
    code = generateRoomCode();
    existing = await prisma.session.findUnique({ where: { roomCode: code } });
  } while (existing);

  const session = await prisma.session.create({
    data: {
      roomCode: code,
      hostId,
      boardSize: settings.boardSize || 'medium',
      language: settings.language || 'AR',
      categories: JSON.stringify(settings.categories || []),
      difficulty: settings.difficulty || 'all',
      timerSeconds: settings.timerSeconds || 30,
      buzzMode: settings.buzzMode !== false,
      status: 'lobby',
    },
  });

  const grid = buildHexGrid(session.boardSize);
  rooms.set(code, {
    sessionId: session.id,
    hostId,
    settings: { ...settings, boardSize: session.boardSize, language: session.language },
    grid,
    players: {},
    teams: { red: [], blue: [] },
    status: 'lobby',
    currentQuestion: null,
    buzzed: null,
    currentCell: null,
    questionHistory: [],
  });

  res.json({ roomCode: code, sessionId: session.id });
});

app.get('/api/rooms/:code', (req, res) => {
  const room = rooms.get(req.params.code);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ exists: true, status: room.status });
});

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentPlayer = null;

  socket.on('join_room', async ({ roomCode, nickname, role, hostId }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    currentRoom = roomCode;
    currentPlayer = { id: socket.id, nickname, role, hostId };
    room.players[socket.id] = currentPlayer;
    socket.join(roomCode);

    socket.emit('room_joined', {
      grid: room.grid,
      settings: room.settings,
      teams: room.teams,
      players: Object.values(room.players),
      status: room.status,
      questionHistory: room.questionHistory,
    });

    io.to(roomCode).emit('player_joined', {
      player: currentPlayer,
      players: Object.values(room.players),
    });
  });

  socket.on('join_team', ({ roomCode, team }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    // Remove from both teams first
    room.teams.red = room.teams.red.filter(id => id !== socket.id);
    room.teams.blue = room.teams.blue.filter(id => id !== socket.id);
    room.teams[team].push(socket.id);
    io.to(roomCode).emit('teams_updated', room.teams);
  });

  socket.on('assign_team', ({ roomCode, playerId, team }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    room.teams.red = room.teams.red.filter(id => id !== playerId);
    room.teams.blue = room.teams.blue.filter(id => id !== playerId);
    room.teams[team].push(playerId);
    io.to(roomCode).emit('teams_updated', room.teams);
  });

  socket.on('start_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    room.status = 'playing';
    prisma.session.update({ where: { roomCode }, data: { status: 'playing' } }).catch(console.error);
    io.to(roomCode).emit('game_started', { grid: room.grid, settings: room.settings });
  });

  socket.on('select_cell', async ({ roomCode, cellId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'playing') return;

    const cell = room.grid.cells.find(c => c.id === cellId);
    if (!cell || cell.owner) return;

    const session = await prisma.session.findUnique({ where: { roomCode } });
    const usedIds = await prisma.usedQuestion.findMany({
      where: { sessionId: session.id },
      select: { questionId: true },
    });
    const usedSet = new Set(usedIds.map(u => u.questionId));

    const filters = {
      hostId: room.hostId,
      NOT: { id: { in: [...usedSet] } },
    };

    const categories = room.settings.categories;
    if (categories && categories.length) filters.category = { in: categories };
    if (room.settings.difficulty !== 'all') filters.difficulty = room.settings.difficulty;

    const lang = room.settings.language;
    const letter = lang === 'AR' ? cell.letterAr : cell.letterEn;
    if (letter && room.settings.showLetterHint) {
      // Try to match by first letter of answer
      const letterFilter = lang === 'AR'
        ? { answerAr: { startsWith: letter } }
        : { answerEn: { startsWith: letter } };
      const matching = await prisma.question.findFirst({ where: { ...filters, ...letterFilter } });
      if (matching) {
        room.currentQuestion = matching;
        room.currentCell = cellId;
        room.buzzed = null;
        io.to(roomCode).emit('question_selected', { question: matching, cellId, letter });
        return;
      }
    }

    const questions = await prisma.question.findMany({ where: filters });
    if (!questions.length) {
      socket.emit('no_questions', { message: 'No unused questions available' });
      return;
    }
    const q = questions[Math.floor(Math.random() * questions.length)];
    room.currentQuestion = q;
    room.currentCell = cellId;
    room.buzzed = null;
    io.to(roomCode).emit('question_selected', { question: q, cellId, letter });
  });

  socket.on('buzz_in', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.buzzed || !room.currentQuestion) return;
    room.buzzed = socket.id;
    const player = room.players[socket.id];
    io.to(roomCode).emit('player_buzzed', { playerId: socket.id, nickname: player?.nickname });
  });

  socket.on('answer_result', async ({ roomCode, correct, team }) => {
    const room = rooms.get(roomCode);
    if (!room || !room.currentQuestion || !room.currentCell) return;

    const session = await prisma.session.findUnique({ where: { roomCode } });
    const q = room.currentQuestion;

    // Mark question as used
    await prisma.usedQuestion.create({
      data: {
        sessionId: session.id,
        questionId: q.id,
        correct,
        teamAnswered: team,
        cellIndex: room.currentCell,
      },
    });

    await prisma.questionHistory.create({
      data: {
        sessionId: session.id,
        questionId: q.id,
        questionEn: q.questionEn,
        questionAr: q.questionAr,
        answerEn: q.answerEn,
        answerAr: q.answerAr,
        correct,
        teamAnswered: team,
        cellIndex: room.currentCell,
      },
    });

    const historyEntry = {
      questionId: q.id,
      questionEn: q.questionEn,
      questionAr: q.questionAr,
      answerEn: q.answerEn,
      answerAr: q.answerAr,
      correct,
      teamAnswered: team,
      cellIndex: room.currentCell,
      askedAt: new Date().toISOString(),
    };
    room.questionHistory.push(historyEntry);

    if (correct && team) {
      const cell = room.grid.cells.find(c => c.id === room.currentCell);
      if (cell) cell.owner = team;

      // Check win
      const winner = checkWin(room.grid.cells, room.grid.size, team) ? team : null;
      if (winner) {
        room.status = 'finished';
        await prisma.session.update({ where: { roomCode }, data: { status: 'finished', winnner: winner } });
        io.to(roomCode).emit('game_won', { winner, grid: room.grid.cells });
      } else {
        io.to(roomCode).emit('cell_captured', { cellId: room.currentCell, team, grid: room.grid.cells });
      }
    } else {
      io.to(roomCode).emit('answer_wrong', { cellId: room.currentCell });
    }

    room.currentQuestion = null;
    room.currentCell = null;
    room.buzzed = null;

    io.to(roomCode).emit('history_updated', { history: room.questionHistory });
  });

  socket.on('skip_question', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    room.currentQuestion = null;
    room.currentCell = null;
    room.buzzed = null;
    io.to(roomCode).emit('question_skipped', {});
  });

  socket.on('reset_game', async ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const grid = buildHexGrid(room.settings.boardSize);
    room.grid = grid;
    room.status = 'playing';
    room.currentQuestion = null;
    room.currentCell = null;
    room.buzzed = null;
    room.questionHistory = [];
    io.to(roomCode).emit('game_reset', { grid });
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        delete room.players[socket.id];
        room.teams.red = room.teams.red.filter(id => id !== socket.id);
        room.teams.blue = room.teams.blue.filter(id => id !== socket.id);
        io.to(currentRoom).emit('player_left', {
          playerId: socket.id,
          players: Object.values(room.players),
        });
      }
    }
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => console.log(`🔌 Socket server running on port ${PORT}`));
