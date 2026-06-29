import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  devLogin,
  getMyProfile,
  getNearbyPlaces,
  getPlaceDetail,
  searchPlaces,
  submitVibeCheck,
  type AuthUser,
  type MyProfile,
  type NearbyPlace,
  type PlaceDetail,
  type VibeCheckPayload,
} from "../api/client";
import { BottomNav, type BottomNavTab } from "../components/BottomNav";
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
    let isMounted = true;

    async function loadLocalSession() {
      try {
        const session = await devLogin("priya");
        const myProfile = await getMyProfile(session.access_token);
        if (isMounted) {
          setAccessToken(session.access_token);
          setCurrentUser(session.user);
          setProfile(myProfile);
          setProfileError(null);
        }
      } catch (caught) {
        if (isMounted) {
          setProfileError(caught instanceof Error ? caught.message : "Unable to start profile");
        }
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    }

    loadLocalSession();

    return () => {
      isMounted = false;
    };
  }, []);

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

    await submitVibeCheck(selectedSlug, payload, accessToken ?? undefined);
    const refreshedDetail = await getPlaceDetail(selectedSlug);
    setDetail(refreshedDetail);
    if (accessToken) {
      const refreshedProfile = await getMyProfile(accessToken);
      setProfile(refreshedProfile);
    }
  }

  async function runSearch(nextQuery = searchQuery) {
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
    setSearchQuery(value);
    if (!value.trim() && searchLabel !== "Best nearby") {
      void runSearch(value);
    }
  }

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
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>P</Text>
            </View>
          </View>

          {activeTab === "Profile" ? (
            <ProfilePanel error={profileError} isLoading={profileLoading} profile={profile} />
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
                  <VibeMap places={places} />

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
        </ScrollView>
        <BottomNav activeTab={activeTab} onSelectTab={selectTab} />
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

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.lime,
    borderRadius: 999,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: colors.lime,
    fontSize: typography.body,
    fontWeight: "900",
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
});
