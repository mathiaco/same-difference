import { useState, useEffect, useRef } from 'react'
import './App.css'
import { GameCard } from './components/GameCard'

const SHAPES = ['triangle', 'circle', 'square'] as const
const COLORS = ['red', 'blue', 'green'] as const
const BACKGROUNDS = ['black', 'white', 'grey'] as const
const TURN_TIME = 30 // seconds per turn
const MAX_EMPTY_TURNS = 6 // game ends after this many turns without valid guesses

type Shape = (typeof SHAPES)[number]
type Color = (typeof COLORS)[number]
type Background = (typeof BACKGROUNDS)[number]

interface Card {
  id: number
  shape: Shape
  color: Color
  bg: Background
}

function generateCard(id: number): Card {
  return {
    id,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    bg: BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)],
  }
}

function isValidSet(cards: Card[]): boolean {
  const attrs: (keyof Pick<Card, 'shape' | 'color' | 'bg'>)[] = [
    'shape',
    'color',
    'bg',
  ]
  return attrs.every((attr) => {
    const values = cards.map((c) => c[attr])
    const unique = new Set(values).size
    return unique === 1 || unique === 3
  })
}

function hasAnyValidSet(cards: Card[], usedSets: string[]): boolean {
  const n = cards.length
  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      for (let k = j + 1; k < n; k++) {
        const combo = [cards[i], cards[j], cards[k]]
        const setKey = [cards[i].id, cards[j].id, cards[k].id]
          .sort((a, b) => a - b)
          .join('-')
        if (!usedSets.includes(setKey) && isValidSet(combo)) {
          return true
        }
      }
    }
  }
  return false
}

function App() {
  const [cards, setCards] = useState<Card[]>(() =>
    Array.from({ length: 9 }, (_, i) => generateCard(i))
  )
  const [selected, setSelected] = useState<number[]>([])
  const [usedSets, setUsedSets] = useState<string[]>([])
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [turn, setTurn] = useState<0 | 1>(0)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<
    'success' | 'error' | 'neutral'
  >('neutral')
  const [timeLeft, setTimeLeft] = useState(TURN_TIME)
  const [emptyTurns, setEmptyTurns] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // resetEmptyTurns: true = reset counter (valid guess), false = keep counter
  function switchTurn(resetEmptyTurns: boolean) {
    if (resetEmptyTurns) {
      setEmptyTurns(0)
    }
    setTurn((t) => (t === 0 ? 1 : 0))
    setTimeLeft(TURN_TIME)
  }

  // Timer countdown effect
  useEffect(() => {
    if (gameOver) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0 // Will trigger the timeout effect
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameOver])

  // Handle timeout when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && !gameOver) {
      // Timeout occurred - switch turn and increment empty turns
      // Using queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(() => {
        setSelected([])
        setEmptyTurns((prev) => {
          const newCount = prev + 1
          if (newCount >= MAX_EMPTY_TURNS) {
            setGameOver(true)
          }
          return newCount
        })
        setTurn((t) => (t === 0 ? 1 : 0))
        setTimeLeft(TURN_TIME)
      })
    }
  }, [timeLeft, gameOver])

  function toggleSelect(id: number) {
    if (gameOver) return
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    )
  }

  function showMessage(text: string, type: 'success' | 'error' | 'neutral') {
    setMessage(text)
    setMessageType(type)
  }

  function submit() {
    if (selected.length !== 3 || gameOver) return

    const setKey = [...selected].sort((a, b) => a - b).join('-')
    if (usedSets.includes(setKey)) {
      // Already tried - no penalty, just pass turn
      showMessage('Already tried this set - turn passes', 'neutral')
      setSelected([])
      switchTurn(false)
    } else {
      const chosen = cards.filter((c) => selected.includes(c.id))
      if (isValidSet(chosen)) {
        const newScores: [number, number] = [...scores]
        newScores[turn] += 1
        setScores(newScores)
        setUsedSets([...usedSets, setKey])
        showMessage('Correct set ✅', 'success')
        setSelected([])
        switchTurn(true)
      } else {
        const newScores: [number, number] = [...scores]
        newScores[turn] -= 1
        setScores(newScores)
        showMessage('Wrong set ❌', 'error')
        setSelected([])
        switchTurn(false)
      }
    }
  }

  function complete() {
    if (gameOver) return
    const hasValid = hasAnyValidSet(cards, usedSets)
    const newScores: [number, number] = [...scores]
    if (!hasValid) {
      newScores[turn] += 3
      showMessage('Correct Complete! ✅ (+3 points) - Game Over!', 'success')
      setScores(newScores)
      setSelected([])
      setGameOver(true)
    } else {
      newScores[turn] -= 2
      showMessage(
        'Incorrect Complete! ❌ Valid sets remain. (-2 points)',
        'error'
      )
      setScores(newScores)
      setSelected([])
      switchTurn(false)
    }
  }

  function newRound() {
    setCards(Array.from({ length: 9 }, (_, i) => generateCard(i)))
    setUsedSets([])
    setSelected([])
    setScores([0, 0])
    setTimeLeft(TURN_TIME)
    setEmptyTurns(0)
    setGameOver(false)
    setTurn(0)
    showMessage('', 'neutral')
  }

  return (
    <div className='p-4 sm:p-6 max-w-xl mx-auto space-y-4'>
      <h1 className='text-2xl font-bold text-center'>Same OR Different</h1>

      {/* Game Over Banner */}
      {gameOver && (
        <div className='text-center py-4 px-4 rounded-xl font-bold text-xl bg-red-100 text-red-800'>
          🏁 Game Over!
          {scores[0] > scores[1] && ' Player 1 Wins!'}
          {scores[1] > scores[0] && ' Player 2 Wins!'}
          {scores[0] === scores[1] && " It's a Tie!"}
        </div>
      )}

      {/* Turn Banner with Timer */}
      {!gameOver && (
        <div
          key={turn}
          className={`
            text-center py-3 px-4 rounded-xl font-semibold text-lg
            transition-all duration-300
            ${
              turn === 0
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }
          `}
        >
          <div>🎮 Player {turn + 1}'s Turn</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              timeLeft <= 10 ? 'text-red-600 animate-pulse' : ''
            }`}
          >
            ⏱️ {timeLeft}s
          </div>
          <div className='text-xs mt-1 opacity-70'>
            {MAX_EMPTY_TURNS - emptyTurns} turns left before game ends
          </div>
        </div>
      )}

      {/* Game Grid */}
      <div className='grid grid-cols-3 gap-3'>
        {cards.map((c) => (
          <GameCard
            key={c.id}
            card={c}
            isSelected={selected.includes(c.id)}
            onClick={() => toggleSelect(c.id)}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className='flex flex-wrap gap-2 justify-center'>
        <button
          onClick={submit}
          className='px-4 py-2 bg-black text-white rounded-xl font-medium disabled:opacity-40 transition-opacity'
          disabled={selected.length !== 3 || gameOver}
        >
          Submit Set
        </button>
        <button
          onClick={complete}
          className='px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-40'
          disabled={gameOver}
        >
          Complete!
        </button>
        <button
          onClick={newRound}
          className='px-4 py-2 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors'
        >
          New Round
        </button>
      </div>

      {/* Feedback Message */}
      {message && (
        <div
          className={`
            text-center py-2 px-4 rounded-lg font-medium
            ${messageType === 'success' ? 'bg-green-100 text-green-800' : ''}
            ${messageType === 'error' ? 'bg-red-100 text-red-800' : ''}
            ${messageType === 'neutral' ? 'bg-gray-100 text-gray-800' : ''}
          `}
        >
          {message}
        </div>
      )}

      {/* Scoreboard */}
      <div className='flex justify-between items-center gap-4'>
        <div
          className={`
            flex-1 text-center py-3 rounded-xl font-semibold transition-all
            ${
              turn === 0
                ? 'bg-blue-500 text-white scale-105'
                : 'bg-gray-200 text-gray-700'
            }
          `}
        >
          Player 1: {scores[0]}
        </div>
        <div
          className={`
            flex-1 text-center py-3 rounded-xl font-semibold transition-all
            ${
              turn === 1
                ? 'bg-purple-500 text-white scale-105'
                : 'bg-gray-200 text-gray-700'
            }
          `}
        >
          Player 2: {scores[1]}
        </div>
      </div>

      {/* Successful Sets List */}
      {usedSets.length > 0 && (
        <div className='bg-gray-50 rounded-xl p-4'>
          <h3 className='font-semibold text-gray-700 mb-2'>Found Sets:</h3>
          <div className='flex flex-wrap gap-2'>
            {usedSets.map((setKey, index) => {
              const cardNumbers = setKey.split('-').map((id) => Number(id) + 1)
              return (
                <span
                  key={setKey}
                  className='bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium'
                >
                  #{index + 1}: {cardNumbers.join(', ')}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
