import type {
  Player,
  Vault,
  PlayerChoice,
  RoundResult,
  RoundLog,
} from './types'

/**
 * Resolve a round and compute results
 * - Players in over-capacity vaults are jailed (no gold)
 * - Gold is split evenly among non-jailed players in a vault
 */
export function resolveRound(
  players: Player[],
  vaults: Vault[],
  playerChoices: PlayerChoice[]
): {
  results: RoundResult[]
  updatedPlayers: Player[]
  log: Omit<RoundLog, 'roundNumber'>
} {
  const results: RoundResult[] = []
  const updatedPlayers = players.map((p) => ({ ...p }))
  const jailedPlayers: string[] = []
  const goldDistribution: { playerName: string; gold: number }[] = []

  // Group players by vault
  for (const vault of vaults) {
    const playersInVault = playerChoices
      .filter((c) => c.vaultId === vault.id)
      .map((c) => c.playerId)

    const isOverCapacity = playersInVault.length > vault.capacity
    let jailedPlayerIds: number[] = []
    let goldReceivers: number[] = []
    let goldPerPlayer = 0

    if (isOverCapacity) {
      // Everyone in this vault is jailed
      jailedPlayerIds = [...playersInVault]
      jailedPlayerIds.forEach((pid) => {
        const player = updatedPlayers.find((p) => p.id === pid)
        if (player) jailedPlayers.push(player.name)
      })
    } else if (playersInVault.length > 0) {
      // Split gold among players
      goldReceivers = [...playersInVault]
      goldPerPlayer = Math.floor(vault.gold / playersInVault.length)

      goldReceivers.forEach((pid) => {
        const player = updatedPlayers.find((p) => p.id === pid)
        if (player) {
          player.score += goldPerPlayer
          goldDistribution.push({
            playerName: player.name,
            gold: goldPerPlayer,
          })
        }
      })
    }

    results.push({
      vaultId: vault.id,
      playerIds: playersInVault,
      capacity: vault.capacity,
      isOverCapacity,
      jailedPlayerIds,
      goldReceivers,
      goldPerPlayer,
    })
  }

  // Handle players who didn't choose a vault
  const playersWithoutVault = playerChoices
    .filter((c) => c.vaultId === null)
    .map((c) => c.playerId)

  if (playersWithoutVault.length > 0) {
    playersWithoutVault.forEach((pid) => {
      const player = updatedPlayers.find((p) => p.id === pid)
      if (player) jailedPlayers.push(player.name + ' (no vault)')
    })
  }

  return {
    results,
    updatedPlayers,
    log: {
      vaults: [...vaults],
      playerChoices: [...playerChoices],
      results,
      jailedPlayers,
      goldDistribution,
    },
  }
}
