import { useCallback, useEffect, useState } from 'react'
import * as Clipboard from 'expo-clipboard'
import { getUserProfileDocument } from '@/datasources/remote/authRemoteDataSource'
import { getColocById } from '@/datasources/remote/colocRemoteDataSource'
import { getMemberProfiles } from '@/datasources/remote/authRemoteDataSource'
import {
  updateAvailability,
  removeMemberFromColoc,
  leaveColoc as leaveColocUseCase,
} from '@/usecases/settingsUseCase'
import { logoutUser } from '@/usecases/authUseCase'
import { UserProfile } from '@/models/userProfile'
import { Coloc } from '@/models/coloc'

type SettingsState = {
  currentUser: UserProfile | null
  coloc: Coloc | null
  colocMembers: UserProfile[]
  isAvailable: boolean
  unavailableUntilDate: string | null
  isLoading: boolean
  error: string | null
  codeCopiedFeedback: boolean
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useSettingsViewModel(
  userId: string,
  userName: string,
  colocId: string | null,
  refreshUserProfile: () => Promise<void>
) {
  const [state, setState] = useState<SettingsState>({
    currentUser: null,
    coloc: null,
    colocMembers: [],
    isAvailable: true,
    unavailableUntilDate: null,
    isLoading: true,
    error: null,
    codeCopiedFeedback: false,
  })

  const loadData = useCallback(async () => {
    if (!userId) return
    setState((previous) => ({ ...previous, isLoading: true, error: null }))
    try {
      const currentUser = await getUserProfileDocument(userId)

      let coloc: Coloc | null = null
      let colocMembers: UserProfile[] = []
      if (colocId !== null) {
        coloc = await getColocById(colocId)
        if (coloc !== null) {
          colocMembers = await getMemberProfiles(coloc.memberIds)
        }
      }

      setState((previous) => ({
        ...previous,
        currentUser,
        coloc,
        colocMembers,
        isAvailable: currentUser?.isAvailable ?? true,
        unavailableUntilDate: currentUser?.unavailableUntilDate ?? null,
        isLoading: false,
      }))
    } catch {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: 'Impossible de charger les paramètres. Réessaie.',
      }))
    }
  }, [userId, colocId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const setAvailability = async (value: boolean) => {
    if (value) {
      // Becoming available: clear the date both locally and in Firestore
      setState((previous) => ({ ...previous, isAvailable: true, unavailableUntilDate: null }))
      await updateAvailability(userId, true, null)
    } else {
      setState((previous) => ({ ...previous, isAvailable: false }))
      await updateAvailability(userId, false, null)
    }
  }

  const setUnavailableUntilDate = async (date: Date | null) => {
    const dateString = date !== null ? toLocalDateString(date) : null
    setState((previous) => ({ ...previous, unavailableUntilDate: dateString }))
    // Date picker is only shown when !isAvailable, so isAvailable is always false here
    await updateAvailability(userId, false, dateString)
  }

  const copyColocCode = async () => {
    if (state.coloc === null) return
    try {
      await Clipboard.setStringAsync(state.coloc.code)
      setState((previous) => ({ ...previous, codeCopiedFeedback: true }))
      setTimeout(() => {
        setState((previous) => ({ ...previous, codeCopiedFeedback: false }))
      }, 2000)
    } catch {
      // Fail silently
    }
  }

  const removeMember = async (memberUserId: string) => {
    if (colocId === null) return
    const memberProfile = state.colocMembers.find((member) => member.userId === memberUserId)
    const memberName = memberProfile?.name ?? memberUserId
    await removeMemberFromColoc(colocId, memberUserId, memberName, userId, userName)
    setState((previous) => ({
      ...previous,
      colocMembers: previous.colocMembers.filter((member) => member.userId !== memberUserId),
    }))
  }

  const leaveColoc = async () => {
    if (colocId === null) return
    await leaveColocUseCase(colocId, userId, userName)
    await refreshUserProfile()
  }

  const signOut = async () => {
    await logoutUser()
    // _layout.tsx detects auth state change and redirects automatically
  }

  return {
    ...state,
    setAvailability,
    setUnavailableUntilDate,
    copyColocCode,
    removeMember,
    leaveColoc,
    signOut,
  }
}
