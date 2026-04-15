import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  subscribeToAuthStateChanges,
  getUserProfileDocument,
} from '@/datasources/remote/authRemoteDataSource'
import { registerUser, loginUser, logoutUser } from '@/usecases/authUseCase'

type AuthState = {
  isLoggedIn: boolean
  isLoading: boolean
  userId: string | null
  userName: string | null
  userEmail: string | null
  colocId: string | null
}

type AuthContextType = AuthState & {
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: true,
    userId: null,
    userName: null,
    userEmail: null,
    colocId: null,
  })

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateChanges(async (firebaseUser) => {
      if (firebaseUser === null) {
        setState({ isLoggedIn: false, isLoading: false, userId: null, userName: null, userEmail: null, colocId: null })
        return
      }

      const userProfile = await getUserProfileDocument(firebaseUser.uid)
      setState({
        isLoggedIn: true,
        isLoading: false,
        userId: firebaseUser.uid,
        userName: userProfile?.name ?? null,
        userEmail: userProfile?.email ?? null,
        colocId: userProfile?.colocId ?? null,
      })
    })

    return unsubscribe
  }, [])

  const refreshUserProfile = async () => {
    if (state.userId === null) return

    const userProfile = await getUserProfileDocument(state.userId)
    setState((previous) => ({
      ...previous,
      colocId: userProfile?.colocId ?? null,
    }))
  }

  const register = async (name: string, email: string, password: string) => {
    await registerUser(name, email, password)
  }

  const login = async (email: string, password: string) => {
    await loginUser(email, password)
  }

  const logout = async () => {
    await logoutUser()
  }

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
