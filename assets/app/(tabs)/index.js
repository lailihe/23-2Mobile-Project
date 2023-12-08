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
  RefreshControl,
  TextInput
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
  onSnapshot,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../components/styles/indexstyles";
import { useRouter } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons"; // Ionicons 아이콘 사용을 위한 임포트

const index = () => {
  const router = useRouter();

  // 컴포넌트가 마운트될 때 실행되는 useEffect 훅.

  useEffect(() => {
    loadPosts();

    (async () => {
      const userUUID = await AsyncStorage.getItem("userUUID");
      setCurrentUserId(userUUID);
    })();
  }, []);

  // 포스트 클릭 이벤트 핸들러
  // 포스트 클릭 이벤트 핸들러
  const handlePostClick = async (post) => {
    console.log("Clicked post ID:", post.id); // postId 값 확인
    //
    // 현재 사용자가 자신의 포스트를 클릭한 경우는 무시
    if (post.userUUID === currentUserId) {
      Alert.alert("자신의 포스트는 신청할 수 없습니다.");
      return;
    }

    // 사용자에게 신청 여부를 묻는 알림 창 표시
    Alert.alert("대리산책 신청", "이 포스트에 대리산책을 신청하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "신청하기",
        onPress: () => applyForWalk(post),
      },
    ]);
  };

  const applyForWalk = async (post) => {
    try {
      const currentUserUUID = await AsyncStorage.getItem("userUUID");

      // 대리산책 신청 데이터 생성
      const walkApplication = {
        applicantId: currentUserUUID, // 신청자 ID
        postId: post.id, // 포스트 ID
        postOwnerId: post.userUUID, // 포스트 주인 ID
        createdAt: Timestamp.now(), // 신청 시간
        status: "pending", // 초기 상태는 'pending'
      };

      // 대리산책 신청 데이터를 Firestore 데이터베이스에 저장
      await addDoc(collection(db, "walkApplications"), walkApplication);
      alert("대리산책 신청이 완료되었습니다.");
    } catch (error) {
      console.error("대리산책 신청 실패: ", error);
      alert("대리산책 신청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 신청자의 프로필 정보를 조회하는 함수
  const fetchUserProfiles = async (userUUID) => {
    try {
      const profileDoc = await getDoc(doc(db, "profiles", userUUID));
      return profileDoc.exists()
        ? { id: userUUID, ...profileDoc.data() }
        : null;
    } catch (error) {
      console.error("프로필 조회 실패:", error);
      return null;
    }
  };

  const [currentPostApplications, setCurrentPostApplications] = useState([]);

  const loadWalkApplications = async (postId) => {
    setCurrentPostId(postId); // 현재 선택된 포스트의 ID를 설정
    try {
      const walkApplicationsQuery = query(
        collection(db, "walkApplications"),
        where("postId", "==", postId)
      );
      const walkApplicationsSnapshot = await getDocs(walkApplicationsQuery);

      const applications = await Promise.all(
        walkApplicationsSnapshot.docs.map(async (doc) => {
          const applicationData = doc.data();
          const userProfile = await fetchUserProfiles(
            applicationData.applicantId
          );
          return {
            id: doc.id,
            userProfile,
            ...applicationData,
          };
        })
      );

      setCurrentPostApplications(applications);
    } catch (error) {
      console.error("대리산책 신청 목록 불러오기 실패:", error);
    }
  };

  const acceptWalkApplication = async (applicationId, postId) => {
    try {
      await updateDoc(doc(db, "walkApplications", applicationId), {
        status: "accepted",
      });
      // 필요한 경우 postId 사용
      alert("대리산책 신청을 수락했습니다.");
    } catch (error) {
      console.error("대리산책 신청 수락 실패:", error);
      alert("대리산책 신청 수락에 실패했습니다.");
    }
  };

  const rejectWalkApplication = async (applicationId, postId) => {
    try {
      await updateDoc(doc(db, "walkApplications", applicationId), {
        status: "rejected",
      });
      // 필요한 경우 postId 사용
      alert("대리산책 신청을 거부했습니다.");
    } catch (error) {
      console.error("대리산책 신청 거부 실패:", error);
      alert("대리산책 신청 거부에 실패했습니다.");
    }
  };

  const handleApplicationClick = (application) => {
    Alert.alert(
      "대리산책 신청",
      `${application.userProfile.name} 님의 신청을 수락하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "수락",
          onPress: () =>
            acceptWalkApplication(application.id, application.postId),
        },
        {
          text: "거부",
          onPress: () =>
            rejectWalkApplication(application.id, application.postId),
        },
      ]
    );
  };

  const renderMessageButton = (item) => {
    return (
      <TouchableOpacity
        style={styles.messageButton}
        onPress={async () => {
          const isAccepted = await fetchWalkApplicationStatus(item.id);
          if (isAccepted) {
            handleMessageClick(item);
          } else {
            // 알림 또는 메시지 버튼 비활성화 처리
            Alert.alert("메시지", "대리산책 신청이 아직 수락되지 않았습니다.");
          }
        }}
        disabled={!acceptedWalkApplications.has(item.id)}
      >
        <AntDesign name="message1" size={24} color="black" />
      </TouchableOpacity>
    );
  };

  const [acceptedWalkApplications, setAcceptedWalkApplications] = useState(
    new Set()
  );

  const fetchWalkApplicationStatus = async (postId) => {
    const walkApplicationsQuery = query(
      collection(db, "walkApplications"),
      where("postId", "==", postId),
      where("status", "==", "accepted")
    );
    const walkApplicationsSnapshot = await getDocs(walkApplicationsQuery);
    return !walkApplicationsSnapshot.empty;
  };

  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리하는 변수

  // 새로고침 함수
  const onRefresh = async () => {
    setRefreshing(true); // 새로고침 시작
    await loadPosts(); // 포스트를 다시 로드합니다.
    setRefreshing(false); // 새로고침 완료
  };

  const handleDelete = async (postId, imagePath) => {
    // 알림을 통해 삭제 확인
    Alert.alert(
      "포스트 삭제",
      "이 포스트를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          onPress: async () => {
            try {
              // Firestore에서 포스트 삭제
              await deleteDoc(doc(db, "walk", postId));
  
              // Firebase Storage에서 이미지 삭제
              if (imagePath) {
                const storage = getStorage();
                const imageRef = storageRef(storage, imagePath);
                await deleteObject(imageRef);
              }
  
              // 대리산책 신청 정보 삭제
              const walkApplicationsQuery = query(
                collection(db, "walkApplications"),
                where("postId", "==", postId)
              );
              const walkApplicationsSnapshot = await getDocs(walkApplicationsQuery);
              walkApplicationsSnapshot.forEach(async (application) => {
                await deleteDoc(doc(db, "walkApplications", application.id));
              });
  
              // 상태 업데이트: 삭제된 포스트를 목록에서 제거
              setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
  
              alert("포스트가 삭제되었습니다.");
            } catch (error) {
              console.error("포스트 삭제 실패:", error);
              alert("포스트 삭제에 실패했습니다.");
            }
          }
        },
      ]
    );
  };
  
  // 여러 상태들을 useState 훅을 사용해 관리합니다.
  const [posts, setPosts] = useState([]); // 포스트 목록
  const [modalVisible, setModalVisible] = useState(false); // 모달의 가시성
  const [hasPosted, setHasPosted] = useState(false); // 사용자의 포스트 여부를 확인하는 상태 변수
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null); // 현재 선택된 포스트 ID
  const [neighborhood, setNeighborhood] = useState("");

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

    if (!neighborhood) {
      alert("동네 정보를 입력해주세요.");
      return;
    }

    try {
      const currentUserUUID = await AsyncStorage.getItem("userUUID");

      // 이미지 업로드 진행 중이 아닌 경우에만 실행
      if (!familyPhotos.isUploading && familyPhotos.me) {
        // 이미지 업로드 진행 중으로 표시
        setFamilyPhotos({ ...familyPhotos, isUploading: true });

        

        const newPostData = {
          description: "대리산책 구해요!",
          neighborhood: neighborhood, // 동네 정보 추가
          createdAt: Timestamp.now(),
          userUUID: currentUserUUID,
        };

        // 이미지 업로드 함수를 호출하여 업로드하고 결과를 받아옴
        const uploadResult = await handleUpload(familyPhotos.me);

        if (uploadResult) {
          // 업로드된 이미지 정보를 포스트 데이터에 추가
          newPostData.imageUrl = uploadResult.imageUrl;
          newPostData.imagePath = uploadResult.imagePath;

          const docRef = await addDoc(collection(db, "walk"), newPostData);
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
      const postsQuery = query(
        collection(db, "walk"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(postsQuery);
      let userHasPosted = false;
  
      // 새로운 acceptedWalkApplications 상태를 만들기 위해 Set을 초기화합니다.
      const newAcceptedWalkApplications = new Set();
  
      const postsPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        if (data.userUUID === currentUserUUID) {
          userHasPosted = true;
        }
        const userProfile = data.userUUID
          ? await fetchUserProfile(data.userUUID)
          : null;
  
        // 대리산책 신청 상태를 확인하고 newAcceptedWalkApplications를 업데이트합니다.
        const walkApplicationsQuery = query(
          collection(db, "walkApplications"),
          where("postId", "==", doc.id),
          where("status", "==", "accepted")
        );
        const walkApplicationsSnapshot = await getDocs(walkApplicationsQuery);
        const isAccepted = !walkApplicationsSnapshot.empty;
        if (isAccepted) {
          newAcceptedWalkApplications.add(doc.id);
        }
  
        return {
          id: doc.id,
          ...data,
          userProfile,
          createdAt: data.createdAt.toDate(),
          isAccepted, // 대리산책 신청 상태 추가
        };
      });
  
      const loadedPosts = await Promise.all(postsPromises);
      loadedPosts.sort((a, b) => b.likes - a.likes);
  
      // 상태 업데이트
      setHasPosted(userHasPosted);
      setPosts(loadedPosts);
      setAcceptedWalkApplications(newAcceptedWalkApplications);
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
      const imagePath = `walk/${new Date().toISOString()}`;
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

  // 포스트 추가를 취소하는 함수
  const handleCancelPost = () => {
    // 선택된 가족 구성원 사진 상태를 초기화합니다.
    setFamilyPhotos({ me: null });
    setSelectedFamilyPhotos({ me: false });

    // 모달의 가시성을 변경합니다.
    setModalVisible(false);
  };

  const numColumns = 2; // 이 값은 상태나 props에 따라 변경될 수 있음

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        
      data={posts}
      numColumns={numColumns}
      key={numColumns === 2 ? "two-columns" : "one-column"}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    
      renderItem=
      {({ item }) => (
        <View style={styles.postContainer}>
          {/* 사용자 프로필 표시 */}
          {item.userProfile && (
            <TouchableOpacity
              onPress={() => handleUserProfileClick(item.userProfile.userUUID)}
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
            renderMessageButton(item) // 수정된 코드로 변경
          )}

          <Text>{item.description}</Text>
          <Text style={styles.neighborhoodText}>{item.neighborhood}</Text>
            
          <View style={styles.postActionContainer}>
            
            {/* 업로드 시간 표시 */}
            <Text>
              {item.createdAt instanceof Date
                ? formatDate(item.createdAt)
                : "Unknown date"}

            </Text>

            {/* 포스트 주인만 신청 보기 버튼 표시 */}
            {currentUserId === item.userUUID && (
              <TouchableOpacity onPress={() => loadWalkApplications(item.id)}>
                <Text>신청 보기</Text>
              </TouchableOpacity>
            )}

            {/* 대리산책 신청 목록 표시 */}
            {currentPostId === item.id &&
              currentPostApplications.map((application) => (
                <View
                  key={application.id}
                  style={styles.walkApplicationContainer}
                >
                  {/* 신청자 정보 및 조건부 렌더링 */}
                  <TouchableOpacity
                    onPress={() => handleApplicationClick(application)}
                  >
                    <Image
                      source={{ uri: application.userProfile.imageUrl }}
                      style={styles.userProfileImage}
                    />
                  </TouchableOpacity>
                  <Text>{application.userProfile.name}</Text>
                  
                </View>
                
              ))}

            {/* 기타 버튼들 */}
          </View>
        </View>
      )}
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

            {/* 동네 정보 입력 필드 */}
      <TextInput
        style={styles.input}
        placeholder="동네를 입력하세요"
        value={neighborhood}
        onChangeText={setNeighborhood}
      />


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
                      style={styles.profileImages}
                    />
                  ) : (
                    <Text style={styles.noImageText}>이미지 없음</Text>
                  )}
                </View>

                {/* 정보 리스트 */}
                <View style={styles.infoSection}>
                  <Ionicons name="paw" size={24} color="#4fc3f7" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoTitle}>반려견 이름</Text>
                    <Text style={styles.infoContent}>
                      {selectedUserProfile.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Ionicons name="male-female" size={24} color="#4fc3f7" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoTitle}>성별</Text>
                    <Text style={styles.infoContent}>
                      {selectedUserProfile.gender}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Ionicons name="medkit" size={24} color="#4fc3f7" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoTitle}>중성화 여부</Text>
                    <Text style={styles.infoContent}>
                      {selectedUserProfile.spayedOrNeutered}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Ionicons name="shield-checkmark" size={24} color="#4fc3f7" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoTitle}>예방접종 여부</Text>
                    <Text style={styles.infoContent}>
                      {selectedUserProfile.vaccinated}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Ionicons name="paw" size={24} color="#4fc3f7" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoTitle}>성격 및 특징</Text>
                    <Text style={styles.infoContent}>
                      {selectedUserProfile.characteristics}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <Text>Loading...</Text>
            )}
            <Button
              title="닫기"
              onPress={() => setProfileModalVisible(false)}
              color="#2196F3" // 버튼 색상 설정
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default index;
