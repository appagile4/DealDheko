import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { THEME } from "../../constants/theme";

export type LegalModalType = "terms" | "privacy";

interface LegalModalProps {
  visible: boolean;
  initialType?: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  initialType = "terms",
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalModalType>(initialType);

  // Sync tab with initialType whenever modal opens
  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialType);
    }
  }, [visible, initialType]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              {/* Top Drag Handle */}
              <View style={styles.handleBar} />

              {/* Header with Title and Close Button */}
              <View style={styles.headerRow}>
                <View style={styles.titleWrap}>
                  <Text style={styles.headerTitle}>
                    {activeTab === "terms" ? "Terms of Use" : "Privacy Policy"}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    DealDoko Nepal • Legal Compliance
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={THEME.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Segmented Switcher: Terms vs Privacy */}
              <View style={styles.tabSwitcher}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "terms" && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab("terms")}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color={
                      activeTab === "terms"
                        ? THEME.colors.primary
                        : THEME.colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "terms" && styles.tabTextActive,
                    ]}
                  >
                    Terms of Use
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "privacy" && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab("privacy")}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color={
                      activeTab === "privacy"
                        ? THEME.colors.primary
                        : THEME.colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "privacy" && styles.tabTextActive,
                    ]}
                  >
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Scrollable Legal Document Body */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {activeTab === "terms" ? (
                  <View style={styles.docContainer}>
                    {/* Meta Badge */}
                    <View style={styles.badgeRow}>
                      <View style={styles.legalBadge}>
                        <Ionicons
                          name="scale-outline"
                          size={14}
                          color={THEME.colors.primary}
                        />
                        <Text style={styles.legalBadgeText}>
                          Nepal Electronic Transactions Act 2063
                        </Text>
                      </View>
                    </View>

                    {/* Section 1 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        1. Acceptance & Eligibility
                      </Text>
                      <Text style={styles.paragraph}>
                        By accessing or registering an account on DealDoko
                        (dealdoko.com & customer mobile apps), you confirm you
                        are at least 18 years of age or possess legal capacity
                        under the laws of Nepal. If registering on behalf of a
                        business, you warrant that you are authorized to bind
                        that entity.
                      </Text>
                    </View>

                    {/* Section 2 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        2. Marketplace Nature & Role
                      </Text>
                      <Text style={styles.paragraph}>
                        DealDoko operates as a neutral classified marketplace
                        connecting independent buyers and sellers. DealDoko is
                        not an auctioneer, merchant, or escrow payment provider.
                        Buyers and sellers transact directly and are solely
                        responsible for inspecting products and verifying funds.
                      </Text>
                    </View>

                    {/* Section 3 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        3. User Accounts & Security
                      </Text>
                      <Text style={styles.paragraph}>
                        You agree to provide true, current contact information.
                        You are responsible for maintaining the confidentiality
                        of your account login and OTPs. DealDoko reserves the
                        right to suspend accounts involved in fraud,
                        misrepresentation, or spam.
                      </Text>
                    </View>

                    {/* Section 4 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        4. Prohibited Goods & Services
                      </Text>
                      <Text style={styles.paragraph}>
                        Users may not list or offer any items prohibited by the
                        laws of Nepal, including weapons, fireworks, narcotics,
                        prescription drugs, stolen property, counterfeit goods,
                        smuggled electronics, or endangered wildlife products.
                      </Text>
                    </View>

                    {/* Section 5 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        5. Governing Law & Jurisdiction
                      </Text>
                      <Text style={styles.paragraph}>
                        These Terms are governed by and construed in accordance
                        with the laws of Nepal. Any disputes arising from or
                        related to DealDoko services shall be subject to the
                        exclusive jurisdiction of the competent courts of
                        Kathmandu, Nepal.
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.docContainer}>
                    {/* Meta Badge */}
                    <View style={styles.badgeRow}>
                      <View style={styles.legalBadge}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={14}
                          color={THEME.colors.primary}
                        />
                        <Text style={styles.legalBadgeText}>
                          Individual Privacy Act 2075 of Nepal
                        </Text>
                      </View>
                    </View>

                    {/* Section 1 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        1. Information We Collect
                      </Text>
                      <Text style={styles.paragraph}>
                        We collect information you provide directly to us: your
                        name, email address, mobile phone number, location
                        preferences, listing details, photos, and messages
                        exchanged via our in-app chat infrastructure.
                      </Text>
                    </View>

                    {/* Section 2 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        2. How We Protect Your Privacy
                      </Text>
                      <Text style={styles.paragraph}>
                        DealDoko provides a "Hide Phone Number" option on ad
                        postings, allowing buyers to communicate with you safely
                        via our in-app messaging without exposing your personal
                        mobile number on the public internet.
                      </Text>
                    </View>

                    {/* Section 3 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        3. Data Security & Storage
                      </Text>
                      <Text style={styles.paragraph}>
                        All data transmitted to DealDoko is protected with
                        256-bit TLS encryption in transit and securely stored
                        with role-based access controls. We never sell your
                        personal information to third-party telemarketers.
                      </Text>
                    </View>

                    {/* Section 4 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        4. Account & Data Deletion
                      </Text>
                      <Text style={styles.paragraph}>
                        You have the right to request deletion of your account
                        and associated personal data at any time. Simply email{" "}
                        <Text style={styles.linkText}>privacy@dealdoko.com</Text>{" "}
                        or use the account deletion option in your profile
                        settings.
                      </Text>
                    </View>

                    {/* Section 5 */}
                    <View style={styles.sectionCard}>
                      <Text style={styles.sectionHeading}>
                        5. Legal Inquiries & Contact
                      </Text>
                      <Text style={styles.paragraph}>
                        For privacy inquiries or compliance requests, contact
                        our Data Protection Officer:{"\n"}
                        Email:{" "}
                        <Text style={styles.linkText}>legal@dealdoko.com</Text>
                        {"\n"}
                        Address: DealDoko Nepal, Lalitpur, Bagmati Province.
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Footer Confirmation Button */}
              <View style={styles.footerWrap}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnText}>I Understand & Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const TermsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => (
  <LegalModal visible={visible} initialType="terms" onClose={onClose} />
);

export const PrivacyModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => (
  <LegalModal visible={visible} initialType="privacy" onClose={onClose} />
);

export default LegalModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radii.xl,
    borderTopRightRadius: THEME.radii.xl,
    maxHeight: "88%",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    ...THEME.shadows.lg,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: THEME.colors.border,
    alignSelf: "center",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  titleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: "700",
    color: THEME.colors.navy,
  },
  headerSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: THEME.radii.md,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: THEME.radii.sm,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    ...THEME.shadows.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.textMuted,
  },
  tabTextActive: {
    color: THEME.colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  docContainer: {
    gap: 12,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  legalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radii.full,
    gap: 6,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  legalBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  sectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: THEME.radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.navy,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 19,
    color: THEME.colors.textSecondary,
  },
  linkText: {
    color: THEME.colors.primary,
    fontWeight: "600",
  },
  footerWrap: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  actionBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radii.md,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
