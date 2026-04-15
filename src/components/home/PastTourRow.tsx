import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ban, Check, X } from 'lucide-react-native'
import { Tour, TourStatus } from '@/models/tour'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

type PastTourRowProps = {
  tour: Tour
  isLast: boolean
  memberNames: Record<string, string>
}

function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

type StatusIconConfig = {
  background: string
  iconColor: string
  label: string
  labelColor: string
}

function getStatusIconConfig(status: TourStatus): StatusIconConfig {
  if (status === 'done') {
    return {
      background: colors.primary + '26',
      iconColor: colors.primary,
      label: 'Fait',
      labelColor: colors.primary,
    }
  }
  if (status === 'cancelled') {
    return {
      background: colors.muted,
      iconColor: colors.mutedForeground,
      label: 'Annulé',
      labelColor: colors.mutedForeground,
    }
  }
  return {
    background: colors.destructive + '26',
    iconColor: colors.destructive,
    label: 'Non fait',
    labelColor: colors.destructive,
  }
}

function StatusIcon({ status }: { status: TourStatus }) {
  const config = getStatusIconConfig(status)
  return (
    <View style={[styles.iconSquare, { backgroundColor: config.background }]}>
      {status === 'done' && <Check size={16} color={config.iconColor} />}
      {status === 'cancelled' && <Ban size={16} color={config.iconColor} />}
      {status !== 'done' && status !== 'cancelled' && <X size={16} color={config.iconColor} />}
    </View>
  )
}

export default function PastTourRow({ tour, isLast, memberNames }: PastTourRowProps) {
  const router = useRouter()
  const config = getStatusIconConfig(tour.status)
  const memberNamesJoined = tour.responsibleMemberIds
    .map((userId) => memberNames[userId] ?? '?')
    .join(', ')

  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(`/(app)/tour/${tour.tourId}`)}
      >
        <StatusIcon status={tour.status} />

        <View style={styles.middleContent}>
          <Text style={styles.dateText}>{formatShortDate(tour.date)}</Text>
          <Text style={styles.memberNamesText}>{memberNamesJoined}</Text>
        </View>

        <Text style={[styles.statusLabel, { color: config.labelColor }]}>{config.label}</Text>
      </TouchableOpacity>
      {!isLast && <View style={styles.separator} />}
    </>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleContent: {
    flex: 1,
    gap: 2,
  },
  dateText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.foreground,
    textTransform: 'capitalize',
  },
  memberNamesText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
  },
  statusLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
})
