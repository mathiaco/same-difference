# Same Or Different

A two-player card matching game inspired by The Genius.

## Setup

- 9 cards displayed in a 3×3 grid, numbered 1-9
- Each card has 3 properties:
  - **Shape**: triangle, circle, or square
  - **Color**: red, blue, or green
  - **Background**: black, white, or grey
- 2 players take turns

## Valid Set

A valid set of 3 cards must satisfy this rule for **each property**:

- All 3 cards have the **same** value, OR
- All 3 cards have **different** values

### Examples

- ✅ Same shape, same color, all different backgrounds → Valid
- ✅ All different shapes, all different colors, same background → Valid
- ❌ 2 circles + 1 square (neither all same nor all different) → Invalid

## Actions

| Action                   | Result                       |
| ------------------------ | ---------------------------- |
| **Submit valid set**     | +1 point, set recorded       |
| **Submit invalid set**   | -1 point                     |
| **Submit duplicate set** | No point change, turn passes |
| **Complete! (correct)**  | +3 points, game ends         |
| **Complete! (wrong)**    | -2 points                    |

## Timer & Turn Rules

- Each player has **30 seconds** per turn
- If time runs out without an attempt → turn passes to next player
- After **6 timeouts** (turns with no attempt) → game ends

## Game Over Conditions

1. A player correctly calls "Complete!" (no valid sets remain)
2. 6 turns pass without any attempts

## New Round

- Generates 9 new cards
- Resets scores to 0-0
- Clears found sets
- Resets turn counter

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```
