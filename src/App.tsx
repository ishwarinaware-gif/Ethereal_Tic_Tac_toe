/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Cloud, RotateCcw, Sparkles } from 'lucide-react';

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function App() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const checkWinner = (currentBoard: Board): Player | 'Draw' | null => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    if (currentBoard.every(cell => cell !== null)) return 'Draw';
    return null;
  };

  const minimax = (currentBoard: Board, depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(currentBoard);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const makeAiMove = useCallback(() => {
    setIsAiThinking(true);
    // Add a small delay for "thinking" effect
    setTimeout(() => {
      let bestScore = -Infinity;
      let move = -1;
      const currentBoard = [...board];

      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, 0, false);
          currentBoard[i] = null;
          if (score > bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }

      if (move !== -1) {
        const newBoard = [...board];
        newBoard[move] = 'O';
        setBoard(newBoard);
        setIsXNext(true);
        const gameResult = checkWinner(newBoard);
        if (gameResult) setWinner(gameResult);
      }
      setIsAiThinking(false);
    }, 600);
  }, [board]);

  useEffect(() => {
    if (!isXNext && !winner) {
      makeAiMove();
    }
  }, [isXNext, winner, makeAiMove]);

  const handleClick = (index: number) => {
    if (board[index] || winner || !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);

    const gameResult = checkWinner(newBoard);
    if (gameResult) setWinner(gameResult);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="font-serif text-5xl md:text-7xl mb-2 tracking-tight italic drop-shadow-lg">
          Daydream
        </h1>
        <p className="text-white/70 font-light tracking-widest uppercase text-xs">
          Moon vs Cloud
        </p>
      </motion.div>

      <div className="relative z-10">
        <div className="grid grid-cols-3 gap-3 p-4 glass rounded-3xl shadow-2xl">
          {board.map((cell, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClick(i)}
              className="w-20 h-20 md:w-28 md:h-28 glass rounded-2xl flex items-center justify-center transition-colors duration-300 relative overflow-hidden group"
              id={`cell-${i}`}
            >
              <AnimatePresence mode="wait">
                {cell === 'X' && (
                  <motion.div
                    key="moon"
                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-yellow-100 drop-shadow-[0_0_8px_rgba(254,252,232,0.8)]"
                  >
                    <Moon size={40} fill="currentColor" />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    key="cloud"
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                  >
                    <Cloud size={44} fill="currentColor" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!cell && !winner && isXNext && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Status Indicator */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <AnimatePresence mode="wait">
            {winner ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <h2 className="font-serif text-3xl mb-4 italic">
                  {winner === 'X' ? "You've awakened" : winner === 'O' ? "The dream continues" : "A shared slumber"}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="px-8 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center gap-2 hover:bg-white/30 transition-all text-sm font-medium tracking-wide"
                  id="reset-button"
                >
                  <RotateCcw size={16} />
                  Reset Dream
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-white/80"
              >
                {isXNext ? (
                  <>
                    <Sparkles size={16} className="animate-pulse text-yellow-200" />
                    <span className="text-sm tracking-widest uppercase font-medium">Your Turn</span>
                  </>
                ) : (
                  <>
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-white rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-white rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-white rounded-full" />
                    </div>
                    <span className="text-sm tracking-widest uppercase font-medium">Cloud is Drifting...</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Clouds Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ x: [-100, 100, -100], y: [-20, 20, -20] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 text-white/10"
        >
          <Cloud size={200} fill="currentColor" />
        </motion.div>
        <motion.div 
          animate={{ x: [100, -100, 100], y: [20, -20, 20] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 text-white/10"
        >
          <Cloud size={250} fill="currentColor" />
        </motion.div>
      </div>
    </div>
  );
}
