import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
  Keyboard,
} from "react-native";
import { useSelector } from "react-redux";
import Text from "@/components/Text";
import useChats, {
  CHAT_UNAVAILABLE_MESSAGE,
  ChatRelationship,
} from "@/hooks/useChat";
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
  Composer,
  Send,
} from "react-native-gifted-chat";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import useGetArtist from "@/hooks/useGetArtist";
import uuid from "react-native-uuid";
import firestore from "@react-native-firebase/firestore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { setCurrentChatId } from "@/utils/NavState";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import type { Asset, ImagePickerResponse } from "react-native-image-picker";
import useBackgroundUpload from "@/hooks/useBackgroundUpload";
import { getFileName } from "@/utils/helperFunctions";
import { GOOGLE_MAPS_API_KEY } from "../../constants/Config";
import useBottomSheet from "@/hooks/useBottomSheet";
import ChatImagePickerBottomSheet from "@/components/BottomSheets/ChatImagePickerBottomSheet";
import { backgroundUploadService } from "@/utils/BackgroundUploadService";
import BlockUserBottomSheet from "@/components/BottomSheets/BlockUserBottomSheet";
import ChatActionsBottomSheet from "@/components/BottomSheets/ChatActionsBottomSheet";
import ChatMessageImage from "@/components/ChatMessageImage";
import Clipboard from "@react-native-clipboard/clipboard";
import { useRealtimeDocsByIds } from "@/hooks/useRealtimeDocsByIds";
import {
  OWN_LINK_PATTERN,
  findOwnLinks,
  parseOwnLink,
  routeFromLaunchURL,
} from "@/utils/deepLinks";

const IMAGE_PICKER_OPTIONS = {
  mediaType: "photo",
  quality: 0.8,
  assetRepresentationMode: "compatible",
} as const;

/**
 * GiftedChat avoids the keyboard by translating the whole list + toolbar up
 * by the keyboard height. The list keeps its full height, so its top
 * `keyboardHeight - bottomOffset` points slide out of view under the header
 * and the oldest messages become unreachable. This spacer is rendered as the
 * list's footer (the visual top of an inverted list) and grows with the
 * keyboard, so scrolling to the end brings the oldest message back into view.
 * It must render inside GiftedChat so it reads GiftedChat's own KeyboardProvider.
 */
const KeyboardListSpacer: React.FC<{ bottomOffset: number }> = ({
  bottomOffset,
}) => {
  const { height } = useReanimatedKeyboardAnimation();
  const style = useAnimatedStyle(() => ({
    // `height` is negative while the keyboard is open.
    height: Math.max(-height.value - bottomOffset, 0),
  }));
  return <Animated.View style={style} />;
};

const renderMessageImage = (props: any) => (
  <ChatMessageImage
    uri={props.currentMessage?.image}
    pending={!!props.currentMessage?.pending}
    isOwn={props.currentMessage?.user?._id === props.user?._id}
  />
);

const getImageFileName = (asset: Asset) => {
  const fallbackName = `chat-image-${Date.now()}.jpg`;
  if (asset.fileName) return asset.fileName;
  if (asset.uri) return getFileName(asset.uri) || fallbackName;
  return fallbackName;
};

const IndividualChat: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    selectedArtistId,
    existingChatId,
    otherUserName,
    otherUserId,
    otherUserProfilePicture,
  } = useLocalSearchParams<any>();
  const [composerHeight, setComposerHeight] = useState(44);
  const [messages, setMessages] = useState<any[]>([]);

  // Artists linked to from message text, so their links can render as
  // "👤 <name>" instead of the raw URL.
  const linkedArtistIds = useMemo(() => {
    const ids = new Set<string>();
    messages.forEach((message) => {
      findOwnLinks(message?.text).forEach((link) => {
        if (link.type === "artist") ids.add(link.id);
      });
    });
    return Array.from(ids);
  }, [messages]);
  const { docs: linkedArtistDocs } = useRealtimeDocsByIds(
    "Users",
    linkedArtistIds,
  );
  const linkedArtistNameById = useMemo(() => {
    const names: Record<string, string> = {};
    linkedArtistDocs.forEach((doc) => {
      if (doc?.data?.name) names[doc.id] = doc.data.name;
    });
    return names;
  }, [linkedArtistDocs]);

  // Own share links show as a hyperlink label; the message text itself keeps
  // the full URL so copying it works outside the app too.
  const ownLinkLabel = (url: string) => {
    const link = parseOwnLink(url);
    if (!link) return url;
    if (link.type === "tattoo") return "🖼️ Image";
    return `👤 ${linkedArtistNameById[link.id] ?? "Artist"}`;
  };
  const openOwnLink = (url: string) => {
    const route = routeFromLaunchURL(url);
    if (route) {
      router.push(route as any);
      return;
    }
    Linking.openURL(url).catch(() => {});
  };
  const ownLinkParsePatterns = (linkStyle: any) => [
    {
      pattern: OWN_LINK_PATTERN,
      style: [linkStyle, { textDecorationLine: "underline" }],
      renderText: ownLinkLabel,
      onPress: openOwnLink,
    },
  ];
  const copyMessageOnLongPress = (context: any, message: any) => {
    const text = message?.text;
    if (!text) return;
    context?.actionSheet?.().showActionSheetWithOptions(
      { options: ["Copy", "Cancel"], cancelButtonIndex: 1 },
      (buttonIndex: number) => {
        if (buttonIndex === 0) Clipboard.setString(text);
      },
    );
  };
  const [chatID, setChatID] = useState<any>(existingChatId || undefined);
  const didLeaveForBlockRef = useRef(false);
  const [messageRecieverName, setMessageRecieverName] = useState(
    String(otherUserName || ""),
  );
  const [recieverProfilePicture, setRecieverProfilePicture] = useState(
    String(otherUserProfilePicture || ""),
  );
  const [isSelectingImage, setIsSelectingImage] = useState(false);
  const [chatRelationship, setChatRelationship] = useState<ChatRelationship>({
    loading: true,
    blockedByCurrentUser: false,
    blockedByOtherUser: false,
    canSend: false,
  });
  const [chatMetadataLoading, setChatMetadataLoading] = useState(
    Boolean(existingChatId),
  );
  const [chatLookupLoading, setChatLookupLoading] = useState(
    Boolean(selectedArtistId),
  );
  const [chatDisabled, setChatDisabled] = useState(false);
  const {
    BottomSheet: ImagePickerSheet,
    show: showImagePickerSheet,
    hide: hideImagePickerSheet,
  } = useBottomSheet();
  const {
    BottomSheet: ActionsSheet,
    show: showActionsSheet,
    hide: hideActionsSheet,
  } = useBottomSheet();
  const {
    BottomSheet: BlockSheet,
    show: showBlockSheet,
    hide: hideBlockSheet,
  } = useBottomSheet();
  const loggedInUser = useSelector((state: any) => state?.user?.user);
  const loggedInUserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore,
  );
  const {
    checkIfChatExists,
    fetchChatMessages,
    createChat,
    addMessageToChat,
    listenToMessages,
    listenToBlockRelationship,
  } = useChats(loggedInUser?.uid);
  const { queueUpload } = useBackgroundUpload();
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [localTime, setLocalTime] = useState<String>();
  const selectedArtist = useGetArtist(selectedArtistId);
  const [otherUserDetails, setOtherUserDetails] = useState<any>();
  const relationshipUserId = String(selectedArtistId || otherUserId || "");
  const isConversationLoading =
    chatRelationship.loading || chatMetadataLoading || chatLookupLoading;
  const isConversationUnavailable =
    !isConversationLoading && (!chatRelationship.canSend || chatDisabled);

  const navigation = useNavigation();
  // Only artists have a public profile screen.
  const canOpenProfile = Boolean(
    relationshipUserId && (selectedArtistId || otherUserDetails?.isArtist),
  );

  const openOtherUserProfile = () => {
    if (!canOpenProfile) return;
    // Opened from this artist's profile: go back instead of stacking a copy.
    const routes: any[] = navigation.getState()?.routes ?? [];
    const previousRoute = routes[routes.length - 2];
    if (
      previousRoute?.name === "artist/ArtistProfile" &&
      String(previousRoute?.params?.artistId ?? "") === relationshipUserId
    ) {
      router.back();
      return;
    }
    router.push({
      pathname: "/artist/ArtistProfile",
      params: { artistId: relationshipUserId },
    });
  };

  const leaveBlockedConversation = useCallback(() => {
    if (didLeaveForBlockRef.current) return;
    didLeaveForBlockRef.current = true;
    if (chatID) {
      backgroundUploadService.cancelChatUploads(String(chatID));
    }
    router.back();
  }, [chatID]);

  useEffect(() => {
    if (!relationshipUserId) return;
    setChatRelationship((current) => ({ ...current, loading: true, canSend: false }));
    return listenToBlockRelationship(relationshipUserId, setChatRelationship);
  }, [relationshipUserId, listenToBlockRelationship]);

  useEffect(() => {
    if (!chatID || !loggedInUser?.uid) {
      setChatMetadataLoading(false);
      setChatDisabled(false);
      return;
    }

    setChatMetadataLoading(true);
    return firestore()
      .collection("Chats")
      .doc(chatID)
      .onSnapshot(
        (snapshot) => {
          const chat = snapshot.data() || {};
          const hiddenFor: string[] = Array.isArray(chat.hiddenFor)
            ? chat.hiddenFor
            : [];
          const disabledParticipants: string[] = Array.isArray(
            chat.disabledParticipants,
          )
            ? chat.disabledParticipants
            : [];

          setChatMetadataLoading(false);
          setChatDisabled(disabledParticipants.includes(loggedInUser.uid));
          if (hiddenFor.includes(loggedInUser.uid)) {
            leaveBlockedConversation();
          }
        },
        (error) => {
          console.error("Error listening to chat availability:", error);
          setChatMetadataLoading(false);
          setChatDisabled(true);
        },
      );
  }, [chatID, leaveBlockedConversation, loggedInUser?.uid]);

  useEffect(() => {
    if (!chatRelationship.blockedByCurrentUser) return;
    leaveBlockedConversation();
  }, [chatRelationship.blockedByCurrentUser, leaveBlockedConversation]);

  useEffect(() => {
    if (!chatID || !isConversationUnavailable) return;
    backgroundUploadService.cancelChatUploads(String(chatID));
  }, [chatID, isConversationUnavailable]);
  useEffect(() => {
    if (!otherUserId) return;
    // A listener answers from the local cache right away; a one-off get()
    // waits for the server, which can hang when the app has just resumed.
    return firestore()
      .collection("Users")
      .doc(otherUserId)
      .onSnapshot(
        (userDoc) => {
          if (userDoc.exists) {
            setOtherUserDetails(userDoc.data());
          } else {
            console.warn("User not found with ID:", otherUserId);
          }
        },
        (error) => console.error("Error fetching user:", error),
      );
  }, [otherUserId]);

  const formatMessages = (msgs: any[]) => {
    return msgs.map((msg) => {
      let createdAt = msg.createdAt;

      // If createdAt is a Firestore timestamp, convert it to milliseconds
      if (createdAt && typeof createdAt.toMillis === "function") {
        createdAt = createdAt.toMillis();
      }

      // Handle string dates
      if (typeof createdAt === "string") {
        createdAt = new Date(createdAt).getTime();
      }

      // If no valid date, use current time
      if (!createdAt || isNaN(createdAt)) {
        createdAt = Date.now();
      }

      return {
        ...msg,
        createdAt,
      };
    });
  };

  useEffect(() => {
    if (selectedArtistId) {
      setChatLookupLoading(true);
      const fetchMessagesIfChatExists = async () => {
        try {
          const artistChat = await checkIfChatExists(selectedArtistId);
          if (artistChat?.exists) {
            setChatMetadataLoading(true);
            setChatID(artistChat.id);
            setMessageRecieverName(selectedArtist?.data?.name);
            setRecieverProfilePicture(
              selectedArtist?.data?.profilePictureSmall
                ? selectedArtist?.data?.profilePictureSmall
                : selectedArtist?.data?.profilePicture,
            );
            if (selectedArtist?.data?.location) {
              const localTime = await getLocalTimeFromCoordinates(
                selectedArtist?.data?.location,
              );
              if (localTime) setLocalTime(localTime);
            }
          } else {
            setMessageRecieverName(selectedArtist?.data?.name);
            setRecieverProfilePicture(
              selectedArtist?.data?.profilePictureSmall
                ? selectedArtist?.data?.profilePictureSmall
                : selectedArtist?.data?.profilePicture,
            );
            if (selectedArtist?.data?.location) {
              const localTime = await getLocalTimeFromCoordinates(
                selectedArtist?.data?.location,
              );
              if (localTime) setLocalTime(localTime);
            }
          }
        } catch (error) {
          console.error("Error checking if chat exists: ", error);
        } finally {
          setChatLookupLoading(false);
        }
      };

      fetchMessagesIfChatExists();
    } else if (existingChatId) {
      const chatExistsAlready = async () => {
        setChatID(existingChatId);
        setMessageRecieverName(
          otherUserDetails?.name || String(otherUserName || ""),
        );
        setRecieverProfilePicture(
          otherUserDetails?.profilePictureSmall
            ? otherUserDetails?.profilePictureSmall
            : otherUserDetails?.profilePicture ||
                String(otherUserProfilePicture || ""),
        );
        if (otherUserDetails?.location) {
          const localTime = await getLocalTimeFromCoordinates(
            otherUserDetails?.location,
          );
          if (localTime) setLocalTime(localTime);
        }
      };
      chatExistsAlready();
    }
  }, [
    selectedArtistId,
    existingChatId,
    otherUserDetails,
    otherUserName,
    otherUserProfilePicture,
  ]);

  useEffect(() => {
    if (!chatID) return;
    const unsubscribe = listenToMessages(chatID, (msgs) => {
      setMessages(formatMessages(msgs));
    });
    setCurrentChatId(chatID);
    return () => unsubscribe();
  }, [chatID]);

  useEffect(() => {
    return () => {
      setCurrentChatId(null);
    };
  }, []);

  const getLocalTimeFromCoordinates = async (loc: any) => {
    try {
      let lat: number | undefined;
      let lng: number | undefined;

      if (Array.isArray(loc) && loc.length >= 2) {
        lat = Number(loc[0]);
        lng = Number(loc[1]);
      } else if (
        loc &&
        typeof loc === "object" &&
        ("latitude" in loc || "lat" in loc || "_latitude" in loc)
      ) {
        lat = Number(
          (loc as any).latitude ?? (loc as any).lat ?? (loc as any)._latitude,
        );
        lng = Number(
          (loc as any).longitude ??
            (loc as any).lng ??
            (loc as any)._longitude,
        );
      }

      // Validate coordinates
      const inRange =
        typeof lat === "number" &&
        typeof lng === "number" &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180 &&
        !(lat === 0 && lng === 0);

      if (!inRange) {
        return null;
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const date = new Date(timestamp * 1000);
        const timeOnly = date.toLocaleTimeString("en-US", {
          timeZone: data.timeZoneId,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        return timeOnly; // e.g., "03:15 AM"
      } else if (data.status === "ZERO_RESULTS") {
        // Gracefully ignore when API cannot determine a timezone for the given location
        console.warn("Time Zone API: ZERO_RESULTS for", lat, lng);
        return null;
      } else {
        console.error("Time Zone API Error:", data.errorMessage || data.status);
        return null;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };

  const sendImageMessage = useCallback(
    async (imageUri: string, fileName?: string) => {
      try {
        if (isConversationLoading || isConversationUnavailable) {
          throw new Error(CHAT_UNAVAILABLE_MESSAGE);
        }
        if (!imageUri) {
          throw new Error("No image selected");
        }

        setIsSelectingImage(true);

        // Ensure chat exists
        let currentChatID = chatID;
        if (!currentChatID) {
          const newChat = await createChat(selectedArtist, {
            uid: loggedInUser?.uid,
            name: loggedInUserFirestore?.name || loggedInUser?.displayName,
            profilePicture:
              loggedInUserFirestore?.profilePictureSmall ||
              loggedInUserFirestore?.profilePicture ||
              loggedInUser?.photoURL,
          });
          currentChatID = newChat.id;
          setChatID(currentChatID);
        }

        // Create message with local image URI
        const messageId = uuid.v4() as string;
        const newMessage: IMessage = {
          _id: messageId,
          text: "",
          createdAt: new Date(),
          user: {
            _id: loggedInUser?.uid,
            name: loggedInUserFirestore?.name || loggedInUser?.displayName || "",
          },
          image: imageUri, // Local URI initially
          pending: true,
        };

        // Add message to chat immediately with local URI
        await addMessageToChat([newMessage], currentChatID);

        // Queue the image for background upload
        const uploadSuccess = await queueUpload({
          uri: imageUri,
          userId: loggedInUser?.uid,
          type: "chatImage",
          chatId: currentChatID,
          messageId: messageId,
          name:
            fileName || getFileName(imageUri) || `chat-image-${Date.now()}.jpg`,
        });

        if (!uploadSuccess) {
          throw new Error("Failed to queue image upload");
        }

        // if (!uploadSuccess) {
        //   Alert.alert(
        //     "Upload Error",
        //     "Failed to queue image for upload. The file may no longer exist."
        //   );
        //   return;
        // }

        // The background upload will handle updating the message with the final URL
        // through your existing upload completion logic
      } catch (error) {
        console.error("Error sending image:", error);
        Alert.alert(
          "Unsuccessful",
          error instanceof Error && error.message === CHAT_UNAVAILABLE_MESSAGE
            ? CHAT_UNAVAILABLE_MESSAGE
            : "Failed to send image.",
        );
      } finally {
        setIsSelectingImage(false);
      }
    },
    [
      chatID,
      loggedInUser,
      loggedInUserFirestore,
      selectedArtist,
      queueUpload,
      isConversationLoading,
      isConversationUnavailable,
      createChat,
      addMessageToChat,
    ]
  );

  const handleImagePickerResponse = useCallback(
    async (result: ImagePickerResponse) => {
      if (result.didCancel) return;

      if (result.errorCode) {
        const message =
          result.errorCode === "camera_unavailable"
            ? "Camera is not available on this device."
            : result.errorCode === "permission"
              ? "Camera or photo access is required to attach an image."
              : result.errorMessage || "Failed to attach image.";

        Alert.alert("Unsuccessful", message);
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Unsuccessful", "No image was selected.");
        return;
      }

      await sendImageMessage(asset.uri, getImageFileName(asset));
    },
    [sendImageMessage]
  );

  const takePhoto = useCallback(async () => {
    try {
      const result = await launchCamera({
        ...IMAGE_PICKER_OPTIONS,
        cameraType: "back",
        saveToPhotos: false,
      });

      await handleImagePickerResponse(result);
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Unsuccessful", "Failed to open camera.");
    }
  }, [handleImagePickerResponse]);

  const chooseFromGallery = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        ...IMAGE_PICKER_OPTIONS,
        selectionLimit: 1,
      });

      await handleImagePickerResponse(result);
    } catch (error) {
      console.error("Error opening photo library:", error);
      Alert.alert("Unsuccessful", "Failed to open photo library.");
    }
  }, [handleImagePickerResponse]);

  const openImageSourcePicker = useCallback(() => {
    if (isSelectingImage || isConversationLoading) return;
    if (isConversationUnavailable) {
      Alert.alert("Conversation unavailable", CHAT_UNAVAILABLE_MESSAGE);
      return;
    }
    Keyboard.dismiss();
    showImagePickerSheet();
  }, [
    isSelectingImage,
    isConversationLoading,
    isConversationUnavailable,
    showImagePickerSheet,
  ]);

  const onSend = useCallback(
    async (messagesToSend: IMessage[]) => {
      // GiftedChat's Send trims the text but still fires for whitespace-only
      // input, so drop anything that ends up empty.
      const newMessages = messagesToSend.filter(
        (message) => !!message.text?.trim(),
      );
      if (newMessages.length === 0) return;

      if (isConversationLoading || isConversationUnavailable) {
        Alert.alert("Conversation unavailable", CHAT_UNAVAILABLE_MESSAGE);
        return;
      }
      let currentChatID = chatID;
      if (!currentChatID) {
        try {
          // const normalizedUser = {
          //   uid: loggedInUser?.uid,
          //   name:
          //     loggedInUserFirestore?.name || loggedInUser?.displayName || "",
          //   profilePicture: loggedInUser?.photoURL || "",
          // };
          const newChat = await createChat(selectedArtist, {
            uid: loggedInUser?.uid,
            name: loggedInUserFirestore?.name || loggedInUser?.displayName,
            profilePicture:
              loggedInUserFirestore?.profilePictureSmall ||
              loggedInUserFirestore?.profilePicture ||
              loggedInUser?.photoURL,
          });
          currentChatID = newChat.id;
          setChatID(currentChatID);
        } catch (error) {
          console.error("Failed to create chat:", error);
          return;
        }
      }
      try {
        await addMessageToChat(newMessages, currentChatID);
      } catch (error) {
        Alert.alert(
          "Conversation unavailable",
          error instanceof Error ? error.message : CHAT_UNAVAILABLE_MESSAGE,
        );
      }
    },
    [
      chatID,
      loggedInUser,
      selectedArtist,
      isConversationLoading,
      isConversationUnavailable,
      createChat,
      addMessageToChat,
    ],
  );

  // Custom rendering functions
  const renderBubble = (props: any) => {
    const isSent = props.position === "right";

    const getTime = (createdAt: any) => {
      if (!createdAt) return "";

      const messageDate =
        typeof createdAt === "number"
          ? new Date(createdAt)
          : createdAt instanceof Date
            ? createdAt
            : new Date(createdAt);

      if (isNaN(messageDate.getTime())) return "";

      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    return (
      <Bubble
        {...props}
        parsePatterns={ownLinkParsePatterns}
        onLongPress={copyMessageOnLongPress}
        wrapperStyle={{
          right: {
            backgroundColor: "#514D33",
            marginVertical: 3,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 4,
          },
          left: {
            backgroundColor: "#292929",
            marginVertical: 3,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            borderBottomLeftRadius: 4,
          },
        }}
        bottomContainerStyle={{
          right: {
            paddingHorizontal: 8,
            paddingBottom: 8,
          },
          left: {
            paddingHorizontal: 8,
            paddingBottom: 8,
          },
        }}
        textStyle={{
          right: {
            color: "#FBF6FA",
          },
          left: {
            color: "#FBF6FA",
          },
        }}
        renderTime={() => {
          const time = getTime(props.currentMessage.createdAt);
          return time ? (
            <Text
              style={{
                color: "#C1C1C1",
                fontSize: 10,
                textAlign: isSent ? "right" : "left",
              }}
            >
              {time}
            </Text>
          ) : null;
        }}
        renderTicks={() => null}
      />
    );
  };
  const renderInputToolbar = (props: any) => {
    if (isConversationLoading) return null;
    if (isConversationUnavailable) {
      return (
        <View style={styles.unavailableContainer}>
          <Text size="p" weight="normal" color="#A7A7A7">
            {CHAT_UNAVAILABLE_MESSAGE}
          </Text>
        </View>
      );
    }

    // Android reports the input's frame height instead of its content height
    // when the text is cleared from JS (i.e. on send), and then stays silent
    // until the next keystroke. An empty composer is always a single line.
    const contentHeight = props.text ? composerHeight : 0;
    const height = Math.min(Math.max(contentHeight + 8, 44), 100);
    const isMultiline = height >= 52;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          marginHorizontal: 8,
          marginTop: 6,
          marginBottom: insets.bottom + 10,
        }}
      >
        {/* + (Add Image) Button - separate from input box */}
        <TouchableOpacity
          onPress={openImageSourcePicker}
          disabled={isSelectingImage}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 6,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#3A3A3A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              style={{ height: 20, width: 20, tintColor: "#C1C1C1" }}
              source={require("../../assets/images/addimagetochat.png")}
            />
          </View>
        </TouchableOpacity>

        {/* Grey chat input container with text + send icon */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#303030",
            borderRadius: isMultiline ? 20 : 100,
            flexDirection: "row",
            alignItems: "flex-end",
            height,
          }}
        >
          {/* Text Input */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Composer
              {...props}
              placeholder="Send message"
              placeholderTextColor="#C1C1C1"
              textInputStyle={{
                color: "white",
                fontSize: 16,
                backgroundColor: "transparent",
                paddingLeft: 8,
              }}
              multiline
              scrollEnabled={composerHeight >= 100}
              textInputProps={{
                selectionColor: "white",
                showsVerticalScrollIndicator: false,
              }}
              onInputSizeChanged={(e) => {
                setComposerHeight(e.height);
              }}
            />
          </View>

          <Send
            {...props}
            disabled={!props.text?.trim()}
            containerStyle={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              alignSelf: isMultiline ? "flex-end" : "center",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                opacity: props.text?.trim() ? 1 : 0.4,
              }}
            >
              <Image
                style={{ height: "100%", width: "100%" }}
                source={require("../../assets/images/sendMessage.png")}
              />
            </View>
          </Send>
        </View>
      </View>
    );
  };
  const phoneNumber = otherUserDetails?.phoneNumber ? otherUserDetails?.phoneNumber : "";

  const openDialer = () => {
    if (isConversationUnavailable || isConversationLoading) {
      Alert.alert("Conversation unavailable", CHAT_UNAVAILABLE_MESSAGE);
      return;
    }
    if (!phoneNumber) {
      Alert.alert(
        "Missing Phone Number",
        "This user has not provided a phone number."
      );
      return;
    }
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Unsuccessful", "Unable to open dialer.");
        }
      })
      .catch((err) => {
        console.error("An error occurred", err);
        Alert.alert("Unsuccessful", "Something went wrong. Please try again.");
      });
  };

  useEffect(() => {
    const receiverId = selectedArtistId || otherUserId; // adjust if you have direct receiver UID

    const unsubscribe = firestore()
      .collection("Users")
      .doc(receiverId)
      .onSnapshot((doc) => {
        const data = doc.data();
        if (data) {
          setIsOnline(data?.isOnline || false);
          setLastSeen(data?.lastSeen?.toDate?.() || null);
        }
      });

    return () => unsubscribe();
  }, [selectedArtistId, existingChatId]);

  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - timestamp.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) === 1 ? "" : "s"
        } ago`;
    return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) === 1 ? "" : "s"
      } ago`;
  };

  // Spread onto GiftedChat's FlashList. In an inverted list the footer sits
  // at the visual top. Declared as a variable because GiftedChat types this
  // prop loosely and rejects extra keys on an inline literal.
  const listViewProps = {
    ListFooterComponent: <KeyboardListSpacer bottomOffset={insets.bottom} />,
    showsVerticalScrollIndicator: Platform.OS !== "ios",
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ImagePickerSheet
        InsideComponent={
          <ChatImagePickerBottomSheet
            hideImagePickerSheet={hideImagePickerSheet}
            onTakePhoto={takePhoto}
            onChooseFromLibrary={chooseFromGallery}
          />
        }
      />
      {relationshipUserId ? (
        <ActionsSheet
          InsideComponent={
            <ChatActionsBottomSheet
              hideActionsSheet={hideActionsSheet}
              showBlockSheet={showBlockSheet}
            />
          }
        />
      ) : null}
      {relationshipUserId ? (
        <BlockSheet
          InsideComponent={
            <BlockUserBottomSheet
              hideBlockSheet={hideBlockSheet}
              blockedUserId={String(relationshipUserId)}
              sourceType="chat"
              sourceId={chatID ? String(chatID) : null}
              blockedUserName={messageRecieverName}
              blockedUserProfilePicture={recieverProfilePicture}
              onBlocked={() => {
                hideBlockSheet();
                leaveBlockedConversation();
              }}
            />
          }
        />
      ) : null}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        // style={{ height: 15, width: 16 }}
        >
          {Platform.OS === "android" && (
            <Image
              source={require("../../assets/images/android_back_arrow.png")}
              style={{ height: 15, width: 16, resizeMode: "contain" }}
            />
          )}
          {Platform.OS === "ios" && (
            <Image
              style={{ height: 24, width: 24, resizeMode: "contain" }}
              source={require("../../assets/images/iosBackIcon.png")}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="View profile"
          onPress={openOtherUserProfile}
          disabled={!canOpenProfile}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            source={
              recieverProfilePicture
                ? { uri: recieverProfilePicture }
                : require("../../assets/images/placeholder.png")
            }
            style={styles.avatar}
          />
          <View style={{ flexShrink: 1, minWidth: 0 }}>
            <Text
              size="p"
              weight="normal"
              color="#FBF6FA"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {messageRecieverName ? messageRecieverName : ""}
            </Text>
            <Text
              size="medium"
              weight="normal"
              color="#A7A7A7"
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ marginTop: 2 }}
            >
              {isOnline
                ? "Online"
                : lastSeen
                  ? `Last seen ${getTimeAgo(lastSeen)}`
                  : ""}
              {localTime ? `  •  Local time ${localTime}` : ""}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openDialer}
          disabled={isConversationUnavailable || isConversationLoading}
          style={{
            height: 24,
            width: 24,
            opacity: isConversationUnavailable || isConversationLoading ? 0.4 : 1,
          }}
        >
          <Image
            source={require("../../assets/images/call.png")}
            style={{ height: "100%", width: "100%", resizeMode: "contain" }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Conversation actions"
          onPress={showActionsSheet}
          disabled={!relationshipUserId || chatRelationship.blockedByCurrentUser}
          style={{
            height: 24,
            width: 24,
            opacity:
              !relationshipUserId || chatRelationship.blockedByCurrentUser
                ? 0.4
                : 1,
          }}
        >
          <Image
            source={require("../../assets/images/more_vert.png")}
            style={{
              height: "100%",
              width: "100%",
              resizeMode: "contain",
              tintColor: "#FBF6FA",
            }}
          />
        </TouchableOpacity>
      </View>

      {/*
        overflow hidden clips the part of the list GiftedChat translates up
        past this container's top while the keyboard is open, so messages do
        not paint over the header. See KeyboardListSpacer for how the hidden
        band is kept reachable.
      */}
      <View style={styles.chatContainer}>
        <GiftedChat
          messageIdGenerator={() => uuid.v4() as string}
          messages={
            chatRelationship.blockedByCurrentUser
              ? []
              : messages
          }
          onSend={(newMessages) => onSend(newMessages)}
          user={{
            _id: loggedInUser?.uid,
            name: loggedInUserFirestore?.name || loggedInUser?.displayName || "",
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          dateFormat="MMM DD, YYYY"
          renderAvatar={null}
          alwaysShowSend={true}
          inverted={true}
          // Cancels the toolbar's own safe-area bottom margin while the
          // keyboard is open so the composer sits flush above the keyboard.
          // Negative because GiftedChat adds bottomOffset to the keyboard
          // height it translates by.
          bottomOffset={-insets.bottom}
          keyboardShouldPersistTaps="handled"
          listViewProps={listViewProps}
          renderMessageImage={renderMessageImage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  chatContainer: {
    flex: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 16,
    borderBottomWidth: 0.33,
    borderBottomColor: "#2D2D2D",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 5,
  },
  unavailableContainer: {
    minHeight: 52,
    marginHorizontal: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#292929",
  },
});

export default IndividualChat;
