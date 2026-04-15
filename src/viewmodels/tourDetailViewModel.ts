import { useCallback, useEffect, useState } from 'react'
import { getTourById, getJournalEntries } from '@/datasources/remote/tourRemoteDataSource'
import { getColocById } from '@/datasources/remote/colocRemoteDataSource'
import { getMemberProfiles } from '@/datasources/remote/authRemoteDataSource'
import { getPastTours } from '@/datasources/remote/tourRemoteDataSource'
import {
  markTourAsDone,
  cancelTour,
  addMember,
  removeMember,
  regenerateMember,
} from '@/usecases/tourDetailUseCase'
import { Tour, JournalEntry } from '@/models/tour'
import { UserProfile } from '@/models/userProfile'

type TourDetailState = {
  tour: Tour | null
  journalEntries: JournalEntry[]
  members: UserProfile[]
  pastTours: Tour[]
  isLoading: boolean
  error: string | null
  isMarkingDone: boolean
  isCancellingTour: boolean
  isRegeneratingMember: boolean
  isRemovingMember: boolean
  isAddingMember: boolean
}

export function useTourDetailViewModel(tourId: string, colocId: string, currentUserId: string, currentUserName: string) {
  const [state, setState] = useState<TourDetailState>({
    tour: null,
    journalEntries: [],
    members: [],
    pastTours: [],
    isLoading: true,
    error: null,
    isMarkingDone: false,
    isCancellingTour: false,
    isRegeneratingMember: false,
    isRemovingMember: false,
    isAddingMember: false,
  })

  const loadTourData = useCallback(async () => {
    setState((previous) => ({ ...previous, isLoading: true, error: null }))
    try {
      const [tour, journalEntries, coloc, pastTours] = await Promise.all([
        getTourById(tourId),
        getJournalEntries(tourId),
        getColocById(colocId),
        getPastTours(colocId),
      ])

      if (tour === null) {
        setState((previous) => ({ ...previous, isLoading: false, error: 'Tour introuvable.' }))
        return
      }

      const members = coloc !== null ? await getMemberProfiles(coloc.memberIds) : []

      setState((previous) => ({
        ...previous,
        tour,
        journalEntries,
        members,
        pastTours,
        isLoading: false,
      }))
    } catch {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: 'Impossible de charger le tour. Réessaie.',
      }))
    }
  }, [tourId, colocId])

  useEffect(() => {
    loadTourData()
  }, [loadTourData])

  const handleMarkTourAsDone = async () => {
    if (state.tour === null) return
    setState((previous) => ({ ...previous, isMarkingDone: true }))
    try {
      await markTourAsDone(tourId, currentUserId, currentUserName)
      const [updatedTour, updatedEntries] = await Promise.all([
        getTourById(tourId),
        getJournalEntries(tourId),
      ])
      setState((previous) => ({
        ...previous,
        tour: updatedTour ?? previous.tour,
        journalEntries: updatedEntries,
        isMarkingDone: false,
      }))
    } catch {
      setState((previous) => ({ ...previous, isMarkingDone: false }))
    }
  }

  const handleCancelTour = async () => {
    if (state.tour === null) return
    setState((previous) => ({ ...previous, isCancellingTour: true }))
    try {
      await cancelTour(tourId, currentUserId, currentUserName)
      const [updatedTour, updatedEntries] = await Promise.all([
        getTourById(tourId),
        getJournalEntries(tourId),
      ])
      setState((previous) => ({
        ...previous,
        tour: updatedTour ?? previous.tour,
        journalEntries: updatedEntries,
        isCancellingTour: false,
      }))
    } catch {
      setState((previous) => ({ ...previous, isCancellingTour: false }))
    }
  }

  const handleRemoveMember = async (memberUserId: string) => {
    if (state.tour === null) return
    setState((previous) => ({ ...previous, isRemovingMember: true }))
    try {
      const memberProfile = state.members.find((member) => member.userId === memberUserId)
      const memberName = memberProfile?.name ?? memberUserId
      const updatedMemberIds = await removeMember(
        tourId,
        memberUserId,
        memberName,
        state.tour.responsibleMemberIds,
        currentUserId,
        currentUserName
      )
      const updatedEntries = await getJournalEntries(tourId)
      setState((previous) => ({
        ...previous,
        tour: previous.tour !== null
          ? { ...previous.tour, responsibleMemberIds: updatedMemberIds }
          : null,
        journalEntries: updatedEntries,
        isRemovingMember: false,
      }))
    } catch {
      setState((previous) => ({ ...previous, isRemovingMember: false }))
    }
  }

  const handleRegenerateMember = async (memberUserIdToReplace: string) => {
    if (state.tour === null) return
    setState((previous) => ({ ...previous, isRegeneratingMember: true }))
    try {
      const updatedMemberIds = await regenerateMember(
        tourId,
        memberUserIdToReplace,
        state.tour.responsibleMemberIds,
        state.members,
        state.pastTours,
        state.tour.date,
        currentUserId,
        currentUserName
      )
      const updatedEntries = await getJournalEntries(tourId)
      setState((previous) => ({
        ...previous,
        tour: previous.tour !== null
          ? { ...previous.tour, responsibleMemberIds: updatedMemberIds }
          : null,
        journalEntries: updatedEntries,
        isRegeneratingMember: false,
      }))
    } catch {
      setState((previous) => ({ ...previous, isRegeneratingMember: false }))
    }
  }

  const handleAddMember = async (memberUserId: string) => {
    if (state.tour === null) return
    setState((previous) => ({ ...previous, isAddingMember: true }))
    try {
      const memberProfile = state.members.find((member) => member.userId === memberUserId)
      const memberName = memberProfile?.name ?? memberUserId
      const updatedMemberIds = await addMember(
        tourId,
        memberUserId,
        memberName,
        state.tour.responsibleMemberIds,
        currentUserId,
        currentUserName
      )
      const updatedEntries = await getJournalEntries(tourId)
      setState((previous) => ({
        ...previous,
        tour: previous.tour !== null
          ? { ...previous.tour, responsibleMemberIds: updatedMemberIds }
          : null,
        journalEntries: updatedEntries,
        isAddingMember: false,
      }))
    } catch {
      setState((previous) => ({ ...previous, isAddingMember: false }))
    }
  }

  return {
    ...state,
    retry: loadTourData,
    markTourAsDone: handleMarkTourAsDone,
    cancelTour: handleCancelTour,
    addMember: handleAddMember,
    removeMember: handleRemoveMember,
    regenerateMember: handleRegenerateMember,
  }
}
