import PastTourRow from "@/components/home/PastTourRow";
import TourCard from "@/components/home/TourCard";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { useTourListViewModel } from "@/viewmodels/tourListViewModel";
import { useRouter } from "expo-router";
import { Recycle } from "lucide-react-native";
import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

function SkeletonCard() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.skeletonCard, animatedStyle]} />;
}

export default function ToursListScreen() {
  const router = useRouter();
  const { colocId } = useAuth();
  const {
    upcomingTours,
    pastTours,
    memberNames,
    isLoading,
    isOffline,
    error,
    retry,
  } = useTourListViewModel(colocId ?? "");

  return (
    <View style={styles.wrapper}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            Mode hors ligne - dernières données connues
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <Recycle size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>TrashDuty</Text>
            <Text style={styles.headerSubtitle}>Prochains tours de verre</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À venir</Text>

          {isLoading && (
            <View style={styles.skeletonList}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          )}

          {!isLoading && error !== null && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={retry}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && error === null && upcomingTours.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Aucun tour à venir</Text>
              <Text style={styles.emptySubtitle}>
                Appuie sur + pour en créer un
              </Text>
            </View>
          )}

          {!isLoading && error === null && upcomingTours.length > 0 && (
            <View style={styles.cardList}>
              {upcomingTours.map((tour) => (
                <TourCard
                  key={tour.tourId}
                  tour={tour}
                  memberNames={memberNames}
                />
              ))}
            </View>
          )}
        </View>

        {!isLoading && pastTours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Derniers tours</Text>
            <View style={styles.pastCard}>
              {pastTours.map((tour, index) => (
                <PastTourRow
                  key={tour.tourId}
                  tour={tour}
                  isLast={index === pastTours.length - 1}
                  memberNames={memberNames}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(app)/tour/new")}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  offlineBanner: {
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  offlineBannerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 100,
    gap: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary + "26",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.foreground,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    height: 96,
    borderRadius: 20,
    backgroundColor: colors.muted,
  },
  errorContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 24,
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.primaryForeground,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    color: colors.mutedForeground,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
  },
  cardList: {
    gap: 12,
  },
  pastCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  fabIcon: {
    color: colors.primaryForeground,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: typography.fontFamily.regular,
  },
});
