import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance" },
  { id: "platform-nature", title: "2. Platform Role" },
  { id: "accounts", title: "3. Accounts" },
  { id: "listing-rules", title: "4. Listing Rules" },
  { id: "prohibited-items", title: "5. Prohibited Goods" },
  { id: "intellectual-property", title: "6. IP & License" },
  { id: "disclaimers", title: "7. Liability" },
  { id: "governing-law", title: "8. Nepal Law" },
];

export default function TermsOfUseScreen() {
  const router = useRouter();
  const scrollRef = useRef<any>(null);

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
        <Text style={styles.headerTitle}>Terms of Use</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: THEME.colors.background }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={styles.scaleBadge}>
              <Ionicons name="scale-outline" size={14} color="#FDBA74" />
              <Text style={styles.scaleBadgeText}>Legal Agreement & User Terms</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>
            Terms of <Text style={styles.heroHighlight}>Use</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Please review these terms carefully before accessing or using DealDoko. By creating an account, posting advertisements, or transacting, you agree to be bound by this agreement under the laws of Nepal.
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#93C5FD" />
            <Text style={styles.metaText}>
              Last Updated: November 2026 • Effective across all 7 Provinces of Nepal
            </Text>
          </View>
        </View>

        {/* Quick Nav Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navChipsContainer}
        >
          {SECTIONS.map((sec) => (
            <View key={sec.id} style={styles.navChip}>
              <Text style={styles.navChipText}>{sec.title}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Section 1: Acceptance & Eligibility */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="shield" size={20} color={THEME.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>1. Acceptance of Terms & Eligibility</Text>
          </View>
          <Text style={styles.paragraph}>
            By accessing, browsing, registering on, or utilizing <Text style={styles.bold}>DealDoko</Text> (dealdoko.com & related mobile applications), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Use and our Privacy Policy.
          </Text>
          <Text style={styles.paragraph}>
            To use DealDoko, you must be at least 18 years of age or possess legal capacity under the laws of Nepal. If registering on behalf of a registered business, showroom, or store in Nepal, you warrant that you are authorized to represent and bind that legal entity.
          </Text>
        </View>

        {/* Section 2: Platform Nature */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="storefront" size={20} color="#16A34A" />
            </View>
            <Text style={styles.cardTitle}>2. Nature of DealDoko Platform</Text>
          </View>
          <Text style={styles.paragraph}>
            DealDoko functions exclusively as an online neutral classified marketplace connecting independent buyers, sellers, and service providers. DealDoko is not an auction house, retail merchant, or escrow payment provider.
          </Text>
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle" size={18} color={THEME.colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>Notice Regarding Transactions:</Text>
              <Text style={styles.noticeBody}>
                DealDoko is not a party to the actual contract between buyers and sellers. We do not hold physical inventory, guarantee the quality or legality of items, or manage deliveries. Buyers and sellers meet and transact directly and are solely responsible for inspecting products and verifying funds.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3: User Accounts & Security */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="person-circle" size={20} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>3. User Accounts & Security</Text>
          </View>
          <Text style={styles.paragraph}>
            You must provide accurate, current, and verifiable contact details, including a valid Nepali phone number. You are solely responsible for safeguarding your login credentials and OTP codes.
          </Text>
          <Text style={styles.paragraph}>
            DealDoko reserves the right to suspend or permanently ban any account suspected of fraud, harassment, impersonation, or creating duplicate accounts to bypass listing limitations.
          </Text>
        </View>

        {/* Section 4: Listing Guidelines */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="pricetag" size={20} color="#9333EA" />
            </View>
            <Text style={styles.cardTitle}>4. Listing Policies & Guidelines</Text>
          </View>
          <Text style={styles.paragraph}>
            When publishing an advertisement on DealDoko, you agree to:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                Provide accurate product specifications, truthful condition grading, and transparent pricing in Nepalese Rupees (NPR).
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                Upload only genuine photographs of the actual item for sale. Generic stock images from foreign websites are strictly prohibited for used items.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                Categorize advertisements in their accurate geographic district and relevant category.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                Mark listings as "Sold" promptly once a transaction is completed.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 5: Strictly Prohibited Goods */}
        <View style={[styles.card, styles.dangerCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="ban" size={20} color="#DC2626" />
            </View>
            <Text style={[styles.cardTitle, { color: "#991B1B" }]}>
              5. Strictly Prohibited Goods & Services
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: "#7F1D1D" }]}>
            The advertisement of any of the following items is strictly prohibited and results in immediate permanent ban and referral to the <Text style={styles.bold}>Nepal Police Cyber Bureau</Text>:
          </Text>

          <View style={styles.prohibitedGrid}>
            <View style={styles.prohibitedItem}>
              <Text style={styles.prohibitedTitle}>Firearms & Weapons</Text>
              <Text style={styles.prohibitedDesc}>Guns, ammunition, military knives, and explosives.</Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Text style={styles.prohibitedTitle}>Stolen Goods & Contraband</Text>
              <Text style={styles.prohibitedDesc}>Items lacking legal ownership proof or forged Bluebooks.</Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Text style={styles.prohibitedTitle}>Wildlife & Protected Species</Text>
              <Text style={styles.prohibitedDesc}>Endangered animals, skins, horns, and restricted herbs.</Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Text style={styles.prohibitedTitle}>Prescription Drugs & Narcotics</Text>
              <Text style={styles.prohibitedDesc}>Controlled medicines, illicit drugs, and unlicensed pharma.</Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Text style={styles.prohibitedTitle}>Pyramid & MLM Schemes</Text>
              <Text style={styles.prohibitedDesc}>Multi-level marketing, get-rich scams, and fake foreign visas.</Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Text style={styles.prohibitedTitle}>Adult Content & Services</Text>
              <Text style={styles.prohibitedDesc}>Pornographic items and unregulated adult entertainment.</Text>
            </View>
          </View>
        </View>

        {/* Section 6: IP & Content License */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons name="code-slash" size={20} color={THEME.colors.textSecondary} />
            </View>
            <Text style={styles.cardTitle}>6. Intellectual Property & License</Text>
          </View>
          <Text style={styles.paragraph}>
            By submitting photos and text, you grant DealDoko a non-exclusive, worldwide, royalty-free license to host, format, and display such listings across our mobile apps and web platforms.
          </Text>
          <Text style={styles.paragraph}>
            All DealDoko branding, trademarks, logos, UI designs, algorithms, and application code are the exclusive intellectual property of DealDoko.
          </Text>
        </View>

        {/* Section 7: Disclaimers & Limitation of Liability */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="alert-circle" size={20} color={THEME.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>7. Disclaimers & Limitation of Liability</Text>
          </View>
          <Text style={styles.paragraph}>
            DealDoko is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Under no circumstances shall DealDoko, its directors, or affiliates be liable for disputes, losses, or damages resulting from direct transactions between users, third-party fraud, or unexpected network outages.
          </Text>
        </View>

        {/* Section 8: Governing Law & Jurisdiction */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="business" size={20} color="#D97706" />
            </View>
            <Text style={styles.cardTitle}>8. Governing Law & Nepal Jurisdiction</Text>
          </View>
          <Text style={styles.paragraph}>
            These Terms shall be governed by, and construed in accordance with, the laws of <Text style={styles.bold}>Nepal</Text>, including the <Text style={styles.bold}>Electronic Transactions Act 2063 (2008)</Text> and the <Text style={styles.bold}>Muluki Civil Code 2074</Text>.
          </Text>
          <Text style={styles.paragraph}>
            Any disputes arising in connection with these terms shall fall under the exclusive jurisdiction of the competent courts of <Text style={styles.bold}>Kathmandu, Nepal</Text>.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
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
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: "#00225E",
    borderRadius: THEME.radii.xl,
    padding: 20,
    marginBottom: 16,
    ...THEME.shadows.md,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  scaleBadge: {
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
  scaleBadgeText: {
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
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  metaText: {
    fontSize: 11,
    color: "#BFDBFE",
    flex: 1,
  },
  navChipsContainer: {
    paddingBottom: 14,
    gap: 8,
  },
  navChip: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  navChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  dangerCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.text,
    flex: 1,
  },
  paragraph: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "700",
    color: THEME.colors.text,
  },
  noticeBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginTop: 4,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.primary,
    marginBottom: 2,
  },
  noticeBody: {
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 17,
  },
  bulletList: {
    gap: 10,
    marginVertical: 4,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bulletText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  prohibitedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  prohibitedItem: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  prohibitedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B91C1C",
    marginBottom: 4,
  },
  prohibitedDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 15,
  },
});
