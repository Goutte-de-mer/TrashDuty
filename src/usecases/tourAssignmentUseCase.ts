import { UserProfile } from '@/models/userProfile'
import { Tour } from '@/models/tour'

function toDateOnly(dateString: string): string {
  // Handles both ISO strings and YYYY-MM-DD strings safely
  return dateString.slice(0, 10)
}

function getAvailableMembers(members: UserProfile[], tourDate: Date): UserProfile[] {
  const tourDateString = `${tourDate.getFullYear()}-${String(tourDate.getMonth() + 1).padStart(2, '0')}-${String(tourDate.getDate()).padStart(2, '0')}`
  return members.filter((member) => {
    if (member.isAvailable) return true
    if (member.unavailableUntilDate === null) return false
    return tourDateString > toDateOnly(member.unavailableUntilDate)
  })
}

function getLastTourDateForMember(userId: string, pastTours: Tour[]): Date {
  const completedTours = pastTours.filter(
    (tour) => tour.status !== 'cancelled' && tour.responsibleMemberIds.includes(userId)
  )

  if (completedTours.length === 0) {
    // Member who has never done a tour goes first
    return new Date(0)
  }

  const sortedByDateDescending = [...completedTours].sort(
    (firstTour, secondTour) => new Date(secondTour.date).getTime() - new Date(firstTour.date).getTime()
  )

  return new Date(sortedByDateDescending[0].date)
}

export function getAssignedMembers(
  members: UserProfile[],
  pastTours: Tour[],
  numberOfMembers: number,
  tourDate: Date
): string[] {
  const availableMembers = getAvailableMembers(members, tourDate)

  const sortedByLongestWait = [...availableMembers].sort((firstMember, secondMember) => {
    const firstMemberLastDate = getLastTourDateForMember(firstMember.userId, pastTours)
    const secondMemberLastDate = getLastTourDateForMember(secondMember.userId, pastTours)
    return firstMemberLastDate.getTime() - secondMemberLastDate.getTime()
  })

  return sortedByLongestWait.slice(0, numberOfMembers).map((member) => member.userId)
}

export function regenerateOneMember(
  memberIdToReplace: string,
  currentResponsibleMemberIds: string[],
  members: UserProfile[],
  pastTours: Tour[],
  tourDate: Date
): string[] {
  const remainingMemberIds = currentResponsibleMemberIds.filter(
    (userId) => userId !== memberIdToReplace
  )

  const availableMembers = getAvailableMembers(members, tourDate)
  const candidateMembers = availableMembers.filter(
    (member) => !currentResponsibleMemberIds.includes(member.userId)
  )

  if (candidateMembers.length === 0) {
    return currentResponsibleMemberIds
  }

  const sortedByLongestWait = [...candidateMembers].sort((firstMember, secondMember) => {
    const firstMemberLastDate = getLastTourDateForMember(firstMember.userId, pastTours)
    const secondMemberLastDate = getLastTourDateForMember(secondMember.userId, pastTours)
    return firstMemberLastDate.getTime() - secondMemberLastDate.getTime()
  })

  const replacementMemberId = sortedByLongestWait[0].userId
  return [...remainingMemberIds, replacementMemberId]
}
