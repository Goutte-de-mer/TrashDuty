import {
  createTourDocument,
  getUpcomingTours,
  getPastTours,
  updateTourStatus,
  updateTourResponsibleMembers,
  addJournalEntry,
} from '@/datasources/remote/tourRemoteDataSource'
import { saveTours, loadTours } from '@/datasources/local/tourLocalDataSource'
import { Tour, TourStatus, JournalEntry } from '@/models/tour'

const UPCOMING_TOURS_CACHE_KEY = 'upcoming'
const PAST_TOURS_CACHE_KEY = 'past'

export async function fetchUpcomingTours(colocId: string): Promise<Tour[]> {
  try {
    const tours = await getUpcomingTours(colocId)
    await saveTours(`${colocId}_${UPCOMING_TOURS_CACHE_KEY}`, tours)
    return tours
  } catch {
    const cachedTours = await loadTours(`${colocId}_${UPCOMING_TOURS_CACHE_KEY}`)
    if (cachedTours !== null) return cachedTours
    throw new Error('Impossible de charger les tours. Vérifie ta connexion.')
  }
}

export async function fetchPastTours(colocId: string): Promise<Tour[]> {
  try {
    const tours = await getPastTours(colocId)
    await saveTours(`${colocId}_${PAST_TOURS_CACHE_KEY}`, tours)
    return tours
  } catch {
    const cachedTours = await loadTours(`${colocId}_${PAST_TOURS_CACHE_KEY}`)
    if (cachedTours !== null) return cachedTours
    throw new Error('Impossible de charger les tours. Vérifie ta connexion.')
  }
}

export async function saveTour(tour: Tour): Promise<void> {
  await createTourDocument(tour)
}

export async function setTourStatus(tourId: string, status: TourStatus): Promise<void> {
  await updateTourStatus(tourId, status)
}

export async function setTourResponsibleMembers(
  tourId: string,
  responsibleMemberIds: string[]
): Promise<void> {
  await updateTourResponsibleMembers(tourId, responsibleMemberIds)
}

export async function saveTourJournalEntry(
  tourId: string,
  entry: JournalEntry
): Promise<void> {
  await addJournalEntry(tourId, entry)
}
