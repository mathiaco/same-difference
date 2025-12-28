// Gold Heist Types

export interface Player {
  id: number
  name: string
  score: number
}

export interface Vault {
  id: number
  gold: number
  capacity: number
}

export interface PlayerChoice {
  playerId: number
  vaultId: number | null
  note: string
}

export interface RoundResult {
  vaultId: number
  playerIds: number[]
  capacity: number
  isOverCapacity: boolean
  jailedPlayerIds: number[]
  goldReceivers: number[]
  goldPerPlayer: number
}

export interface RoundLog {
  roundNumber: number
  vaults: Vault[]
  playerChoices: PlayerChoice[]
  results: RoundResult[]
  jailedPlayers: string[]
  goldDistribution: { playerName: string; gold: number }[]
}

export type GamePhase = 'setup' | 'input' | 'reveal' | 'resolution' | 'complete'

export interface GameState {
  phase: GamePhase
  players: Player[]
  vaults: Vault[]
  playerChoices: PlayerChoice[]
  roundNumber: number
  roundLogs: RoundLog[]
  hasResolved: boolean
}
