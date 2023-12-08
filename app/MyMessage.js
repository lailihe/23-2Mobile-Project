import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,  
} from 'react-native';
import { db } from './firebase/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, getDoc, doc, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useGlobalSearchParams } from 'expo-router';

const MyMessage = () => {
  const { postUserId } = useGlobalSearchParams();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const router = useRouter();
  const [latestMessage, setLatestMessage] = useState(null);
  const [userMessages, setUserMessages] = useState({}); // 사용자별 메시지 저장



  const fetchUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'profiles', userId));
      if (userDoc.exists()) {
        setUserProfiles((prev) => {
          const updatedProfiles = { ...prev, [userId]: userDoc.data() };
          console.log('Updated profiles:', updatedProfiles);
          return updatedProfiles;
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleDelete = async (senderId) => {
  console.log('senderId', senderId, '의 대화방 삭제');
  try {
    // Firestore에서 메시지 삭제
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUserId),
      where('senderId', '==', senderId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);

    // 로컬 상태 업데이트
    setUserMessages(prevMessages => {
      const updatedMessages = { ...prevMessages };
      delete updatedMessages[senderId]; // 해당 senderId 메시지 삭제
      return updatedMessages;
    });

  } catch (error) {
    console.error('메시지 삭제 중 오류 발생:', error);
  }
};

  useEffect(() => {
    if (latestMessage) {
      fetchUserProfile(latestMessage.senderId);
    }
  }, [latestMessage]);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const userId = await AsyncStorage.getItem('userUUID');
      setCurrentUserId(userId);
    };

    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      const q = query(
        collection(db, 'messages'),
        where('receiverId', '==', currentUserId),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        let newMessages = {};
        let profileFetchPromises = [];

        querySnapshot.forEach((doc) => {
          const message = { id: doc.id, ...doc.data() };
          const senderId = message.senderId;

          if (!newMessages[senderId]) {
            newMessages[senderId] = { messages: [], unreadCount: 0 };
            // 프로필 가져오기를 위한 프로미스 추가
            profileFetchPromises.push(fetchUserProfile(senderId));
          }

          newMessages[senderId].messages.push(message);
          if (!message.isRead) {
            newMessages[senderId].unreadCount += 1;
          }
        });

        // 모든 프로필을 가져온 후 상태 업데이트
        await Promise.all(profileFetchPromises);
        setUserMessages(newMessages);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [currentUserId]);



  const navigateToChat = (senderId) => {
    router.push({
      pathname: '/messages',
      params: { postUserId: senderId },
    });
  };

  return (
    <View style={styles.container}>
      {Object.entries(userMessages).map(([senderId, { messages, unreadCount }]) => {
        const latestMessage = messages[0];
        return (
          <View key={senderId} style={styles.messageItem}>
            <TouchableOpacity
              onPress={() => navigateToChat(senderId)}
              style={styles.profileContainer}
            >
              <Image
                source={{ uri: userProfiles[senderId]?.imageUrl }}
                style={styles.profilePic}
              />
              <Text style={styles.messageSender}>
                {userProfiles[senderId]?.name}
              </Text>
              <Text style={styles.messageText}>: {latestMessage.text}</Text>
              {unreadCount > 0 && <Text style={styles.unreadCount}>{unreadCount}</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(senderId)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  messageItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageSender: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
  messageText: {
    color: '#333',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  unreadCount: {
    marginLeft: 'auto',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    marginLeft: 'auto',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MyMessage;
