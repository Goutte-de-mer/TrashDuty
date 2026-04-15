import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { getColocById } from '@/datasources/remote/colocRemoteDataSource'
import { getMemberProfiles } from '@/datasources/remote/authRemoteDataSource'
import { fetchPastTours, saveTour as saveTourToRepository } from '@/repositories/tourRepository'
import { getAssignedMembers } from '@/usecases/tourAssignmentUseCase'
import { scheduleTourNotifications } from '@/services/notifications/notificationService'
import { UserProfile } from '@/models/userProfile'
import { Tour } from '@/models/tour'

function generateTourId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const randomValue = (Math.random() * 16) | 0
    const value = character === 'x' ? randomValue : (randomValue & 0x3) | 0x8
    return value.toString(16)
  })
}

type AddTourState = {
  colocMembers: UserProfile[]
  pastTours: Tour[]
  selectedDate: Date | null
  selectedMemberIds: string[]
  isLoadingMembers: boolean
  isSaving: boolean
  error: string | null
}

export function useAddTourViewModel(colocId: string) {
  const router = useRouter()

  const [state, setState] = useState<AddTourState>({
    colocMembers: [],
    pastTours: [],
    selectedDate: null,
    selectedMemberIds: [],
    isLoadingMembers: true,
    isSaving: false,
    error: null,
  })

  const loadColocData = useCallback(async () => {
    if (!colocId) return
    setState((previous) => ({ ...previous, isLoadingMembers: true, error: null }))
    try {
      const [coloc, pastTours] = await Promise.all([
        getColocById(colocId),
        fetchPastTours(colocId),
      ])
      const colocMembers = coloc !== null ? await getMemberProfiles(coloc.memberIds) : []
      setState((previous) => ({
        ...previous,
        colocMembers,
        pastTours,
        isLoadingMembers: false,
      }))
    } catch {
      setState((previous) => ({
        ...previous,
        isLoadingMembers: false,
        error: 'Impossible de charger les membres. Réessaie.',
      }))
    }
  }, [colocId])

  useEffect(() => {
    loadColocData()
  }, [loadColocData])

  const setSelectedDate = (date: Date | null) => {
    setState((previous) => ({ ...previous, selectedDate: date }))
  }

  const toggleMember = (member: UserProfile) => {
    setState((previous) => {
      const isAlreadySelected = previous.selectedMemberIds.includes(member.userId)
      const updatedIds = isAlreadySelected
        ? previous.selectedMemberIds.filter((selectedId) => selectedId !== member.userId)
        : [...previous.selectedMemberIds, member.userId]
      return { ...previous, selectedMemberIds: updatedIds }
    })
  }

  const autoGenerateMembers = () => {
    if (state.selectedDate === null) return
    const numberOfMembersToAssign = Math.min(state.colocMembers.length, 3)
    const assignedMemberIds = getAssignedMembers(
      state.colocMembers,
      state.pastTours,
      numberOfMembersToAssign,
      state.selectedDate
    )
    setState((previous) => ({ ...previous, selectedMemberIds: assignedMemberIds }))
  }

  const saveTour = async () => {
    if (state.selectedDate === null || state.selectedMemberIds.length === 0) return

    setState((previous) => ({ ...previous, isSaving: true, error: null }))
    try {
      const tourId = generateTourId()
      const newTour: Tour = {
        tourId,
        colocId,
        date: state.selectedDate.toISOString(),
        responsibleMemberIds: state.selectedMemberIds,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      await saveTourToRepository(newTour)
      await scheduleTourNotifications(tourId, state.selectedDate)


      router.replace('/(app)/(tabs)')
    } catch {
      setState((previous) => ({
        ...previous,
        isSaving: false,
        error: "Impossible d'enregistrer le tour. Réessaie.",
      }))
    }
  }

  const selectedMembers = state.colocMembers.filter((member) =>
    state.selectedMemberIds.includes(member.userId)
  )

  return {
    colocMembers: state.colocMembers,
    selectedDate: state.selectedDate,
    selectedMembers,
    selectedMemberIds: state.selectedMemberIds,
    isLoadingMembers: state.isLoadingMembers,
    isSaving: state.isSaving,
    error: state.error,
    setSelectedDate,
    toggleMember,
    autoGenerateMembers,
    saveTour,
  }
}
