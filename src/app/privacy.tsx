import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
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

const SECTIONS = [
  { id: "collection", title: "1. Collection" },
  { id: "usage", title: "2. Usage" },
  { id: "phone-privacy", title: "3. Phone Privacy" },
  { id: "cookies", title: "4. Local Storage" },
  { id: "sharing", title: "5. Sharing & Legal" },
  { id: "security", title: "6. Security" },
  { id: "rights", title: "7. Your Rights" },
  { id: "contact-dpo", title: "8. Contact Officer" },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const scrollRef = useRef<any>(null);

  const handleEmailDpo = () => {
    Linking.openURL("mailto:privacy@dealdoko.com?subject=Privacy%20Inquiry%20-%20DealDoko");
  };

  const handleCallHelpline = () => {
    Linking.openURL("tel:+97714567890");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* App Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={handleEmailDpo}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="mail-outline" size={22} color={THEME.colors.primary} />
        </TouchableOpacity>
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
            <View style={styles.lockBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FDBA74" />
              <Text style={styles.lockBadgeText}>Data Protection & Confidentiality</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>
            Privacy <Text style={styles.heroHighlight}>Policy</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Your trust and confidentiality are fundamental to DealDoko. This policy explains what information we collect, how it is secured, and the granular controls you have over your personal data.
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#93C5FD" />
            <Text style={styles.metaText}>
              Last Updated: November 2026 • Compliant with Individual Privacy Act of Nepal
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

        {/* Section 1: Information We Collect */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="folder-open" size={20} color={THEME.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>1. Information We Collect</Text>
          </View>
          <Text style={styles.paragraph}>
            When you interact with DealDoko (dealdoko.com & customer mobile apps), we collect certain categories of personal and usage information:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Account & Profile Data:</Text> Name, email address, and mobile phone number provided during verification or ad posting.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Listing Details:</Text> Titles, descriptions, asking prices, photos, approximate city/district location, and item specifications.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>In-App Communications:</Text> Messages exchanged through our encrypted in-app chat infrastructure (monitored automatically for scam patterns and abusive language).
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Technical & Device Logs:</Text> IP address, device identifiers, app version, and timestamp logs used to prevent unauthorized scraping and spam.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: How We Use Your Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="git-network" size={20} color="#16A34A" />
            </View>
            <Text style={styles.cardTitle}>2. How We Use Your Information</Text>
          </View>
          <Text style={styles.paragraph}>
            We process your information strictly to operate and secure the marketplace experience:
          </Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridItemTitle}>Connecting Buyers & Sellers</Text>
              <Text style={styles.gridItemBody}>
                Displaying your ads, enabling direct calls or encrypted in-app messaging between interested parties.
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridItemTitle}>Fraud Prevention & Safety</Text>
              <Text style={styles.gridItemBody}>
                Detecting advance-fee scams, counterfeit listings, and verifying seller authenticity.
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridItemTitle}>Service Notifications</Text>
              <Text style={styles.gridItemBody}>
                Delivering verification SMS OTPs, password reset links, and listing expiration notices.
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridItemTitle}>Platform Enhancement</Text>
              <Text style={styles.gridItemBody}>
                Optimizing search relevance, category filters, and mobile responsiveness across Nepal.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3: Phone Privacy Feature */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="call" size={20} color="#15803D" />
            </View>
            <Text style={[styles.cardTitle, { color: "#14532D" }]}>
              3. Phone Number Privacy & In-App Chat
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: "#166534" }]}>
            We respect your right to avoid unsolicited calls or spam. When posting any ad, you have complete control over buyer communications:
          </Text>
          <View style={styles.emeraldNotice}>
            <Ionicons name="shield-checkmark" size={20} color="#15803D" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.emeraldNoticeTitle}>"Hide Phone Number" Privacy Feature:</Text>
              <Text style={styles.emeraldNoticeBody}>
                You can select the "Hide Phone Number" option while posting an ad. Your phone number will never be revealed publicly, and all prospective buyers will communicate with you exclusively through DealDoko's in-app messaging.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Cookies & Storage */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="file-tray-full" size={20} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>4. Local Device & App Storage</Text>
          </View>
          <Text style={styles.paragraph}>
            DealDoko uses hardware-backed secure storage to remember session preferences, including:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="ellipse" size={8} color={THEME.colors.primary} style={styles.bulletDot} />
              <Text style={styles.bulletText}>Your selected city / district (e.g. Kathmandu, Pokhara).</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="ellipse" size={8} color={THEME.colors.primary} style={styles.bulletDot} />
              <Text style={styles.bulletText}>Saved favourite listings and search query history.</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="ellipse" size={8} color={THEME.colors.primary} style={styles.bulletDot} />
              <Text style={styles.bulletText}>Encrypted authentication tokens to keep you logged in safely.</Text>
            </View>
          </View>
          <Text style={styles.subtext}>
            We never sell or distribute your browsing habits to external third-party advertisers.
          </Text>
        </View>

        {/* Section 5: Information Sharing & Disclosures */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#FEF2F2" }]}>
              <Ionicons name="share-social" size={20} color="#DC2626" />
            </View>
            <Text style={styles.cardTitle}>5. Sharing & Legal Disclosures</Text>
          </View>
          <Text style={styles.paragraph}>
            DealDoko does not sell, rent, or trade your personal information. Disclosures only occur under these strictly defined conditions:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Public Listings:</Text> Details you voluntarily include in your ad (title, photo, price, city) are visible across the marketplace.
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Law Enforcement Requests:</Text> When required by a lawful court order, warrant, or official subpoena issued by the <Text style={styles.bold}>Nepal Police Cyber Bureau</Text> or judicial authorities investigating fraud or criminal conduct.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 6: Data Security & Retention */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="lock-closed" size={20} color="#9333EA" />
            </View>
            <Text style={styles.cardTitle}>6. Data Security & Retention</Text>
          </View>
          <Text style={styles.paragraph}>
            All network communication between your device and DealDoko is encrypted using bank-grade 256-bit TLS/SSL protocols. Sensitive credentials are protected via cryptographic hashing algorithms.
          </Text>
          <Text style={styles.paragraph}>
            When an advertisement is marked as sold or expired, it is instantly removed from public search indexes.
          </Text>
        </View>

        {/* Section 7: User Rights & Deletion */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="trash-bin" size={20} color={THEME.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>7. Your Data Rights & Deletion Requests</Text>
          </View>
          <Text style={styles.paragraph}>
            Under the Individual Privacy Act of Nepal, you have the right to access, inspect, update, or permanently delete your account and listing records at any time.
          </Text>
          <View style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>Need your account or data removed?</Text>
            <Text style={styles.actionCardBody}>
              Send an email from your registered email address to <Text style={styles.bold}>privacy@dealdoko.com</Text> with the subject line "Account Deletion Request". Our team processes deletion within 48 business hours.
            </Text>
            <TouchableOpacity style={styles.emailBtn} onPress={handleEmailDpo}>
              <Ionicons name="mail" size={16} color="#FFFFFF" />
              <Text style={styles.emailBtnText}>Email Privacy Team</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 8: Contact Data Privacy Officer */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons name="business" size={20} color={THEME.colors.textSecondary} />
            </View>
            <Text style={styles.cardTitle}>8. Contact Data Privacy Officer</Text>
          </View>
          <Text style={styles.paragraph}>
            For questions or complaints concerning your personal information, contact our designated privacy officer:
          </Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactName}>Data Protection Officer — DealDoko</Text>
            <Text style={styles.contactDetail}>Jhamsikhel Road, Ward No. 3, Lalitpur, Nepal</Text>
            <TouchableOpacity onPress={handleEmailDpo} style={styles.contactLinkRow}>
              <Ionicons name="mail" size={14} color={THEME.colors.primary} />
              <Text style={styles.contactLink}>privacy@dealdoko.com</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCallHelpline} style={styles.contactLinkRow}>
              <Ionicons name="call" size={14} color={THEME.colors.primary} />
              <Text style={styles.contactLink}>+977-1-4567890 (Ext. 4)</Text>
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
    marginBottom: 16,
    ...THEME.shadows.md,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  lockBadge: {
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
  lockBadgeText: {
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
  highlightCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
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
  bulletDot: {
    marginTop: 6,
  },
  bulletText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  gridItemTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 4,
  },
  gridItemBody: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 15,
  },
  emeraldNotice: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(22, 163, 74, 0.08)",
    padding: 12,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: "#86EFAC",
    marginTop: 6,
  },
  emeraldNoticeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 2,
  },
  emeraldNoticeBody: {
    fontSize: 12,
    color: "#166534",
    lineHeight: 17,
  },
  subtext: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontStyle: "italic",
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 4,
  },
  actionCardBody: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.radii.md,
  },
  emailBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  contactBox: {
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
  },
  contactName: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  contactDetail: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  contactLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  contactLink: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
});
