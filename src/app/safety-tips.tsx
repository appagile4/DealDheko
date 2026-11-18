import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";

const GOLDEN_RULES = [
  {
    icon: "location-sharp" as const,
    title: "1. Meet in Busy, Well-Lit Public Places",
    description:
      "Always arrange physical meetings in bustling public places during daylight hours. Ideal locations in Kathmandu & Pokhara include shopping malls (Bhatbhateni, Labim Mall, Civil Mall), major bank lobbies, or cafes near main intersections. Never meet in secluded alleys or private residences alone.",
  },
  {
    icon: "eye-sharp" as const,
    title: "2. Inspect the Item In-Person First",
    description:
      "Thoroughly inspect the product before handing over any money. For smartphones and laptops, verify iCloud / Google account signouts, check IMEI numbers against official boxes, and inspect battery health. For bikes and cars, test ride in an open area and inspect engine noise.",
  },
  {
    icon: "card-sharp" as const,
    title: "3. Never Pay Advance 'Booking' or 'Delivery' Fees",
    description:
      "Legitimate sellers do not demand advance token deposits before you have personally examined the item. Never transfer money via eSewa, Khalti, IME Pay, or bank transfer in advance to 'hold' an item or cover imaginary courier charges.",
  },
  {
    icon: "document-text-sharp" as const,
    title: "4. Verify Official Bluebook Papers & Chassis",
    description:
      "When purchasing used motorbikes, scooters, or cars, inspect the official government Bluebook (Sawari Darta Kitab). Ensure the chassis and engine numbers stamped on the vehicle physically match the book, and check that annual vehicle taxes (Sawari Kar) are up to date at Yatayat Karyalaya.",
  },
  {
    icon: "people-sharp" as const,
    title: "5. Bring a Friend or Expert Mechanic",
    description:
      "For significant purchases (such as automobiles, cameras, musical instruments, or rented properties), bring along a knowledgeable friend or trusted mechanic. A second pair of eyes helps spot cosmetic coverups, engine leaks, and hidden defects.",
  },
];

const DOS = [
  "Test smartphones thoroughly: make a test call, check WiFi, cameras, speakers, and touch response.",
  "Verify seller's identity on DealDoko: look for the 'Verified Seller' badge and member join date.",
  "Pay via digital transfer (Fonepay / eSewa) ONLY after you have physical possession of the product.",
  "Ask for original purchase receipts, warranty cards, and packaging when available.",
  "Report suspicious ads immediately using the 'Report' button on any ad.",
];

const DONTS = [
  "Never send advance deposits, earnest money, or courier fees before physical inspection.",
  "Don't accept fake payment confirmation screenshots — verify your own bank/eSewa balance directly.",
  "Never scan unfamiliar QR codes that claim to 'send you money' — QR codes authorize debits, not credits.",
  "Avoid deals that appear 'too good to be true' (e.g. iPhone 15 Pro for Rs. 35,000 is always a scam).",
  "Do not share OTP codes, banking passwords, or national citizenship card copies with strangers.",
];

export default function SafetyTipsScreen() {
  const router = useRouter();

  const handleReportAd = () => {
    Linking.openURL("mailto:support@dealdoko.com?subject=Report%20Suspicious%20Ad%20or%20User");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buyer & Seller Safety</Text>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={handleReportAd}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="alert-circle-outline" size={24} color={THEME.colors.warning} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={styles.shieldBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FDBA74" />
              <Text style={styles.shieldBadgeText}>Safety & Fraud Prevention</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>
            Safety Tips for <Text style={styles.heroHighlight}>Nepal</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Follow these essential marketplace rules on every deal to eliminate 99.9% of transaction risks and avoid common classified scams.
          </Text>
        </View>

        {/* Section: 5 Golden Rules */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>ESSENTIAL RULES</Text>
          </View>
          <Text style={styles.sectionTitle}>The 5 Golden Rules of Safe Classifieds</Text>
          <Text style={styles.sectionSubtitle}>
            Keep these top of mind whenever meeting a buyer or seller in person.
          </Text>
        </View>

        {GOLDEN_RULES.map((rule, idx) => (
          <View key={idx} style={styles.ruleCard}>
            <View style={styles.ruleIconWrap}>
              <Ionicons name={rule.icon} size={22} color={THEME.colors.accent} />
            </View>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <Text style={styles.ruleDesc}>{rule.description}</Text>
            </View>
          </View>
        ))}

        {/* Do's and Don'ts Checklist */}
        <View style={styles.checklistSection}>
          <Text style={styles.sectionTitle}>Do's & Don'ts Quick Reference</Text>
          <Text style={styles.sectionSubtitle}>
            A handy checklist for face-to-face inspections and payment security.
          </Text>

          {/* Do's Card */}
          <View style={styles.dosCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
              <Text style={styles.dosTitle}>Always DO These:</Text>
            </View>
            <View style={styles.checkList}>
              {DOS.map((item, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <View style={[styles.dot, { backgroundColor: "#16A34A" }]} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Don'ts Card */}
          <View style={styles.dontsCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="close-circle" size={22} color="#DC2626" />
              <Text style={styles.dontsTitle}>NEVER Do These:</Text>
            </View>
            <View style={styles.checkList}>
              {DONTS.map((item, idx) => (
                <View key={idx} style={styles.checkItem}>
                  <View style={[styles.dot, { backgroundColor: "#DC2626" }]} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* High Ticket Inspection Advice */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category-Specific Safety Advice</Text>
        </View>

        <View style={styles.categoryAdviceCard}>
          <View style={styles.categoryAdviceHeader}>
            <Ionicons name="bicycle" size={20} color={THEME.colors.primary} />
            <Text style={styles.categoryAdviceTitle}>Used Bikes & Scooters</Text>
          </View>
          <Text style={styles.categoryAdviceBody}>
            Check engine noise upon cold start. Verify battery charging, tire tread, and front fork oil seals. Ensure no police confiscation or loan hold exists at Yatayat Karyalaya.
          </Text>
        </View>

        <View style={styles.categoryAdviceCard}>
          <View style={styles.categoryAdviceHeader}>
            <Ionicons name="phone-portrait" size={20} color={THEME.colors.primary} />
            <Text style={styles.categoryAdviceTitle}>Used Smartphones (iPhone & Android)</Text>
          </View>
          <Text style={styles.categoryAdviceBody}>
            Dial <Text style={styles.codeText}>*#06#</Text> to cross-verify the IMEI with the original box. Check MDMS registration on the Nepal Telecommunications Authority (NTA) portal to prevent SIM blocking.
          </Text>
        </View>

        <View style={styles.categoryAdviceCard}>
          <View style={styles.categoryAdviceHeader}>
            <Ionicons name="home" size={20} color={THEME.colors.primary} />
            <Text style={styles.categoryAdviceTitle}>Real Estate & Apartments</Text>
          </View>
          <Text style={styles.categoryAdviceBody}>
            Inspect the Lalpurja (Land Ownership Certificate) and cadastral maps at the local Malpot Karyalaya (Land Revenue Office) before paying any earnest agreement token.
          </Text>
        </View>

        {/* Report Notice Banner */}
        <View style={styles.reportBanner}>
          <Ionicons name="shield-half-sharp" size={32} color="#FF6A00" />
          <View style={{ flex: 1 }}>
            <Text style={styles.reportBannerTitle}>Notice Something Suspicious?</Text>
            <Text style={styles.reportBannerBody}>
              If a seller demands advance booking fees or acts suspiciously, report the listing immediately or notify our Trust & Safety team.
            </Text>
            <TouchableOpacity style={styles.reportBtn} onPress={handleReportAd}>
              <Ionicons name="flag" size={16} color="#FFFFFF" />
              <Text style={styles.reportBtnText}>Report to Safety Team</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: "#00225E",
    borderRadius: THEME.radii.xl,
    padding: 20,
    marginBottom: 20,
    ...THEME.shadows.md,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  shieldBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  shieldBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FDBA74",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  heroHighlight: {
    color: THEME.colors.accent,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#DBEAFE",
    lineHeight: 19,
  },
  sectionHeader: {
    marginBottom: 14,
    marginTop: 4,
  },
  sectionBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 71, 186, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radii.sm,
    marginBottom: 6,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.colors.primary,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 17,
  },
  ruleCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    flexDirection: "row",
    gap: 14,
    ...THEME.shadows.sm,
  },
  ruleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    flexShrink: 0,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 6,
  },
  ruleDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  checklistSection: {
    marginTop: 16,
    marginBottom: 20,
    gap: 14,
  },
  dosCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: THEME.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dosTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#166534",
  },
  dontsCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: THEME.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  dontsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#991B1B",
  },
  checkList: {
    gap: 10,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  checkText: {
    fontSize: 12,
    color: THEME.colors.text,
    lineHeight: 18,
    flex: 1,
  },
  categoryAdviceCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  categoryAdviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  categoryAdviceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  categoryAdviceBody: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  codeText: {
    fontWeight: "700",
    color: THEME.colors.accent,
    backgroundColor: "#F1F5F9",
  },
  reportBanner: {
    backgroundColor: "#0F172A",
    borderRadius: THEME.radii.xl,
    padding: 18,
    marginTop: 14,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    ...THEME.shadows.md,
  },
  reportBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  reportBannerBody: {
    fontSize: 11,
    color: "#94A3B8",
    lineHeight: 16,
    marginBottom: 12,
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: THEME.colors.accent,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: THEME.radii.md,
    alignSelf: "flex-start",
  },
  reportBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
