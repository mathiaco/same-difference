import { useState } from 'react'
import type {
  GamePhase,
  Player,
  Vault,
  PlayerChoice,
  RoundLog,
  RoundResult,
} from './types'
import { generateVaults } from './vaultUtils'
import { resolveRound } from './resolutionUtils'

interface GoldHeistProps {
  onBack: () => void
}

export function GoldHeist({ onBack }: GoldHeistProps) {
  // Setup state
  const [numPlayersInput, setNumPlayersInput] = useState('4')
  const [playerNames, setPlayerNames] = useState<string[]>([])

  // Game state
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [players, setPlayers] = useState<Player[]>([])
  const [vaults, setVaults] = useState<Vault[]>([])
  const [playerChoices, setPlayerChoices] = useState<PlayerChoice[]>([])
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundLogs, setRoundLogs] = useState<RoundLog[]>([])
  const [hasResolved, setHasResolved] = useState(false)
  const [results, setResults] = useState<RoundResult[]>([])

  // Setup phase handlers
  function handleNumPlayersChange(value: string) {
    const num = parseInt(value) || 0
    setNumPlayersInput(value)
    if (num >= 3 && num <= 10) {
      setPlayerNames(
        Array(num)
          .fill('')
          .map((_, i) => `Player ${i + 1}`)
      )
    }
  }

  function handlePlayerNameChange(index: number, name: string) {
    const newNames = [...playerNames]
    newNames[index] = name
    setPlayerNames(newNames)
  }

  function startGame() {
    const numPlayers = parseInt(numPlayersInput)
    if (numPlayers < 3 || playerNames.some((n) => !n.trim())) return

    const initialPlayers: Player[] = playerNames.map((name, i) => ({
      id: i,
      name: name.trim(),
      score: 0,
    }))

    setPlayers(initialPlayers)
    setPlayerChoices(
      initialPlayers.map((p) => ({ playerId: p.id, vaultId: null, note: '' }))
    )
    setVaults(generateVaults(numPlayers))
    setPhase('input')
    setRoundNumber(1)
    setHasResolved(false)
  }

  // Input phase handlers
  function handleVaultChoice(playerId: number, vaultId: number | null) {
    setPlayerChoices((prev) =>
      prev.map((c) => (c.playerId === playerId ? { ...c, vaultId } : c))
    )
  }

  function handleNoteChange(playerId: number, note: string) {
    setPlayerChoices((prev) =>
      prev.map((c) => (c.playerId === playerId ? { ...c, note } : c))
    )
  }

  // Phase transitions
  function handleReveal() {
    if (phase !== 'input') return
    setPhase('reveal')
  }

  function handleResolve() {
    if (phase !== 'reveal' || hasResolved) return

    const {
      results: roundResults,
      updatedPlayers,
      log,
    } = resolveRound(players, vaults, playerChoices)

    setResults(roundResults)
    setPlayers(updatedPlayers)
    setRoundLogs((prev) => [...prev, { roundNumber, ...log }])
    setHasResolved(true)
    setPhase('resolution')
  }

  function handleNextRound() {
    if (phase !== 'resolution') return

    const newVaults = generateVaults(players.length)
    setVaults(newVaults)
    setPlayerChoices(
      players.map((p) => ({ playerId: p.id, vaultId: null, note: '' }))
    )
    setRoundNumber((r) => r + 1)
    setHasResolved(false)
    setResults([])
    setPhase('input')
  }

  function handleNewGame() {
    setPhase('setup')
    setPlayers([])
    setVaults([])
    setPlayerChoices([])
    setRoundNumber(1)
    setRoundLogs([])
    setHasResolved(false)
    setResults([])
    setNumPlayersInput('4')
    setPlayerNames([])
  }

  // Render setup phase
  if (phase === 'setup') {
    return (
      <div className='p-4 sm:p-6 max-w-xl mx-auto space-y-6'>
        <div className='flex items-center justify-between'>
          <button
            onClick={onBack}
            className='px-3 py-1 text-gray-600 hover:text-gray-800 font-medium'
          >
            ← Back
          </button>
          <h1 className='text-2xl font-bold'>🏦 Gold Heist</h1>
          <div className='w-16'></div>
        </div>

        <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4'>
          <p className='text-yellow-800 text-sm'>
            ⚠️ Dealer Console Only - Players should not see this screen
          </p>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Number of Players (3-10)
            </label>
            <input
              type='number'
              min='3'
              max='10'
              value={numPlayersInput}
              onChange={(e) => handleNumPlayersChange(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
            />
          </div>

          {playerNames.length > 0 && (
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Player Names
              </label>
              {playerNames.map((name, i) => (
                <input
                  key={i}
                  type='text'
                  value={name}
                  onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
                />
              ))}
            </div>
          )}

          <button
            onClick={startGame}
            disabled={
              parseInt(numPlayersInput) < 3 ||
              playerNames.some((n) => !n.trim())
            }
            className='w-full py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 disabled:opacity-40 transition-colors'
          >
            Start Game
          </button>
        </div>
      </div>
    )
  }

  // Game UI
  return (
    <div className='p-4 sm:p-6 max-w-2xl mx-auto space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <button
          onClick={handleNewGame}
          className='px-3 py-1 text-gray-600 hover:text-gray-800 font-medium'
        >
          ← New Game
        </button>
        <h1 className='text-xl font-bold'>🏦 Gold Heist</h1>
        <div className='text-sm font-medium text-gray-600'>
          Round {roundNumber}
        </div>
      </div>

      {/* Phase Indicator */}
      <div
        className={`text-center py-2 px-4 rounded-xl font-bold text-lg ${
          phase === 'input'
            ? 'bg-blue-100 text-blue-800'
            : phase === 'reveal'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-green-100 text-green-800'
        }`}
      >
        {phase === 'input' && '📝 Dealer Input Phase'}
        {phase === 'reveal' && '👁️ Reveal Phase'}
        {phase === 'resolution' && '💰 Resolution Phase'}
      </div>

      {/* Dealer Warning */}
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center'>
        <p className='text-yellow-800 text-xs'>
          ⚠️ Dealer Only - Hide from players
        </p>
      </div>

      {/* Vaults (Dealer View) */}
      <div className='bg-gray-50 rounded-xl p-4'>
        <h2 className='font-bold text-gray-800 mb-3'>
          🏦 Vaults (Dealer View)
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {vaults.map((vault) => {
            const playersInVault =
              phase !== 'input'
                ? playerChoices
                    .filter((c) => c.vaultId === vault.id)
                    .map((c) => players.find((p) => p.id === c.playerId)?.name)
                    .filter(Boolean)
                : []
            const isOverCapacity = playersInVault.length > vault.capacity
            const result = results.find((r) => r.vaultId === vault.id)

            return (
              <div
                key={vault.id}
                className={`p-3 rounded-lg border-2 ${
                  phase === 'resolution' && isOverCapacity
                    ? 'border-red-400 bg-red-50'
                    : phase === 'resolution' && playersInVault.length > 0
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-bold'>Vault {vault.id + 1}</span>
                  <span className='text-sm text-gray-500'>
                    Cap: {vault.capacity}
                  </span>
                </div>
                <div className='text-yellow-600 font-bold text-lg'>
                  💰 {vault.gold} gold
                </div>

                {/* Show players after reveal */}
                {phase !== 'input' && playersInVault.length > 0 && (
                  <div className='mt-2 text-sm'>
                    <span className='text-gray-600'>Players: </span>
                    <span
                      className={
                        isOverCapacity ? 'text-red-600' : 'text-green-600'
                      }
                    >
                      {playersInVault.join(', ')}
                    </span>
                    {isOverCapacity && (
                      <span className='text-red-600 font-bold'> 🚔 JAILED</span>
                    )}
                  </div>
                )}

                {/* Show gold distribution after resolution */}
                {phase === 'resolution' &&
                  result &&
                  result.goldPerPlayer > 0 && (
                    <div className='mt-1 text-sm text-green-700 font-medium'>
                      +{result.goldPerPlayer} gold each
                    </div>
                  )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Player Input (Input Phase) */}
      {phase === 'input' && (
        <div className='bg-white rounded-xl p-4 border'>
          <h2 className='font-bold text-gray-800 mb-3'>👥 Player Choices</h2>
          <div className='space-y-3'>
            {players.map((player) => {
              const choice = playerChoices.find((c) => c.playerId === player.id)
              return (
                <div
                  key={player.id}
                  className='p-3 bg-gray-50 rounded-lg space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{player.name}</span>
                    <span className='text-sm text-gray-500'>
                      Score: {player.score}
                    </span>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {vaults.map((vault) => (
                      <button
                        key={vault.id}
                        onClick={() => handleVaultChoice(player.id, vault.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          choice?.vaultId === vault.id
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Vault {vault.id + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handleVaultChoice(player.id, null)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        choice?.vaultId === null
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      None
                    </button>
                  </div>
                  <input
                    type='text'
                    placeholder='Notes (tips, alliances...)'
                    value={choice?.note || ''}
                    onChange={(e) =>
                      handleNoteChange(player.id, e.target.value)
                    }
                    className='w-full px-2 py-1 text-sm border border-gray-300 rounded-lg'
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Scoreboard */}
      <div className='bg-white rounded-xl p-4 border'>
        <h2 className='font-bold text-gray-800 mb-3'>📊 Scoreboard</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
          {players
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <div
                key={player.id}
                className={`p-2 rounded-lg text-center ${
                  index === 0
                    ? 'bg-yellow-100 border-2 border-yellow-400'
                    : 'bg-gray-100'
                }`}
              >
                <div className='font-medium text-sm truncate'>
                  {player.name}
                </div>
                <div className='font-bold text-lg'>{player.score} 💰</div>
              </div>
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-wrap gap-2 justify-center'>
        {phase === 'input' && (
          <button
            onClick={handleReveal}
            className='px-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-colors'
          >
            👁️ Reveal
          </button>
        )}
        {phase === 'reveal' && !hasResolved && (
          <button
            onClick={handleResolve}
            className='px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors'
          >
            💰 Resolve
          </button>
        )}
        {phase === 'resolution' && (
          <button
            onClick={handleNextRound}
            className='px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors'
          >
            ➡️ Next Round
          </button>
        )}
      </div>

      {/* Round Log */}
      {roundLogs.length > 0 && (
        <details className='bg-gray-50 rounded-xl p-4'>
          <summary className='font-bold text-gray-800 cursor-pointer'>
            📜 Round History ({roundLogs.length} rounds)
          </summary>
          <div className='mt-3 space-y-4 max-h-64 overflow-y-auto'>
            {roundLogs.map((log) => (
              <div
                key={log.roundNumber}
                className='p-3 bg-white rounded-lg border text-sm'
              >
                <div className='font-bold mb-2'>Round {log.roundNumber}</div>
                <div className='text-gray-600'>
                  <div>
                    Vaults:{' '}
                    {log.vaults
                      .map((v) => `V${v.id + 1}(${v.gold}g, cap ${v.capacity})`)
                      .join(', ')}
                  </div>
                  {log.jailedPlayers.length > 0 && (
                    <div className='text-red-600'>
                      Jailed: {log.jailedPlayers.join(', ')}
                    </div>
                  )}
                  {log.goldDistribution.length > 0 && (
                    <div className='text-green-600'>
                      Gold:{' '}
                      {log.goldDistribution
                        .map((g) => `${g.playerName}: +${g.gold}`)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

export default GoldHeist
