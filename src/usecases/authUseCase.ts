import {
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  logoutCurrentUser,
  createUserProfileDocument,
} from '@/datasources/remote/authRemoteDataSource'

function translateFirebaseAuthError(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée.'
      case 'auth/invalid-email':
        return "L'adresse email est invalide."
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères.'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect.'
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessaie dans quelques minutes.'
      case 'auth/network-request-failed':
        return 'Erreur réseau. Vérifie ta connexion.'
      default:
        return 'Une erreur est survenue. Réessaie.'
    }
  }
  return 'Une erreur est survenue. Réessaie.'
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<void> {
  try {
    const firebaseUser = await registerWithEmailAndPassword(email, password)
    await createUserProfileDocument({
      userId: firebaseUser.uid,
      name,
      email,
      colocId: null,
      isAvailable: true,
      unavailableUntilDate: null,
    })
  } catch (error) {
    throw new Error(translateFirebaseAuthError(error))
  }
}

export async function loginUser(email: string, password: string): Promise<void> {
  try {
    await loginWithEmailAndPassword(email, password)
  } catch (error) {
    throw new Error(translateFirebaseAuthError(error))
  }
}

export async function logoutUser(): Promise<void> {
  await logoutCurrentUser()
}
