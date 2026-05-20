import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface Devotional {
  id: string;
  date: string;
  dayLabel: string;
  title: string;
  scripture: string;
  scriptureRef: string;
  body: string;
  author: string;
  reflection: string;
  prayer: string;
}

const DEVOTIONALS: Devotional[] = [
  {
    id: "d1",
    date: "2026-05-19",
    dayLabel: "Today · May 19",
    title: "Resting in His Faithfulness",
    scripture: "Great is Thy faithfulness, O God my Father, there is no shadow of turning with Thee; Thou changest not, Thy compassions, they fail not; as Thou hast been Thou forever wilt be.",
    scriptureRef: "Lamentations 3:22–23 / Hymn #100",
    author: "Ellen G. White (adapted)",
    body: "In a world that is constantly shifting — relationships that falter, health that wavers, finances that ebb and flow — there is one anchor that never gives way: the faithfulness of God.\n\nGod's faithfulness is not a product of our performance. It does not depend on how well we prayed this week, how consistently we attended church, or how triumphantly we overcame temptation. His faithfulness flows from who He is: the same yesterday, today, and forever.\n\nThis morning, as you begin another day, consider the mercies that are new every morning. The sun that rose this morning did not do so because the world earned it — it rose because a faithful Creator set the laws of nature in motion. In the same way, God's mercies toward you are not earned; they are given freely, renewed continually, flowing endlessly from His inexhaustible love.\n\nPerhaps you are in a season that feels like night — when the promises of God seem distant, when unanswered prayers pile up like unread letters. Yet even in the deepest darkness, His faithfulness has not failed. The morning always comes. Weeping may endure for a night, but joy comes in the morning.\n\nThe Seventh-day Adventist understanding of the Sabbath is, in part, a weekly declaration of this truth. Every seventh day, we stop. We rest. We trust. We affirm that God is still on the throne, that He holds our lives in His hands, and that we do not need to strive for what He freely gives. Sabbath rest is faith in action — and faith rests on the bedrock of His faithfulness.",
    reflection: "In what area of your life do you most need to trust God's faithfulness today? Is there a worry or fear you've been carrying that you can lay at His feet this morning?",
    prayer: "Father of all faithfulness, I come to You this morning with my doubts and my fears. You have never failed me, even when I couldn't see Your hand. Help me to rest in the assurance that Your mercies are new this morning — for me. Renew my faith, quiet my anxiety, and give me grace to trust You with everything I cannot control. Great is Your faithfulness. Amen.",
  },
  {
    id: "d2",
    date: "2026-05-18",
    dayLabel: "Yesterday · May 18",
    title: "The Still Small Voice",
    scripture: "And after the earthquake a fire; but the Lord was not in the fire: and after the fire a still small voice.",
    scriptureRef: "1 Kings 19:12",
    author: "Adventist Devotional",
    body: "Elijah had just witnessed one of the most dramatic demonstrations of God's power in all of Scripture. Fire had fallen from heaven. Prophets of Baal had been defeated. The drought was over. And yet, in the aftermath of that great victory, Elijah sat under a juniper tree, utterly spent, and asked to die.\n\nGod did not respond with condemnation. He sent an angel to feed him. He let him sleep. Then He asked a gentle question: 'What are you doing here, Elijah?'\n\nWhen God finally spoke, it was not in the great wind, not in the earthquake, not in the fire — it was in a still small voice. After all the noise and drama, God chose the quiet whisper.\n\nHow often do we expect God to show up only in the spectacular — in the loud, the unmistakable, the undeniable? Yet so much of our walk with God happens in the quiet moments. In the early morning before the house wakes. In the hushed reading of Scripture. In a sudden impression of peace that surpasses understanding.\n\nElijah was burned out, isolated, and convinced he was the only faithful one left. God's gentle response addressed each of these: rest, food, a new mission, and a community of seven thousand who had not bowed to Baal.\n\nWhen you feel depleted today, listen for the still small voice. God is speaking — not always in the thunder, but often in the gentlest whisper of His Spirit.",
    reflection: "How much of your spiritual life depends on dramatic experiences versus daily, quiet time with God? What would it look like to make space for the still small voice today?",
    prayer: "Lord, quiet the noise around me and within me. I confess that I sometimes look for You only in the extraordinary, while missing Your voice in the ordinary. Speak to me in the stillness. Help me to cultivate a listening heart. And when I am worn out like Elijah, remind me that You provide rest before mission. Thank You for caring for the whole person — body, mind, and soul. Amen.",
  },
  {
    id: "d3",
    date: "2026-05-17",
    dayLabel: "May 17",
    title: "The Bread of Life",
    scripture: "I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.",
    scriptureRef: "John 6:35",
    author: "Adventist Devotional",
    body: "The crowd had followed Jesus across the sea of Galilee because He had fed five thousand with five loaves and two fish. They wanted more bread — physical bread, the kind that satisfies hunger for a day.\n\nJesus offered them something infinitely greater. He offered Himself.\n\n'I am the bread of life.' Not I have bread. Not I will give you bread. I am the bread. He was claiming to be the very substance that sustains eternal life — the source and means of spiritual nourishment.\n\nIn a culture deeply familiar with manna — the miraculous bread that God provided for Israel in the wilderness — this claim was both profound and provocative. The people knew that when the manna stopped, they starved. But the bread that Jesus offered would never run out. It was not gathered morning by morning from the desert floor; it was given once for all at Calvary.\n\nSeventh-day Adventists have a beautiful tradition of connecting physical nourishment with spiritual nourishment. We believe that caring for the body is an act of worship. But even our best physical care cannot satisfy the soul's deepest hunger — the hunger to know God, to be loved by Him, to be in relationship with the One who made us.\n\nCome to Him. Feed on His Word. The hunger that nothing in this world can satisfy — He satisfies.",
    reflection: "What do you tend to run to when you feel spiritually hungry or depleted? How can you develop the habit of going to Jesus — the Bread of Life — as your first response?",
    prayer: "Jesus, You are the Bread of Life, and I confess that I often try to satisfy my soul with the lesser things of this world. Feed me today with Your Word. Let the Scripture I read and the time I spend with You be genuine nourishment for my soul. I come hungry — fill me with Yourself. Amen.",
  },
  {
    id: "d4",
    date: "2026-05-16",
    dayLabel: "May 16",
    title: "Strength for the Journey",
    scripture: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    scriptureRef: "Isaiah 40:31",
    author: "Adventist Devotional",
    body: "Isaiah wrote these words to a people in exile. The Babylonian captivity was not a temporary inconvenience — it was decades of displacement, grief, and unanswered questions. 'Has God forgotten us?' was not a rhetorical question; it was the prayer of an exhausted people.\n\nThe prophet's answer was stunning in its simplicity: wait on the Lord.\n\nWaiting in Scripture is not passive resignation. It is active, expectant trust. The Hebrew word 'qavah' carries the idea of binding together, of twisting into a cord — a picture of intertwining your life with God's, attaching yourself to Him in confident dependence.\n\nThe image of eagles is instructive. Eagles don't power their way to great heights through frantic wing-beating. They find the thermal updrafts — the columns of warm air that rise from the earth — and spread their wings to ride them. They rise on something outside themselves.\n\nGod's promise is not that He will remove every hard thing from your path. He promises that those who wait on Him will find their strength renewed — not because life becomes easy, but because they learn to spread their wings on His grace.\n\nWhatever journey you are on today — whether you are running hard, walking faithfully, or barely able to stand — His promise is the same: wait on Him. Spread your wings. He is the updraft.",
    reflection: "Are you in a season of running, walking, or waiting? What does it look like to 'wait upon the Lord' practically, in your current circumstances?",
    prayer: "Lord of all strength, I am weary in ways I can't always articulate. The journey is longer than I expected and harder than I planned. Today I choose to wait on You — not in passivity, but in active trust. Renew my strength. Lift me on Your grace. Let me soar when I need to soar, walk when I need to walk, and rest when I need to rest — always leaning on You. Amen.",
  },
  {
    id: "d5",
    date: "2026-05-15",
    dayLabel: "May 15",
    title: "The Latter Rain",
    scripture: "Ask ye of the Lord rain in the time of the latter rain; so the Lord shall make bright clouds, and give them showers of rain, to every one grass in the field.",
    scriptureRef: "Zechariah 10:1",
    author: "Adventist Devotional",
    body: "In the agricultural calendar of ancient Israel, there were two critical seasons of rain: the former rain, which fell at the beginning of the planting season to soften the ground and allow seeds to germinate; and the latter rain, which fell near harvest time to swell the grain and bring it to full ripeness.\n\nAdventist theology has long understood these rains as symbols of the Holy Spirit's outpourings in salvation history. The 'former rain' was the Pentecost — the initial outpouring of the Holy Spirit on the early church that gave birth to the Christian movement. The 'latter rain' is yet to come — a final, powerful outpouring of the Spirit that will ripen the harvest of souls before Christ's return.\n\nBut notice what the prophet says: 'Ask ye of the Lord rain in the time of the latter rain.' The latter rain is not given to unprepared hearts. We are to ask for it. We are to position ourselves for it — through prayer, through surrender, through a deepening life of the Spirit.\n\nAre you longing for a fresh outpouring in your own life? The Spirit of God is not reluctant to fill you — He is looking for containers that have been emptied of self. As you pray today, ask not just for blessings but for the rain that ripens — the kind of Spirit-filling that brings your life to full maturity in Christ.",
    reflection: "What in your life might be blocking the 'latter rain' — the full outpouring of the Holy Spirit? Is there anything you need to surrender to make room for more of God?",
    prayer: "Holy Spirit, I ask for rain. Not just a sprinkle of blessing, but the deep, soaking rain that brings transformation. Pour out Your Spirit on my life, on my family, on my church. Prepare us for harvest. Empty me of myself so that You can fill me with Yourself. Come, Holy Spirit. Amen.",
  },
  {
    id: "d6",
    date: "2026-05-14",
    dayLabel: "May 14",
    title: "The Sabbath: A Gift of Rest",
    scripture: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: but the seventh day is the sabbath of the Lord thy God.",
    scriptureRef: "Exodus 20:8–10",
    author: "Adventist Devotional",
    body: "The Sabbath is the only commandment that begins with the word 'Remember.' Perhaps God knew that this would be the one we would most easily — and most eagerly — forget.\n\nThe Sabbath was instituted not after sin, but before it — on the seventh day of a perfect creation. God did not rest because He was tired; He rested because the work was complete, good, and worth pausing to celebrate. He blessed the Sabbath and made it holy before He made any laws, before Israel existed as a nation, before there was any religion at all.\n\nThis means the Sabbath is not primarily a religious duty — it is a gift to humanity. Jesus Himself said it: 'The Sabbath was made for man, not man for the Sabbath' (Mark 2:27).\n\nIn our driven, achievement-oriented, always-on culture, the Sabbath is countercultural. It declares: you are more than your productivity. You are worth resting. Your identity is not in what you accomplish but in whose you are.\n\nAs Seventh-day Adventists, we hold the Sabbath as a sign of our covenant relationship with God — a weekly reminder that He is our Creator and our Redeemer, and that our lives are held in His hands. As the sun sets this coming Friday, may you enter the Sabbath not as a burden but as a welcome guest, a foretaste of the eternal rest that awaits.",
    reflection: "What does Sabbath rest genuinely look like for you — beyond just not working? How can you make the Sabbath a delight rather than a restriction this week?",
    prayer: "Creator God, thank You for the gift of the Sabbath. In a world that never stops, You invite me to stop. Help me to receive this gift with gratitude. As the Sabbath approaches, still my heart from the busyness of the week. Help me to rest in You — to worship, to connect, to delight in what You have made. Make my Sabbath a foretaste of heaven. Amen.",
  },
  {
    id: "d7",
    date: "2026-05-13",
    dayLabel: "May 13",
    title: "By Faith, Not by Sight",
    scripture: "For we walk by faith, not by sight.",
    scriptureRef: "2 Corinthians 5:7",
    author: "Adventist Devotional",
    body: "Paul wrote these words from a place of hardship. Earlier in the same chapter he described their outer nature wasting away, the weight of glory yet to come, the groaning of hearts not yet home. These were not the words of a man writing from comfort; they were the testimony of a man who had learned to walk in the dark.\n\nFaith, in the biblical sense, is not the absence of doubt. It is not pretending everything is fine. It is not refusing to look at the hard realities of life. Faith is the deliberate choice to orient your life around what God has said rather than what you can see.\n\nThe great examples of faith in Hebrews 11 — Abraham, Moses, Rahab, Sarah — were people who acted on God's word when the visible evidence pointed the other way. Abraham left his homeland without knowing where he was going. Moses forsook the treasures of Egypt for an invisible reward. These were not easy, natural responses; they were costly, intentional acts of trust.\n\nToday, you may be facing circumstances that don't make sense. The timeline you hoped for has not materialized. The prayer you've prayed a hundred times remains unanswered. The path forward is not clear.\n\nWalk by faith. Not because it is easy — it isn't. Not because the doubts aren't real — they may be. But because the God who promised is faithful, and the 'not yet' of your experience does not cancel the 'it is written' of His word.",
    reflection: "What is one area of your life where you are having difficulty walking by faith rather than sight? What would it look like to take one step of faith in that area today?",
    prayer: "Lord, I confess that I am a better seer than believer. I trust more easily what I can verify with my eyes than what You have spoken by Your word. Strengthen my faith today. Where I walk in uncertainty, let Your word be a lamp. Where I walk in fear, let Your presence be my courage. I choose to walk by faith. Amen.",
  },
];

function getDailyDevotional(): Devotional {
  return DEVOTIONALS[0];
}

export default function DevotionalScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [selected, setSelected] = useState<Devotional>(getDailyDevotional());
  const [showList, setShowList] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Daily Devotional</Text>
          <Text style={styles.headerSub}>{selected.dayLabel}</Text>
        </View>
        <TouchableOpacity style={styles.calBtn} onPress={() => setShowList(!showList)}>
          <Feather name="calendar" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Past devotionals picker */}
      {showList && (
        <View style={styles.listPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 10 }}>
            {DEVOTIONALS.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[styles.dayCard, selected.id === d.id && styles.dayCardActive]}
                onPress={() => { setSelected(d); setShowList(false); }}
              >
                <Text style={[styles.dayCardLabel, selected.id === d.id && { color: "#FFF" }]}>{d.dayLabel.split("·")[0].trim()}</Text>
                <Text style={[styles.dayCardTitle, selected.id === d.id && { color: "#FFF" }]} numberOfLines={2}>{d.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 60 }} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleWrap}>
          <View style={styles.dateBadge}>
            <Ionicons name="sunny-outline" size={12} color="#B8860B" />
            <Text style={styles.dateBadgeText}>{selected.dayLabel.toUpperCase()}</Text>
          </View>
          <Text style={styles.devotionalTitle}>{selected.title}</Text>
          <Text style={styles.authorText}>— {selected.author}</Text>
        </View>

        {/* Scripture */}
        <View style={styles.scriptureCard}>
          <View style={styles.scriptureTop}>
            <Ionicons name="book-outline" size={14} color="#B8860B" />
            <Text style={styles.scriptureLabel}>SCRIPTURE</Text>
          </View>
          <Text style={styles.scriptureText}>"{selected.scripture}"</Text>
          <Text style={styles.scriptureRef}>— {selected.scriptureRef}</Text>
        </View>

        {/* Body */}
        <Text style={styles.bodyText}>{selected.body}</Text>

        {/* Reflection */}
        <View style={styles.reflectionCard}>
          <View style={styles.reflectionTop}>
            <Ionicons name="bulb-outline" size={14} color="#6B7B5A" />
            <Text style={styles.reflectionLabel}>REFLECTION</Text>
          </View>
          <Text style={styles.reflectionText}>{selected.reflection}</Text>
        </View>

        {/* Prayer */}
        <View style={styles.prayerCard}>
          <View style={styles.prayerTop}>
            <Text style={{ fontSize: 14 }}>🙏</Text>
            <Text style={styles.prayerLabel}>PRAYER</Text>
          </View>
          <Text style={styles.prayerText}>{selected.prayer}</Text>
        </View>

        {/* Navigate between days */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => {
              const idx = DEVOTIONALS.findIndex((d) => d.id === selected.id);
              if (idx < DEVOTIONALS.length - 1) setSelected(DEVOTIONALS[idx + 1]);
            }}
            disabled={DEVOTIONALS.findIndex((d) => d.id === selected.id) >= DEVOTIONALS.length - 1}
          >
            <Ionicons name="chevron-back" size={18} color="#8E8E93" />
            <Text style={styles.navBtnText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => {
              const idx = DEVOTIONALS.findIndex((d) => d.id === selected.id);
              if (idx > 0) setSelected(DEVOTIONALS[idx - 1]);
            }}
            disabled={DEVOTIONALS.findIndex((d) => d.id === selected.id) <= 0}
          >
            <Text style={styles.navBtnText}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerCenter: { alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "#636366", fontSize: 11, marginTop: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  calBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  listPanel: {
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2C2C2E",
    backgroundColor: "#111",
  },
  dayCard: {
    width: 130, backgroundColor: "#1C1C1E", borderRadius: 12, padding: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  dayCardActive: { backgroundColor: "#3B5BDB", borderColor: "#3B5BDB" },
  dayCardLabel: { color: "#636366", fontSize: 10, marginBottom: 4 },
  dayCardTitle: { color: "#8E8E93", fontSize: 12, fontWeight: "500", lineHeight: 16 },
  titleWrap: { marginBottom: 20 },
  dateBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    marginBottom: 10,
  },
  dateBadgeText: { color: "#B8860B", fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  devotionalTitle: { color: "#FFF", fontSize: 26, fontWeight: "700", lineHeight: 32, marginBottom: 8 },
  authorText: { color: "#636366", fontSize: 12 },
  scriptureCard: {
    backgroundColor: "#1A1608", borderRadius: 16, padding: 18, marginBottom: 24,
    borderLeftWidth: 3, borderLeftColor: "#B8860B",
  },
  scriptureTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  scriptureLabel: { color: "#B8860B", fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  scriptureText: { color: "#FFF", fontSize: 16, lineHeight: 26, fontStyle: "italic", marginBottom: 8 },
  scriptureRef: { color: "#B8860B99", fontSize: 12 },
  bodyText: { color: "#DADADB", fontSize: 15, lineHeight: 26, marginBottom: 24 },
  reflectionCard: {
    backgroundColor: "#0D1A0D", borderRadius: 16, padding: 18, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: "#6B7B5A",
  },
  reflectionTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  reflectionLabel: { color: "#6B7B5A", fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  reflectionText: { color: "#DADADB", fontSize: 14, lineHeight: 22 },
  prayerCard: {
    backgroundColor: "#1C1C1E", borderRadius: 16, padding: 18, marginBottom: 24,
  },
  prayerTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  prayerLabel: { color: "#8E8E93", fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  prayerText: { color: "#DADADB", fontSize: 14, lineHeight: 22, fontStyle: "italic" },
  navRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8 },
  navBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8 },
  navBtnText: { color: "#8E8E93", fontSize: 14 },
});
