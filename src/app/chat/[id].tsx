import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMessages,
  sendMessageThunk,
  setActiveConversation,
  receiveMessage,
  markConversationAsReadInState,
} from "../../store/slices/chatSlice";
import { chatApi } from "../../services/api";
import { initSocket } from "../../services/socket";
import { THEME } from "../../constants/theme";

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const conversation = useAppSelector((state) =>
    state.chat.conversations.find((c) => c._id === id),
  );
  const messages = useAppSelector((state) =>
    id ? state.chat.messages[id] || [] : [],
  );
  const isLoading = useAppSelector((state) => state.chat.isLoadingMessages);

  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Setup conversation, messages, and socket listener
  useEffect(() => {
    if (id) {
      dispatch(setActiveConversation(id));
      dispatch(fetchMessages(id));
      dispatch(markConversationAsReadInState(id));
      chatApi.markRead(id).catch(() => {});

      // Initialize Socket connection and listeners
      initSocket().then((socket) => {
        socket.emit("join", { conversationId: id, userId: user?._id });

        const handleNewMessage = (data: any) => {
          if (data && data.conversation === id) {
            dispatch(receiveMessage(data));
          }
        };

        socket.on("private_message", handleNewMessage);
        socket.on("message_sent", handleNewMessage);

        return () => {
          socket.off("private_message", handleNewMessage);
          socket.off("message_sent", handleNewMessage);
        };
      });
    }

    return () => {
      dispatch(setActiveConversation(null));
    };
  }, [id, dispatch, user?._id]);

  const handleSend = async () => {
    if (!inputText.trim() || sending || !id) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      await dispatch(sendMessageThunk({ conversationId: id, text })).unwrap();
    } catch (err: any) {
      Alert.alert("Failed to Send", err || "Could not deliver your message.");
    } finally {
      setSending(false);
    }
  };

  const handlePickAttachment = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access to send images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const photo = result.assets[0];
        const formData = new FormData();
        const filename = photo.uri.split("/").pop() || "chat_attachment.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("file", {
          uri: photo.uri,
          name: filename,
          type,
        } as any);

        setSending(true);
        try {
          const uploadRes = await chatApi.uploadAttachment(formData);
          if (uploadRes.data?.attachment && id) {
            await dispatch(
              sendMessageThunk({
                conversationId: id,
                text: "Sent an attachment",
                attachment: uploadRes.data.attachment,
              }),
            ).unwrap();
          }
        } catch (err) {
          Alert.alert("Upload Failed", "Could not send image attachment.");
        } finally {
          setSending(false);
        }
      }
    } catch (e) {
      console.warn("Attachment error:", e);
    }
  };

  const otherUser =
    conversation?.participants?.find((p) => p._id !== user?._id) ||
    conversation?.participants?.[0];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.navy} />
        </TouchableOpacity>

        <Image
          source={{
            uri:
              otherUser?.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
          }}
          style={styles.avatar}
          contentFit="cover"
        />

        <View style={styles.headerInfo}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {otherUser?.name || "Customer"}
          </Text>
          <Text style={styles.onlineStatus}>Active on DealDoko</Text>
        </View>
      </View>

      {/* Ad Context Banner */}
      {conversation?.advertisement && (
        <TouchableOpacity
          style={styles.adBanner}
          onPress={() => {
            if (conversation.advertisement?.slug) {
              router.push({
                pathname: "/listing/[slug]",
                params: { slug: conversation.advertisement.slug },
              } as any);
            }
          }}
        >
          <Image
            source={{
              uri:
                conversation.advertisement.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=200&q=80",
            }}
            style={styles.adThumb}
            contentFit="cover"
          />
          <View style={styles.adBannerText}>
            <Text style={styles.adBannerTitle} numberOfLines={1}>
              {conversation.advertisement.title}
            </Text>
            <Text style={styles.adBannerPrice}>
              Rs.{" "}
              {Number(conversation.advertisement.price).toLocaleString("en-IN")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={THEME.colors.textMuted}
          />
        </TouchableOpacity>
      )}

      {/* Messages Feed */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id || Math.random().toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          renderItem={({ item }) => {
            const isMe = item.sender?._id === user?._id;

            return (
              <View
                style={[
                  styles.messageBubble,
                  isMe ? styles.myBubble : styles.theirBubble,
                ]}
              >
                {/* Image Attachment */}
                {item.attachment?.url && (
                  <Image
                    source={{ uri: item.attachment.url }}
                    style={styles.attachedImage}
                    contentFit="cover"
                  />
                )}

                {item.text && item.text !== "Sent an attachment" && (
                  <Text
                    style={[
                      styles.bubbleText,
                      isMe ? styles.myText : styles.theirText,
                    ]}
                  >
                    {item.text}
                  </Text>
                )}

                <Text
                  style={[
                    styles.timeText,
                    isMe ? styles.myTime : styles.theirTime,
                  ]}
                >
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyMessages}>
                <Ionicons
                  name="shield-checkmark"
                  size={36}
                  color={THEME.colors.primary}
                />
                <Text style={styles.emptyPromptTitle}>
                  Safe In-App Messaging
                </Text>
                <Text style={styles.emptyPromptSubtitle}>
                  Negotiate directly, ask questions about the item, and arrange
                  safe public meetings. Never send advance payment.
                </Text>
              </View>
            ) : (
              <ActivityIndicator
                style={{ marginTop: 24 }}
                color={THEME.colors.primary}
              />
            )
          }
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={handlePickAttachment}
          >
            <Ionicons
              name="camera-outline"
              size={24}
              color={THEME.colors.textSecondary}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={THEME.colors.textMuted}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              inputText.trim().length > 0 && styles.activeSendBtn,
            ]}
            onPress={handleSend}
            disabled={sending || inputText.trim().length === 0}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.borderLight,
  },
  headerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  onlineStatus: {
    fontSize: 10,
    color: THEME.colors.success,
    fontWeight: "600",
  },
  adBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 10,
  },
  adThumb: {
    width: 38,
    height: 38,
    borderRadius: THEME.radii.xs,
    backgroundColor: THEME.colors.borderLight,
  },
  adBannerText: {
    flex: 1,
  },
  adBannerTitle: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  adBannerPrice: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: THEME.radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...THEME.shadows.sm,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: THEME.colors.primary,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    fontSize: THEME.typography.sizes.sm,
    lineHeight: 20,
  },
  myText: {
    color: "#FFFFFF",
  },
  theirText: {
    color: THEME.colors.text,
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  theirTime: {
    color: THEME.colors.textMuted,
  },
  attachedImage: {
    width: 200,
    height: 150,
    borderRadius: THEME.radii.md,
    marginBottom: 6,
  },
  emptyMessages: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyPromptTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptyPromptSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.text,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  activeSendBtn: {
    backgroundColor: THEME.colors.primary,
  },
});
