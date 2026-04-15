import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

export default function TourFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TourFormScreen</Text>
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
