import React, { useState, useEffect } from "react";
// React Native의 여러 컴포넌트와 기능들을 임포트합니다.
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // 아이콘 사용을 위한 임포트
import * as ImagePicker from "expo-image-picker"; // 이미지 선택을 위한 임포트
import { db } from "../firebaseConfig"; // Firebase 설정을 임포트합니다.
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

  // 여러 상태들을 useState 훅을 사용해 관리합니다.
  const [posts, setPosts] = useState([]); // 포스트 목록
  const [modalVisible, setModalVisible] = useState(false); // 모달의 가시성
  const [newPost, setNewPost] = useState({ imageUrl: "", description: "" }); // 새 포스트 데이터

  // 포스트 추가 로직
  const handleAddPost = async () => {
    try {
      if (!newPost.imageUrl) {
        console.log("이미지가 선택되지 않았습니다");
        return;
      }
      // 이미지를 Firebase Storage에 업로드하는 로직
      const uploadResult = await handleUpload(newPost.imageUrl);
      if (!uploadResult) return;

      const currentUserUUID = await AsyncStorage.getItem("userUUID");
      // 새 포스트 데이터를 구성합니다.
      const newPostData = {
        ...newPost,
        imageUrl: uploadResult.imageUrl,
        imagePath: uploadResult.imagePath,
        likes: 0,
        createdAt: Timestamp.now(),
        userUUID: currentUserUUID, // 사용자 고유 식별자 추가
      };

      // Firestore에 새 포스트를 추가합니다.
      const docRef = await addDoc(collection(db, "posts"), newPostData);
      console.log("새 포스트가 저장되었습니다:", docRef.id);

      // 상태를 업데이트하여 UI에 새 포스트를 반영합니다.
      setPosts([...posts, { ...newPostData, id: docRef.id }]);
      setNewPost({ imageUrl: "", description: "" }); // 입력 필드 초기화
      setModalVisible(false); // 모달을 닫습니다.
    } catch (error) {
      console.error("포스트 저장 실패: ", error);
    }
  };

  // 포스트를 로드하는 함수
  const loadPosts = async () => {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const loadedPosts = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      let userProfile = null;

      // userUUID가 있는 경우에만 프로필 조회
      if (data.userUUID) {
        const profileQuery = query(
          collection(db, "profiles"),
          where("uniqueId", "==", data.userUUID)
        );
        const profileSnapshot = await getDocs(profileQuery);
        userProfile = profileSnapshot.docs[0]?.data();

        // 콘솔 로그 추가 - 프로필 데이터 확인
        console.log("Loaded profile data:", userProfile);
      }

      loadedPosts.push({
        id: doc.id,
        ...data,
        userProfile,
        createdAt: data.createdAt.toDate(),
      });
    }

    setPosts(loadedPosts); // 상태를 업데이트하여 UI에 포스트를 반영합니다.
  };

  // 이미지 업로드 및 저장
  const handleUpload = async (selectedImageUri) => {
    try {
      console.log("1");
      if (selectedImageUri) {
        console.log("2");
        const response = await fetch(selectedImageUri);
        console.log("3");
        const blob = await response.blob();
        console.log("4");
        const storage = getStorage();
        console.log("5");
        const imagePath = "posts/" + new Date().toISOString();
        console.log(imagePath);
        const imageRef = storageRef(storage, imagePath);
        console.log(imageRef);
        await uploadBytes(imageRef, blob); // 이미지를 Storage에 업로드합니다.
        console.log("7");

        const imageUrl = await getDownloadURL(imageRef); // 업로드된 이미지의 URL을 받아옵니다.

        return { imageUrl, imagePath }; // 이미지 URL과 경로 반환
      }
    } catch (error) {
      console.error("이미지 업로드 실패: ", error);
      // 여기서 필요한 경우 사용자에게 알림을 표시할 수 있습니다.
      alert("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
      return null; // 오류가 발생하면 null을 반환
    }
  };

  // 포스트에 좋아요를 누르는 함수
  const handleLikePost = async (postId) => {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      likes: increment(1), // 좋아요 수를 1 증가시킵니다.
    });
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return { ...post, likes: post.likes + 1 };
        }
        return post;
      })
    );
  };

  // 포스트 추가를 취소하는 함수
  const handleCancelPost = () => {
    setNewPost({ imageUrl: "", description: "" });
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

  // 이미지 선택 함수
  const selectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setNewPost({ ...newPost, imageUrl: selectedImageUri });
      setModalVisible(true);
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
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
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
                <MaterialIcons name="favorite-border" size={24} color="pink" />
                <Text>{item.likes}</Text>
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
      />

      {/* Add Post Button */}
      <TouchableOpacity style={styles.fab} onPress={selectImage}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              value={newPost.imageUrl}
              onChangeText={(text) =>
                setNewPost({ ...newPost, imageUrl: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newPost.description}
              onChangeText={(text) =>
                setNewPost({ ...newPost, description: text })
              }
            />
            <Button title="Add Post" onPress={handleAddPost} color="#ff69b4" />
            <Button title="Cancel" onPress={handleCancelPost} color="#ff4500" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf0",
  },
  postActionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postContainer: {
    borderRadius: 15,
    backgroundColor: "#ffffff",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#ff69b4",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: "#ff4500",
    padding: 10,
    width: "80%",
    backgroundColor: "#ffffff",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    width: "80%",
  },
  buttonOpen: {
    backgroundColor: "#ff69b4",
  },
  buttonClose: {
    backgroundColor: "#ff4500",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  userProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  userProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // 원형 이미지
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
export default CommunityApp;
