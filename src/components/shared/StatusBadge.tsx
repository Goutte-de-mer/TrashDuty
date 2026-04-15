import { StyleSheet, Text, View } from 'react-native'
import { getTourStatusBadge } from '@/usecases/tourStatusUseCase'
import { TourStatus } from '@/models/tour'
import { typography } from '@/theme/typography'

type StatusBadgeProps = {
  tourDate: string
  tourStatus: TourStatus
}

export default function StatusBadge({ tourDate, tourStatus }: StatusBadgeProps) {
  const badge = getTourStatusBadge(tourDate, tourStatus)

  return (
    <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
      <Text style={[styles.label, { color: badge.color }]}>{badge.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
  },
})
