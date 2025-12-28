import type { Vault } from './types'

/**
 * Generate vaults for a round
 * - 3-5 vaults per round
 * - sum(capacity) < number of players
 * - Each vault has gold (5-20) and capacity (1-3)
 */
export function generateVaults(numPlayers: number): Vault[] {
  const numVaults = Math.floor(Math.random() * 3) + 3 // 3-5 vaults
  const maxTotalCapacity = numPlayers - 1

  const vaults: Vault[] = []
  let remainingCapacity = maxTotalCapacity

  for (let i = 0; i < numVaults; i++) {
    const isLastVault = i === numVaults - 1

    // Calculate capacity for this vault
    let capacity: number
    if (isLastVault) {
      // Last vault gets remaining capacity (at least 1)
      capacity = Math.max(1, Math.min(remainingCapacity, 3))
    } else {
      // Leave room for remaining vaults (each needs at least 1)
      const remainingVaults = numVaults - i - 1
      const maxForThisVault = Math.min(3, remainingCapacity - remainingVaults)
      capacity = Math.max(
        1,
        Math.min(maxForThisVault, Math.floor(Math.random() * 3) + 1)
      )
    }

    remainingCapacity -= capacity

    // Gold amount: 5-20 per vault
    const gold = Math.floor(Math.random() * 16) + 5

    vaults.push({
      id: i,
      gold,
      capacity,
    })
  }

  return vaults
}

/**
 * Check if total capacity constraint is satisfied
 */
export function validateVaults(vaults: Vault[], numPlayers: number): boolean {
  const totalCapacity = vaults.reduce((sum, v) => sum + v.capacity, 0)
  return totalCapacity < numPlayers
}
