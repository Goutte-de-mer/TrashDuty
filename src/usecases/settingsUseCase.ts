import { updateUserAvailability, clearUserColocId } from '@/datasources/remote/authRemoteDataSource'
import { removeMemberFromColocDocument, getColocById, deleteColocDocument } from '@/datasources/remote/colocRemoteDataSource'
import { getUpcomingTours, updateTourResponsibleMembers, addJournalEntry } from '@/datasources/remote/tourRemoteDataSource'
import { JournalEntry } from '@/models/tour'

function generateEntryId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const randomValue = (Math.random() * 16) | 0
    const value = character === 'x' ? randomValue : (randomValue & 0x3) | 0x8
    return value.toString(16)
  })
}

function buildJournalEntry(authorUserId: string, authorName: string, action: string): JournalEntry {
  return {
    entryId: generateEntryId(),
    authorUserId,
    authorName,
    action,
    createdAt: new Date().toISOString(),
  }
}

export async function updateAvailability(
  userId: string,
  isAvailable: boolean,
  unavailableUntilDate: string | null
): Promise<void> {
  await updateUserAvailability(userId, isAvailable, unavailableUntilDate)
}

export async function removeMemberFromColoc(
  colocId: string,
  memberUserId: string,
  memberName: string,
  authorUserId: string,
  authorName: string
): Promise<void> {
  await removeMemberFromColocDocument(colocId, memberUserId)
  await clearUserColocId(memberUserId)

  const updatedColoc = await getColocById(colocId)
  if (updatedColoc !== null && updatedColoc.memberIds.length === 0) {
    await deleteColocDocument(colocId)
  }

  const upcomingTours = await getUpcomingTours(colocId)
  const toursWithMember = upcomingTours.filter((tour) =>
    tour.responsibleMemberIds.includes(memberUserId)
  )

  await Promise.all(
    toursWithMember.map(async (tour) => {
      const updatedMemberIds = tour.responsibleMemberIds.filter(
        (userId) => userId !== memberUserId
      )
      await updateTourResponsibleMembers(tour.tourId, updatedMemberIds)
      await addJournalEntry(
        tour.tourId,
        buildJournalEntry(authorUserId, authorName, `a retiré ${memberName} de la coloc`)
      )
    })
  )
}

export async function leaveColoc(
  colocId: string,
  userId: string,
  userName: string
): Promise<void> {
  await removeMemberFromColoc(colocId, userId, userName, userId, userName)
}
