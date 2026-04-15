import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Ban, Check, Plus, RefreshCw, Trash2 } from 'lucide-react-native'
import { useAuth } from '@/context/AuthContext'
import { useTourDetailViewModel } from '@/viewmodels/tourDetailViewModel'
import StatusBadge from '@/components/shared/StatusBadge'
import MemberAvatar from '@/components/shared/MemberAvatar'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

function formatDetailDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatJournalDate(isoDate: string): string {
  const date = new Date(isoDate)
  const day = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}

function SkeletonBlock({ height }: { height: number }) {
  return <View style={[styles.skeleton, { height }]} />
}

export default function TourDetailScreen() {
  const router = useRouter()
  const { tourId } = useLocalSearchParams<{ tourId: string }>()
  const { colocId, userId, userName } = useAuth()

  const viewModel = useTourDetailViewModel(
    tourId ?? '',
    colocId ?? '',
    userId ?? '',
    userName ?? ''
  )

  const {
    tour,
    journalEntries,
    members,
    isLoading,
    error,
    isMarkingDone,
    isCancellingTour,
    isRegeneratingMember,
    isRemovingMember,
    isAddingMember,
  } = viewModel

  const isAnyActionInProgress = isMarkingDone || isCancellingTour || isRegeneratingMember || isRemovingMember || isAddingMember

  if (isLoading) {
    return (
      <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
        <SkeletonBlock height={32} />
        <SkeletonBlock height={96} />
        <SkeletonBlock height={160} />
      </ScrollView>
    )
  }

  if (error !== null || tour === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Tour introuvable.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={viewModel.retry}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={18} color={colors.mutedForeground} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      <View style={styles.headerSection}>
        <Text style={styles.dateHeading}>{formatDetailDate(tour.date)}</Text>
        <StatusBadge tourDate={tour.date} tourStatus={tour.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Responsables</Text>
        <View style={styles.membersList}>
          {tour.responsibleMemberIds.map((memberId, index) => {
            const member = members.find((m) => m.userId === memberId)
            const memberName = member?.name ?? memberId
            return (
              <View key={memberId} style={styles.memberRow}>
                <View style={styles.memberIdentity}>
                  <MemberAvatar name={memberName} index={index} size="md" />
                  <Text style={styles.memberName}>{memberName}</Text>
                </View>
                {tour.status === 'pending' && (
                  <View style={styles.memberActions}>
                    <TouchableOpacity
                      onPress={() => viewModel.regenerateMember(memberId)}
                      disabled={isAnyActionInProgress}
                      style={[styles.iconButton, isAnyActionInProgress && styles.disabled]}
                    >
                      {isRegeneratingMember ? (
                        <ActivityIndicator size="small" color={colors.mutedForeground} />
                      ) : (
                        <RefreshCw size={18} color={colors.mutedForeground} />
                      )}
                    </TouchableOpacity>
                    {tour.responsibleMemberIds.length > 1 && (
                      <TouchableOpacity
                        onPress={() => viewModel.removeMember(memberId)}
                        disabled={isAnyActionInProgress}
                        style={[styles.iconButton, isAnyActionInProgress && styles.disabled]}
                      >
                        {isRemovingMember ? (
                          <ActivityIndicator size="small" color={colors.destructive} />
                        ) : (
                          <Trash2 size={18} color={colors.destructive} />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )
          })}
        </View>

        {tour.status === 'pending' && (() => {
          const unassignedMembers = members.filter(
            (member) => !tour.responsibleMemberIds.includes(member.userId)
          )
          if (unassignedMembers.length === 0) return null
          return (
            <View style={styles.addMembersSection}>
              <Text style={styles.sectionTitle}>Ajouter un responsable</Text>
              {unassignedMembers.map((member, index) => (
                <TouchableOpacity
                  key={member.userId}
                  style={[styles.addMemberRow, isAnyActionInProgress && styles.disabled]}
                  onPress={() => viewModel.addMember(member.userId)}
                  disabled={isAnyActionInProgress}
                >
                  <View style={styles.memberIdentity}>
                    <MemberAvatar name={member.name} index={tour.responsibleMemberIds.length + index} size="md" />
                    <Text style={styles.memberName}>{member.name}</Text>
                  </View>
                  {isAddingMember
                    ? <ActivityIndicator size="small" color={colors.primary} />
                    : <Plus size={18} color={colors.primary} />
                  }
                </TouchableOpacity>
              ))}
            </View>
          )
        })()}
      </View>

      {tour.status === 'pending' && (
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.primaryButton, isAnyActionInProgress && styles.disabled]}
            onPress={viewModel.markTourAsDone}
            disabled={isAnyActionInProgress}
          >
            {isMarkingDone ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Check size={18} color={colors.primaryForeground} />
                <Text style={styles.primaryButtonText}>Marquer comme fait</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, isAnyActionInProgress && styles.disabled]}
            onPress={viewModel.cancelTour}
            disabled={isAnyActionInProgress}
          >
            {isCancellingTour ? (
              <ActivityIndicator color={colors.mutedForeground} />
            ) : (
              <>
                <Ban size={18} color={colors.mutedForeground} />
                <Text style={styles.secondaryButtonText}>Annuler ce tour</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {journalEntries.length > 0 && (
        <View style={styles.journalCard}>
          <Text style={styles.sectionTitle}>Journal des modifications</Text>
          {journalEntries.map((entry, index) => (
            <View key={entry.entryId}>
              <View style={styles.journalEntry}>
                <View style={styles.journalEntryTop}>
                  <Text style={styles.journalAuthor}>{entry.authorName}</Text>
                  <Text style={styles.journalAction}> {entry.action}</Text>
                </View>
                <Text style={styles.journalDate}>{formatJournalDate(entry.createdAt)}</Text>
              </View>
              {index < journalEntries.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    gap: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  skeleton: {
    borderRadius: 20,
    backgroundColor: colors.muted,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  backText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.mutedForeground,
  },
  headerSection: {
    gap: 8,
  },
  dateHeading: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    color: colors.foreground,
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  membersList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.foreground,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  actionsSection: {
    gap: 12,
  },
  primaryButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.primaryForeground,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.mutedForeground,
  },
  journalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  journalEntry: {
    paddingVertical: 12,
    gap: 4,
  },
  journalEntryTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  journalAuthor: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.foreground,
  },
  journalAction: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
  },
  journalDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  addMembersSection: {
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.primaryForeground,
  },
})
