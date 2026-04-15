import {
  createColocDocument,
  findColocByCode,
  addMemberToColoc,
} from '@/datasources/remote/colocRemoteDataSource'
import { updateUserColocId } from '@/datasources/remote/authRemoteDataSource'
import { Coloc } from '@/models/coloc'

export async function saveColoc(coloc: Coloc): Promise<void> {
  await createColocDocument(coloc)
}

export async function getColocByCode(code: string): Promise<Coloc | null> {
  return findColocByCode(code)
}

export async function addUserToColoc(colocId: string, userId: string): Promise<void> {
  await addMemberToColoc(colocId, userId)
}

export async function linkColocToUser(userId: string, colocId: string): Promise<void> {
  await updateUserColocId(userId, colocId)
}
