import AsyncStorage from '@react-native-async-storage/async-storage'

function buildReminderIdsKey(userId: string, tourId: string): string {
  return `overdueReminderIds_${userId}_${tourId}`
}

function buildActiveTourIdsKey(userId: string): string {
  return `overdueReminderActiveTourIds_${userId}`
}

export async function saveOverdueReminderIds(
  userId: string,
  tourId: string,
  notificationIds: string[]
): Promise<void> {
  const key = buildReminderIdsKey(userId, tourId)
  await AsyncStorage.setItem(key, JSON.stringify(notificationIds))
}

export async function loadOverdueReminderIds(userId: string, tourId: string): Promise<string[]> {
  const key = buildReminderIdsKey(userId, tourId)
  const stored = await AsyncStorage.getItem(key)
  if (stored === null) return []
  return JSON.parse(stored) as string[]
}

export async function clearOverdueReminderIds(userId: string, tourId: string): Promise<void> {
  const key = buildReminderIdsKey(userId, tourId)
  await AsyncStorage.removeItem(key)
}

export async function saveActiveTourIds(userId: string, tourIds: string[]): Promise<void> {
  const key = buildActiveTourIdsKey(userId)
  await AsyncStorage.setItem(key, JSON.stringify(tourIds))
}

export async function loadActiveTourIds(userId: string): Promise<string[]> {
  const key = buildActiveTourIdsKey(userId)
  const stored = await AsyncStorage.getItem(key)
  if (stored === null) return []
  return JSON.parse(stored) as string[]
}
