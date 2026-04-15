import Constants from 'expo-constants'
import { updateTourScheduledNotifications, getTourById } from '@/datasources/remote/tourRemoteDataSource'
import {
  saveOverdueReminderIds,
  loadOverdueReminderIds,
  clearOverdueReminderIds,
} from '@/datasources/local/overdueReminderLocalDataSource'

// expo-notifications remote push support was removed from Expo Go in SDK 53
const isRunningInExpoGo = Constants.executionEnvironment === 'storeClient'

function buildTriggerDateAt1pm(baseDate: Date, dayOffset: number): Date {
  const triggerDate = new Date(baseDate)
  triggerDate.setDate(triggerDate.getDate() + dayOffset)
  triggerDate.setHours(13, 0, 0, 0)
  return triggerDate
}


export async function scheduleTourNotifications(tourId: string, tourDate: Date): Promise<void> {
  if (isRunningInExpoGo) return

  try {
    const Notifications = await import('expo-notifications')

    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') return

    const twoDaysBeforeDate = buildTriggerDateAt1pm(tourDate, -2)
    const tourDayDate = buildTriggerDateAt1pm(tourDate, 0)
    const now = new Date()

    const notificationIds: string[] = []

    if (twoDaysBeforeDate > now) {
      const twoDaysBeforeId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tour de verre dans 2 jours 🗑️',
          body: "N'oublie pas de déposer le verre après-demain",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: twoDaysBeforeDate,
        },
      })
      notificationIds.push(twoDaysBeforeId)
    }

    if (tourDayDate > now) {
      const tourDayId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "C'est ton tour aujourd'hui ! 🗑️",
          body: 'Pense à déposer le verre au conteneur',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: tourDayDate,
        },
      })
      notificationIds.push(tourDayId)
    }

    if (notificationIds.length > 0) {
      await updateTourScheduledNotifications(tourId, notificationIds)
    }
  } catch {
    // Non-critical — fail silently
  }
}

const OVERDUE_REMINDER_DAYS_COUNT = 7

export async function scheduleOverdueReminderNotifications(
  tourId: string,
  userId: string
): Promise<void> {
  if (isRunningInExpoGo) return

  try {
    const Notifications = await import('expo-notifications')

    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') return

    // Cancel any previously scheduled overdue reminders for this tour+user
    const previousNotificationIds = await loadOverdueReminderIds(userId, tourId)
    if (previousNotificationIds.length > 0) {
      await Promise.all(
        previousNotificationIds.map((notificationId) =>
          Notifications.cancelScheduledNotificationAsync(notificationId)
        )
      )
    }

    const notificationIds: string[] = []
    const now = new Date()

    for (let dayOffset = 0; dayOffset < OVERDUE_REMINDER_DAYS_COUNT; dayOffset++) {
      const triggerDate = new Date()
      triggerDate.setDate(triggerDate.getDate() + dayOffset)
      triggerDate.setHours(13, 0, 0, 0)

      if (triggerDate > now) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Tour de verre en retard 🗑️',
            body: "Le tour n'a pas encore été marqué comme fait",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        })
        notificationIds.push(notificationId)
      }
    }

    await saveOverdueReminderIds(userId, tourId, notificationIds)
  } catch {
    // Non-critical — fail silently
  }
}

export async function cancelOverdueReminderNotifications(
  tourId: string,
  userId: string
): Promise<void> {
  if (isRunningInExpoGo) return

  try {
    const notificationIds = await loadOverdueReminderIds(userId, tourId)
    if (notificationIds.length === 0) return

    const Notifications = await import('expo-notifications')
    await Promise.all(
      notificationIds.map((notificationId) =>
        Notifications.cancelScheduledNotificationAsync(notificationId)
      )
    )
    await clearOverdueReminderIds(userId, tourId)
  } catch {
    // Non-critical — fail silently
  }
}

export async function cancelTourNotifications(tourId: string): Promise<void> {
  if (isRunningInExpoGo) return

  try {
    const tour = await getTourById(tourId)
    if (tour === null || !tour.scheduledNotificationIds || tour.scheduledNotificationIds.length === 0) return

    const Notifications = await import('expo-notifications')
    await Promise.all(
      tour.scheduledNotificationIds.map((notificationId) =>
        Notifications.cancelScheduledNotificationAsync(notificationId)
      )
    )
    await updateTourScheduledNotifications(tourId, [])
  } catch {
    // Non-critical — fail silently
  }
}
