import { colors } from '@/theme/colors'
import { TourStatus } from '@/models/tour'

type TourStatusBadge = {
  label: string
  color: string
  backgroundColor: string
}

export function getTourStatusBadge(tourDate: string, tourStatus: TourStatus): TourStatusBadge {
  if (tourStatus === 'done') {
    return {
      label: 'Fait',
      color: colors.primary,
      backgroundColor: colors.primary + '26',
    }
  }

  if (tourStatus === 'cancelled') {
    return {
      label: 'Annulé',
      color: colors.mutedForeground,
      backgroundColor: colors.mutedForeground + '26',
    }
  }

  const now = new Date()
  const date = new Date(tourDate)
  const diffInDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

  if (diffInDays < 0) {
    return {
      label: 'En retard',
      color: colors.destructive,
      backgroundColor: colors.destructive + '26',
    }
  }

  if (diffInDays <= 2) {
    return {
      label: 'Urgent',
      color: colors.accent,
      backgroundColor: colors.accent + '26',
    }
  }

  return {
    label: 'À venir',
    color: colors.primary,
    backgroundColor: colors.primary + '26',
  }
}
