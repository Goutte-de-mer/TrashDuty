import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Tour } from '@/models/tour'
import StatusBadge from '@/components/shared/StatusBadge'
import MemberAvatar from '@/components/shared/MemberAvatar'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

type TourCardProps = {
  tour: Tour
  memberNames: Record<string, string>
}

function formatTourDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function TourCard({ tour, memberNames }: TourCardProps) {
  const router = useRouter()
  const memberCount = tour.responsibleMemberIds.length
  const memberNamesJoined = tour.responsibleMemberIds
    .map((userId) => memberNames[userId] ?? '?')
    .join(', ')

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(app)/tour/${tour.tourId}`)}
    >
      <View style={styles.topRow}>
        <View style={styles.dateAndBadge}>
          <Text style={styles.dateText}>{formatTourDate(tour.date)}</Text>
          <StatusBadge tourDate={tour.date} tourStatus={tour.status} />
        </View>
        <ChevronRight size={20} color={colors.mutedForeground} />
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.avatarsRow}>
          {tour.responsibleMemberIds.map((userId, index) => (
            <View
              key={userId}
              style={[
                styles.avatarWrapper,
                index > 0 && styles.avatarOverlap,
                { zIndex: memberCount - index },
              ]}
            >
              <MemberAvatar name={memberNames[userId] ?? '?'} index={index} size="sm" />
            </View>
          ))}
        </View>
        <Text style={styles.memberNamesText}>{memberNamesJoined}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateAndBadge: {
    gap: 6,
  },
  dateText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.foreground,
    textTransform: 'capitalize',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarsRow: {
    flexDirection: 'row',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: colors.card,
    borderRadius: 99,
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  memberNamesText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
    flexShrink: 1,
  },
})
