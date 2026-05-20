import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, TextInput, ScrollView, Animated,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export interface Hymn {
  id: string;
  number: number;
  title: string;
  category: string;
  verses: string[];
  chorus?: string;
}

export const HYMNS: Hymn[] = [
  {
    id: "h1", number: 1, title: "Praise to the Lord, the Almighty", category: "Praise",
    verses: [
      "Praise to the Lord, the Almighty, the King of creation!\nO my soul, praise Him, for He is thy health and salvation!\nAll ye who hear, now to His temple draw near;\nJoin me in glad adoration!",
      "Praise to the Lord, who o'er all things so wondrously reigneth,\nShelters thee under His wings, yea, so gently sustaineth!\nHast thou not seen how thy desires e'er have been\nGranted in what He ordaineth?",
      "Praise to the Lord, who doth prosper thy work and defend thee,\nSurely His goodness and mercy here daily attend thee;\nPonder anew what the Almighty can do,\nIf with His love He befriend thee.",
      "Praise to the Lord! O let all that is in me adore Him!\nAll that hath life and breath, come now with praises before Him!\nLet the Amen sound from His people again;\nGladly for aye we adore Him.",
    ],
  },
  {
    id: "h2", number: 2, title: "Come, Thou Almighty King", category: "Praise",
    verses: [
      "Come, Thou Almighty King,\nHelp us Thy name to sing,\nHelp us to praise!\nFather! all glorious,\nO'er all victorious,\nCome, and reign over us,\nAncient of days!",
      "Come, Thou Incarnate Word,\nGird on Thy mighty sword,\nOur prayer attend!\nCome, and Thy people bless,\nAnd give Thy word success,\nSpirit of holiness,\nOn us descend!",
      "Come, Holy Comforter,\nThy sacred witness bear\nIn this glad hour!\nThou who almighty art,\nNow rule in every heart,\nAnd ne'er from us depart,\nSpirit of power!",
      "To the great One in Three\nEternal praises be,\nHence evermore!\nHis sovereign majesty\nMay we in glory see,\nAnd to eternity\nLove and adore!",
    ],
  },
  {
    id: "h3", number: 3, title: "All Creatures of Our God and King", category: "Praise",
    verses: [
      "All creatures of our God and King,\nLift up your voice and with us sing,\nAlleluia! Alleluia!\nThou burning sun with golden beam,\nThou silver moon with softer gleam!\nO praise Him! O praise Him!\nAlleluia! Alleluia! Alleluia!",
      "Thou rushing wind that art so strong,\nYe clouds that sail in heaven along,\nO praise Him! Alleluia!\nThou rising morn, in praise rejoice,\nYe lights of evening, find a voice!\nO praise Him! O praise Him!\nAlleluia! Alleluia! Alleluia!",
      "Thou flowing water, pure and clear,\nMake music for thy Lord to hear,\nAlleluia! Alleluia!\nThou fire so masterful and bright,\nThat givest man both warmth and light,\nO praise Him! O praise Him!\nAlleluia! Alleluia! Alleluia!",
      "Let all things their Creator bless,\nAnd worship Him in humbleness,\nO praise Him! Alleluia!\nPraise, praise the Father, praise the Son,\nAnd praise the Spirit, Three in One!\nO praise Him! O praise Him!\nAlleluia! Alleluia! Alleluia!",
    ],
  },
  {
    id: "h4", number: 9, title: "For the Beauty of the Earth", category: "Creation",
    verses: [
      "For the beauty of the earth,\nFor the glory of the skies,\nFor the love which from our birth\nOver and around us lies;\nLord of all, to Thee we raise\nThis our hymn of grateful praise.",
      "For the beauty of each hour\nOf the day and of the night,\nHill and vale and tree and flower,\nSun and moon and stars of light;\nLord of all, to Thee we raise\nThis our hymn of grateful praise.",
      "For the joy of human love,\nBrother, sister, parent, child,\nFriends on earth, and friends above,\nFor all gentle thoughts and mild;\nLord of all, to Thee we raise\nThis our hymn of grateful praise.",
      "For Thy church that evermore\nLifteth holy hands above,\nOffering up on every shore\nHer pure sacrifice of love;\nLord of all, to Thee we raise\nThis our hymn of grateful praise.",
    ],
  },
  {
    id: "h5", number: 12, title: "Joyful, Joyful, We Adore Thee", category: "Praise",
    verses: [
      "Joyful, joyful, we adore Thee,\nGod of glory, Lord of love;\nHearts unfold like flowers before Thee,\nOpening to the sun above.\nMelt the clouds of sin and sadness,\nDrive the dark of doubt away;\nGiver of immortal gladness,\nFill us with the light of day!",
      "All Thy works with joy surround Thee,\nEarth and heaven reflect Thy rays,\nStars and angels sing around Thee,\nCenter of unbroken praise.\nField and forest, vale and mountain,\nFlowery meadow, flashing sea,\nChanting bird and flowing fountain\nCall us to rejoice in Thee.",
      "Thou art giving and forgiving,\nEver blessing, ever blest,\nWellspring of the joy of living,\nOcean depth of happy rest!\nThou our Father, Christ our Brother,\nAll who live in love are Thine;\nTeach us how to love each other,\nLift us to the joy divine.",
      "Mortals, join the happy chorus,\nWhich the morning stars began;\nFather-love is reigning o'er us,\nBrother-love binds man to man.\nEver singing, march we onward,\nVictors in the midst of strife;\nJoyful music lifts us sunward\nIn the triumph song of life.",
    ],
  },
  {
    id: "h6", number: 13, title: "Immortal, Invisible, God Only Wise", category: "Praise",
    verses: [
      "Immortal, invisible, God only wise,\nIn light inaccessible hid from our eyes,\nMost blessed, most glorious, the Ancient of Days,\nAlmighty, victorious, Thy great name we praise.",
      "Unresting, unhasting, and silent as light,\nNor wanting, nor wasting, Thou rulest in might;\nThy justice like mountains high soaring above\nThy clouds which are fountains of goodness and love.",
      "To all life Thou givest, to both great and small;\nIn all life Thou livest, the true life of all;\nWe blossom and flourish as leaves on the tree,\nAnd wither and perish, but naught changeth Thee.",
      "Great Father of glory, pure Father of light,\nThine angels adore Thee, all veiling their sight;\nAll praise we would render; O help us to see\n'Tis only the splendor of light hideth Thee.",
    ],
  },
  {
    id: "h7", number: 73, title: "Holy, Holy, Holy", category: "Worship",
    verses: [
      "Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy! Merciful and mighty!\nGod in three Persons, blessed Trinity!",
      "Holy, holy, holy! All the saints adore Thee,\nCasting down their golden crowns around the glassy sea;\nCherubim and seraphim falling down before Thee,\nWho wert, and art, and evermore shalt be.",
      "Holy, holy, holy! Though the darkness hide Thee,\nThough the eye of sinful man Thy glory may not see;\nOnly Thou art holy; there is none beside Thee\nPerfect in power, in love, and purity.",
      "Holy, holy, holy! Lord God Almighty!\nAll Thy works shall praise Thy name, in earth and sky and sea;\nHoly, holy, holy! Merciful and mighty!\nGod in three Persons, blessed Trinity!",
    ],
  },
  {
    id: "h8", number: 86, title: "How Great Thou Art", category: "Praise",
    verses: [
      "O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made,\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.",
      "When through the woods and forest glades I wander,\nAnd hear the birds sing sweetly in the trees;\nWhen I look down from lofty mountain grandeur\nAnd hear the brook and feel the gentle breeze:",
      "And when I think that God, His Son not sparing,\nSent Him to die, I scarce can take it in;\nThat on the cross, my burden gladly bearing,\nHe bled and died to take away my sin:",
      "When Christ shall come with shout of acclamation\nAnd take me home, what joy shall fill my heart!\nThen I shall bow in humble adoration\nAnd there proclaim, my God, how great Thou art!",
    ],
    chorus: "Then sings my soul, my Savior God, to Thee,\nHow great Thou art, how great Thou art!\nThen sings my soul, my Savior God, to Thee,\nHow great Thou art, how great Thou art!",
  },
  {
    id: "h9", number: 92, title: "This Is My Father's World", category: "Creation",
    verses: [
      "This is my Father's world,\nAnd to my listening ears\nAll nature sings, and round me rings\nThe music of the spheres.\nThis is my Father's world:\nI rest me in the thought\nOf rocks and trees, of skies and seas;\nHis hand the wonders wrought.",
      "This is my Father's world,\nThe birds their carols raise,\nThe morning light, the lily white,\nDeclare their Maker's praise.\nThis is my Father's world:\nHe shines in all that's fair;\nIn the rustling grass I hear Him pass;\nHe speaks to me everywhere.",
      "This is my Father's world.\nO let me ne'er forget\nThat though the wrong seems oft so strong,\nGod is the ruler yet.\nThis is my Father's world:\nThe battle is not done;\nJesus who died shall be satisfied,\nAnd earth and heaven be one.",
    ],
  },
  {
    id: "h10", number: 100, title: "Great Is Thy Faithfulness", category: "Assurance",
    verses: [
      "Great is Thy faithfulness, O God my Father,\nThere is no shadow of turning with Thee;\nThou changest not, Thy compassions, they fail not;\nAs Thou hast been Thou forever wilt be.",
      "Summer and winter, and springtime and harvest,\nSun, moon and stars in their courses above,\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love.",
      "Pardon for sin and a peace that endureth,\nThine own dear presence to cheer and to guide;\nStrength for today and bright hope for tomorrow,\nBlessings all mine, with ten thousand beside!",
    ],
    chorus: "Great is Thy faithfulness!\nGreat is Thy faithfulness!\nMorning by morning new mercies I see;\nAll I have needed Thy hand hath provided—\nGreat is Thy faithfulness, Lord, unto me!",
  },
  {
    id: "h11", number: 121, title: "O Come, All Ye Faithful", category: "Worship",
    verses: [
      "O come, all ye faithful,\nJoyful and triumphant,\nO come ye, O come ye to Bethlehem;\nCome and behold Him,\nBorn the King of angels;\nO come, let us adore Him,\nO come, let us adore Him,\nO come, let us adore Him,\nChrist the Lord.",
      "Sing, choirs of angels,\nSing in exultation,\nSing, all ye citizens of heaven above!\nGlory to God\nIn the highest;\nO come, let us adore Him,\nO come, let us adore Him,\nO come, let us adore Him,\nChrist the Lord.",
      "Yea, Lord, we greet Thee,\nBorn this happy morning,\nJesu, to Thee be glory given;\nWord of the Father,\nNow in flesh appearing;\nO come, let us adore Him,\nO come, let us adore Him,\nO come, let us adore Him,\nChrist the Lord.",
    ],
  },
  {
    id: "h12", number: 125, title: "Joy to the World", category: "Praise",
    verses: [
      "Joy to the world! the Lord is come;\nLet earth receive her King;\nLet every heart prepare Him room,\nAnd heaven and nature sing,\nAnd heaven and nature sing,\nAnd heaven, and heaven, and nature sing.",
      "Joy to the world! the Savior reigns;\nLet men their songs employ;\nWhile fields and floods, rocks, hills and plains\nRepeat the sounding joy,\nRepeat the sounding joy,\nRepeat, repeat the sounding joy.",
      "He rules the world with truth and grace,\nAnd makes the nations prove\nThe glories of His righteousness,\nAnd wonders of His love,\nAnd wonders of His love,\nAnd wonders, wonders of His love.",
    ],
  },
  {
    id: "h13", number: 131, title: "O Little Town of Bethlehem", category: "Worship",
    verses: [
      "O little town of Bethlehem,\nHow still we see thee lie!\nAbove thy deep and dreamless sleep\nThe silent stars go by;\nYet in thy dark streets shineth\nThe everlasting Light;\nThe hopes and fears of all the years\nAre met in thee tonight.",
      "For Christ is born of Mary,\nAnd gathered all above,\nWhile mortals sleep, the angels keep\nTheir watch of wondering love.\nO morning stars, together\nProclaim the holy birth!\nAnd praises sing to God the King,\nAnd peace to men on earth.",
      "How silently, how silently,\nThe wondrous gift is given!\nSo God imparts to human hearts\nThe blessings of His heaven.\nNo ear may hear His coming,\nBut in this world of sin,\nWhere meek souls will receive Him still,\nThe dear Christ enters in.",
      "O holy Child of Bethlehem,\nDescend to us, we pray;\nCast out our sin and enter in,\nBe born in us today.\nWe hear the Christmas angels\nThe great glad tidings tell;\nO come to us, abide with us,\nOur Lord Emmanuel.",
    ],
  },
  {
    id: "h14", number: 154, title: "When I Survey the Wondrous Cross", category: "Calvary",
    verses: [
      "When I survey the wondrous cross\nOn which the Prince of glory died,\nMy richest gain I count but loss,\nAnd pour contempt on all my pride.",
      "Forbid it, Lord, that I should boast,\nSave in the death of Christ my God;\nAll the vain things that charm me most,\nI sacrifice them to His blood.",
      "See, from His head, His hands, His feet,\nSorrow and love flow mingled down;\nDid e'er such love and sorrow meet,\nOr thorns compose so rich a crown?",
      "Were the whole realm of nature mine,\nThat were a present far too small;\nLove so amazing, so divine,\nDemands my soul, my life, my all.",
    ],
  },
  {
    id: "h15", number: 159, title: "The Old Rugged Cross", category: "Calvary",
    verses: [
      "On a hill far away stood an old rugged cross,\nThe emblem of suffering and shame;\nAnd I love that old cross where the dearest and best\nFor a world of lost sinners was slain.",
      "O that old rugged cross, so despised by the world,\nHas a wondrous attraction for me;\nFor the dear Lamb of God left His glory above\nTo bear it to dark Calvary.",
      "In that old rugged cross, stained with blood so divine,\nA wondrous beauty I see,\nFor 'twas on that old cross Jesus suffered and died,\nTo pardon and sanctify me.",
      "To the old rugged cross I will ever be true;\nIts shame and reproach gladly bear;\nThen He'll call me some day to my home far away,\nWhere His glory forever I'll share.",
    ],
    chorus: "So I'll cherish the old rugged cross,\nTill my trophies at last I lay down;\nI will cling to the old rugged cross,\nAnd exchange it someday for a crown.",
  },
  {
    id: "h16", number: 167, title: "Fairest Lord Jesus", category: "Worship",
    verses: [
      "Fairest Lord Jesus, Ruler of all nature,\nO Thou of God and man the Son!\nThee will I cherish, Thee will I honor,\nThou, my soul's glory, joy, and crown.",
      "Fair are the meadows, fairer still the woodlands,\nRobed in the blooming garb of spring;\nJesus is fairer, Jesus is purer,\nWho makes the woeful heart to sing.",
      "Fair is the sunshine, fairer still the moonlight,\nAnd all the twinkling, starry host;\nJesus shines brighter, Jesus shines purer\nThan all the angels heaven can boast.",
      "Beautiful Savior! Lord of all the nations!\nSon of God and Son of Man!\nGlory and honor, praise, adoration,\nNow and forevermore be Thine!",
    ],
  },
  {
    id: "h17", number: 180, title: "Christ the Lord Is Risen Today", category: "Praise",
    verses: [
      "Christ the Lord is risen today, Alleluia!\nSons of men and angels say, Alleluia!\nRaise your joys and triumphs high, Alleluia!\nSing, ye heavens, and earth reply, Alleluia!",
      "Lives again our glorious King, Alleluia!\nWhere, O death, is now thy sting? Alleluia!\nOnce He died our souls to save, Alleluia!\nWhere's thy victory, boasting grave? Alleluia!",
      "Love's redeeming work is done, Alleluia!\nFought the fight, the battle won, Alleluia!\nDeath in vain forbids Him rise, Alleluia!\nChrist has opened Paradise, Alleluia!",
      "Soar we now where Christ has led, Alleluia!\nFollowing our exalted Head, Alleluia!\nMade like Him, like Him we rise, Alleluia!\nOurs the cross, the grave, the skies, Alleluia!",
    ],
  },
  {
    id: "h18", number: 208, title: "Blessed Assurance", category: "Assurance",
    verses: [
      "Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.",
      "Perfect submission, perfect delight,\nVisions of rapture now burst on my sight;\nAngels, descending, bring from above\nEchoes of mercy, whispers of love.",
      "Perfect submission, all is at rest,\nI in my Savior am happy and blest;\nWatching and waiting, looking above,\nFilled with His goodness, lost in His love.",
    ],
    chorus: "This is my story, this is my song,\nPraising my Savior all the day long;\nThis is my story, this is my song,\nPraising my Savior all the day long.",
  },
  {
    id: "h19", number: 214, title: "Lo, He Comes with Clouds Descending", category: "Second Coming",
    verses: [
      "Lo, He comes with clouds descending,\nOnce for favored sinners slain!\nThousand thousand saints attending\nSwell the triumph of His train:\nAlleluia! Alleluia! Alleluia!\nGod appears on earth to reign.",
      "Every eye shall now behold Him\nRobed in dreadful majesty;\nThose who set at naught and sold Him,\nPierced and nailed Him to the tree,\nDeeply wailing, deeply wailing, deeply wailing,\nShall the true Messiah see.",
      "Yea, Amen! let all adore Thee,\nHigh on Thine eternal throne;\nSavior, take the power and glory;\nClaim the kingdom for Thine own:\nAlleluia! Alleluia! Alleluia!\nThou shalt reign, and Thou alone.",
    ],
  },
  {
    id: "h20", number: 265, title: "Breathe on Me, Breath of God", category: "Holy Spirit",
    verses: [
      "Breathe on me, Breath of God,\nFill me with life anew,\nThat I may love what Thou dost love,\nAnd do what Thou wouldst do.",
      "Breathe on me, Breath of God,\nUntil my heart is pure,\nUntil my will is one with Thine,\nTo do and to endure.",
      "Breathe on me, Breath of God,\nTill I am wholly Thine,\nTill all this earthly part of me\nGlows with Thy fire divine.",
      "Breathe on me, Breath of God,\nSo shall I never die,\nBut live with Thee the perfect life\nOf Thine eternity.",
    ],
  },
  {
    id: "h21", number: 270, title: "Holy Bible, Book Divine", category: "Scripture",
    verses: [
      "Holy Bible, book divine,\nPrecious treasure, thou art mine;\nMine to tell me whence I came;\nMine to teach me what I am.",
      "Mine to chide me when I rove;\nMine to show a Savior's love;\nMine thou art to guide and guard;\nMine to punish or reward.",
      "Mine to comfort in distress,\nSuffering in this wilderness;\nMine to show by living faith\nMan can triumph over death.",
      "Mine to tell of joys to come,\nAnd the rebel sinner's doom;\nO thou holy book divine,\nPrecious treasure, thou art mine.",
    ],
  },
  {
    id: "h22", number: 272, title: "Give Me the Bible", category: "Scripture",
    verses: [
      "Give me the Bible, star of gladness gleaming,\nTo cheer the wanderer lone and tempest-tossed,\nNo storm can hide that peaceful radiance beaming,\nSince Jesus came to seek and save the lost.",
      "Give me the Bible, holy message shining,\nThy light shall guide me in the narrow way;\nPrecept and promise, law and love combining,\nTill night shall vanish in eternal day.",
      "Give me the Bible, when my heart is broken,\nWhen sin and grief have left a painful sting;\nSay not one sweet consoling word unspoken,\nLet me behold the suffering Savior King.",
      "Give me the Bible, all my steps enlighten,\nTeach me the danger of these realms below;\nThat lamp of safety o'er the gloom shall brighten,\nThat light alone the path of peace can show.",
    ],
    chorus: "Give me the Bible, holy message shining,\nThy light shall guide me in the narrow way;\nPrecept and promise, law and love combining,\nTill night shall vanish in eternal day.",
  },
  {
    id: "h23", number: 273, title: "Break Thou the Bread of Life", category: "Scripture",
    verses: [
      "Break Thou the bread of life, dear Lord, to me,\nAs Thou didst break the loaves beside the sea;\nBeyond the sacred page I seek Thee, Lord;\nMy spirit pants for Thee, O living Word.",
      "Bless Thou the truth, dear Lord, to me, to me,\nAs Thou didst bless the bread by Galilee;\nThen shall all bondage cease, all fetters fall;\nAnd I shall find my peace, my all in all.",
      "Thou art the bread of life, O Lord, to me,\nThy holy Word the truth that saveth me;\nGive me to eat and live with Thee above;\nTeach me to love Thy truth, for Thou art love.",
    ],
  },
  {
    id: "h24", number: 300, title: "Rock of Ages", category: "Calvary",
    verses: [
      "Rock of Ages, cleft for me,\nLet me hide myself in Thee;\nLet the water and the blood,\nFrom Thy wounded side which flowed,\nBe of sin the double cure;\nSave from wrath and make me pure.",
      "Could my tears forever flow,\nCould my zeal no languor know,\nThese for sin could not atone;\nThou must save, and Thou alone;\nIn my hand no price I bring;\nSimply to Thy cross I cling.",
      "While I draw this fleeting breath,\nWhen my eyes shall close in death,\nWhen I rise to worlds unknown\nAnd behold Thee on Thy throne,\nRock of Ages, cleft for me,\nLet me hide myself in Thee.",
    ],
  },
  {
    id: "h25", number: 309, title: "I Surrender All", category: "Devotion",
    verses: [
      "All to Jesus I surrender;\nAll to Him I freely give;\nI will ever love and trust Him,\nIn His presence daily live.",
      "All to Jesus I surrender;\nHumbly at His feet I bow,\nWorldly pleasures all forsaken;\nTake me, Jesus, take me now.",
      "All to Jesus I surrender;\nMake me, Savior, wholly Thine;\nLet me feel the Holy Spirit,\nTruly know that Thou art mine.",
      "All to Jesus I surrender;\nLord, I give myself to Thee;\nFill me with Thy love and power;\nLet Thy blessing fall on me.",
    ],
    chorus: "I surrender all, I surrender all,\nAll to Thee, my blessed Savior,\nI surrender all.",
  },
  {
    id: "h26", number: 313, title: "Just As I Am", category: "Prayer",
    verses: [
      "Just as I am, without one plea,\nBut that Thy blood was shed for me,\nAnd that Thou bidd'st me come to Thee,\nO Lamb of God, I come, I come.",
      "Just as I am, and waiting not\nTo rid my soul of one dark blot,\nTo Thee whose blood can cleanse each spot,\nO Lamb of God, I come, I come.",
      "Just as I am, though tossed about\nWith many a conflict, many a doubt,\nFightings and fears within, without,\nO Lamb of God, I come, I come.",
      "Just as I am, Thou wilt receive,\nWilt welcome, pardon, cleanse, relieve;\nBecause Thy promise I believe,\nO Lamb of God, I come, I come.",
    ],
  },
  {
    id: "h27", number: 337, title: "At Calvary", category: "Calvary",
    verses: [
      "Years I spent in vanity and pride,\nCaring not my Lord was crucified,\nKnowing not it was for me He died\nOn Calvary.",
      "By God's Word at last my sin I learned;\nThen I trembled at the law I'd spurned,\nTill my guilty soul imploring turned\nTo Calvary.",
      "Now I've given to Jesus everything,\nNow I gladly own Him as my King,\nNow my raptured soul can only sing\nOf Calvary!",
      "O the love that drew salvation's plan!\nO the grace that brought it down to man!\nO the mighty gulf that God did span\nAt Calvary!",
    ],
    chorus: "Mercy there was great, and grace was free;\nPardon there was multiplied to me;\nThere my burdened soul found liberty\nAt Calvary.",
  },
  {
    id: "h28", number: 341, title: "To God Be the Glory", category: "Praise",
    verses: [
      "To God be the glory, great things He hath taught us,\nGreat things He hath done, and great our rejoicing\nThrough Jesus the Son; but purer and higher\nAnd greater will be our wonder, our transport,\nWhen Jesus we see.",
      "O perfect redemption, the purchase of blood,\nTo every believer the promise of God;\nThe vilest offender who truly believes,\nThat moment from Jesus a pardon receives.",
      "Great things He hath taught us, great things He hath done,\nAnd great our rejoicing through Jesus the Son;\nBut purer and higher and greater will be\nOur wonder, our transport, when Jesus we see.",
    ],
    chorus: "Praise the Lord, praise the Lord,\nLet the earth hear His voice!\nPraise the Lord, praise the Lord,\nLet the people rejoice!\nO come to the Father, through Jesus the Son,\nAnd give Him the glory, great things He hath done.",
  },
  {
    id: "h29", number: 348, title: "The Church Has One Foundation", category: "The Church",
    verses: [
      "The church's one foundation\nIs Jesus Christ her Lord;\nShe is His new creation\nBy water and the Word;\nFrom heaven He came and sought her\nTo be His holy bride;\nWith His own blood He bought her,\nAnd for her life He died.",
      "Elect from every nation,\nYet one o'er all the earth;\nHer charter of salvation\nOne Lord, one faith, one birth;\nOne holy name she blesses,\nPartakes one holy food,\nAnd to one hope she presses,\nWith every grace endued.",
      "'Mid toil and tribulation,\nAnd tumult of her war,\nShe waits the consummation\nOf peace forevermore;\nTill with the vision glorious\nHer longing eyes are blest,\nAnd the great church victorious\nShall be the church at rest.",
    ],
  },
  {
    id: "h30", number: 349, title: "In Christ There Is No East or West", category: "The Church",
    verses: [
      "In Christ there is no East or West,\nIn Him no South or North,\nBut one great fellowship of love\nThroughout the whole wide earth.",
      "In Him shall true hearts everywhere\nTheir high communion find;\nHis service is the golden cord\nClose binding all mankind.",
      "Join hands, then, brothers of the faith,\nWhate'er your race may be;\nWho serves my Father as a son\nIs surely kin to me.",
      "In Christ now meet both East and West,\nIn Him meet South and North;\nAll Christly souls are one in Him\nThroughout the whole wide earth.",
    ],
  },
  {
    id: "h31", number: 350, title: "Blest Be the Tie That Binds", category: "The Church",
    verses: [
      "Blest be the tie that binds\nOur hearts in Christian love;\nThe fellowship of kindred minds\nIs like to that above.",
      "Before our Father's throne\nWe pour our ardent prayers;\nOur fears, our hopes, our aims are one,\nOur comforts and our cares.",
      "We share our mutual woes,\nOur mutual burdens bear,\nAnd often for each other flows\nThe sympathizing tear.",
      "When we asunder part,\nIt gives us inward pain;\nBut we shall still be joined in heart,\nAnd hope to meet again.",
    ],
  },
  {
    id: "h32", number: 367, title: "We've a Story to Tell to the Nations", category: "Mission",
    verses: [
      "We've a story to tell to the nations,\nThat shall turn their hearts to the right,\nA story of truth and mercy,\nA story of peace and light.",
      "We've a song to be sung to the nations,\nThat shall lift their hearts to the Lord,\nA song that shall conquer evil\nAnd shatter the spear and sword.",
      "We've a message to give to the nations,\nThat the Lord who reigneth above\nHath sent us His Son to save us,\nAnd show us that God is love.",
      "We've a Savior to show to the nations,\nWho the path of sorrow hath trod,\nThat all of the world's great peoples\nMight come to the truth of God.",
    ],
    chorus: "For the darkness shall turn to dawning,\nAnd the dawning to noonday bright,\nAnd Christ's great kingdom shall come on earth,\nThe kingdom of love and light.",
  },
  {
    id: "h33", number: 368, title: "O Zion, Haste", category: "Mission",
    verses: [
      "O Zion, haste, thy mission high fulfilling,\nTo tell to all the world that God is Light;\nThat He who made all nations is not willing\nOne soul should perish, lost in shades of night.",
      "Behold how many thousands still are lying\nBound in the darksome prison house of sin,\nWith none to tell them of the Savior's dying,\nOr of the life He died for them to win.",
      "Proclaim to every people, tongue, and nation\nThat God, in whom they live and move, is Love;\nTell how He stooped to save His lost creation,\nAnd died on earth that man might live above.",
    ],
    chorus: "Publish glad tidings, tidings of peace,\nTidings of Jesus, redemption and release.",
  },
  {
    id: "h34", number: 380, title: "Safely Through Another Week", category: "Sabbath",
    verses: [
      "Safely through another week\nGod has brought us on our way;\nLet us now a blessing seek,\nWaiting in His courts today:\nDay of all the week the best,\nEmblem of eternal rest.\nDay of all the week the best,\nEmblem of eternal rest.",
      "While we pray for pard'ning grace,\nThrough the dear Redeemer's name,\nShow Thy reconciled face,\nTake away our sin and shame;\nFrom our worldly cares set free,\nMay we rest this day in Thee.\nFrom our worldly cares set free,\nMay we rest this day in Thee.",
      "May the gospel's joyful sound\nConquer sinners, comfort saints;\nMake the fruits of grace abound,\nBring relief for all complaints;\nThus may all our Sabbaths prove,\nTill we join the church above.\nThus may all our Sabbaths prove,\nTill we join the church above.",
    ],
  },
  {
    id: "h35", number: 383, title: "O Day of Rest and Gladness", category: "Sabbath",
    verses: [
      "O day of rest and gladness,\nO day of joy and light,\nO balm of care and sadness,\nMost beautiful, most bright;\nOn thee the high and lowly,\nThrough ages joined in tune,\nSing holy, holy, holy,\nTo the great God Triune.",
      "On thee, at the creation,\nThe light first had its birth;\nOn thee, for our salvation,\nChrist rose from depths of earth;\nOn thee our Lord, victorious,\nThe Spirit sent from heaven;\nAnd thus on thee, most glorious,\nA triple light was given.",
      "New graces ever gaining\nFrom this our day of rest,\nWe reach the rest remaining\nTo spirits of the blest;\nTo Holy Ghost be praises,\nTo Father and to Son;\nThe church her voice upraises\nTo Thee, blest Three in One.",
    ],
  },
  {
    id: "h36", number: 389, title: "Welcome, Welcome, Day of Rest", category: "Sabbath",
    verses: [
      "Welcome, welcome, day of rest,\nDay that God has ever blessed,\nDay that breaks the toil and strife,\nDay of spiritual life.",
      "Welcome, welcome, day of light,\nScattering all the shades of night,\nBringing forth each hidden thing,\nMaking us to heavenward spring.",
      "Welcome, welcome, holy day,\nDrive our worldly thoughts away,\nHelp us on life's rugged road,\nLeading us to meet our God.",
    ],
  },
  {
    id: "h37", number: 429, title: "Jerusalem the Golden", category: "Hope",
    verses: [
      "Jerusalem the golden,\nWith milk and honey blest,\nBeneath thy contemplation\nSink heart and voice oppressed:\nI know not, O I know not,\nWhat joys await us there,\nWhat radiancy of glory,\nWhat bliss beyond compare.",
      "They stand, those halls of Zion,\nAll jubilant with song,\nAnd bright with many an angel,\nAnd all the martyr throng;\nThe Prince is ever in them,\nThe daylight is serene,\nThe pastures of the blessed\nAre decked in glorious sheen.",
      "O sweet and blessed country,\nThe home of God's elect!\nO sweet and blessed country\nThat eager hearts expect!\nJesu, in mercy bring us\nTo that dear land of rest;\nWho art, with God the Father,\nAnd Spirit, ever blest.",
    ],
  },
  {
    id: "h38", number: 456, title: "More Love to Thee, O Christ", category: "Devotion",
    verses: [
      "More love to Thee, O Christ,\nMore love to Thee!\nHear Thou the prayer I make\nOn bended knee;\nThis is my earnest plea:\nMore love, O Christ, to Thee,\nMore love to Thee!\nMore love to Thee!",
      "Once earthly joy I craved,\nSought peace and rest;\nNow Thee alone I seek,\nGive what is best;\nThis all my prayer shall be:\nMore love, O Christ, to Thee,\nMore love to Thee!\nMore love to Thee!",
      "Let sorrow do its work,\nSend grief and pain;\nSweet are Thy messengers,\nSweet their refrain,\nWhen they can sing with me:\nMore love, O Christ, to Thee,\nMore love to Thee!\nMore love to Thee!",
    ],
  },
  {
    id: "h39", number: 462, title: "Leaning on the Everlasting Arms", category: "Trust",
    verses: [
      "What a fellowship, what a joy divine,\nLeaning on the everlasting arms;\nWhat a blessedness, what a peace is mine,\nLeaning on the everlasting arms.",
      "O how sweet to walk in this pilgrim way,\nLeaning on the everlasting arms;\nO how bright the path grows from day to day,\nLeaning on the everlasting arms.",
      "What have I to dread, what have I to fear,\nLeaning on the everlasting arms?\nI have blessed peace with my Lord so near,\nLeaning on the everlasting arms.",
    ],
    chorus: "Leaning, leaning,\nSafe and secure from all alarms;\nLeaning, leaning,\nLeaning on the everlasting arms.",
  },
  {
    id: "h40", number: 472, title: "Nearer, My God, to Thee", category: "Prayer",
    verses: [
      "Nearer, my God, to Thee,\nNearer to Thee!\nE'en though it be a cross\nThat raiseth me;\nStill all my song shall be:\nNearer, my God, to Thee,\nNearer, my God, to Thee,\nNearer to Thee!",
      "Though like the wanderer,\nThe sun gone down,\nDarkness be over me,\nMy rest a stone;\nYet in my dreams I'd be\nNearer, my God, to Thee,\nNearer, my God, to Thee,\nNearer to Thee!",
      "There let the way appear\nSteps unto heaven;\nAll that Thou sendest me\nIn mercy given;\nAngels to beckon me\nNearer, my God, to Thee,\nNearer, my God, to Thee,\nNearer to Thee!",
    ],
  },
  {
    id: "h41", number: 478, title: "Sweet Hour of Prayer", category: "Prayer",
    verses: [
      "Sweet hour of prayer! sweet hour of prayer!\nThat calls me from a world of care,\nAnd bids me at my Father's throne\nMake all my wants and wishes known.\nIn seasons of distress and grief,\nMy soul has often found relief,\nAnd oft escaped the tempter's snare,\nBy thy return, sweet hour of prayer!",
      "Sweet hour of prayer! sweet hour of prayer!\nThy wings shall my petition bear\nTo Him whose truth and faithfulness\nEngage the waiting soul to bless.\nAnd since He bids me seek His face,\nBelieve His word, and trust His grace,\nI'll cast on Him my every care,\nAnd wait for thee, sweet hour of prayer!",
      "Sweet hour of prayer! sweet hour of prayer!\nMay I thy consolation share,\nTill, from Mount Pisgah's lofty height,\nI view my home and take my flight;\nThis robe of flesh I'll drop, and rise\nTo seize the everlasting prize,\nAnd shout, while passing through the air,\nFarewell, farewell, sweet hour of prayer!",
    ],
  },
  {
    id: "h42", number: 483, title: "I Need Thee Every Hour", category: "Prayer",
    verses: [
      "I need Thee every hour,\nMost gracious Lord;\nNo tender voice like Thine\nCan peace afford.",
      "I need Thee every hour,\nStay Thou nearby;\nTemptations lose their power\nWhen Thou art nigh.",
      "I need Thee every hour,\nIn joy or pain;\nCome quickly and abide,\nOr life is vain.",
      "I need Thee every hour;\nTeach me Thy will;\nAnd Thy rich promises\nIn me fulfill.",
    ],
    chorus: "I need Thee, O I need Thee;\nEvery hour I need Thee!\nO bless me now, my Savior,\nI come to Thee.",
  },
  {
    id: "h43", number: 487, title: "In the Garden", category: "Prayer",
    verses: [
      "I come to the garden alone,\nWhile the dew is still on the roses;\nAnd the voice I hear, falling on my ear,\nThe Son of God discloses.",
      "He speaks, and the sound of His voice\nIs so sweet the birds hush their singing;\nAnd the melody that He gave to me\nWithin my heart is ringing.",
      "I'd stay in the garden with Him\nThough the night around me be falling;\nBut He bids me go; through the voice of woe,\nHis voice to me is calling.",
    ],
    chorus: "And He walks with me, and He talks with me,\nAnd He tells me I am His own;\nAnd the joy we share as we tarry there,\nNone other has ever known.",
  },
  {
    id: "h44", number: 499, title: "What a Friend We Have in Jesus", category: "Prayer",
    verses: [
      "What a friend we have in Jesus,\nAll our sins and griefs to bear!\nWhat a privilege to carry\nEverything to God in prayer!\nO what peace we often forfeit,\nO what needless pain we bear,\nAll because we do not carry\nEverything to God in prayer!",
      "Have we trials and temptations?\nIs there trouble anywhere?\nWe should never be discouraged,\nTake it to the Lord in prayer.\nCan we find a friend so faithful\nWho will all our sorrows share?\nJesus knows our every weakness;\nTake it to the Lord in prayer.",
      "Are we weak and heavy laden,\nCumbered with a load of care?\nPrecious Savior, still our refuge;\nTake it to the Lord in prayer.\nDo thy friends despise, forsake thee?\nTake it to the Lord in prayer;\nIn His arms He'll take and shield thee;\nThou wilt find a solace there.",
    ],
  },
  {
    id: "h45", number: 506, title: "A Mighty Fortress Is Our God", category: "Trust",
    verses: [
      "A mighty fortress is our God,\nA bulwark never failing;\nOur helper He, amid the flood\nOf mortal ills prevailing.\nFor still our ancient foe\nDoth seek to work us woe;\nHis craft and power are great,\nAnd, armed with cruel hate,\nOn earth is not his equal.",
      "Did we in our own strength confide,\nOur striving would be losing;\nWere not the right Man on our side,\nThe Man of God's own choosing.\nDost ask who that may be?\nChrist Jesus, it is He;\nLord Sabaoth His name,\nFrom age to age the same,\nAnd He must win the battle.",
      "That word above all earthly powers,\nNo thanks to them, abideth;\nThe Spirit and the gifts are ours\nThrough Him who with us sideth.\nLet goods and kindred go,\nThis mortal life also;\nThe body they may kill:\nGod's truth abideth still,\nHis kingdom is forever.",
    ],
  },
  {
    id: "h46", number: 530, title: "It Is Well with My Soul", category: "Trust",
    verses: [
      "When peace like a river attendeth my way,\nWhen sorrows like sea billows roll;\nWhatever my lot, Thou hast taught me to say,\n\"It is well, it is well with my soul.\"",
      "Though Satan should buffet, though trials should come,\nLet this blest assurance control,\nThat Christ hath regarded my helpless estate,\nAnd hath shed His own blood for my soul.",
      "My sin—O the bliss of this glorious thought—\nMy sin, not in part, but the whole,\nIs nailed to the cross and I bear it no more;\nPraise the Lord, praise the Lord, O my soul!",
      "And Lord, haste the day when the faith shall be sight,\nThe clouds be rolled back as a scroll,\nThe trump shall resound and the Lord shall descend,\nEven so—it is well with my soul.",
    ],
    chorus: "It is well with my soul,\nIt is well, it is well with my soul.",
  },
  {
    id: "h47", number: 559, title: "We Gather Together", category: "Worship",
    verses: [
      "We gather together to ask the Lord's blessing;\nHe chastens and hastens His will to make known;\nThe wicked oppressing now cease from distressing;\nSing praises to His name, He forgets not His own.",
      "Beside us to guide us, our God with us joining,\nOrdaining, maintaining His kingdom divine;\nSo from the beginning the fight we were winning;\nThou, Lord, wast at our side—all glory be Thine!",
      "We all do extol Thee, Thou leader triumphant,\nAnd pray that Thou still our defender wilt be;\nLet Thy congregation escape tribulation;\nThy name be ever praised! O Lord, make us free!",
    ],
  },
  {
    id: "h48", number: 567, title: "Have Thine Own Way, Lord", category: "Devotion",
    verses: [
      "Have Thine own way, Lord!\nHave Thine own way!\nThou art the potter;\nI am the clay.\nMold me and make me\nAfter Thy will,\nWhile I am waiting,\nYielded and still.",
      "Have Thine own way, Lord!\nHave Thine own way!\nSearch me and try me,\nMaster today!\nWhiter than snow, Lord,\nWash me just now,\nAs in Thy presence\nHumbly I bow.",
      "Have Thine own way, Lord!\nHave Thine own way!\nHold o'er my being\nAbsolute sway!\nFill with Thy Spirit\nTill all shall see\nChrist only, always,\nLiving in me.",
    ],
  },
  {
    id: "h49", number: 590, title: "Turn Your Eyes Upon Jesus", category: "Devotion",
    verses: [
      "O soul, are you weary and troubled?\nNo light in the darkness you see?\nThere's light for a look at the Savior,\nAnd life more abundant and free!",
      "Through death into life everlasting\nHe passed, and we follow Him there;\nO'er us sin no more hath dominion—\nFor more than conquerors we are!",
      "His word shall not fail you—He promised;\nBelieve Him, and all will be well;\nThen go to a world that is dying,\nHis perfect salvation to tell!",
    ],
    chorus: "Turn your eyes upon Jesus,\nLook full in His wonderful face,\nAnd the things of earth will grow strangely dim,\nIn the light of His glory and grace.",
  },
  {
    id: "h50", number: 617, title: "Onward, Christian Soldiers", category: "Mission",
    verses: [
      "Onward, Christian soldiers,\nMarching as to war,\nWith the cross of Jesus\nGoing on before!\nChrist, the royal Master,\nLeads against the foe;\nForward into battle,\nSee His banners go!",
      "At the sign of triumph\nSatan's host doth flee;\nOn, then, Christian soldiers,\nOn to victory!\nHell's foundations quiver\nAt the shout of praise;\nBrothers, lift your voices,\nLoud your anthems raise!",
      "Crowns and thrones may perish,\nKingdoms rise and wane,\nBut the Church of Jesus\nConstant will remain;\nGates of hell can never\n'Gainst that church prevail;\nWe have Christ's own promise,\nAnd that cannot fail.",
    ],
    chorus: "Onward, Christian soldiers,\nMarching as to war,\nWith the cross of Jesus\nGoing on before!",
  },
  {
    id: "h51", number: 619, title: "Lead On, O King Eternal", category: "Mission",
    verses: [
      "Lead on, O King Eternal,\nThe day of march has come;\nHenceforth in fields of conquest\nThy tents shall be our home.\nThrough days of preparation\nThy grace has made us strong;\nAnd now, O King Eternal,\nWe lift our battle song.",
      "Lead on, O King Eternal,\nTill sin's fierce war shall cease,\nAnd holiness shall whisper\nThe sweet amen of peace;\nFor not with swords' loud clashing,\nNor roll of stirring drums,\nWith deeds of love and mercy\nThe heavenly kingdom comes.",
      "Lead on, O King Eternal,\nWe follow, not with fears,\nFor gladness breaks like morning\nWherever Thy face appears;\nThy cross is lifted o'er us,\nWe journey in its light;\nThe crown awaits the conquest;\nLead on, O God of might.",
    ],
  },
  {
    id: "h52", number: 631, title: "O That Will Be Glory", category: "Hope",
    verses: [
      "When all my labors and trials are o'er,\nAnd I am safe on that beautiful shore,\nJust to be near the dear Lord I adore\nWill through the ages be glory for me.",
      "When by the gift of His infinite grace,\nI am accorded in heaven a place,\nJust to be there and to look on His face\nWill through the ages be glory for me.",
      "Friends will be there I have loved long ago;\nJoy like a river around me will flow;\nYet just a smile from my Savior, I know,\nWill through the ages be glory for me.",
    ],
    chorus: "O that will be glory for me,\nGlory for me, glory for me,\nWhen by His grace I shall look on His face,\nThat will be glory, be glory for me!",
  },
  {
    id: "h53", number: 632, title: "When We All Get to Heaven", category: "Hope",
    verses: [
      "Sing the wondrous love of Jesus,\nSing His mercy and His grace;\nIn the mansions bright and blessed\nHe'll prepare for us a place.",
      "While we walk the pilgrim pathway,\nClouds will overspread the sky;\nBut when traveling days are over\nNot a shadow, not a sigh.",
      "Let us then be true and faithful,\nTrusting, serving every day;\nJust one glimpse of Him in glory\nWill the toils of life repay.",
      "Onward to the prize before us!\nSoon His beauty we'll behold;\nSoon the pearly gates will open;\nWe shall tread the streets of gold.",
    ],
    chorus: "When we all get to heaven,\nWhat a day of rejoicing that will be!\nWhen we all see Jesus,\nWe'll sing and shout the victory!",
  },
  {
    id: "h54", number: 635, title: "Face to Face with Christ My Savior", category: "Hope",
    verses: [
      "Face to face with Christ my Savior,\nFace to face—what will it be?\nWhen with rapture I behold Him,\nJesus Christ who died for me.",
      "Only faintly now I see Him,\nWith the darkened veil between;\nBut a blessed day is coming,\nWhen His glory shall be seen.",
      "What rejoicing in His presence,\nWhen are banished grief and pain;\nWhen the crooked ways are straightened\nAnd the dark things shall be plain.",
    ],
    chorus: "Face to face I shall behold Him,\nFar beyond the starry sky;\nFace to face in all His glory,\nI shall see Him by and by!",
  },
  {
    id: "h55", number: 462, title: "Blessed Assurance (Reprise)", category: "Assurance",
    verses: [
      "Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.",
    ],
    chorus: "This is my story, this is my song,\nPraising my Savior all the day long.",
  },
  {
    id: "h56", number: 390, title: "O How Love I Thy Law", category: "Sabbath",
    verses: [
      "O how love I Thy law!\nIt is my meditation all the day.\nThy commandments make me wiser than my enemies,\nFor they are ever with me.",
      "I have more understanding than all my teachers,\nFor Thy testimonies are my meditation.\nI understand more than the ancients,\nBecause I keep Thy precepts.",
      "How sweet are Thy words unto my taste!\nYea, sweeter than honey to my mouth!\nThrough Thy precepts I get understanding;\nTherefore I hate every false way.",
    ],
  },
  {
    id: "h57", number: 310, title: "Take My Life and Let It Be", category: "Devotion",
    verses: [
      "Take my life and let it be\nConsecrated, Lord, to Thee;\nTake my moments and my days;\nLet them flow in ceaseless praise.",
      "Take my hands and let them move\nAt the impulse of Thy love;\nTake my feet and let them be\nSwift and beautiful for Thee.",
      "Take my voice and let me sing\nAlways, only, for my King;\nTake my lips and let them be\nFilled with messages from Thee.",
      "Take my will and make it Thine;\nIt shall be no longer mine;\nTake my heart, it is Thine own;\nIt shall be Thy royal throne.",
    ],
  },
  {
    id: "h58", number: 275, title: "Thy Word Is a Lamp", category: "Scripture",
    verses: [
      "Thy Word is a lamp to my feet\nAnd a light to my path.\nThy Word is a lamp to my feet\nAnd a light to my path.",
      "When I feel afraid, think I've lost my way,\nStill You're there right beside me,\nNothing will I fear as long as You are near;\nPlease be near me to the end.",
      "I will not forget Your love for me, and yet\nMy heart forever is wandering;\nJesus be my guide and hold me to Your side,\nI will love You to the end.",
    ],
  },
  {
    id: "h59", number: 309, title: "My Faith Looks Up to Thee", category: "Prayer",
    verses: [
      "My faith looks up to Thee,\nThou Lamb of Calvary,\nSavior divine!\nNow hear me while I pray;\nTake all my guilt away;\nO let me from this day\nBe wholly Thine!",
      "May Thy rich grace impart\nStrength to my fainting heart,\nMy zeal inspire;\nAs Thou hast died for me,\nO may my love to Thee\nPure, warm, and changeless be,\nA living fire!",
      "While life's dark maze I tread,\nAnd griefs around me spread,\nBe Thou my guide;\nBid darkness turn to day,\nWipe sorrow's tears away,\nNor let me ever stray\nFrom Thee aside.",
    ],
  },
  {
    id: "h60", number: 583, title: "Go, Labor On", category: "Mission",
    verses: [
      "Go, labor on; spend and be spent,\nThy joy to do the Father's will;\nIt is the way the Master went;\nShould not the servant tread it still?",
      "Go, labor on; 'tis not for naught;\nThine earthly loss is heavenly gain;\nMen heed thee, love thee, praise thee not;\nThe Master praises—what are men?",
      "Go, labor on while it is day;\nThe world's dark night is hastening on;\nSpeed, speed thy work, cast sloth away;\nIt is not thus that souls are won.",
      "Toil on, faint not, keep watch and pray;\nBe wise the erring soul to win;\nGo forth into the world's highway,\nCompel the wanderer to come in.",
    ],
  },
];

const CATEGORIES = [
  "All", "Praise", "Worship", "Prayer", "Calvary", "Assurance",
  "Scripture", "Trust", "Devotion", "Hope", "Creation", "Sabbath",
  "Mission", "The Church", "Holy Spirit", "Second Coming",
];

function getDailyHymn(): Hymn {
  const day = Math.floor(Date.now() / 86400000);
  return HYMNS[day % HYMNS.length];
}

export default function HymnsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [currentVerse, setCurrentVerse] = useState(0);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  const dailyHymn = getDailyHymn();

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const openHymn = useCallback((hymn: Hymn) => {
    setSelectedHymn(hymn);
    setCurrentVerse(0);
  }, []);

  const fontSizeValue = fontSize === "sm" ? 14 : fontSize === "lg" ? 20 : 16;
  const lineHeightValue = fontSize === "sm" ? 22 : fontSize === "lg" ? 32 : 26;

  const filtered = HYMNS.filter((h) => {
    const matchSearch = search === "" ||
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      String(h.number).includes(search) ||
      h.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || h.category === activeCategory;
    const matchTab = activeTab === "all" || favorites.has(h.id);
    return matchSearch && matchCat && matchTab;
  });

  const totalVerses = selectedHymn ? selectedHymn.verses.length : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>SDA Hymnal</Text>
          <Text style={styles.headerSub}>{HYMNS.length} hymns</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Hymn of the Day */}
      <TouchableOpacity style={styles.hymnOfDay} onPress={() => openHymn(dailyHymn)} activeOpacity={0.85}>
        <View style={styles.hymnOfDayLeft}>
          <View style={styles.hymnOfDayBadge}>
            <Ionicons name="musical-note" size={12} color="#B8860B" />
            <Text style={styles.hymnOfDayBadgeText}>HYMN OF THE DAY</Text>
          </View>
          <Text style={styles.hymnOfDayTitle} numberOfLines={1}>{dailyHymn.title}</Text>
          <Text style={styles.hymnOfDaySub}>#{dailyHymn.number} · {dailyHymn.category}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#B8860B" />
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>All Hymns</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "favorites" && styles.tabBtnActive]}
          onPress={() => setActiveTab("favorites")}
        >
          <Ionicons
            name={activeTab === "favorites" ? "heart" : "heart-outline"}
            size={14}
            color={activeTab === "favorites" ? "#FFF" : "#8E8E93"}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, activeTab === "favorites" && styles.tabTextActive]}>
            Favorites {favorites.size > 0 ? `(${favorites.size})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#636366" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, number, or category..."
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

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(h) => h.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.hymnCard} onPress={() => openHymn(item)} activeOpacity={0.8}>
            <View style={styles.hymnNumber}>
              <Text style={styles.hymnNumberText}>#{item.number}</Text>
            </View>
            <View style={styles.hymnInfo}>
              <Text style={styles.hymnTitle}>{item.title}</Text>
              <Text style={styles.hymnCat}>{item.category} · {item.verses.length} verses</Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={() => toggleFavorite(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={favorites.has(item.id) ? "heart" : "heart-outline"}
                size={18}
                color={favorites.has(item.id) ? "#FF453A" : "#636366"}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="musical-notes-outline" size={40} color="#3C3C3E" />
            <Text style={{ color: "#636366", marginTop: 12, fontSize: 14 }}>
              {activeTab === "favorites" ? "No favorites yet — tap ♥ to save a hymn" : "No hymns found"}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      {/* Hymn Reader Modal */}
      {selectedHymn && (
        <View style={[StyleSheet.absoluteFill, styles.modalContainer]}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

          {/* Modal Header */}
          <View style={[styles.modalHeader, { paddingTop: topPad }]}>
            <TouchableOpacity onPress={() => setSelectedHymn(null)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedHymn.title}</Text>
              <Text style={styles.modalSub}>#{selectedHymn.number} · {selectedHymn.category}</Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={() => toggleFavorite(selectedHymn.id)}
            >
              <Ionicons
                name={favorites.has(selectedHymn.id) ? "heart" : "heart-outline"}
                size={22}
                color={favorites.has(selectedHymn.id) ? "#FF453A" : "#8E8E93"}
              />
            </TouchableOpacity>
          </View>

          {/* Font size + verse counter */}
          <View style={styles.modalToolbar}>
            <View style={styles.fontSizeGroup}>
              {(["sm", "md", "lg"] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.fontBtn, fontSize === size && styles.fontBtnActive]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[styles.fontBtnText, { fontSize: size === "sm" ? 11 : size === "lg" ? 17 : 14 }, fontSize === size && { color: "#FFF" }]}>
                    A
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.verseCounter}>
              Verse {currentVerse + 1} of {totalVerses}
            </Text>
          </View>

          {/* Verse content */}
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Chorus before verses if exists */}
            {selectedHymn.chorus && currentVerse === 0 && (
              <View style={styles.chorusBlock}>
                <Text style={styles.chorusLabel}>CHORUS</Text>
                <Text style={[styles.chorusText, { fontSize: fontSizeValue, lineHeight: lineHeightValue }]}>
                  {selectedHymn.chorus}
                </Text>
              </View>
            )}

            <View style={styles.verseBlock}>
              <Text style={styles.verseNum}>Verse {currentVerse + 1}</Text>
              <Text style={[styles.verseText, { fontSize: fontSizeValue, lineHeight: lineHeightValue }]}>
                {selectedHymn.verses[currentVerse]}
              </Text>
            </View>

            {/* Show chorus after verses too if chorus exists */}
            {selectedHymn.chorus && currentVerse > 0 && (
              <View style={styles.chorusBlock}>
                <Text style={styles.chorusLabel}>CHORUS</Text>
                <Text style={[styles.chorusText, { fontSize: fontSizeValue, lineHeight: lineHeightValue }]}>
                  {selectedHymn.chorus}
                </Text>
              </View>
            )}

            {/* All verses list at bottom */}
            <View style={styles.allVersesDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.allVersesLabel}>ALL VERSES</Text>
              <View style={styles.dividerLine} />
            </View>
            {selectedHymn.verses.map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.verseThumb, currentVerse === i && styles.verseThumbActive]}
                onPress={() => setCurrentVerse(i)}
              >
                <Text style={[styles.verseThumbNum, currentVerse === i && { color: "#3B5BDB" }]}>
                  {i + 1}
                </Text>
                <Text style={[styles.verseThumbText, currentVerse === i && { color: "#FFF" }]} numberOfLines={2}>
                  {selectedHymn.verses[i].split("\n")[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Verse navigation */}
          <View style={[styles.navBar, { paddingBottom: insets.bottom + 8 }]}>
            <TouchableOpacity
              style={[styles.navBtn, currentVerse === 0 && styles.navBtnDisabled]}
              onPress={() => setCurrentVerse((v) => Math.max(0, v - 1))}
              disabled={currentVerse === 0}
            >
              <Ionicons name="chevron-back" size={20} color={currentVerse === 0 ? "#3C3C3E" : "#FFF"} />
              <Text style={[styles.navBtnText, currentVerse === 0 && { color: "#3C3C3E" }]}>Previous</Text>
            </TouchableOpacity>

            <View style={styles.verseDots}>
              {selectedHymn.verses.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setCurrentVerse(i)}>
                  <View style={[styles.dot, currentVerse === i && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.navBtn, currentVerse === totalVerses - 1 && styles.navBtnDisabled]}
              onPress={() => setCurrentVerse((v) => Math.min(totalVerses - 1, v + 1))}
              disabled={currentVerse === totalVerses - 1}
            >
              <Text style={[styles.navBtnText, currentVerse === totalVerses - 1 && { color: "#3C3C3E" }]}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color={currentVerse === totalVerses - 1 ? "#3C3C3E" : "#FFF"} />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  hymnOfDay: {
    marginHorizontal: 16, marginBottom: 12, backgroundColor: "#1A1608",
    borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#B8860B33",
  },
  hymnOfDayLeft: { flex: 1 },
  hymnOfDayBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  hymnOfDayBadgeText: { color: "#B8860B", fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  hymnOfDayTitle: { color: "#FFF", fontSize: 15, fontWeight: "700", marginBottom: 2 },
  hymnOfDaySub: { color: "#B8860B99", fontSize: 12 },
  tabRow: {
    flexDirection: "row", paddingHorizontal: 16, marginBottom: 10, gap: 8,
  },
  tabBtn: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20, backgroundColor: "#1C1C1E",
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  tabBtnActive: { backgroundColor: "#3B5BDB", borderColor: "#3B5BDB" },
  tabText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: "#FFF" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E",
    borderRadius: 12, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15, paddingVertical: 10 },
  catRow: { marginBottom: 12, minHeight: 44 },
  catContent: { paddingHorizontal: 16, paddingVertical: 6, gap: 8, alignItems: "center" },
  catPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E" },
  catPillActive: { backgroundColor: "#3B5BDB", borderColor: "#3B5BDB" },
  catText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  catTextActive: { color: "#FFF" },
  hymnCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#111",
    borderRadius: 12, padding: 14, gap: 12,
  },
  hymnNumber: {
    width: 46, height: 46, borderRadius: 10, backgroundColor: "#3B5BDB22",
    alignItems: "center", justifyContent: "center",
  },
  hymnNumberText: { color: "#3B5BDB", fontSize: 12, fontWeight: "700" },
  hymnInfo: { flex: 1 },
  hymnTitle: { color: "#FFF", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  hymnCat: { color: "#8E8E93", fontSize: 12 },
  favoriteBtn: { padding: 4 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: "#0A0A0A" },
  modalHeader: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2C2C2E", gap: 8,
  },
  modalHeaderInfo: { flex: 1 },
  modalTitle: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  modalSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  modalToolbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C1C1E",
  },
  fontSizeGroup: { flexDirection: "row", gap: 6 },
  fontBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: "#1C1C1E",
    alignItems: "center", justifyContent: "center",
  },
  fontBtnActive: { backgroundColor: "#3B5BDB" },
  fontBtnText: { color: "#8E8E93", fontWeight: "700" },
  verseCounter: { color: "#636366", fontSize: 12 },
  verseBlock: { marginBottom: 24 },
  verseNum: { color: "#6B7B5A", fontSize: 11, fontWeight: "700", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  verseText: { color: "#DADADB", lineHeight: 26 },
  chorusBlock: {
    backgroundColor: "#3B5BDB11", borderRadius: 12, padding: 16,
    marginBottom: 20, borderLeftWidth: 3, borderLeftColor: "#3B5BDB",
  },
  chorusLabel: { color: "#3B5BDB", fontSize: 10, fontWeight: "700", marginBottom: 8, letterSpacing: 0.8, textTransform: "uppercase" },
  chorusText: { color: "#DADADB", lineHeight: 26, fontStyle: "italic" },
  allVersesDivider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 8 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E" },
  allVersesLabel: { color: "#636366", fontSize: 10, fontWeight: "600", letterSpacing: 0.8 },
  verseThumb: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
    marginBottom: 6, backgroundColor: "#0D0D0D",
  },
  verseThumbActive: { backgroundColor: "#3B5BDB22" },
  verseThumbNum: { color: "#636366", fontSize: 13, fontWeight: "700", width: 20, textAlign: "center" },
  verseThumbText: { flex: 1, color: "#636366", fontSize: 13 },
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#1C1C1E",
    backgroundColor: "#0A0A0A",
  },
  navBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8, paddingHorizontal: 12 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { color: "#FFF", fontSize: 14, fontWeight: "500" },
  verseDots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2C2C2E" },
  dotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#3B5BDB" },
});
