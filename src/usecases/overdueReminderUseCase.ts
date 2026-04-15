import { Tour } from '@/models/tour'
import {
  scheduleOverdueReminderNotifications,
  cancelOverdueReminderNotifications,
} from '@/services/notifications/notificationService'
import {
  saveActiveTourIds,
  loadActiveTourIds,
} from '@/datasources/local/overdueReminderLocalDataSource'

// Called each time the pending tour list updates (from tourListViewModel).
// - Cancels overdue reminders for tours that are no longer pending (marked done/cancelled on another device)
// - Schedules (or refreshes) daily reminders for tours still overdue where the user is responsible
export async function refreshOverdueReminders(
  overduePendingTours: Tour[],
  currentUserId: string
): Promise<void> {
  const toursToRemind = overduePendingTours.filter((tour) =>
    tour.responsibleMemberIds.includes(currentUserId)
  )

  const currentOverdueTourIds = toursToRemind.map((tour) => tour.tourId)
  const previouslyActiveTourIds = await loadActiveTourIds(currentUserId)

  // Cancel reminders for tours that are no longer overdue+pending for this user
  const tourIdsToCancel = previouslyActiveTourIds.filter(
    (tourId) => !currentOverdueTourIds.includes(tourId)
  )
  await Promise.all(
    tourIdsToCancel.map((tourId) => cancelOverdueReminderNotifications(tourId, currentUserId))
  )

  // Schedule (or refresh) daily reminders for currently overdue tours
  await Promise.all(
    toursToRemind.map((tour) =>
      scheduleOverdueReminderNotifications(tour.tourId, currentUserId)
    )
  )

  await saveActiveTourIds(currentUserId, currentOverdueTourIds)
}
