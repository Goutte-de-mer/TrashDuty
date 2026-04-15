import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Tour, TourStatus, JournalEntry } from '@/models/tour'

function toFirestoreData(tour: Tour): object {
  return {
    ...tour,
    date: Timestamp.fromDate(new Date(tour.date)),
    createdAt: Timestamp.fromDate(new Date(tour.createdAt)),
  }
}

function fromFirestoreData(data: Record<string, unknown>, tourId: string): Tour {
  return {
    tourId,
    colocId: data.colocId as string,
    date: (data.date as Timestamp).toDate().toISOString(),
    responsibleMemberIds: data.responsibleMemberIds as string[],
    status: data.status as TourStatus,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
  }
}

export async function createTourDocument(tour: Tour): Promise<void> {
  const tourDocumentReference = doc(db, 'tours', tour.tourId)
  await setDoc(tourDocumentReference, toFirestoreData(tour))
}

export async function getUpcomingTours(colocId: string): Promise<Tour[]> {
  const toursCollectionReference = collection(db, 'tours')
  // Requires a composite index on (colocId, date) in Firestore
  const toursQuery = query(
    toursCollectionReference,
    where('colocId', '==', colocId),
    where('status', '==', 'pending'),
    orderBy('date', 'asc')
  )
  const querySnapshot = await getDocs(toursQuery)
  return querySnapshot.docs.map((document) =>
    fromFirestoreData(document.data() as Record<string, unknown>, document.id)
  )
}

export async function getPastTours(colocId: string): Promise<Tour[]> {
  const toursCollectionReference = collection(db, 'tours')
  // Requires a composite index on (colocId, date) in Firestore
  const toursQuery = query(
    toursCollectionReference,
    where('colocId', '==', colocId),
    where('status', 'in', ['done', 'cancelled']),
    orderBy('date', 'desc')
  )
  const querySnapshot = await getDocs(toursQuery)
  return querySnapshot.docs.map((document) =>
    fromFirestoreData(document.data() as Record<string, unknown>, document.id)
  )
}

export function subscribeToUpcomingTours(
  colocId: string,
  onToursChanged: (tours: Tour[]) => void,
  onError: (error: Error) => void
): () => void {
  const toursCollectionReference = collection(db, 'tours')
  const toursQuery = query(
    toursCollectionReference,
    where('colocId', '==', colocId),
    where('status', '==', 'pending'),
    orderBy('date', 'asc')
  )
  return onSnapshot(
    toursQuery,
    (snapshot) => {
      const tours = snapshot.docs.map((document) =>
        fromFirestoreData(document.data() as Record<string, unknown>, document.id)
      )
      onToursChanged(tours)
    },
    onError
  )
}

export function subscribeToPastTours(
  colocId: string,
  onToursChanged: (tours: Tour[]) => void,
  onError: (error: Error) => void
): () => void {
  const toursCollectionReference = collection(db, 'tours')
  const toursQuery = query(
    toursCollectionReference,
    where('colocId', '==', colocId),
    where('status', 'in', ['done', 'cancelled']),
    orderBy('date', 'desc')
  )
  return onSnapshot(
    toursQuery,
    (snapshot) => {
      const tours = snapshot.docs.map((document) =>
        fromFirestoreData(document.data() as Record<string, unknown>, document.id)
      )
      onToursChanged(tours)
    },
    onError
  )
}

export async function getTourById(tourId: string): Promise<Tour | null> {
  const tourDocumentReference = doc(db, 'tours', tourId)
  const tourDocumentSnapshot = await getDoc(tourDocumentReference)
  if (!tourDocumentSnapshot.exists()) return null
  return fromFirestoreData(tourDocumentSnapshot.data() as Record<string, unknown>, tourId)
}

export async function getJournalEntries(tourId: string): Promise<JournalEntry[]> {
  const entriesCollectionReference = collection(db, 'tours', tourId, 'entries')
  const entriesQuery = query(entriesCollectionReference, orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(entriesQuery)
  return querySnapshot.docs.map((document) => {
    const data = document.data()
    return {
      entryId: document.id,
      authorUserId: data.authorUserId as string,
      authorName: data.authorName as string,
      action: data.action as string,
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    }
  })
}

export async function updateTourStatus(tourId: string, status: TourStatus): Promise<void> {
  const tourDocumentReference = doc(db, 'tours', tourId)
  await updateDoc(tourDocumentReference, { status })
}

export async function updateTourResponsibleMembers(
  tourId: string,
  responsibleMemberIds: string[]
): Promise<void> {
  const tourDocumentReference = doc(db, 'tours', tourId)
  await updateDoc(tourDocumentReference, { responsibleMemberIds })
}

export async function updateTourScheduledNotifications(
  tourId: string,
  scheduledNotificationIds: string[]
): Promise<void> {
  const tourDocumentReference = doc(db, 'tours', tourId)
  await updateDoc(tourDocumentReference, { scheduledNotificationIds })
}

export async function addJournalEntry(tourId: string, entry: JournalEntry): Promise<void> {
  const entryDocumentReference = doc(
    db,
    'tours',
    tourId,
    'entries',
    entry.entryId
  )
  await setDoc(entryDocumentReference, {
    ...entry,
    createdAt: Timestamp.fromDate(new Date(entry.createdAt)),
  })
}
