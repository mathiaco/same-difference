import { useState } from 'react'
import './App.css'
import { SameDifference } from './games/same-difference/SameDifference'
import { GoldHeist } from './games/gold-heist/GoldHeist'

type GameType = 'home' | 'same-difference' | 'gold-heist'

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('home')

  if (currentGame === 'same-difference') {
    return <SameDifference onBack={() => setCurrentGame('home')} />
  }

  if (currentGame === 'gold-heist') {
    return <GoldHeist onBack={() => setCurrentGame('home')} />
  }

  // Home - Game Selection
  return (
    <div className='p-4 sm:p-6 max-w-xl mx-auto space-y-6'>
      <h1 className='text-3xl font-bold text-center'>🎮 The Genius Games</h1>
      <p className='text-center text-gray-600'>Select a game to play</p>

      <div className='space-y-4'>
        <button
          onClick={() => setCurrentGame('same-difference')}
          className='w-full p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-[1.02]'
        >
          <div className='text-2xl font-bold mb-2'>🃏 Same OR Different</div>
          <div className='text-sm opacity-90'>
            2 players • Find valid card sets • Race against the timer
          </div>
        </button>

        <button
          onClick={() => setCurrentGame('gold-heist')}
          className='w-full p-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-[1.02]'
        >
          <div className='text-2xl font-bold mb-2'>🏦 Gold Heist</div>
          <div className='text-sm opacity-90'>
            3+ players • Dealer console • Vaults, gold & jails
          </div>
        </button>
      </div>

      <div className='text-center text-xs text-gray-400 mt-8'>
        Inspired by The Genius
      </div>
    </div>
  )
}

export default App
