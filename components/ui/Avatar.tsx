import { Image } from 'expo-image'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'

import type { AvatarSize } from '@/types'

// ─── background colour from name ─── //

const PALETTE = [
  '#14532D', // primary   (dark green)
  '#1E3A8A', // secondary (dark blue)
  '#166534', // green-800
  '#1D4ED8', // blue-700
  '#374151', // gray-700
  '#065F46', // emerald-800
]

function pickColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}


const containerSize: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 72,
  xl: 96,
}

const fontSize: Record<AvatarSize, number> = {
  sm: 12,
  md: 18,
  lg: 26,
  xl: 36,
}

// ─── Props ─── //

interface AvatarProps {
  name: string            // initials fallback & colour seed
  imageUrl?: string       // renders the image if provided
  size?: AvatarSize
  className?: string
}


export default function Avatar({ name, imageUrl, size = 'md', className = '' }: AvatarProps) {
  const dim = containerSize[size]
  const fSize = fontSize[size]
  const initials = useMemo(() => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }, [name])

  const bgColor = useMemo(() => pickColor(name), [name])

  return (
    <View
      className={`items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: dim, height: dim, backgroundColor: bgColor }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          contentFit="cover"
          style={{ width: dim, height: dim, borderRadius: dim / 2 }}
          transition={200}
        />
      ) : (
        <Text
          style={{ fontSize: fSize, color: '#ffffff', fontWeight: '700' }}
        >
          {initials}
        </Text>
      )}
    </View>
  )
}
