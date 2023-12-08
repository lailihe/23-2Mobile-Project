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
  Alert,
  Button,
  TextInput,
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
  Timestamp,
  where,
  query,
  orderBy, // orderBy 함수를 임포트합니다.
  getDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../components/styles/indexstyle";
import { Ionicons, AntDesign } from "@expo/vector-icons"; // Ionicons 아이콘 사용을 위한 임포트
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { useRouter, useGlobalSearchParams } from "expo-router";

const post = () => {
  const router = useRouter();

  // 컴포넌트가 마운트될 때 실행되는 useEffect 훅.

  useEffect(() => {
    loadPosts();
    loadLikedPosts();

    (async () => {
      const userUUID = await AsyncStorage.getItem("userUUID");
      setCurrentUserId(userUUID);
    })();
  }, []);

  const loadLikedPosts = async () => {
    try {
      const likedPostsData = await AsyncStorage.getItem("likedPosts");
      if (likedPostsData !== null) {
        setLikedPosts(JSON.parse(likedPostsData));
      }
    } catch (error) {
      console.error("좋아요 상태 로드 실패:", error);
    }
  };

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
  const [hasPosted, setHasPosted] = useState(false); // 사용자의 포스트 여부를 확인하는 상태 변수
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterGender, setFilterGender] = useState("");

  // 가족 구성원 사진의 URL을 저장하기 위한 상태 변수
  const [familyPhotos, setFamilyPhotos] = useState({
    me: null,
  }); // 가족 구성원의 사진 URL

  // 선택된 가족 구성원의 사진을 추적하기 위한 상태
  const [selectedFamilyPhotos, setSelectedFamilyPhotos] = useState({
    me: false,
  });

  // "플러스" 버튼을 눌렀을 때 모달을 나타내는 함수
  const showAddFamilyModal = () => {
    if (hasPosted) {
      alert(
        "이미 포스트를 게시하셨습니다. 하나의 고유 아이디당 하나의 포스터만 게시 가능합니다."
      );
    } else {
      setModalVisible(true);
    }
  };

  // CommunityApp 컴포넌트 내

  // 메시지 버튼 핸들러
  const handleMessageClick = (post) => {
    if (post.userUUID) {
      router.push({
        pathname: "/messages",
        params: {
          postUserId: post.userUUID, // 대화 상대방의 ID
          postId: post.id, // 포스트의 ID
        },
      });
    } else {
      console.error("Error: postUserId is undefined");
    }
  };

  // 포스트 클릭 시 모달을 열고 선택된 포스트를 설정하는 함수
  const handlePostClick = async (post) => {
    const userUUID = post.userUUID;

    // 콘솔 로그로 userUUID 출력
    router.push({
      pathname: "/momdad",
      params: { userUUID }, // 올바르게 userUUID를 전달
    });
  };

  // 사용자 프로필을 조회하는 별도의 함수
  const fetchUserProfile = async (userUUID) => {
    try {
      const profileQuery = query(
        collection(db, "profiles"),
        where("userUUID", "==", userUUID)
      );
      const profileSnapshot = await getDocs(profileQuery);
      return profileSnapshot.empty ? null : profileSnapshot.docs[0].data();
    } catch (error) {
      console.error("프로필 조회 실패:", error);
      return null;
    }
  };

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

      // 이미지 URI를 상태에 직접 설정합니다.
      setFamilyPhotos({ ...familyPhotos, [member]: selectedImageUri });
      setSelectedFamilyPhotos({ ...selectedFamilyPhotos, [member]: true });
    }
  };

  // 사용자 프로필 클릭 이벤트 핸들러
  const handleUserProfileClick = async (userUUID) => {
    const userProfile = await fetchUserProfile(userUUID);
    setSelectedUserProfile(userProfile);
    setProfileModalVisible(true);
  };
  // "사진 등록" 버튼을 누를 때 호출되는 함수
  const handleAddPost = async () => {
    try {
      const currentUserUUID = await AsyncStorage.getItem("userUUID");

      // 이미지 업로드 진행 중이 아닌 경우에만 실행
      if (!familyPhotos.isUploading && familyPhotos.me) {
        // 이미지 업로드 진행 중으로 표시
        setFamilyPhotos({ ...familyPhotos, isUploading: true });

        const newPostData = {
          description: "사진을 눌러주세요!",
          likes: 0,
          createdAt: Timestamp.now(),
          userUUID: currentUserUUID,
        };

        // 이미지 업로드 함수를 호출하여 업로드하고 결과를 받아옴
        const uploadResult = await handleUpload(familyPhotos.me);

        if (uploadResult) {
          // 업로드된 이미지 정보를 포스트 데이터에 추가
          newPostData.imageUrl = uploadResult.imageUrl;
          newPostData.imagePath = uploadResult.imagePath;

          const docRef = await addDoc(collection(db, "posts"), newPostData);
          const newPost = { ...newPostData, id: docRef.id };

          setPosts([...posts, newPost]);
        }

        // 이미지 업로드가 완료되었음을 표시하고 상태 초기화
        setFamilyPhotos({ me: null, isUploading: false });
        setSelectedFamilyPhotos({ me: false });
        setModalVisible(false);
      }
    } catch (error) {
      console.error("포스트 저장 실패: ", error);
      alert("포스트 저장에 실패했습니다.");
    }
  };

  // 포스트를 로드하는 함수
  const loadPosts = async () => {
    try {
      const currentUserUUID = await AsyncStorage.getItem("userUUID");
      // Firestore에서 포스트를 최신 순으로 정렬하여 가져옵니다.
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(postsQuery);
      let userHasPosted = false;

      const postsPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        if (data.userUUID === currentUserUUID) {
          userHasPosted = true;
        }
        const userProfile = data.userUUID
          ? await fetchUserProfile(data.userUUID)
          : null;
        return {
          id: doc.id,
          ...data,
          userProfile,
          createdAt: data.createdAt.toDate(),
        };
      });

      setHasPosted(userHasPosted);
      const loadedPosts = await Promise.all(postsPromises);
      // 좋아요 수에 따라 포스트를 내림차순으로 정렬합니다.
      loadedPosts.sort((a, b) => b.likes - a.likes);
      setPosts(loadedPosts);

      // 새로운 좋아요 상태를 초기화
      const newPostLikes = {};
      loadedPosts.forEach((post) => {
        newPostLikes[post.id] = post.likes;
      });

      setPosts(loadedPosts);
      setPostLikes(newPostLikes); // 좋아요 수 상태 업데이트
    } catch (error) {
      console.error("포스트 로드 실패:", error);
    }
  };

  // 이미지 업로드 함수
  const handleUpload = async (selectedImageUri) => {
    try {
      const response = await fetch(selectedImageUri);
      const blob = await response.blob();

      const storage = getStorage();
      // 모든 사진을 'posts' 경로에 저장
      const imagePath = `postss/${new Date().toISOString()}`;
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

  const formatDate = (date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 포스트에 좋아요를 누르는 함수
  // 포스트에 좋아요를 누르는 함수
  const handleLikePost = async (postId) => {
    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        // 포스트가 존재하지 않으면 처리 중단
        return;
      }

      // 좋아요 상태를 확인하고 업데이트
      const isLiked = likedPosts.includes(postId);
      const newLikes = isLiked
        ? postSnap.data().likes - 1
        : postSnap.data().likes + 1;

      // Firestore의 좋아요 수 업데이트
      await updateDoc(postRef, {
        likes: newLikes,
      });

      // 새로운 likedPosts 상태 계산
      const updatedLikedPosts = isLiked
        ? likedPosts.filter((id) => id !== postId)
        : [...likedPosts, postId];

      // 상태 업데이트
      setLikedPosts(updatedLikedPosts);

      // AsyncStorage에 새로운 상태 저장
      await AsyncStorage.setItem(
        "likedPosts",
        JSON.stringify(updatedLikedPosts)
      );

      // 포스트 좋아요 상태 업데이트
      setPostLikes({ ...postLikes, [postId]: newLikes });
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  // 포스트 추가를 취소하는 함수
  const handleCancelPost = () => {
    // 선택된 가족 구성원 사진 상태를 초기화합니다.
    setFamilyPhotos({ me: null });
    setSelectedFamilyPhotos({ me: false });

    // 모달의 가시성을 변경합니다.
    setModalVisible(false);
  };

  /// 포스트를 삭제하는 함수
  const handleDeletePost = async (postId, imagePath) => {
    try {
      // Firestore에서 포스트 정보를 가져옵니다.
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        console.log("포스트를 찾을 수 없습니다!");
        return;
      }
      const post = postSnap.data();

      // Firestore에서 해당 포스트를 삭제합니다.
      await deleteDoc(postRef);

      // Storage에서 포스트 이미지를 삭제합니다.
      if (imagePath) {
        const storage = getStorage();
        const imageRef = storageRef(storage, imagePath);
        await deleteObject(imageRef);
      }

      // 상태를 업데이트하여 UI에서 포스트를 제거합니다.
      setPosts(posts.filter((post) => post.id !== postId));

      // 연관된 사용자 프로필 삭제 로직
      const userUUID = post.userUUID; // 포스트와 연관된 사용자의 고유 아이디
      if (userUUID) {
        const profileRef = doc(db, "parents", userUUID);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();

          // Firestore에서 사용자 프로필 문서를 삭제합니다.
          await deleteDoc(profileRef);

          // Storage에서 사용자 프로필 이미지를 삭제합니다.
          if (profileData.mom && profileData.mom.imageUrl) {
            const momImageRef = storageRef(
              getStorage(),
              profileData.mom.imageUrl
            );
            await deleteObject(momImageRef);
          }
          if (profileData.dad && profileData.dad.imageUrl) {
            const dadImageRef = storageRef(
              getStorage(),
              profileData.dad.imageUrl
            );
            await deleteObject(dadImageRef);
          }
        }
      }

      console.log("포스트 및 연관된 프로필이 삭제되었습니다:", postId);
      Alert.alert("삭제 성공");
    } catch (error) {
      console.error("포스트 및 프로필 삭제 실패: ", error);
      Alert.alert("삭제 오류", "정보 삭제 중 문제가 발생했습니다.");
    }
  };

  const handleDelete = (postId, imagePath) => {
    Alert.alert(
      "포스트 삭제",
      "포스트를 정말로 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", onPress: () => handleDeletePost(postId, imagePath) },
      ],
      { cancelable: false }
    );
  };

  // 모든 프로필을 가져오는 함수
  const fetchAllProfiles = async () => {
    const profilesQuery = query(collection(db, "profiles"));
    const querySnapshot = await getDocs(profilesQuery);
    return querySnapshot.docs.map((doc) => doc.data());
  };

  const [filterBreedChanged, setFilterBreedChanged] = useState(false);

  //조건 추천
  const recommendRandomProfile = () => {
    // 필터 상태 초기화
    setFilterGender("");
    setFilterBreed("");
    // 모달 표시
    setFilterModalVisible(true)
  };

  const applyFilter = async () => {
    const allProfiles = await fetchAllProfiles();
    const filteredProfiles = allProfiles.filter((profile) => {
      return (
        (!filterBreed || profile.type === filterBreed) &&
        (!filterGender || profile.gender === filterGender)
      );
    });

    if (filteredProfiles.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredProfiles.length);
      setSelectedUserProfile(filteredProfiles[randomIndex]);
      setProfileModalVisible(true);
    } else {
      alert("조건에 맞는 프로필이 없습니다.");
    }

    setFilterModalVisible(false);
  };

  const BreedSelection = () => {
  setFilterBreedChanged(true);
  router.push({
    pathname: "/Search4",
  });
  setFilterModalVisible(false);
};

  const { filterBreed: gType } = useGlobalSearchParams();
  const [filterBreed, setFilterBreed] = useState(gType);
  
  useEffect(() => {
    // URL에서 가져온 type 값이 변경될 때마다 type 상태 업데이트
    setFilterBreed(gType);
  }, [gType]);

  useEffect(() => {
    if (filterBreedChanged && filterBreed) {
      setFilterModalVisible(true);
      setFilterBreedChanged(false);
    }
  }, [filterBreed, filterBreedChanged]);
  
  const numColumns = 2; // 이 값은 상태나 props에 따라 변경될 수 있음

  const renderInfoSection = (iconName, title, content) => (
    <View style={styles.infoSection}>
      <Ionicons name={iconName} size={24} color="#4fc3f7" />
      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoContent}>{content}</Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        numColumns={numColumns}
        key={numColumns === 2 ? "two-columns" : "one-column"}
        renderItem={({ item, index }) => (
          <View style={styles.postContainer}>
            {/* 첫 번째 포스트에 금색 왕관 아이콘 추가 */}
            {index === 0 && (
              <MaterialCommunityIcons
                name="crown"
                size={24}
                color="gold"
                style={styles.crownIcon} // 스타일 적용
              />
            )}
            {/* 두 번째 포스트에 은색 왕관 아이콘 추가 */}
            {index === 1 && (
              <MaterialCommunityIcons
                name="crown"
                size={24}
                color="silver"
                style={styles.crownIcon} // 스타일 적용
              />
            )}

            {/* 사용자 프로필 표시 */}
            {item.userProfile && (
              <TouchableOpacity
                onPress={() =>
                  handleUserProfileClick(item.userProfile.userUUID)
                }
              >
                <View style={styles.userProfileContainer}>
                  <Image
                    source={{ uri: item.userProfile.imageUrl }}
                    style={styles.userProfileImage}
                  />
                  <Text style={styles.userName}>{item.userProfile.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handlePostClick(item)}>
              <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            </TouchableOpacity>
            {/* 조건부 렌더링: 사용자가 올린 포스트에는 삭제 버튼, 다른 사용자의 포스트에는 메시지 버튼 표시 */}
            {currentUserId === item.userUUID ? (
              // 삭제 버튼 (자신이 올린 포스트일 경우에만 표시)
              <TouchableOpacity
                style={styles.postDeleteButton}
                onPress={() => handleDelete(item.id, item.imagePath)}
              >
                <AntDesign name="delete" size={24} color="black" />
              </TouchableOpacity>
            ) : (
              // 메시지 버튼 (자신이 올린 포스트가 아닐 경우에만 표시)
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => handleMessageClick(item)}
              >
                <AntDesign name="message1" size={24} color="black" />
              </TouchableOpacity>
            )}
            <Text>{item.description}</Text>
            <View style={styles.postActionContainer}>
              {/* 업로드 시간 표시 */}
              <Text>
                {item.createdAt instanceof Date
                  ? formatDate(item.createdAt)
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
                <Text style={styles.likeCount}>{postLikes[item.id] || 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing} // 새로고침 상태를 설정
        onRefresh={handleRefresh} // 새로고침 함수를 설정
      />

      <TouchableOpacity
        style={styles.recommendButton}
        onPress={recommendRandomProfile}
      >
        <Text style={styles.recommendButtonText}>프로필 추천</Text>
      </TouchableOpacity>
      <View style={styles.filterContainer}></View>

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


      <Modal
  visible={profileModalVisible}
  onRequestClose={() => setProfileModalVisible(false)}
>
  <View style={styles.centeredView}>
    <View style={styles.modalView}>
      {selectedUserProfile ? (
        <>
          {/* 프로필 이미지 */}
          <View style={styles.imageContainer}>
            {selectedUserProfile.imageUrl ? (
              <Image
                source={{ uri: selectedUserProfile.imageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.noImageText}>이미지 없음</Text>
            )}
          </View>

          {/* 정보 리스트 */}
          {renderInfoSection("paw", "반려견 이름", selectedUserProfile.name)}
          {renderInfoSection("male-female", "성별", selectedUserProfile.gender)}
          {renderInfoSection("medkit", "중성화 여부", selectedUserProfile.spayedOrNeutered)}
          {renderInfoSection("shield-checkmark", "예방접종 여부", selectedUserProfile.vaccinated)}
          {renderInfoSection("paw", "성격 및 특징", selectedUserProfile.characteristics)}
        </>
      ) : (
        <Text>Loading...</Text>
      )}
      <Button
        title="닫기"
        onPress={() => setProfileModalVisible(false)}
        color="#2196F3"
      />
    </View>
  </View>
</Modal>
      {/* 조건 달아서 프로필 추천 */}
      {/* 조건 달아서 프로필 추천 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(!filterModalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.action}>
              <Ionicons name="paw" size={24} color="#4fc3f7" />
              <TouchableOpacity
                onPress={BreedSelection}
                style={[styles.input, styles.inputTouchable]}
              >
                {/* 여기에서 filterBreed 상태를 사용합니다. */}
                <Text style={styles.inputText}>
                  {filterBreed || "반려견 견종 선택"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.action}>
              <Ionicons name="male-female" size={24} color="#4fc3f7" />
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    filterGender === "남아" ? styles.selected : null,
                  ]}
                  onPress={() => setFilterGender("남아")}
                >
                  <Text style={styles.buttonText}>남아</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    filterGender === "여아" ? styles.selected : null,
                  ]}
                  onPress={() => setFilterGender("여아")}
                >
                  <Text style={styles.buttonText}>여아</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button title="적용" onPress={applyFilter} />
            <Button title="취소" onPress={() => setFilterModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default post;
