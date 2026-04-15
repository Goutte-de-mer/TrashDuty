import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { UserProfile } from '@/models/userProfile'

export async function registerWithEmailAndPassword(
  email: string,
  password: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function loginWithEmailAndPassword(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function logoutCurrentUser(): Promise<void> {
  await signOut(auth)
}

export async function createUserProfileDocument(profile: UserProfile): Promise<void> {
  const userDocumentReference = doc(db, 'users', profile.userId)
  await setDoc(userDocumentReference, profile)
}

export async function getUserProfileDocument(userId: string): Promise<UserProfile | null> {
  const userDocumentReference = doc(db, 'users', userId)
  const userDocumentSnapshot = await getDoc(userDocumentReference)

  if (!userDocumentSnapshot.exists()) {
    return null
  }

  return userDocumentSnapshot.data() as UserProfile
}

export async function getMemberProfiles(memberIds: string[]): Promise<UserProfile[]> {
  const profilePromises = memberIds.map((userId) => getUserProfileDocument(userId))
  const profiles = await Promise.all(profilePromises)
  return profiles.filter((profile): profile is UserProfile => profile !== null)
}

export async function updateUserColocId(userId: string, colocId: string): Promise<void> {
  const userDocumentReference = doc(db, 'users', userId)
  await updateDoc(userDocumentReference, { colocId })
}

export async function updateUserAvailability(
  userId: string,
  isAvailable: boolean,
  unavailableUntilDate: string | null
): Promise<void> {
  const userDocumentReference = doc(db, 'users', userId)
  await updateDoc(userDocumentReference, { isAvailable, unavailableUntilDate })
}

export async function clearUserColocId(userId: string): Promise<void> {
  const userDocumentReference = doc(db, 'users', userId)
  await updateDoc(userDocumentReference, { colocId: null })
}

export function subscribeToAuthStateChanges(
  onUserChanged: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, onUserChanged)
}
