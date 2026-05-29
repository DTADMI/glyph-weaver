import { type FC } from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: number
  variant?: 'text' | 'rect' | 'circle'
  count?: number
}

const baseStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #222 25%, #2a2a3e 50%, #222 75%)',
  backgroundSize: '200% 100%',
  animation: 'gw-shimmer 1.5s ease-in-out infinite',
}

const textStyle: React.CSSProperties = {
  ...baseStyle,
  height: '14px',
  borderRadius: '4px',
  marginBottom: '8px',
}

const rectStyle: React.CSSProperties = {
  ...baseStyle,
  borderRadius: '6px',
}

const circleStyle: React.CSSProperties = {
  ...baseStyle,
  borderRadius: '50%',
}

export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height,
  borderRadius,
  variant = 'rect',
  count = 1,
}) => {
  const variantStyle =
    variant === 'text' ? textStyle
    : variant === 'circle' ? circleStyle
    : rectStyle

  const finalStyle: React.CSSProperties = {
    ...variantStyle,
    width,
    ...(height !== undefined && { height }),
    ...(borderRadius !== undefined && { borderRadius }),
  }

  if (variant === 'circle' && height === undefined) {
    const w = typeof width === 'number' ? width : 40
    finalStyle.width = w
    finalStyle.height = w
  }

  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} style={finalStyle} />
  ))

  return <>{items}</>
}

export const PanelSkeleton: FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div style={{ padding: '16px' }}>
    <Skeleton variant="text" width="60%" height="18px" />
    <div style={{ height: '12px' }} />
    {Array.from({ length: rows }, (_, i) => (
      <Skeleton key={i} variant="text" />
    ))}
  </div>
)

export const CanvasSkeleton: FC<{ width?: number; height?: number }> = ({
  width = 500,
  height = 400,
}) => (
  <div
    style={{
      width,
      height,
      border: '2px solid #333',
      borderRadius: '4px',
      overflow: 'hidden',
    }}
  >
    <div style={{ ...baseStyle, width: '100%', height: '100%' }} />
  </div>
)

export const DictionarySkeleton: FC<{ entries?: number }> = ({ entries = 3 }) => (
  <div style={{ padding: '12px' }}>
    {Array.from({ length: entries }, (_, i) => (
      <div key={i} style={{ marginBottom: '16px' }}>
        <Skeleton variant="text" width="40%" height="16px" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="70%" />
      </div>
    ))}
  </div>
)
