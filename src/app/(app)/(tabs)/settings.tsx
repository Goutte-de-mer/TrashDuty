import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { CalendarDays, Copy, DoorOpen, LogOut, User, UserMinus } from 'lucide-react-native'
import { useAuth } from '@/context/AuthContext'
import { useSettingsViewModel } from '@/viewmodels/settingsViewModel'
import MemberAvatar from '@/components/shared/MemberAvatar'
import { colors } from '@/theme/colors'
import { globalStyles } from '@/styles/globalStyles'
import { typography } from '@/theme/typography'

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function SettingsScreen() {
  const { userId, userName, userEmail, colocId, refreshUserProfile } = useAuth()
  const viewModel = useSettingsViewModel(userId ?? '', userName ?? '', colocId, refreshUserProfile)

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date>(new Date())

  const today = new Date()

  const handleOpenDatePicker = () => {
    const currentDate = viewModel.unavailableUntilDate !== null
      ? new Date(viewModel.unavailableUntilDate)
      : today
    setPendingDate(currentDate)
    setIsDatePickerVisible(true)
  }

  const handleAndroidDateChange = (_event: unknown, date?: Date) => {
    setIsDatePickerVisible(false)
    if (date !== undefined) {
      viewModel.setUnavailableUntilDate(date)
    }
  }

  const handleIosDateChange = (_event: unknown, date?: Date) => {
    if (date !== undefined) {
      setPendingDate(date)
    }
  }

  const handleIosConfirm = () => {
    viewModel.setUnavailableUntilDate(pendingDate)
    setIsDatePickerVisible(false)
  }

  const handleRemoveMember = (memberUserId: string, memberName: string) => {
    Alert.alert(
      `Retirer ${memberName} ?`,
      `${memberName} sera retiré de la coloc et de tous les tours à venir.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => viewModel.removeMember(memberUserId),
        },
      ]
    )
  }

  const handleLeaveColoc = () => {
    Alert.alert(
      'Quitter la coloc ?',
      'Tu seras retiré de la coloc et de tous les tours à venir.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => viewModel.leaveColoc(),
        },
      ]
    )
  }

  const handleSignOut = () => {
    Alert.alert(
      'Se déconnecter ?',
      "Tu devras te reconnecter pour accéder à l'application.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => viewModel.signOut(),
        },
      ]
    )
  }

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[globalStyles.h2, styles.screenTitle]}>Réglages</Text>

      {/* User info card */}
      <View style={styles.card}>
        <View style={styles.userInfoRow}>
          <View style={styles.userIconWrapper}>
            <User size={22} color={colors.primary} />
          </View>
          <View style={styles.userInfoText}>
            <Text style={globalStyles.textSemiBold}>{userName ?? '—'}</Text>
            <Text style={[globalStyles.textSmall, { color: colors.mutedForeground }]}>
              {userEmail ?? '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Availability card */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Disponibilité</Text>

        <View style={styles.availabilityRow}>
          <View>
            <Text style={[globalStyles.textSemiBold, { color: colors.foreground }]}>
              {viewModel.isAvailable ? 'Disponible' : 'Indisponible'}
            </Text>
            <Text style={[globalStyles.textSmall, { color: colors.mutedForeground }]}>
              {viewModel.isAvailable
                ? 'Tu peux être désigné'
                : 'Tu ne seras pas désigné'}
            </Text>
          </View>
          <Switch
            value={viewModel.isAvailable}
            onValueChange={viewModel.setAvailability}
            trackColor={{ false: colors.input, true: colors.primary }}
            thumbColor={colors.primaryForeground}
          />
        </View>

        {!viewModel.isAvailable && (
          <TouchableOpacity style={styles.dateButton} onPress={handleOpenDatePicker}>
            <CalendarDays size={16} color={colors.mutedForeground} />
            <Text style={styles.dateButtonText}>
              {viewModel.unavailableUntilDate !== null
                ? `Jusqu'au ${formatDate(viewModel.unavailableUntilDate)}`
                : 'Indéterminée'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Coloc card */}
      {colocId !== null && viewModel.coloc !== null && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Ma coloc</Text>
          <Text style={globalStyles.textSemiBold}>{viewModel.coloc.name}</Text>

          <View style={styles.codeRow}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{viewModel.coloc.code}</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={viewModel.copyColocCode}>
              <Copy size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {viewModel.codeCopiedFeedback && (
            <Text style={styles.codeCopiedText}>Code copié !</Text>
          )}

          <View style={styles.membersList}>
            {viewModel.colocMembers.map((member, index) => {
              const isUnavailable = !member.isAvailable
              return (
                <View key={member.userId} style={styles.memberRow}>
                  <View style={styles.memberRowLeft}>
                    <MemberAvatar name={member.name} index={index} size="sm" />
                    <View>
                      <Text style={[globalStyles.textSemiBold, { color: colors.foreground }]}>
                        {member.name}
                      </Text>
                      {isUnavailable && (
                        <Text style={styles.unavailableLabel}>
                          {member.unavailableUntilDate !== null
                            ? `Indisponible jusqu'au ${formatDate(member.unavailableUntilDate)}`
                            : 'Indisponible'}
                        </Text>
                      )}
                    </View>
                  </View>
                  {member.userId !== userId && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member.userId, member.name)}
                      hitSlop={8}
                    >
                      <UserMinus size={18} color={colors.destructive} />
                    </TouchableOpacity>
                  )}
                </View>
              )
            })}
          </View>
        </View>
      )}

      {/* Leave coloc button */}
      {colocId !== null && (
        <TouchableOpacity style={styles.leaveColocButton} onPress={handleLeaveColoc}>
          <DoorOpen size={18} color={styles.leaveColocButtonText.color} />
          <Text style={styles.leaveColocButtonText}>Quitter la coloc</Text>
        </TouchableOpacity>
      )}

      {/* Sign out button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={18} color={colors.destructive} />
        <Text style={styles.signOutButtonText}>Se déconnecter</Text>
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

      {/* Android date picker */}
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

const LEAVE_COLOC_COLOR = '#EA580C'
const LEAVE_COLOC_BORDER = '#FED7AA'

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    gap: 16,
  },
  screenTitle: {
    color: colors.foreground,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  userIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary + '26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoText: {
    gap: 2,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    backgroundColor: colors.muted,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  dateButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBox: {
    flex: 1,
    height: 40,
    backgroundColor: colors.muted,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
    color: colors.foreground,
    letterSpacing: 6,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeCopiedText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  membersList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  unavailableLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
    marginTop: 1,
  },
  leaveColocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LEAVE_COLOC_BORDER,
  },
  leaveColocButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: LEAVE_COLOC_COLOR,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.destructive + '33',
  },
  signOutButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.destructive,
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
    width: '90%',
    gap: 16,
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
