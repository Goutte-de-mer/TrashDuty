import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Coloc } from '@/models/coloc'

export async function createColocDocument(coloc: Coloc): Promise<void> {
  const colocDocumentReference = doc(db, 'colocs', coloc.colocId)
  await setDoc(colocDocumentReference, coloc)
}

export async function findColocByCode(code: string): Promise<Coloc | null> {
  const colocsCollectionReference = collection(db, 'colocs')
  const colocQuery = query(colocsCollectionReference, where('code', '==', code))
  const querySnapshot = await getDocs(colocQuery)

  if (querySnapshot.empty) {
    return null
  }

  return querySnapshot.docs[0].data() as Coloc
}

export async function getColocById(colocId: string): Promise<Coloc | null> {
  const colocDocumentReference = doc(db, 'colocs', colocId)
  const colocDocumentSnapshot = await getDoc(colocDocumentReference)
  if (!colocDocumentSnapshot.exists()) return null
  return colocDocumentSnapshot.data() as Coloc
}

export async function addMemberToColoc(colocId: string, userId: string): Promise<void> {
  const colocDocumentReference = doc(db, 'colocs', colocId)
  await updateDoc(colocDocumentReference, {
    memberIds: arrayUnion(userId),
  })
}

export async function removeMemberFromColocDocument(colocId: string, userId: string): Promise<void> {
  const colocDocumentReference = doc(db, 'colocs', colocId)
  await updateDoc(colocDocumentReference, {
    memberIds: arrayRemove(userId),
  })
}

export async function deleteColocDocument(colocId: string): Promise<void> {
  const colocDocumentReference = doc(db, 'colocs', colocId)
  await deleteDoc(colocDocumentReference)
}
