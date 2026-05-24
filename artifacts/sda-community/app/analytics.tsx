import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

type RangeKey = "7" | "30" | "90";

const RANGE_DATA: Record<RangeKey, {
  overview: { impressions: string; engagementRate: string; shares: string; growth: string };
  views: number[];
  topPosts: { title: string; views: string; engagement: string }[];
  breakdown: { likes: number; comments: number; shares: number; saves: number };
  audience: { regions: string; activeHour: string; returningRate: string };
}> = {
  "7": {
    overview: { impressions: "21.4K", engagementRate: "8.2%", shares: "438", growth: "+12%" },
    views: [24, 36, 52, 41, 57, 63, 49],
    topPosts: [
      { title: "Sabbath Reflection Reel", views: "4.2K", engagement: "9.3%" },
      { title: "Community Prayer Night", views: "3.6K", engagement: "8.7%" },
      { title: "Faith in Action Story", views: "2.8K", engagement: "7.9%" },
    ],
    breakdown: { likes: 66, comments: 15, shares: 11, saves: 8 },
    audience: { regions: "Ghana 34%, Nigeria 23%, US 18%", activeHour: "7:00 PM", returningRate: "41%" },
  },
  "30": {
    overview: { impressions: "83.8K", engagementRate: "7.6%", shares: "1.3K", growth: "+26%" },
    views: [32, 45, 41, 58, 67, 63, 74, 69],
    topPosts: [
      { title: "Camp Meeting Highlights", views: "11.4K", engagement: "10.1%" },
      { title: "Bible Study Quick Notes", views: "9.7K", engagement: "8.9%" },
      { title: "Family Worship Snippet", views: "8.3K", engagement: "8.2%" },
    ],
    breakdown: { likes: 61, comments: 17, shares: 14, saves: 8 },
    audience: { regions: "Ghana 31%, Kenya 17%, US 16%", activeHour: "8:00 PM", returningRate: "47%" },
  },
  "90": {
    overview: { impressions: "242K", engagementRate: "7.1%", shares: "3.9K", growth: "+48%" },
    views: [28, 34, 39, 45, 52, 57, 66, 73, 78, 74],
    topPosts: [
      { title: "Youth Revival Recap", views: "28.2K", engagement: "10.8%" },
      { title: "Hope & Healing Testimony", views: "24.5K", engagement: "9.6%" },
      { title: "Sabbath Worship Moments", views: "22.1K", engagement: "9.2%" },
    ],
    breakdown: { likes: 58, comments: 18, shares: 16, saves: 8 },
    audience: { regions: "Ghana 29%, Nigeria 19%, UK 12%", activeHour: "9:00 PM", returningRate: "53%" },
  },
};

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [range, setRange] = useState<RangeKey>("30");

  const data = useMemo(() => RANGE_DATA[range], [range]);
  const engagementScore = Number(data.overview.engagementRate.replace("%", ""));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}> 
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.rangeWrap}>
          {(["7", "30", "90"] as const).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.rangeChip, range === item && styles.rangeChipActive]}
              onPress={() => setRange(item)}
            >
              <Text style={[styles.rangeChipText, range === item && styles.rangeChipTextActive]}>{item}d</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.overviewGrid}>
          <MetricCard label="Impressions" value={data.overview.impressions} growth={data.overview.growth} />
          <MetricCard label="Engagement" value={data.overview.engagementRate} growth="Strong" />
          <MetricCard label="Shares" value={data.overview.shares} growth="Up" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Engagement Ring</Text>
          <View style={styles.ringRow}>
            <View style={styles.ringOuter}>
              <View style={[styles.ringArc, { transform: [{ rotate: `${Math.min(engagementScore * 3.2, 320)}deg` }] }]} />
              <View style={styles.ringInner}>
                <Text style={styles.ringValue}>{data.overview.engagementRate}</Text>
                <Text style={styles.ringLabel}>Rate</Text>
              </View>
            </View>
            <Text style={styles.mutedText}>Your audience is actively engaging with posts and stories in this period.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Post Views</Text>
          <View style={styles.barRow}>
            {data.views.map((value, idx) => (
              <View key={`${value}-${idx}`} style={styles.barCol}>
                <View style={[styles.bar, { height: value + 24 }]} />
                <Text style={styles.barLabel}>{idx + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Posts</Text>
          {data.topPosts.map((post, idx) => (
            <View key={post.title} style={styles.rankRow}>
              <Text style={styles.rankIndex}>#{idx + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankTitle}>{post.title}</Text>
                <Text style={styles.rankMeta}>{post.views} views • {post.engagement} engagement</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Engagement Breakdown</Text>
          <BreakdownBar label="Likes" value={data.breakdown.likes} color="#4B7BEC" />
          <BreakdownBar label="Comments" value={data.breakdown.comments} color="#6BCB77" />
          <BreakdownBar label="Shares" value={data.breakdown.shares} color="#F4C95D" />
          <BreakdownBar label="Saves" value={data.breakdown.saves} color="#E76F51" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Audience Insights</Text>
          <Text style={styles.insightLine}>Top regions: {data.audience.regions}</Text>
          <Text style={styles.insightLine}>Peak activity: {data.audience.activeHour}</Text>
          <Text style={styles.insightLine}>Returning audience: {data.audience.returningRate}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricCard({ label, value, growth }: { label: string; value: string; growth: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricGrowth}>{growth}</Text>
    </View>
  );
}

function BreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.breakdownHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricLabel}>{value}%</Text>
      </View>
      <View style={styles.breakdownTrack}>
        <View style={[styles.breakdownFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, gap: 12 },

  rangeWrap: {
    flexDirection: "row",
    backgroundColor: "#17171A",
    borderRadius: 12,
    padding: 4,
    gap: 6,
    marginBottom: 2,
  },
  rangeChip: { flex: 1, borderRadius: 9, paddingVertical: 8, alignItems: "center" },
  rangeChipActive: { backgroundColor: "#4B7BEC" },
  rangeChipText: { color: "#8E8E93", fontSize: 13, fontWeight: "700" },
  rangeChipTextActive: { color: "#FFF" },

  overviewGrid: { flexDirection: "row", gap: 8 },
  metricCard: {
    flex: 1,
    backgroundColor: "#151518",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  metricLabel: { color: "#9A9AA0", fontSize: 12, fontWeight: "600" },
  metricValue: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  metricGrowth: { color: "#8ED8A7", fontSize: 12, fontWeight: "700" },

  card: {
    backgroundColor: "#141416",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cardTitle: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  ringRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  ringOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringArc: {
    position: "absolute",
    width: 140,
    height: 14,
    borderRadius: 12,
    backgroundColor: "#4B7BEC",
  },
  ringInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#0E0E10",
    alignItems: "center",
    justifyContent: "center",
  },
  ringValue: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  ringLabel: { color: "#8E8E93", fontSize: 12 },
  mutedText: { color: "#B6B6BB", fontSize: 13, lineHeight: 19, flex: 1 },

  barRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  barCol: { alignItems: "center", width: 24, gap: 6 },
  bar: { width: 16, borderRadius: 6, backgroundColor: "#4B7BEC" },
  barLabel: { color: "#7A7A80", fontSize: 10 },

  rankRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  rankIndex: {
    color: "#F4C95D",
    fontSize: 18,
    fontWeight: "800",
    width: 28,
    textAlign: "center",
  },
  rankTitle: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  rankMeta: { color: "#9A9AA0", fontSize: 12, marginTop: 2 },

  breakdownHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  breakdownTrack: { backgroundColor: "#232327", borderRadius: 999, height: 9, overflow: "hidden" },
  breakdownFill: { height: "100%", borderRadius: 999 },

  insightLine: { color: "#D0D0D4", fontSize: 13, lineHeight: 20 },
});
