import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

type AvatarSize = 'sm' | 'md' | 'lg'

type MemberAvatarProps = {
  name: string
  index: number
  size?: AvatarSize
}

const AVATAR_PALETTE = [
  { background: colors.primary + '33', text: colors.primary },
  { background: colors.accent + '33', text: colors.accent },
  { background: colors.chart4 + '33', text: colors.chart4 },
  { background: colors.chart5 + '33', text: colors.chart5 },
  { background: colors.chart3 + '33', text: colors.chart3 },
]

const AVATAR_SIZES: Record<AvatarSize, number> = {
  sm: 28,
  md: 36,
  lg: 44,
}

export default function MemberAvatar({ name, index, size = 'md' }: MemberAvatarProps) {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length]
  const diameter = AVATAR_SIZES[size]
  const initial = name.trim().charAt(0).toUpperCase()

  return (
    <View
      style={[
        styles.circle,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: palette.background,
        },
      ]}
    >
      <Text style={[styles.initial, { color: palette.text }]}>{initial}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
})
