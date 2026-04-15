import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

export default function TourDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TourDetailScreen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
  },
})
