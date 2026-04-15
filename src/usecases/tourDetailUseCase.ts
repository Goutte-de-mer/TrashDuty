import { setTourStatus, setTourResponsibleMembers, saveTourJournalEntry } from '@/repositories/tourRepository'
import { regenerateOneMember } from '@/usecases/tourAssignmentUseCase'
import {
  cancelTourNotifications,
  cancelOverdueReminderNotifications,
} from '@/services/notifications/notificationService'
import { UserProfile } from '@/models/userProfile'
import { Tour, JournalEntry } from '@/models/tour'

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

export async function markTourAsDone(
  tourId: string,
  authorUserId: string,
  authorName: string
): Promise<void> {
  await setTourStatus(tourId, 'done')
  await cancelOverdueReminderNotifications(tourId, authorUserId)
  await saveTourJournalEntry(tourId, buildJournalEntry(authorUserId, authorName, 'a marqué le tour comme fait'))
}

export async function cancelTour(
  tourId: string,
  authorUserId: string,
  authorName: string
): Promise<void> {
  await setTourStatus(tourId, 'cancelled')
  await cancelTourNotifications(tourId)
  await cancelOverdueReminderNotifications(tourId, authorUserId)
  await saveTourJournalEntry(tourId, buildJournalEntry(authorUserId, authorName, 'a annulé le tour'))
}

export async function addMember(
  tourId: string,
  memberUserId: string,
  memberName: string,
  currentResponsibleMemberIds: string[],
  authorUserId: string,
  authorName: string
): Promise<string[]> {
  const updatedMemberIds = [...currentResponsibleMemberIds, memberUserId]
  await setTourResponsibleMembers(tourId, updatedMemberIds)
  await saveTourJournalEntry(tourId, buildJournalEntry(authorUserId, authorName, `a ajouté ${memberName}`))

  return updatedMemberIds
}

export async function removeMember(
  tourId: string,
  memberUserId: string,
  memberName: string,
  currentResponsibleMemberIds: string[],
  authorUserId: string,
  authorName: string
): Promise<string[]> {
  const updatedMemberIds = currentResponsibleMemberIds.filter((id) => id !== memberUserId)
  await setTourResponsibleMembers(tourId, updatedMemberIds)
  await saveTourJournalEntry(tourId, buildJournalEntry(authorUserId, authorName, `a retiré ${memberName}`))
  return updatedMemberIds
}

export async function regenerateMember(
  tourId: string,
  memberUserIdToReplace: string,
  currentResponsibleMemberIds: string[],
  members: UserProfile[],
  pastTours: Tour[],
  tourDate: string,
  authorUserId: string,
  authorName: string
): Promise<string[]> {
  const updatedMemberIds = regenerateOneMember(
    memberUserIdToReplace,
    currentResponsibleMemberIds,
    members,
    pastTours,
    new Date(tourDate)
  )
  await setTourResponsibleMembers(tourId, updatedMemberIds)

  const replacedMember = members.find((member) => member.userId === memberUserIdToReplace)
  const newMember = members.find(
    (member) => !currentResponsibleMemberIds.includes(member.userId) && updatedMemberIds.includes(member.userId)
  )
  const replacedName = replacedMember?.name ?? memberUserIdToReplace
  const newName = newMember?.name ?? 'un autre membre'

  await saveTourJournalEntry(
    tourId,
    buildJournalEntry(authorUserId, authorName, `a remplacé ${replacedName} par ${newName}`)
  )

  return updatedMemberIds
}
