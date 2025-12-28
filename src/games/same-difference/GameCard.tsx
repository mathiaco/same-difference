import type { FC } from 'react'

type Shape = 'triangle' | 'circle' | 'square'
type Color = 'red' | 'blue' | 'green'
type Background = 'black' | 'white' | 'grey'

interface Card {
  id: number
  shape: Shape
  color: Color
  bg: Background
}

interface GameCardProps {
  card: Card
  isSelected: boolean
  onClick: () => void
}

const COLOR_MAP: Record<Color, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
}

function ShapeSVG({ shape, color }: { shape: Shape; color: Color }) {
  const fill = COLOR_MAP[color]

  if (shape === 'circle') {
    return (
      <svg viewBox='0 0 40 40' className='w-10 h-10'>
        <circle cx='20' cy='20' r='16' fill={fill} />
      </svg>
    )
  }

  if (shape === 'square') {
    return (
      <svg viewBox='0 0 40 40' className='w-10 h-10'>
        <rect x='4' y='4' width='32' height='32' fill={fill} />
      </svg>
    )
  }

  // triangle
  return (
    <svg viewBox='0 0 40 40' className='w-10 h-10'>
      <polygon points='20,4 36,36 4,36' fill={fill} />
    </svg>
  )
}

const BG_COLOR_MAP: Record<Background, string> = {
  black: '#1f2937',
  white: '#f9fafb',
  grey: '#9ca3af',
}

export const GameCard: FC<GameCardProps> = ({ card, isSelected, onClick }) => {
  const bgColor = BG_COLOR_MAP[card.bg]
  const borderClass = isSelected
    ? 'border-yellow-400 ring-2 ring-yellow-400 scale-105'
    : 'border-gray-400'

  // Determine text color based on background for contrast
  const textColor = card.bg === 'white' ? '#374151' : '#f9fafb'

  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: bgColor }}
      className={`
        h-24 w-full rounded-xl border-2 flex flex-col items-center justify-center relative
        transition-all duration-150 ease-out
        ${borderClass}
      `}
    >
      <span
        style={{ color: textColor }}
        className='absolute top-1 left-2 text-xs font-bold'
      >
        {card.id + 1}
      </span>
      <ShapeSVG shape={card.shape} color={card.color} />
    </button>
  )
}

export default GameCard
