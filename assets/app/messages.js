import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert 
} from "react-native";
import { db } from "./firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalSearchParams } from "expo-router";

const MessageScreen = () => {
  const { postUserId } = useGlobalSearchParams();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [otherUserProfilePic, setOtherUserProfilePic] = useState(null);
  const [isOtherUserInView, setIsOtherUserInView] = useState(false);

  const flatListRef = useRef(null);

  
  useEffect(() => {
    // 채팅 메시지 목록이 업데이트 될 때마다 마지막 메시지로 스크롤합니다.
    if (messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    // 상대방의 프로필 사진을 가져오는 함수
    const fetchOtherUserProfilePic = async () => {
      if (postUserId) {
        const userDoc = await getDoc(doc(db, "users", postUserId));
        if (userDoc.exists()) {
          setOtherUserProfilePic(userDoc.data().profilePicture);
        }
      }
    };

    fetchOtherUserProfilePic();
  }, [postUserId]);

  useEffect(() => {
    // 현재 사용자의 ID를 AsyncStorage에서 가져오는 함수
    const fetchCurrentUserId = async () => {
      const userId = await AsyncStorage.getItem("userUUID");
      setCurrentUserId(userId);
    };

    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    // 메시지를 읽음으로 표시하는 함수
    const markMessageAsRead = async (messageId) => {
      try {
        const messageRef = doc(db, "messages", messageId);
        await updateDoc(messageRef, {
          isRead: true,
        });
      } catch (error) {
        console.error("메시지를 읽음으로 표시하는 동안 오류 발생:", error);
      }
    };

    if (currentUserId && postUserId) {
      // 채팅 메시지를 조회하는 쿼리
      const q = query(
        collection(db, "messages"),
        where("chatId", "in", [
          `${currentUserId}_${postUserId}`,
          `${postUserId}_${currentUserId}`,
        ]),
        orderBy("createdAt")
      );

      // 메시지 업데이트를 구독
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);

        if (isOtherUserInView) {
          msgs.forEach((message) => {
            if (message.senderId !== currentUserId && !message.isRead) {
              markMessageAsRead(message.id);
            }
          });
        }

        // FlatList의 끝으로 스크롤
        flatListRef.current.scrollToEnd({ animated: true });
      });

      return () => unsubscribe();
    }
  }, [currentUserId, postUserId, isOtherUserInView]);

  const sendMessage = async () => {
    // 메시지가 비어있는지 확인
    if (!message.trim()) {
      // 메시지 입력이 없으면 알림창 표시
      Alert.alert("메시지 입력 필요", "메시지를 입력해주세요.");
      return;
    }
  
    // 기존의 메시지 전송 로직
    if (currentUserId && postUserId) {
      try {
        await addDoc(collection(db, "messages"), {
          chatId: `${currentUserId}_${postUserId}`,
          senderId: currentUserId,
          receiverId: postUserId,
          text: message,
          createdAt: new Date(),
          isRead: false,
        });
        setMessage("");
      } catch (error) {
        console.error("메시지를 보내는 동안 오류 발생:", error);
      }
    } else {
      console.error("오류: 유효하지 않은 메시지 또는 사용자 ID", {
        currentUserId,
        postUserId,
      });
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // 예시 값, 필요에 따라 조정
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.messageContainer,
                item.senderId === currentUserId
                  ? styles.sentMessageContainer
                  : styles.receivedMessageContainer,
              ]}
              onPress={() => {
                if (item.senderId !== currentUserId && !item.isRead) {
                  markMessageAsRead(item.id);
                }
              }}
            >
              {item.senderId !== currentUserId && otherUserProfilePic && (
                <Image
                  source={{ uri: otherUserProfilePic }}
                  style={styles.profilePic}
                />
              )}
              <View
                style={[
                  styles.messageBubble,
                  item.senderId === currentUserId
                    ? styles.sentMessage
                    : styles.receivedMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>
                {item.senderId !== currentUserId && !item.isRead && (
                  <View style={styles.unreadIndicator}>
                    <Text style={styles.unreadText}>1</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setIsOtherUserInView(height > 0);
          }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="메시지 입력"
          />
          <Button title="보내기" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// 스타일 및 주석
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  messageItem: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  unreadIndicator: {
    backgroundColor: "yellow", // 읽지 않은 메시지 표시 배경색입니다.
    borderRadius: 10, // 표시의 모서리를 둥글게 합니다.
    padding: 2, // 표시 주변의 여백입니다.
    position: "absolute", // 부모 컴포넌트에 상대적인 위치입니다.
    right: 10, // 부모 컴포넌트의 오른쪽에서 떨어진 거리입니다.
    top: 10, // 부모 컴포넌트의 위에서 떨어진 거리입니다.
  },
  unreadText: {
    color: "#000", // 읽지 않은 메시지 수의 텍스트 색상입니다.
    fontSize: 12, // 읽지 않은 메시지 수의 텍스트 크기입니다.
  },
  messageContainer: {
    flexDirection: "row",
    padding: 8,
    alignItems: "flex-end",
  },
  sentMessageContainer: {
    justifyContent: "flex-end",
  },
  receivedMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    maxWidth: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  sentMessage: {
    backgroundColor: "#DCF8C6",
    marginLeft: 10,
  },
  receivedMessage: {
    backgroundColor: "#fff",
    marginRight: 10,
  },
});

export default MessageScreen;
