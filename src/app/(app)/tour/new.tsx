import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useRouter } from 'expo-router'
import { ArrowLeft, Check, Shuffle, X } from 'lucide-react-native'
import { useAuth } from '@/context/AuthContext'
import { useAddTourViewModel } from '@/viewmodels/addTourViewModel'
import MemberAvatar from '@/components/shared/MemberAvatar'
import { colors } from '@/theme/colors'
import { globalStyles } from '@/styles/globalStyles'
import { typography } from '@/theme/typography'
import { UserProfile } from '@/models/userProfile'

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function NewTourScreen() {
  const router = useRouter()
  const { colocId } = useAuth()
  const viewModel = useAddTourViewModel(colocId ?? '')

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date>(new Date())

  const today = new Date()

  const handleOpenDatePicker = () => {
    setPendingDate(viewModel.selectedDate ?? today)
    setIsDatePickerVisible(true)
  }

  const handleAndroidDateChange = (_event: unknown, date?: Date) => {
    setIsDatePickerVisible(false)
    if (date !== undefined) {
      viewModel.setSelectedDate(date)
    }
  }

  const handleIosDateChange = (_event: unknown, date?: Date) => {
    if (date !== undefined) {
      setPendingDate(date)
    }
  }

  const handleIosConfirm = () => {
    viewModel.setSelectedDate(pendingDate)
    setIsDatePickerVisible(false)
  }

  const canSave = viewModel.selectedDate !== null && viewModel.selectedMemberIds.length > 0

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={18} color={colors.mutedForeground} />
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      <Text style={[globalStyles.h2, styles.screenTitle]}>Nouveau tour</Text>

      {/* Date section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Date du tour</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={handleOpenDatePicker}>
          <Text
            style={[
              styles.datePickerButtonText,
              viewModel.selectedDate === null && styles.datePickerPlaceholder,
            ]}
          >
            {viewModel.selectedDate !== null
              ? formatDate(viewModel.selectedDate)
              : 'Choisir une date'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Members section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>
            Responsables ({viewModel.selectedMemberIds.length}/3)
          </Text>
          {viewModel.selectedDate !== null && (
            <TouchableOpacity style={styles.autoGenerateButton} onPress={viewModel.autoGenerateMembers}>
              <Shuffle size={14} color={colors.primary} />
              <Text style={styles.autoGenerateButtonText}>Générer auto</Text>
            </TouchableOpacity>
          )}
        </View>

        {viewModel.selectedDate === null ? (
          <View style={styles.dateMissingCard}>
            <Text style={styles.dateMissingText}>Choisis d'abord une date pour sélectionner les responsables</Text>
          </View>
        ) : (
          <>
            {viewModel.selectedMembers.length > 0 && (
              <View style={styles.selectedMembersChips}>
                {viewModel.selectedMembers.map((member, index) => (
                  <SelectedMemberChip
                    key={member.userId}
                    member={member}
                    index={index}
                    onRemove={() => viewModel.toggleMember(member)}
                  />
                ))}
              </View>
            )}

            <View style={styles.membersCard}>
              {viewModel.colocMembers.length === 0 && !viewModel.isLoadingMembers && (
                <Text style={styles.emptyMembersText}>Aucun membre dans la coloc</Text>
              )}
              {viewModel.isLoadingMembers && (
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.membersLoadingIndicator}
                />
              )}
              {viewModel.colocMembers.map((member, index) => {
                const isSelected = viewModel.selectedMemberIds.includes(member.userId)
                const isLast = index === viewModel.colocMembers.length - 1
                return (
                  <MemberRow
                    key={member.userId}
                    member={member}
                    index={index}
                    isSelected={isSelected}
                    isLast={isLast}
                    onPress={() => viewModel.toggleMember(member)}
                  />
                )
              })}
            </View>
          </>
        )}
      </View>

      {viewModel.error !== null && (
        <Text style={styles.errorText}>{viewModel.error}</Text>
      )}

      <TouchableOpacity
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        onPress={viewModel.saveTour}
        disabled={!canSave || viewModel.isSaving}
      >
        {viewModel.isSaving ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Text style={styles.saveButtonText}>
            {viewModel.isSaving ? 'Enregistrement...' : 'Enregistrer le tour'}
          </Text>
        )}
      </TouchableOpacity>

      {/* iOS date picker modal */}
      {Platform.OS === 'ios' && isDatePickerVisible && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={pendingDate}
                mode="date"
                display="inline"
                minimumDate={today}
                onChange={handleIosDateChange}
                accentColor={colors.primary}
              />
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleIosConfirm}>
                <Text style={styles.modalConfirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Android date picker (renders directly) */}
      {Platform.OS === 'android' && isDatePickerVisible && (
        <DateTimePicker
          value={pendingDate}
          mode="date"
          minimumDate={today}
          onChange={handleAndroidDateChange}
        />
      )}
    </ScrollView>
  )
}

type SelectedMemberChipProps = {
  member: UserProfile
  index: number
  onRemove: () => void
}

function SelectedMemberChip({ member, index, onRemove }: SelectedMemberChipProps) {
  return (
    <View style={styles.chip}>
      <MemberAvatar name={member.name} index={index} size="sm" />
      <Text style={[globalStyles.textSemiBold, styles.chipName]}>{member.name}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={8}>
        <X size={14} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  )
}

type MemberRowProps = {
  member: UserProfile
  index: number
  isSelected: boolean
  isLast: boolean
  onPress: () => void
}

function MemberRow({ member, index, isSelected, isLast, onPress }: MemberRowProps) {
  return (
    <>
      <TouchableOpacity
        style={[styles.memberRow, isSelected && styles.memberRowSelected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.memberRowLeft}>
          <MemberAvatar name={member.name} index={index} size="md" />
          <Text style={styles.memberRowName}>{member.name}</Text>
        </View>
        <View style={[styles.selectionCircle, isSelected && styles.selectionCircleSelected]}>
          {isSelected && <Check size={12} color={colors.primaryForeground} strokeWidth={3} />}
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.memberRowSeparator} />}
    </>
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
    gap: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 0,
  },
  backButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.mutedForeground,
  },
  screenTitle: {
    color: colors.foreground,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoGenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  autoGenerateButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  autoGenerateButtonDisabled: {
    opacity: 0.4,
  },
  autoGenerateButtonTextDisabled: {
    color: colors.mutedForeground,
  },
  sectionDisabled: {
    opacity: 0.5,
  },
  dateMissingHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
    fontStyle: 'italic',
  },
  dateMissingCard: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dateMissingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  datePickerButton: {
    height: 48,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  datePickerButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.foreground,
  },
  datePickerPlaceholder: {
    color: colors.mutedForeground,
  },
  selectedMembersChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.primary + '1A',
  },
  chipName: {
    fontSize: typography.fontSize.sm,
    color: colors.foreground,
  },
  membersCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyMembersText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.mutedForeground,
    textAlign: 'center',
    paddingVertical: 24,
  },
  membersLoadingIndicator: {
    paddingVertical: 24,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memberRowSelected: {
    backgroundColor: colors.primary + '0D',
  },
  memberRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberRowName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.foreground,
  },
  memberRowSeparator: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
    marginHorizontal: 16,
  },
  selectionCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.destructive,
    textAlign: 'center',
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.primaryForeground,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    gap: 16,
    width: '90%',
  },
  modalConfirmButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.primaryForeground,
  },
})
