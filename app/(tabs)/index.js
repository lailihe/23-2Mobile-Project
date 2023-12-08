import React, { useState, useEffect } from "react";
// React Native의 여러 컴포넌트와 기능들을 임포트합니다.
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // 아이콘 사용을 위한 임포트
import * as ImagePicker from "expo-image-picker"; // 이미지 선택을 위한 임포트
import { db } from "../firebase/firebaseConfig"; // Firebase 설정을 임포트합니다.
// Firebase Storage와 Firestore의 여러 기능들을 임포트합니다.
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  Timestamp,
  where,
  query,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../components/styles/indexstyle";

const CommunityApp = () => {
  // 컴포넌트가 마운트될 때 실행되는 useEffect 훅.
  useEffect(() => {
    loadPosts(); // 포스트를 로드하는 함수를 호출합니다.
    (async () => {
      if (Platform.OS !== "ios") {
        // 안드로이드의 경우, 이미지 라이브러리 접근 권한을 요청합니다.
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 상태를 관리하는 변수

  // 새로고침 함수
  const handleRefresh = async () => {
    setIsRefreshing(true); // 새로고침 시작
    await loadPosts(); // 포스트를 다시 로드합니다.
    setIsRefreshing(false); // 새로고침 완료
  };

  // 여러 상태들을 useState 훅을 사용해 관리합니다.
  const [posts, setPosts] = useState([]); // 포스트 목록
  const [modalVisible, setModalVisible] = useState(false); // 모달의 가시성
  const [postLikes, setPostLikes] = useState({}); // 각 포스트의 좋아요 수
  const [likedPosts, setLikedPosts] = useState([]); // 사용자가 좋아요를 누른 포스트 목록
  const [familyPhotosModalVisible, setFamilyphotosModalVisible] = useState(null);

  // 가족 구성원 사진의 URL을 저장하기 위한 상태 변수
  const [familyPhotos, setFamilyPhotos] = useState({
    mom: null,
    dad: null,
    me: null,
  }); // 가족 구성원의 사진 URL
  // 선택된 가족 구성원의 사진을 추적하기 위한 상태
  const [selectedFamilyPhotos, setSelectedFamilyPhotos] = useState({
    mom: false,
    dad: false,
    me: false,
  });

  // "플러스" 버튼을 눌렀을 때 모달을 나타내는 함수
  const showAddFamilyModal = () => {
    setModalVisible(true);
  };

  // 포스트 클릭 시 모달을 열고 선택된 포스트를 설정하는 함수
  const handlePostClick = async (post) => {
    setSelectedVisible(true);
  
    // 엄마와 아빠 사진의 URL 가져오기
    const momImageURL = await getFamilyMemberImageURL("mom");
    const dadImageURL = await getFamilyMemberImageURL("dad");
  
    // 모달 상태 업데이트
    setSelectedFamilyPhotos({ mom: momImageURL, dad: dadImageURL });

  };
  
 // 엄마와 아빠 사진의 URL을 가져오는 함수
 const getFamilyMemberImageURL = async (imagePath) => {
  try {
    if (!imagePath) {
      return null; // 이미지 경로가 없는 경우 null 반환
    }

    const storage = getStorage();
    const imageRef = storageRef(storage, imagePath);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  } catch (error) {
    console.error(`${imagePath} 사진 가져오기 실패: `, error);
    return null;
  }
};

  const storagePath = `family_photos/`;

  // 이미지 선택 로직 업데이트
  const selectImageForFamilyMember = async (member) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      const uploadResult = await handleUpload(selectedImageUri, member);

      if (uploadResult) {
        setFamilyPhotos({ ...familyPhotos, [member]: uploadResult.imageUrl });
        setSelectedFamilyPhotos({ ...selectedFamilyPhotos, [member]: true });
      }
    }
  };

// "사진 등록" 버튼을 누를 때 호출되는 함수
const handleAddPost = async () => {
  try {
        const currentUserUUID = await AsyncStorage.getItem("userUUID");
  
      // '나'의 사진 업로드
      if (familyPhotos.me) {
        const uploadResult = await handleUpload(familyPhotos.me, "me");
    
        if (uploadResult) {
          const newPostData = {
            imageUrl: uploadResult.imageUrl,
            imagePath: uploadResult.imagePath,
            description: "나의 사진",
            likes: 0,
            createdAt: Timestamp.now(),
            userUUID: currentUserUUID,
          };
    
          const docRef = await addDoc(collection(db, "posts"), newPostData);
          const newPost = { ...newPostData, id: docRef.id };
    
          setPosts([...posts, newPost]);
        }
      }
    
      // 모달 닫기 및 상태 초기화
      setFamilyPhotos({ mom: null, dad: null, me: null });
      setSelectedFamilyPhotos({ mom: false, dad: false, me: false });
      setModalVisible(false);
    }catch (error) {
        console.error("포스트 저장 실패: ", error);
        alert("포스트 저장에 실패했습니다.");
      }
    };

  // 사용자 프로필을 조회하는 별도의 함수
  const fetchUserProfile = async (userUUID) => {
    try {
      const profileQuery = query(
        collection(db, "profiles"),
        where("uniqueId", "==", userUUID)
      );
      const profileSnapshot = await getDocs(profileQuery);
      return profileSnapshot.empty ? null : profileSnapshot.docs[0].data();
    } catch (error) {
      console.error("프로필 조회 실패:", error);
      return null;
    }
  };

  // 포스트를 로드하는 함수
  const loadPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userProfile = data.userUUID
          ? await fetchUserProfile(data.userUUID)
          : null;
        return {
          id: doc.id,
          ...data,
          userProfile, // 사용자 프로필 추가
          createdAt: data.createdAt.toDate(),
        };
      });

      const loadedPosts = await Promise.all(postsPromises);
      setPosts(loadedPosts);
    } catch (error) {
      console.error("포스트 로드 실패:", error);
    }
  };

   // 이미지 업로드 함수
   const handleUpload = async (selectedImageUri, member) => {
    try {
      const response = await fetch(selectedImageUri);
      const blob = await response.blob();
  
      const storage = getStorage();
      // 각 멤버에 따른 다른 경로 설정
      const imagePath = `${member === "me" ? "posts" : "family_photos"}/${member}/${new Date().toISOString()}`;
      const imageRef = storageRef(storage, imagePath);
  
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);
  
      return { imageUrl, imagePath };
    } catch (error) {
      console.error("이미지 업로드 실패: ", error);
      alert("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
      return null;
    }
  };

  // 포스트에 좋아요를 누르는 함수
  const handleLikePost = async (postId) => {
    try {
      if (likedPosts.includes(postId)) {
        // 이미 좋아요를 누른 포스트인 경우, 좋아요 취소
        setLikedPosts(likedPosts.filter((id) => id !== postId));
        setPostLikes({ ...postLikes, [postId]: postLikes[postId] - 1 });

        // Firestore에서 해당 포스트의 좋아요 수를 1 감소시킵니다.
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
          likes: increment(-1),
        });

        // 좋아요 수 감소 로직 추가 (서버에서 처리 필요)
        // ...
      } else {
        // 아직 좋아요를 누르지 않은 포스트인 경우, 좋아요 추가
        setLikedPosts([...likedPosts, postId]);
        setPostLikes({ ...postLikes, [postId]: (postLikes[postId] || 0) + 1 });

        // Firestore에서 해당 포스트의 좋아요 수를 1 증가시킵니다.
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
          likes: increment(1),
        });

        // 좋아요 수 증가 로직 추가 (서버에서 처리 필요)
        // ...
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  // 포스트 추가를 취소하는 함수
  const handleCancelPost = () => {
    // 선택된 가족 구성원 사진 상태를 초기화합니다.
    setFamilyPhotos({ mom: null, dad: null, me: null });
    setSelectedFamilyPhotos({ mom: false, dad: false, me: false });

    // 모달의 가시성을 변경합니다.
    setModalVisible(false);
  };

  // 포스트를 삭제하는 함수
  const handleDeletePost = async (postId, imagePath) => {
    try {
      const postRef = doc(db, "posts", postId);
      await deleteDoc(postRef); // Firestore에서 해당 포스트를 삭제합니다.

      if (imagePath) {
        const storage = getStorage();
        const imageRef = storageRef(storage, imagePath);
        await deleteObject(imageRef); // Storage에서 이미지를 삭제합니다.
      }

      setPosts(posts.filter((post) => post.id !== postId)); // 상태를 업데이트하여 UI에서 포스트를 제거합니다.

      console.log("포스트가 삭제되었습니다:", postId);
    } catch (error) {
      console.error("포스트 삭제 실패: ", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            {/* 사용자 프로필 표시 */}
            {item.userProfile && (
              <View style={styles.userProfileContainer}>
                <Image
                  source={{ uri: item.userProfile.imageUrl }}
                  style={styles.userProfileImage}
                />
                <Text style={styles.userName}>{item.userProfile.name}</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => handlePostClick(item)}>
              <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            </TouchableOpacity>
            

            <Text>{item.description}</Text>
            <View style={styles.postActionContainer}>
              {/* 업로드 시간 표시 */}
              <Text>
                Posted on:{" "}
                {item.createdAt instanceof Date
                  ? item.createdAt.toLocaleString()
                  : "Unknown date"}
              </Text>
              {/* 기타 버튼들 */}
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => handleLikePost(item.id)}
              >
                <MaterialIcons
                  name={
                    likedPosts.includes(item.id)
                      ? "favorite"
                      : "favorite-border"
                  }
                  size={24}
                  color={likedPosts.includes(item.id) ? "red" : "black"}
                />
                <Text>{postLikes[item.id] || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.postDeleteButton}
                onPress={() => handleDeletePost(item.id, item.imagePath)}
              >
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing} // 새로고침 상태를 설정
        onRefresh={handleRefresh} // 새로고침 함수를 설정
      />

      {/* Add Post Button */}
      <TouchableOpacity style={styles.fab} onPress={showAddFamilyModal}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* 이미지 미리보기 및 선택 버튼 */}
            {selectedFamilyPhotos.mom ? (
              <Image
                source={{ uri: familyPhotos.mom }}
                style={styles.imagePreview}
              />
            ) : (
              <Button
                title="엄마"
                onPress={() => selectImageForFamilyMember("mom")}
                color="#ff69b4"
              />
            )}
            {selectedFamilyPhotos.dad ? (
              <Image
                source={{ uri: familyPhotos.dad }}
                style={styles.imagePreview}
              />
            ) : (
              <Button
                title="아빠"
                onPress={() => selectImageForFamilyMember("dad")}
                color="#87CEEB"
              />
            )}
            {selectedFamilyPhotos.me ? (
              <Image
                source={{ uri: familyPhotos.me }}
                style={styles.imagePreview}
              />
            ) : (
              <Button
                title="나"
                onPress={() => selectImageForFamilyMember("me")}
                color="#32CD32"
              />
            )}

            {/* 이미지 업로드 버튼 */}
            <Button title="사진등록" onPress={handleAddPost} color="#00ff00" />

            <Button
              title="등록취소"
              onPress={handleCancelPost}
              color="#ff4500"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CommunityApp;
