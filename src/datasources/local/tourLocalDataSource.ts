import AsyncStorage from '@react-native-async-storage/async-storage'
import { Tour } from '@/models/tour'

function buildStorageKey(colocId: string): string {
  return `tours_${colocId}`
}

export async function saveTours(colocId: string, tours: Tour[]): Promise<void> {
  const key = buildStorageKey(colocId)
  await AsyncStorage.setItem(key, JSON.stringify(tours))
}

export async function loadTours(colocId: string): Promise<Tour[] | null> {
  const key = buildStorageKey(colocId)
  const stored = await AsyncStorage.getItem(key)
  if (stored === null) return null
  return JSON.parse(stored) as Tour[]
}

export async function clearTours(colocId: string): Promise<void> {
  const key = buildStorageKey(colocId)
  await AsyncStorage.removeItem(key)
}
