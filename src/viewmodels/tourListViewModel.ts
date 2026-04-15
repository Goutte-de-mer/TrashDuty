import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeToUpcomingTours, subscribeToPastTours } from '@/datasources/remote/tourRemoteDataSource'
import { getColocById } from '@/datasources/remote/colocRemoteDataSource'
import { getMemberProfiles } from '@/datasources/remote/authRemoteDataSource'
import { saveTours, loadTours } from '@/datasources/local/tourLocalDataSource'
import { refreshOverdueReminders } from '@/usecases/overdueReminderUseCase'
import { Tour } from '@/models/tour'

const MAX_DISPLAYED_TOURS = 3

function filterUpcoming(tours: Tour[]): Tour[] {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  return tours
    .filter((tour) => tour.status === 'pending' && new Date(tour.date) >= startOfToday)
    .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())
    .slice(0, MAX_DISPLAYED_TOURS)
}

function filterPast(pendingTours: Tour[], doneCancelledTours: Tour[]): Tour[] {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const overduePendingTours = pendingTours.filter(
    (tour) => new Date(tour.date) < startOfToday
  )

  return [...doneCancelledTours, ...overduePendingTours]
    .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime())
    .slice(0, MAX_DISPLAYED_TOURS)
}

type TourListState = {
  upcomingTours: Tour[]
  pastTours: Tour[]
  memberNames: Record<string, string>
  isLoading: boolean
  isOffline: boolean
  error: string | null
}

export function useTourListViewModel(colocId: string, currentUserId: string) {
  const [state, setState] = useState<TourListState>({
    upcomingTours: [],
    pastTours: [],
    memberNames: {},
    isLoading: true,
    isOffline: false,
    error: null,
  })

  const allPendingToursRef = useRef<Tour[]>([])
  const allDoneCancelledToursRef = useRef<Tour[]>([])
  const hasUpcomingLoadedRef = useRef(false)
  const hasPastLoadedRef = useRef(false)

  const updateState = useCallback((isOffline: boolean) => {
    const upcomingTours = filterUpcoming(allPendingToursRef.current)
    const pastTours = filterPast(allPendingToursRef.current, allDoneCancelledToursRef.current)
    const isLoaded = hasUpcomingLoadedRef.current && hasPastLoadedRef.current

    setState((previous) => ({
      ...previous,
      upcomingTours,
      pastTours,
      isLoading: !isLoaded,
      isOffline,
      error: null,
    }))
  }, [])

  const loadFromCache = useCallback(async () => {
    const cachedUpcoming = await loadTours(`${colocId}_upcoming`)
    const cachedPast = await loadTours(`${colocId}_past`)

    if (cachedUpcoming !== null) allPendingToursRef.current = cachedUpcoming
    if (cachedPast !== null) allDoneCancelledToursRef.current = cachedPast

    hasUpcomingLoadedRef.current = true
    hasPastLoadedRef.current = true

    const hasCachedData = cachedUpcoming !== null || cachedPast !== null
    if (hasCachedData) {
      updateState(true)
    } else {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: 'Impossible de charger les tours. Vérifie ta connexion.',
      }))
    }
  }, [colocId, updateState])

  useEffect(() => {
    if (!colocId) return
    getColocById(colocId).then(async (coloc) => {
      if (coloc === null) return
      const profiles = await getMemberProfiles(coloc.memberIds)
      const memberNames: Record<string, string> = {}
      profiles.forEach((profile) => { memberNames[profile.userId] = profile.name })
      setState((previous) => ({ ...previous, memberNames }))
    })
  }, [colocId])

  useEffect(() => {
    hasUpcomingLoadedRef.current = false
    hasPastLoadedRef.current = false
    allPendingToursRef.current = []
    allDoneCancelledToursRef.current = []

    const unsubscribeUpcoming = subscribeToUpcomingTours(
      colocId,
      async (tours) => {
        allPendingToursRef.current = tours
        hasUpcomingLoadedRef.current = true
        await saveTours(`${colocId}_upcoming`, tours)
        updateState(false)

        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        const overduePendingTours = tours.filter((tour) => new Date(tour.date) < startOfToday)
        refreshOverdueReminders(overduePendingTours, currentUserId)
      },
      () => loadFromCache()
    )

    const unsubscribePast = subscribeToPastTours(
      colocId,
      async (tours) => {
        allDoneCancelledToursRef.current = tours
        hasPastLoadedRef.current = true
        await saveTours(`${colocId}_past`, tours)
        updateState(false)
      },
      () => loadFromCache()
    )

    return () => {
      unsubscribeUpcoming()
      unsubscribePast()
    }
  }, [colocId, updateState, loadFromCache])

  const retry = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true, error: null }))
    loadFromCache()
  }, [loadFromCache])

  return { ...state, retry }
}
