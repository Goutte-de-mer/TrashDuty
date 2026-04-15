import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useState } from 'react'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { ArrowRight, Recycle, Users } from 'lucide-react-native'
import { useAuth } from '@/context/AuthContext'
import { createColoc, joinColoc } from '@/usecases/colocUseCase'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

type OnboardingStep = 'choice' | 'create' | 'join'

export default function WelcomeScreen() {
  const { userId, refreshUserProfile, logout } = useAuth()

  const [step, setStep] = useState<OnboardingStep>('choice')
  const [colocName, setColocName] = useState('')
  const [colocCode, setColocCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateColoc = async () => {
    if (userId === null || colocName.trim() === '') return

    setError(null)
    setIsLoading(true)
    try {
      await createColoc(colocName.trim(), userId)
      await refreshUserProfile()
    } catch {
      setError('Impossible de créer la coloc. Réessaie.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinColoc = async () => {
    if (userId === null || colocCode.trim().length < COLOC_CODE_LENGTH) return

    setError(null)
    setIsLoading(true)
    try {
      await joinColoc(colocCode.trim(), userId)
      await refreshUserProfile()
    } catch (joinError: unknown) {
      const message =
        joinError instanceof Error ? joinError.message : 'Impossible de rejoindre la coloc.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    setError(null)
    setColocName('')
    setColocCode('')
    setStep('choice')
  }

  if (step === 'create') {
    return (
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.wrapper}>
        <KeyboardAvoidingView
          style={styles.wrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
            <Text style={styles.formTitle}>Créer une coloc</Text>
            <Text style={styles.formSubtitle}>Choisis un nom pour ta colocation.</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nom de la coloc</Text>
              <TextInput
                style={styles.input}
                value={colocName}
                onChangeText={setColocName}
                placeholder="Ex : Les Colocs du 12"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {error !== null && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || colocName.trim() === '') && styles.buttonDisabled,
              ]}
              onPress={handleCreateColoc}
              disabled={isLoading || colocName.trim() === ''}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.buttonText}>Créer la coloc</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={goBack} disabled={isLoading}>
              <Text style={styles.backText}>← Retour</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    )
  }

  if (step === 'join') {
    return (
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.wrapper}>
        <KeyboardAvoidingView
          style={styles.wrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
            <Text style={styles.formTitle}>Rejoindre une coloc</Text>
            <Text style={styles.formSubtitle}>Entre le code à 5 caractères donné par ton colocataire.</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Code de la coloc</Text>
              <TextInput
                style={styles.codeInput}
                value={colocCode}
                onChangeText={(text) => setColocCode(text.toUpperCase())}
                placeholder="XXXXX"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={COLOC_CODE_LENGTH}
                editable={!isLoading}
              />
            </View>

            {error !== null && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || colocCode.trim().length < COLOC_CODE_LENGTH) && styles.buttonDisabled,
              ]}
              onPress={handleJoinColoc}
              disabled={isLoading || colocCode.trim().length < COLOC_CODE_LENGTH}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.buttonText}>Rejoindre</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={goBack} disabled={isLoading}>
              <Text style={styles.backText}>← Retour</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.choiceContainer}>
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <Recycle size={20} color={colors.primary} />
          </View>
          <Text style={styles.appName}>TrashDuty</Text>
          <Text style={styles.appTagline}>Gérez les tours de verre en coloc sans prise de tête.</Text>
        </View>

        <View style={styles.cards}>
          <TouchableOpacity style={styles.card} onPress={() => setStep('create')} activeOpacity={0.85}>
            <View style={[styles.cardIconWrapper, styles.cardIconWrapperPrimary]}>
              <Users size={24} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Créer une coloc</Text>
              <Text style={styles.cardSubtitle}>Invite tes colocataires avec un code</Text>
            </View>
            <ArrowRight size={20} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setStep('join')} activeOpacity={0.85}>
            <View style={[styles.cardIconWrapper, styles.cardIconWrapperAccent]}>
              <ArrowRight size={24} color={colors.accent} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Rejoindre une coloc</Text>
              <Text style={styles.cardSubtitle}>Entre le code donné par ton colocataire</Text>
            </View>
            <ArrowRight size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  )
}

const COLOC_CODE_LENGTH = 5

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  choiceContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 40,
  },
  header: {
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary + '26',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appName: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
  },
  appTagline: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  cards: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconWrapperPrimary: {
    backgroundColor: colors.primary + '26',
  },
  cardIconWrapperAccent: {
    backgroundColor: colors.accent + '33',
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
  },
  cardSubtitle: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 16,
  },
  formTitle: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    marginBottom: 4,
  },
  formSubtitle: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    marginBottom: 8,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  input: {
    height: 48,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.foreground,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
  },
  codeInput: {
    height: 48,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.foreground,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    textAlign: 'center',
    letterSpacing: 6,
  },
  errorText: {
    color: colors.destructive,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  button: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
  },
  backText: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginTop: 4,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
})
