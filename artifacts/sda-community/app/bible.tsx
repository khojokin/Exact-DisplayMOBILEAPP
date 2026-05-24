import React, { useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, TextInput, ActivityIndicator,
  ScrollView, Share, Alert, Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

// ─── Complete Bible — 66 Books ───────────────────────────────────────────────
const BOOKS = [
  // Old Testament
  { id: "genesis",          name: "Genesis",          short: "Gen",  testament: "OT", chapters: 50 },
  { id: "exodus",           name: "Exodus",           short: "Exo",  testament: "OT", chapters: 40 },
  { id: "leviticus",        name: "Leviticus",        short: "Lev",  testament: "OT", chapters: 27 },
  { id: "numbers",          name: "Numbers",          short: "Num",  testament: "OT", chapters: 36 },
  { id: "deuteronomy",      name: "Deuteronomy",      short: "Deu",  testament: "OT", chapters: 34 },
  { id: "joshua",           name: "Joshua",           short: "Jos",  testament: "OT", chapters: 24 },
  { id: "judges",           name: "Judges",           short: "Jdg",  testament: "OT", chapters: 21 },
  { id: "ruth",             name: "Ruth",             short: "Rut",  testament: "OT", chapters: 4  },
  { id: "1+samuel",         name: "1 Samuel",         short: "1Sa",  testament: "OT", chapters: 31 },
  { id: "2+samuel",         name: "2 Samuel",         short: "2Sa",  testament: "OT", chapters: 24 },
  { id: "1+kings",          name: "1 Kings",          short: "1Ki",  testament: "OT", chapters: 22 },
  { id: "2+kings",          name: "2 Kings",          short: "2Ki",  testament: "OT", chapters: 25 },
  { id: "1+chronicles",     name: "1 Chronicles",     short: "1Ch",  testament: "OT", chapters: 29 },
  { id: "2+chronicles",     name: "2 Chronicles",     short: "2Ch",  testament: "OT", chapters: 36 },
  { id: "ezra",             name: "Ezra",             short: "Ezr",  testament: "OT", chapters: 10 },
  { id: "nehemiah",         name: "Nehemiah",         short: "Neh",  testament: "OT", chapters: 13 },
  { id: "esther",           name: "Esther",           short: "Est",  testament: "OT", chapters: 10 },
  { id: "job",              name: "Job",              short: "Job",  testament: "OT", chapters: 42 },
  { id: "psalms",           name: "Psalms",           short: "Psa",  testament: "OT", chapters: 150 },
  { id: "proverbs",         name: "Proverbs",         short: "Pro",  testament: "OT", chapters: 31 },
  { id: "ecclesiastes",     name: "Ecclesiastes",     short: "Ecc",  testament: "OT", chapters: 12 },
  { id: "song+of+solomon",  name: "Song of Solomon",  short: "SoS",  testament: "OT", chapters: 8  },
  { id: "isaiah",           name: "Isaiah",           short: "Isa",  testament: "OT", chapters: 66 },
  { id: "jeremiah",         name: "Jeremiah",         short: "Jer",  testament: "OT", chapters: 52 },
  { id: "lamentations",     name: "Lamentations",     short: "Lam",  testament: "OT", chapters: 5  },
  { id: "ezekiel",          name: "Ezekiel",          short: "Eze",  testament: "OT", chapters: 48 },
  { id: "daniel",           name: "Daniel",           short: "Dan",  testament: "OT", chapters: 12 },
  { id: "hosea",            name: "Hosea",            short: "Hos",  testament: "OT", chapters: 14 },
  { id: "joel",             name: "Joel",             short: "Joe",  testament: "OT", chapters: 3  },
  { id: "amos",             name: "Amos",             short: "Amo",  testament: "OT", chapters: 9  },
  { id: "obadiah",          name: "Obadiah",          short: "Oba",  testament: "OT", chapters: 1  },
  { id: "jonah",            name: "Jonah",            short: "Jon",  testament: "OT", chapters: 4  },
  { id: "micah",            name: "Micah",            short: "Mic",  testament: "OT", chapters: 7  },
  { id: "nahum",            name: "Nahum",            short: "Nah",  testament: "OT", chapters: 3  },
  { id: "habakkuk",         name: "Habakkuk",         short: "Hab",  testament: "OT", chapters: 3  },
  { id: "zephaniah",        name: "Zephaniah",        short: "Zep",  testament: "OT", chapters: 3  },
  { id: "haggai",           name: "Haggai",           short: "Hag",  testament: "OT", chapters: 2  },
  { id: "zechariah",        name: "Zechariah",        short: "Zec",  testament: "OT", chapters: 14 },
  { id: "malachi",          name: "Malachi",          short: "Mal",  testament: "OT", chapters: 4  },
  // New Testament
  { id: "matthew",          name: "Matthew",          short: "Mat",  testament: "NT", chapters: 28 },
  { id: "mark",             name: "Mark",             short: "Mar",  testament: "NT", chapters: 16 },
  { id: "luke",             name: "Luke",             short: "Luk",  testament: "NT", chapters: 24 },
  { id: "john",             name: "John",             short: "Joh",  testament: "NT", chapters: 21 },
  { id: "acts",             name: "Acts",             short: "Act",  testament: "NT", chapters: 28 },
  { id: "romans",           name: "Romans",           short: "Rom",  testament: "NT", chapters: 16 },
  { id: "1+corinthians",    name: "1 Corinthians",    short: "1Co",  testament: "NT", chapters: 16 },
  { id: "2+corinthians",    name: "2 Corinthians",    short: "2Co",  testament: "NT", chapters: 13 },
  { id: "galatians",        name: "Galatians",        short: "Gal",  testament: "NT", chapters: 6  },
  { id: "ephesians",        name: "Ephesians",        short: "Eph",  testament: "NT", chapters: 6  },
  { id: "philippians",      name: "Philippians",      short: "Phi",  testament: "NT", chapters: 4  },
  { id: "colossians",       name: "Colossians",       short: "Col",  testament: "NT", chapters: 4  },
  { id: "1+thessalonians",  name: "1 Thessalonians",  short: "1Th",  testament: "NT", chapters: 5  },
  { id: "2+thessalonians",  name: "2 Thessalonians",  short: "2Th",  testament: "NT", chapters: 3  },
  { id: "1+timothy",        name: "1 Timothy",        short: "1Ti",  testament: "NT", chapters: 6  },
  { id: "2+timothy",        name: "2 Timothy",        short: "2Ti",  testament: "NT", chapters: 4  },
  { id: "titus",            name: "Titus",            short: "Tit",  testament: "NT", chapters: 3  },
  { id: "philemon",         name: "Philemon",         short: "Phm",  testament: "NT", chapters: 1  },
  { id: "hebrews",          name: "Hebrews",          short: "Heb",  testament: "NT", chapters: 13 },
  { id: "james",            name: "James",            short: "Jam",  testament: "NT", chapters: 5  },
  { id: "1+peter",          name: "1 Peter",          short: "1Pe",  testament: "NT", chapters: 5  },
  { id: "2+peter",          name: "2 Peter",          short: "2Pe",  testament: "NT", chapters: 3  },
  { id: "1+john",           name: "1 John",           short: "1Jo",  testament: "NT", chapters: 5  },
  { id: "2+john",           name: "2 John",           short: "2Jo",  testament: "NT", chapters: 1  },
  { id: "3+john",           name: "3 John",           short: "3Jo",  testament: "NT", chapters: 1  },
  { id: "jude",             name: "Jude",             short: "Jud",  testament: "NT", chapters: 1  },
  { id: "revelation",       name: "Revelation",       short: "Rev",  testament: "NT", chapters: 22 },
];

const POPULAR_VERSES = [
  { ref: "John 3:16",        text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
  { ref: "Jeremiah 29:11",   text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: "Philippians 4:13", text: "I can do all this through him who gives me strength." },
  { ref: "Romans 8:28",      text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose." },
  { ref: "Proverbs 3:5-6",   text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
  { ref: "Psalm 23:1",       text: "The Lord is my shepherd, I lack nothing." },
  { ref: "Isaiah 40:31",     text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." },
  { ref: "Matthew 11:28",    text: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { ref: "Psalm 46:10",      text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth!" },
  { ref: "Romans 12:2",      text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind." },
];

interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

type BibleScreenView = "books" | "chapters" | "reader";

const OT_COLOR = "#B8860B";
const NT_COLOR = "#3B5BDB";

function testamentColor(t: string) {
  return t === "OT" ? OT_COLOR : NT_COLOR;
}

// ─── BookListView ─────────────────────────────────────────────────────────────
function BookListView({
  onSelectBook,
  insets,
}: {
  onSelectBook: (book: typeof BOOKS[0]) => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<"ALL" | "OT" | "NT">("ALL");

  const filtered = BOOKS.filter((b) => {
    const matchSearch = search === "" || b.name.toLowerCase().includes(search.toLowerCase());
    const matchTestament = testament === "ALL" || b.testament === testament;
    return matchSearch && matchTestament;
  });

  const otBooks = filtered.filter((b) => b.testament === "OT");
  const ntBooks = filtered.filter((b) => b.testament === "NT");

  function renderBookGrid(books: typeof BOOKS) {
    return (
      <View style={bls.grid}>
        {books.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={bls.card}
            onPress={() => onSelectBook(book)}
            activeOpacity={0.75}
          >
            <View style={[bls.accentBar, { backgroundColor: testamentColor(book.testament) }]} />
            <Text style={bls.bookName} numberOfLines={2}>{book.name}</Text>
            <Text style={bls.chapCount}>{book.chapters} ch</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <>
      {/* Search */}
      <View style={bls.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#636366" />
        <TextInput
          style={bls.searchInput}
          placeholder="Search books..."
          placeholderTextColor="#636366"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#636366" />
          </TouchableOpacity>
        )}
      </View>

      {/* Testament filter */}
      <View style={bls.filterRow}>
        {(["ALL", "OT", "NT"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[bls.filterBtn, testament === t && bls.filterBtnActive]}
            onPress={() => setTestament(t)}
          >
            <Text style={[bls.filterText, testament === t && bls.filterTextActive]}>
              {t === "ALL" ? "All Books" : t === "OT" ? "Old Testament" : "New Testament"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Popular verses */}
        {search === "" && (
          <>
            <Text style={bls.sectionLabel}>POPULAR VERSES</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 4 }}
            >
              {POPULAR_VERSES.map((v, i) => (
                <TouchableOpacity
                  key={i}
                  style={bls.verseCard}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Clipboard.setString(`${v.ref} — ${v.text}`);
                      Alert.alert("Copied!", `${v.ref} copied to clipboard.`);
                    } else {
                      Share.share({ message: `${v.ref}\n\n${v.text}` });
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={bls.verseCardRef}>{v.ref}</Text>
                  <Text style={bls.verseCardText} numberOfLines={4}>{v.text}</Text>
                  <View style={bls.verseCardFooter}>
                    <Ionicons name="share-outline" size={12} color="#636366" />
                    <Text style={bls.verseCardFooterText}>Share</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Old Testament */}
        {(testament === "ALL" || testament === "OT") && otBooks.length > 0 && (
          <>
            <View style={bls.testamentHeader}>
              <View style={[bls.testamentDash, { backgroundColor: OT_COLOR }]} />
              <Text style={[bls.testamentTitle, { color: OT_COLOR }]}>
                OLD TESTAMENT — {otBooks.length} books
              </Text>
            </View>
            {renderBookGrid(otBooks)}
          </>
        )}

        {/* New Testament */}
        {(testament === "ALL" || testament === "NT") && ntBooks.length > 0 && (
          <>
            <View style={bls.testamentHeader}>
              <View style={[bls.testamentDash, { backgroundColor: NT_COLOR }]} />
              <Text style={[bls.testamentTitle, { color: NT_COLOR }]}>
                NEW TESTAMENT — {ntBooks.length} books
              </Text>
            </View>
            {renderBookGrid(ntBooks)}
          </>
        )}

        {filtered.length === 0 && (
          <View style={bls.empty}>
            <Ionicons name="book-outline" size={40} color="#3C3C3E" />
            <Text style={bls.emptyText}>No books found</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

// ─── ChapterView ──────────────────────────────────────────────────────────────
function ChapterView({
  book,
  onSelectChapter,
  insets,
}: {
  book: typeof BOOKS[0];
  onSelectChapter: (chapter: number) => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const accent = testamentColor(book.testament);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
      <View style={chv.bookInfo}>
        <View style={[chv.bookBadge, { backgroundColor: accent + "22" }]}>
          <Text style={[chv.bookBadgeText, { color: accent }]}>
            {book.testament === "OT" ? "Old Testament" : "New Testament"}
          </Text>
        </View>
        <Text style={chv.subtitle}>{book.chapters} chapters</Text>
      </View>
      <View style={chv.grid}>
        {chapters.map((ch) => (
          <TouchableOpacity
            key={ch}
            style={[chv.chapterBtn, { borderColor: accent + "44" }]}
            onPress={() => onSelectChapter(ch)}
            activeOpacity={0.75}
          >
            <Text style={chv.chapterNum}>{ch}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── ReaderView ───────────────────────────────────────────────────────────────
function ReaderView({
  book,
  chapter,
  onChangeChapter,
  insets,
}: {
  book: typeof BOOKS[0];
  chapter: number;
  onChangeChapter: (ch: number) => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const [fontSize, setFontSize] = useState(16);
  const accent = testamentColor(book.testament);
  const flatRef = useRef<FlatList>(null);

  const fetchChapter = useCallback(async (bookId: string, ch: number) => {
    setLoading(true);
    setError(null);
    setVerses([]);
    try {
      const url = `https://bible-api.com/${bookId}+${ch}?verse_numbers=true&translation=kjv`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed: BibleVerse[] = (data.verses || []).map((v: any) => ({
        book_id: data.reference,
        book_name: data.reference.split(" ")[0],
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim(),
      }));
      setVerses(parsed);
    } catch (e: any) {
      setError("Could not load verses. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchChapter(book.id, chapter);
  }, [book.id, chapter]);

  function toggleBookmark(v: number) {
    setBookmarked((prev) => {
      const n = new Set(prev);
      n.has(v) ? n.delete(v) : n.add(v);
      return n;
    });
  }

  function toggleHighlight(v: number) {
    setHighlighted((prev) => {
      const n = new Set(prev);
      n.has(v) ? n.delete(v) : n.add(v);
      return n;
    });
  }

  function copyVerse(verse: BibleVerse) {
    const text = `${book.name} ${verse.chapter}:${verse.verse} — "${verse.text}" (KJV)`;
    if (Platform.OS !== "web") {
      Clipboard.setString(text);
      Alert.alert("Copied!", `${book.name} ${verse.chapter}:${verse.verse} copied.`);
    } else {
      Share.share({ message: text });
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Chapter nav bar */}
      <View style={rdv.navBar}>
        <TouchableOpacity
          style={[rdv.navArrow, chapter <= 1 && rdv.navArrowDisabled]}
          onPress={() => { if (chapter > 1) onChangeChapter(chapter - 1); }}
          disabled={chapter <= 1}
        >
          <Ionicons name="chevron-back" size={22} color={chapter <= 1 ? "#3C3C3E" : "#FFF"} />
        </TouchableOpacity>

        <View style={rdv.navCenter}>
          <Text style={[rdv.navChapter, { color: accent }]}>Chapter {chapter}</Text>
          <View style={rdv.fontSizeRow}>
            <TouchableOpacity onPress={() => setFontSize((f) => Math.max(12, f - 2))} style={rdv.fontBtn}>
              <Text style={rdv.fontBtnText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize((f) => Math.min(24, f + 2))} style={rdv.fontBtn}>
              <Text style={rdv.fontBtnText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[rdv.navArrow, chapter >= book.chapters && rdv.navArrowDisabled]}
          onPress={() => { if (chapter < book.chapters) onChangeChapter(chapter + 1); }}
          disabled={chapter >= book.chapters}
        >
          <Ionicons name="chevron-forward" size={22} color={chapter >= book.chapters ? "#3C3C3E" : "#FFF"} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={rdv.center}>
          <ActivityIndicator size="large" color={accent} />
          <Text style={rdv.loadingText}>Loading {book.name} {chapter}…</Text>
        </View>
      )}

      {error && !loading && (
        <View style={rdv.center}>
          <Ionicons name="wifi-outline" size={40} color="#3C3C3E" />
          <Text style={rdv.errorText}>{error}</Text>
          <TouchableOpacity style={rdv.retryBtn} onPress={() => fetchChapter(book.id, chapter)}>
            <Text style={rdv.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && verses.length > 0 && (
        <FlatList
          ref={flatRef}
          data={verses}
          keyExtractor={(v) => String(v.verse)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 100, gap: 0 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: v }) => {
            const isBookmarked = bookmarked.has(v.verse);
            const isHighlighted = highlighted.has(v.verse);
            return (
              <TouchableOpacity
                style={[rdv.verseRow, isHighlighted && { backgroundColor: accent + "18", borderRadius: 8, marginHorizontal: -8, paddingHorizontal: 8 }]}
                onLongPress={() => {
                  Alert.alert(
                    `${book.name} ${chapter}:${v.verse}`,
                    v.text,
                    [
                      { text: isBookmarked ? "Remove Bookmark" : "Bookmark", onPress: () => toggleBookmark(v.verse) },
                      { text: isHighlighted ? "Remove Highlight" : "Highlight", onPress: () => toggleHighlight(v.verse) },
                      { text: "Copy & Share", onPress: () => copyVerse(v) },
                      { text: "Cancel", style: "cancel" },
                    ]
                  );
                }}
                activeOpacity={0.85}
              >
                <Text style={[rdv.verseNum, { color: accent }]}>{v.verse}</Text>
                <Text style={[rdv.verseText, { fontSize }]}>{v.text}</Text>
                {isBookmarked && (
                  <Ionicons name="bookmark" size={14} color={accent} style={rdv.bookmarkIcon} />
                )}
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <View style={rdv.chapterFooter}>
              <View style={[rdv.footerLine, { backgroundColor: accent + "44" }]} />
              <Text style={[rdv.footerRef, { color: accent }]}>
                {book.name} · Chapter {chapter} of {book.chapters}
              </Text>
              <View style={[rdv.footerLine, { backgroundColor: accent + "44" }]} />
              <View style={rdv.footerBtns}>
                {chapter > 1 && (
                  <TouchableOpacity style={rdv.footerNavBtn} onPress={() => onChangeChapter(chapter - 1)}>
                    <Ionicons name="chevron-back" size={14} color="#FFF" />
                    <Text style={rdv.footerNavText}>Previous Chapter</Text>
                  </TouchableOpacity>
                )}
                {chapter < book.chapters && (
                  <TouchableOpacity style={[rdv.footerNavBtn, { backgroundColor: accent + "33" }]} onPress={() => onChangeChapter(chapter + 1)}>
                    <Text style={[rdv.footerNavText, { color: accent }]}>Next Chapter</Text>
                    <Ionicons name="chevron-forward" size={14} color={accent} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BibleScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [view, setView] = useState<BibleScreenView>("books");
  const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0] | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);

  function goToBook(book: typeof BOOKS[0]) {
    setSelectedBook(book);
    setSelectedChapter(1);
    setView("chapters");
  }

  function goToChapter(ch: number) {
    setSelectedChapter(ch);
    setView("reader");
  }

  function changeChapter(ch: number) {
    setSelectedChapter(ch);
  }

  function goBack() {
    if (view === "reader") { setView("chapters"); return; }
    if (view === "chapters") { setView("books"); setSelectedBook(null); return; }
    router.back();
  }

  const accent = selectedBook ? testamentColor(selectedBook.testament) : "#B8860B";

  const headerTitle =
    view === "books" ? "Bible"
      : view === "chapters" ? selectedBook!.name
      : `${selectedBook!.name} ${selectedChapter}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
          {view === "reader" && selectedBook && (
            <Text style={[styles.headerSub, { color: accent }]}>
              {selectedBook.testament === "OT" ? "Old Testament" : "New Testament"} · KJV
            </Text>
          )}
        </View>

        <View style={{ width: 36 }}>
          {view === "reader" && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                if (!selectedBook) return;
                Share.share({
                  message: `Reading ${selectedBook.name} Chapter ${selectedChapter} on SDA Community`,
                });
              }}
            >
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Breadcrumb */}
      {view !== "books" && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.breadcrumbScroll} contentContainerStyle={styles.breadcrumb}>
          <TouchableOpacity onPress={() => { setView("books"); setSelectedBook(null); }}>
            <Text style={styles.breadcrumbItem}>Bible</Text>
          </TouchableOpacity>
          {selectedBook && (
            <>
              <Ionicons name="chevron-forward" size={12} color="#48484A" />
              <TouchableOpacity onPress={() => setView("chapters")}>
                <Text style={[styles.breadcrumbItem, view === "chapters" && styles.breadcrumbActive]}>
                  {selectedBook.name}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {view === "reader" && (
            <>
              <Ionicons name="chevron-forward" size={12} color="#48484A" />
              <Text style={styles.breadcrumbActive}>Chapter {selectedChapter}</Text>
            </>
          )}
        </ScrollView>
      )}

      {view === "books" && <BookListView onSelectBook={goToBook} insets={insets} />}
      {view === "chapters" && selectedBook && (
        <ChapterView book={selectedBook} onSelectChapter={goToChapter} insets={insets} />
      )}
      {view === "reader" && selectedBook && (
        <ReaderView
          book={selectedBook}
          chapter={selectedChapter}
          onChangeChapter={changeChapter}
          insets={insets}
        />
      )}
    </View>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  headerSub: { fontSize: 11, marginTop: 1, fontWeight: "500" },
  breadcrumbScroll: { flexShrink: 0, maxHeight: 36 },
  breadcrumb: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, gap: 6, paddingBottom: 10,
  },
  breadcrumbItem: { color: "#8E8E93", fontSize: 13 },
  breadcrumbActive: { color: "#FFF", fontSize: 13, fontWeight: "600" },
});

// ─── BookList Styles ──────────────────────────────────────────────────────────
const bls = StyleSheet.create({
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1C1C1E", borderRadius: 12,
    marginHorizontal: 16, marginBottom: 10,
    paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15, paddingVertical: 10 },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 2 },
  filterBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "#1C1C1E", alignItems: "center",
  },
  filterBtnActive: { backgroundColor: "#B8860B22" },
  filterText: { color: "#8E8E93", fontSize: 12, fontWeight: "500" },
  filterTextActive: { color: "#B8860B", fontWeight: "700" },
  sectionLabel: {
    color: "#636366", fontSize: 11, fontWeight: "600",
    letterSpacing: 0.6, marginTop: 16, marginBottom: 10, marginLeft: 20,
  },
  verseCard: {
    width: 224,
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#B8860B",
  },
  verseCardRef: { color: "#B8860B", fontSize: 13, fontWeight: "700", marginBottom: 6 },
  verseCardText: { color: "#AEAEB2", fontSize: 13, lineHeight: 20, fontStyle: "italic" },
  verseCardFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  verseCardFooterText: { color: "#636366", fontSize: 11 },
  testamentHeader: {
    flexDirection: "row", alignItems: "center",
    gap: 10, paddingHorizontal: 16, marginTop: 18, marginBottom: 10,
  },
  testamentDash: { width: 16, height: 3, borderRadius: 2 },
  testamentTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  grid: {
    flexDirection: "row", flexWrap: "wrap",
    paddingHorizontal: 12, gap: 8,
  },
  card: {
    width: "30.5%",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 12,
    overflow: "hidden",
    position: "relative",
  },
  accentBar: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  bookName: { color: "#FFF", fontSize: 13, fontWeight: "600", marginTop: 6, marginBottom: 4, lineHeight: 18 },
  chapCount: { color: "#636366", fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: "#48484A", fontSize: 15 },
});

// ─── Chapter View Styles ──────────────────────────────────────────────────────
const chv = StyleSheet.create({
  bookInfo: { alignItems: "center", marginBottom: 20, gap: 6 },
  bookBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  bookBadgeText: { fontSize: 12, fontWeight: "700" },
  subtitle: { color: "#636366", fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-start" },
  chapterBtn: {
    width: 54, height: 54,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  chapterNum: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});

// ─── Reader View Styles ───────────────────────────────────────────────────────
const rdv = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  navArrow: {
    width: 38, height: 38,
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  navArrowDisabled: { opacity: 0.3 },
  navCenter: { flex: 1, alignItems: "center", gap: 4 },
  navChapter: { fontSize: 15, fontWeight: "700" },
  fontSizeRow: { flexDirection: "row", gap: 10 },
  fontBtn: {
    backgroundColor: "#1C1C1E", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  fontBtnText: { color: "#8E8E93", fontSize: 12, fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 },
  loadingText: { color: "#8E8E93", fontSize: 14 },
  errorText: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 20 },
  retryBtn: {
    backgroundColor: "#1C1C1E", borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  retryText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  verseRow: {
    flexDirection: "row",
    paddingVertical: 7,
    alignItems: "flex-start",
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C1C1E",
  },
  verseNum: { fontSize: 12, fontWeight: "700", marginTop: 3, minWidth: 24 },
  verseText: { flex: 1, color: "#E5E5E7", lineHeight: 26 },
  bookmarkIcon: { marginTop: 4 },
  chapterFooter: { paddingTop: 24, paddingBottom: 16, alignItems: "center", gap: 10 },
  footerLine: { width: "40%", height: 1, borderRadius: 1 },
  footerRef: { fontSize: 12, fontWeight: "600" },
  footerBtns: { flexDirection: "row", gap: 12, marginTop: 8, flexWrap: "wrap", justifyContent: "center" },
  footerNavBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#1C1C1E", borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  footerNavText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
});
