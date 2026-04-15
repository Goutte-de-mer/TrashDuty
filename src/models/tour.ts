export type TourStatus = 'pending' | 'done' | 'cancelled'

export type Tour = {
  tourId: string
  colocId: string
  date: string
  responsibleMemberIds: string[]
  status: TourStatus
  createdAt: string
  scheduledNotificationIds?: string[]
}

export type JournalEntry = {
  entryId: string
  authorUserId: string
  authorName: string
  action: string
  createdAt: string
}
