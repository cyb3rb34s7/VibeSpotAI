import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getMyProfile,
  getNearbyPlaces,
  getPlaceDetail,
  logout,
  searchPlaces,
  startAuth,
  submitVibeCheck,
  verifyAuth,
  type AuthUser,
  type MyProfile,
  type NearbyPlace,
  type PlaceDetail,
  type VibeCheckPayload,
} from "../api/client";
import { BottomNav, type BottomNavTab } from "../components/BottomNav";
import { AuthPanel } from "../components/AuthPanel";
import { FreshDropsPeek } from "../components/FreshDropsPeek";
import { PlaceDetailSheet } from "../components/PlaceDetailSheet";
import { PlacePreviewCard } from "../components/PlacePreviewCard";
import { ProfilePanel } from "../components/ProfilePanel";
import { SearchPill } from "../components/SearchPill";
import { VibeMap } from "../components/VibeMap";
import { colors, spacing, typography } from "../theme/tokens";

export function MapHomeScreen() {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchQueryRef = useRef("");
  const [searchLabel, setSearchLabel] = useState("Best nearby");
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoadingSlug, setDetailLoadingSlug] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BottomNavTab>("Map");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [localOtpCode, setLocalOtpCode] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const tabReveal = useRef(new Animated.Value(1)).current;

  async function loadNearbyPlaces() {
    setIsLoading(true);
    try {
      const nearbyPlaces = await getNearbyPlaces();
      setPlaces(nearbyPlaces);
      setError(null);
      setSearchLabel("Best nearby");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load places");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadNearbyPlaces();
  }, []);

  useEffect(() => {
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ animated: true, y: 0 });
    tabReveal.setValue(0);
    Animated.timing(tabReveal, {
      duration: 260,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  async function openPlaceDetail(slug: string) {
    setSelectedSlug(slug);
    setDetail(null);
    setDetailError(null);
    setDetailLoadingSlug(slug);

    try {
      const placeDetail = await getPlaceDetail(slug);
      setDetail(placeDetail);
    } catch (caught) {
      setDetailError(caught instanceof Error ? caught.message : "Unable to load this place");
    } finally {
      setDetailLoadingSlug(null);
    }
  }

  function closePlaceDetail() {
    setSelectedSlug(null);
    setDetail(null);
    setDetailError(null);
    setDetailLoadingSlug(null);
  }

  async function submitDetailVibeCheck(payload: VibeCheckPayload) {
    if (!selectedSlug) {
      throw new Error("No place selected");
    }
    if (!accessToken) {
      throw new Error("Sign in before dropping a vibe check");
    }

    await submitVibeCheck(selectedSlug, payload, accessToken);
    const refreshedDetail = await getPlaceDetail(selectedSlug);
    setDetail(refreshedDetail);
    if (accessToken) {
      const refreshedProfile = await getMyProfile(accessToken);
      setProfile(refreshedProfile);
    }
  }

  async function handleStartAuth(email: string) {
    setAuthLoading(true);
    try {
      const result = await startAuth(email);
      setLocalOtpCode(result.otp_code);
      setAuthError(null);
    } catch (caught) {
      setAuthError(caught instanceof Error ? caught.message : "Unable to start sign in");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleVerifyAuth(email: string, otpCode: string) {
    setAuthLoading(true);
    try {
      const session = await verifyAuth(email, otpCode);
      const myProfile = await getMyProfile(session.access_token);
      setAccessToken(session.access_token);
      setCurrentUser(session.user);
      setProfile(myProfile);
      setProfileError(null);
      setAuthError(null);
      setLocalOtpCode(null);
      setActiveTab("Map");
    } catch (caught) {
      setAuthError(caught instanceof Error ? caught.message : "Unable to verify sign in");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (accessToken) {
      await logout(accessToken);
    }
    setAccessToken(null);
    setCurrentUser(null);
    setProfile(null);
    setActiveTab("Profile");
  }

  async function runSearch(nextQuery = searchQueryRef.current) {
    const query = nextQuery.trim();
    if (!query) {
      await loadNearbyPlaces();
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchPlaces(query);
      setPlaces(results);
      setSearchLabel("Intent matches");
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to search places");
    } finally {
      setIsLoading(false);
    }
  }

  function updateSearchQuery(value: string) {
    searchQueryRef.current = value;
    setSearchQuery(value);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void runSearch(searchQueryRef.current);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function selectTab(tab: BottomNavTab) {
    if (tab === "Drop" && places[0]) {
      openPlaceDetail(places[0].slug);
      return;
    }

    setActiveTab(tab === "Search" ? "Map" : tab);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background, colors.backgroundAlt, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          ref={scrollRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>VibeSpot</Text>
              <Text style={styles.subtitle}>
                {currentUser ? `@${currentUser.handle}` : "Local signal, right now"}
              </Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.tabContent,
              {
                opacity: tabReveal,
                transform: [
                  {
                    translateY: tabReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {activeTab === "Profile" ? (
              accessToken ? (
                <ProfilePanel
                  error={profileError}
                  isLoading={profileLoading}
                  onLogout={handleLogout}
                  profile={profile}
                />
              ) : (
                <AuthPanel
                  error={authError}
                  isLoading={authLoading}
                  localOtpCode={localOtpCode}
                  onStart={handleStartAuth}
                  onVerify={handleVerifyAuth}
                />
              )
            ) : (
              <>
                <SearchPill
                  onChangeText={updateSearchQuery}
                  onSubmit={runSearch}
                  value={searchQuery}
                />

                {isLoading ? (
                  <View style={styles.statePanel}>
                    <ActivityIndicator color={colors.lime} />
                    <Text style={styles.stateText}>Loading the local grid...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.statePanel}>
                    <Text style={styles.errorTitle}>Backend not reachable</Text>
                    <Text style={styles.stateText}>{error}</Text>
                  </View>
                ) : (
                  <>
                    <UnlockMoment count={Math.min(3, places.length)} />
                    <VibeMap places={places} />
                    <FreshDropsPeek places={places} />

                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>{searchLabel}</Text>
                      <Text style={styles.sectionMeta}>{places.length} live candidates</Text>
                    </View>

                    {places.slice(0, 6).map((place) => (
                      <PlacePreviewCard
                        key={place.id}
                        onPress={() => openPlaceDetail(place.slug)}
                        place={place}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </Animated.View>
        </ScrollView>
        <BottomNav
          activeTab={activeTab}
          onSelectTab={selectTab}
          pendingDrops={places.slice(0, 2).length}
          streakCount={profile?.stats.vibe_checks_count ?? 0}
        />
      </SafeAreaView>
      <PlaceDetailSheet
        detail={detail}
        error={detailError}
        isLoading={detailLoadingSlug !== null}
        isVisible={selectedSlug !== null}
        onClose={closePlaceDetail}
        onSubmitVibeCheck={submitDetailVibeCheck}
      />
    </View>
  );
}

function UnlockMoment({ count }: { count: number }) {
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(reveal, {
      duration: 520,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [reveal]);

  const translateY = reveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      style={[
        styles.unlockCard,
        {
          opacity: reveal,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.unlockIcon}>
        <Text style={styles.unlockIconText}>{count}</Text>
      </View>
      <View style={styles.unlockCopy}>
        <Text style={styles.unlockTitle}>Fresh zone unlocked</Text>
        <Text style={styles.unlockText}>
          {count} cafe signals are live. Two are still hidden.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: 120,
  },
  tabContent: {
    gap: spacing.md,
  },
  header: {
    alignItems: "flex-start",
    paddingTop: spacing.sm,
  },
  brand: {
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  sectionMeta: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "800",
  },
  statePanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 220,
    justifyContent: "center",
    padding: spacing.lg,
  },
  stateText: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: "center",
  },
  errorTitle: {
    color: colors.coral,
    fontSize: typography.title,
    fontWeight: "900",
  },
  unlockCard: {
    alignItems: "center",
    backgroundColor: colors.surfaceGlassStrong,
    borderColor: "rgba(189, 244, 74, 0.18)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  unlockIcon: {
    alignItems: "center",
    backgroundColor: colors.lime,
    borderRadius: 16,
    height: 40,
    justifyContent: "center",
    shadowColor: colors.lime,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    width: 40,
  },
  unlockIconText: {
    color: colors.onLime,
    fontSize: typography.title,
    fontWeight: "900",
  },
  unlockCopy: {
    flex: 1,
  },
  unlockTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  unlockText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 3,
  },
});
