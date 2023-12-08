import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, deleteDoc, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from "./firebase/firebaseConfig";
import styles from "../components/styles/mdstyle";
import { useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"; // 아이콘 사용을 위한 임포트

const Momdad = () => {
  // 상태 관리
  const [momImage, setMomImage] = useState(null);
  const [momnameBreed, setMomNameBreed] = useState("");
  const [momsizeWeight, setMomSizeWeight] = useState("");
  const [mombirthdateLifespan, setMomBirthdateLifespan] = useState("");
  const [mompersonality, setMomPersonality] = useState("");
  const [momgeneticInfo, setMomGeneticInfo] = useState("");
  const [momgood, setMomGood] = useState("");
  const [momIntro, setMomIntro] = useState("");

  const [dadImage, setDadImage] = useState(null);
  const [dadnameBreed, setDadNameBreed] = useState("");
  const [dadsizeWeight, setDadSizeWeight] = useState("");
  const [dadbirthdateLifespan, setDadBirthdateLifespan] = useState("");
  const [dadpersonality, setDadPersonality] = useState("");
  const [dadgeneticInfo, setDadGeneticInfo] = useState("");
  const [dadgood, setDadGood] = useState("");
  const [dadIntro, setDadIntro] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [currentUserUUID, setCurrentUserUUID] = useState(null);
  const [displayedUserUUID, setDisplayedUserUUID] = useState(null); // 표시되는 유저의 UUID

  const { userUUID } = useLocalSearchParams(); // 외부에서 전달받은 UUID

  // 프로필 데이터 가져오기 함수
  const fetchProfileData = async (uuid) => {
    try {
      const docRef = doc(db, "parents", uuid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setMomImage(data.mom.imageUrl);
        setMomNameBreed(data.mom.namebreed);
        setMomSizeWeight(data.mom.sizeWeight);
        setMomBirthdateLifespan(data.mom.birthdateLifespan);
        setMomPersonality(data.mom.personality);
        setMomGeneticInfo(data.mom.geneticInfo);
        setMomGood(data.mom.good);
        setMomIntro(data.mom.intro);

        setDadImage(data.dad.imageUrl);
        setDadNameBreed(data.dad.namebreed);
        setDadSizeWeight(data.dad.sizeWeight);
        setDadBirthdateLifespan(data.dad.birthdateLifespan);
        setDadPersonality(data.dad.personality);
        setDadGeneticInfo(data.dad.geneticInfo);
        setDadGood(data.dad.good);
        setDadIntro(data.dad.intro);
      } else {
        console.log("문서를 찾을 수 없습니다!");
      }
    } catch (error) {
      console.log("프로필 데이터 불러오기 오류:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "프로필 삭제",
      "프로필을 정말로 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", onPress: () => deleteProfile() },
      ],
      { cancelable: false }
    );
  };

  // 삭제 함수
  const deleteProfile = async () => {
    const savedUUID = await AsyncStorage.getItem("userUUID");
    if (savedUUID) {
      const docRef = doc(db, "parents", savedUUID);

      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Firestore 문서 삭제
          await deleteDoc(docRef);

          // Storage에서 이미지 삭제
          if (data.mom && data.mom.imageUrl) {
            const momImageRef = ref(getStorage(), data.mom.imageUrl);
            await deleteObject(momImageRef);
          }
          if (data.dad && data.dad.imageUrl) {
            const dadImageRef = ref(getStorage(), data.dad.imageUrl);
            await deleteObject(dadImageRef);
          }

          Alert.alert("삭제 성공", "부모님 정보가 삭제되었습니다.");
          // 상태 초기화 또는 다른 화면으로 이동
          setMomImage(data.mom.imageUrl);
          setMomNameBreed(data.mom.namebreed);
          setMomSizeWeight(data.mom.sizeWeight);
          setMomBirthdateLifespan(data.mom.birthdateLifespan);
          setMomPersonality(data.mom.personality);
          setMomGeneticInfo(data.mom.geneticInfo);
          setMomGood(data.mom.good);
          setMomIntro(data.mom.intro);

          setDadImage(data.dad.imageUrl);
          setDadNameBreed(data.dad.namebreed);
          setDadSizeWeight(data.dad.sizeWeight);
          setDadBirthdateLifespan(data.dad.birthdateLifespan);
          setDadPersonality(data.dad.personality);
          setDadGeneticInfo(data.dad.geneticInfo);
          setDadGood(data.dad.good);
          setDadIntro(data.dad.intro);
        } else {
          console.log("문서를 찾을 수 없습니다!");
        }
      } catch (error) {
        console.error("삭제 중 오류 발생:", error);
        Alert.alert("삭제 오류", "정보 삭제 중 문제가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    // 현재 사용자의 UUID 가져오기
    const getUserUUID = async () => {
      const uuid = await AsyncStorage.getItem("userUUID");
      setCurrentUserUUID(uuid);
      setDisplayedUserUUID(userUUID || uuid);
    };

    getUserUUID();
  }, []);

  useEffect(() => {
    if (displayedUserUUID) {
      fetchProfileData(displayedUserUUID);
    }
  }, [displayedUserUUID]);

  // 새로고침 함수
  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData(displayedUserUUID).then(() => {
      setRefreshing(false);
    });
  };

  // 여기에 스타일 및 기타 필요한 컴포넌트 구현을 추가합니다.
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.contentContainer}>
        {momImage ? (
          <Image source={{ uri: momImage }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>
            엄마 사진을 불러올 수 없습니다.
          </Text>
        )}

        <Text style={styles.customText}>엄마</Text>

        <View style={styles.infoSection}>
          <Ionicons name="paw" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>이름과 종</Text>
            <Text style={styles.infoContent}>{momnameBreed}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="resize" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>크기 및 무게</Text>
            <Text style={styles.infoContent}>{momsizeWeight}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="calendar" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>생년월일</Text>
            <Text style={styles.infoContent}>{mombirthdateLifespan}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="happy" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>성격</Text>
            <Text style={styles.infoContent}>{mompersonality}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <FontAwesome5 name="dna" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>유전 정보</Text>
            <Text style={styles.infoContent}>{momgeneticInfo}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="ribbon" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>수상 경력</Text>
            <Text style={styles.infoContent}>{momgood}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>기타 정보</Text>
            <Text style={styles.infoContent}>{momIntro}</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {dadImage ? (
          <Image source={{ uri: dadImage }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>
            아빠 사진을 불러올 수 없습니다.
          </Text>
        )}
        <Text style={styles.customText}>아빠</Text>

        <View style={styles.infoSection}>
          <Ionicons name="paw" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>이름과 종</Text>
            <Text style={styles.infoContent}>{dadnameBreed}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="resize" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>크기 및 무게</Text>
            <Text style={styles.infoContent}>{dadsizeWeight}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="calendar" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>생년월일</Text>
            <Text style={styles.infoContent}>{dadbirthdateLifespan}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="happy" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>성격</Text>
            <Text style={styles.infoContent}>{dadpersonality}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <FontAwesome5 name="dna" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>유전 정보</Text>
            <Text style={styles.infoContent}>{dadgeneticInfo}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="ribbon" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>수상 경력</Text>
            <Text style={styles.infoContent}>{dadgood}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>기타 정보</Text>
            <Text style={styles.infoContent}>{dadIntro}</Text>
          </View>
        </View>
      </View>
      {/* 삭제 버튼: 현재 사용자가 프로필 주인일 경우에만 표시 */}
      {currentUserUUID === displayedUserUUID && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>정보 삭제하기</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default Momdad;
