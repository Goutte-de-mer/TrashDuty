import {
  saveColoc,
  getColocByCode,
  addUserToColoc,
  linkColocToUser,
} from '@/repositories/colocRepository'

const COLOC_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const COLOC_CODE_LENGTH = 5

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const randomValue = (Math.random() * 16) | 0
    const value = character === 'x' ? randomValue : (randomValue & 0x3) | 0x8
    return value.toString(16)
  })
}

function generateColocCode(): string {
  let code = ''
  for (let i = 0; i < COLOC_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * COLOC_CODE_ALPHABET.length)
    code += COLOC_CODE_ALPHABET[randomIndex]
  }
  return code
}

export async function createColoc(
  colocName: string,
  userId: string
): Promise<void> {
  try {
    const colocId = generateUUID()
    const code = generateColocCode()

    await saveColoc({
      colocId,
      name: colocName,
      code,
      memberIds: [userId],
    })

    await linkColocToUser(userId, colocId)
  } catch {
    throw new Error('Impossible de créer la coloc. Réessaie.')
  }
}

export async function joinColoc(code: string, userId: string): Promise<void> {
  try {
    const coloc = await getColocByCode(code.toUpperCase())

    if (coloc === null) {
      throw new Error('Aucune coloc trouvée avec ce code. Vérifie et réessaie.')
    }

    if (!coloc.memberIds.includes(userId)) {
      await addUserToColoc(coloc.colocId, userId)
    }

    await linkColocToUser(userId, coloc.colocId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Aucune coloc')) {
      throw error
    }
    throw new Error('Impossible de rejoindre la coloc. Réessaie.')
  }
}
