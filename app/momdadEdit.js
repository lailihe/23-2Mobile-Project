// momdadEdit.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getDocs, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig"; // Firebase 구성 파일의 경로를 확인하세요.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useGlobalSearchParams } from "expo-router";
import styles from "../components/styles/mdEstyle";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"; // 아이콘 사용을 위한 임포트

const momdadEdit = () => {
  // 상태 관리
  const [momImage, setMomImage] = useState(null);
  const [momsizeWeight, setMomSizeWeight] = useState("");
  const [mombirthdateLifespan, setMomBirthdateLifespan] = useState("");
  const [mompersonality, setMomPersonality] = useState("");
  const [momgeneticInfo, setMomGeneticInfo] = useState("");
  const [momgood, setMomGood] = useState("");
  const [momIntro, setMomIntro] = useState("");

  const [dadImage, setDadImage] = useState(null);
  const [dadsizeWeight, setDadSizeWeight] = useState("");
  const [dadbirthdateLifespan, setDadBirthdateLifespan] = useState("");
  const [dadpersonality, setDadPersonality] = useState("");
  const [dadgeneticInfo, setDadGeneticInfo] = useState("");
  const [dadgood, setDadGood] = useState("");
  const [dadIntro, setDadIntro] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [userUUID, setUserUUID] = useState(null); // 사용자 UUID 상태 추가

  const router = useRouter();
  const { momnameBreed: uType } = useGlobalSearchParams();
  const [momnameBreed, setMomNameBreed] = useState(uType);
  
  const { dadnameBreed: urType } = useGlobalSearchParams();
  const [dadnameBreed, setDadNameBreed] = useState(urType);
 

  useEffect(() => {
    // URL에서 가져온 'momnameBreed'와 'dadnameBreed' 값이 변경될 때만 상태 업데이트
    if (uType) {
      setMomNameBreed(uType);
    }
    if (urType) {
      setDadNameBreed(urType);
    }
  }, [uType, urType]);

  useEffect(() => {
    // 컴포넌트 마운트시 갤러리 접근 권한 요청
    requestPermission();
    fetchProfileData();
  }, []);

  // 프로필 데이터 가져오기
  const fetchProfileData = async () => {
    const savedUUID = await AsyncStorage.getItem("userUUID");
    setUserUUID(savedUUID); // 가져온 userUUID를 상태에 설정합니다.
    if (savedUUID) {
      const docRef = doc(db, "parents", savedUUID);
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
    }
  };

  const MomBreedSelection = () => {
    router.push("/Search2"); // 'select-breed'는 견종 선택 스크린의 라우트 경로여야 합니다.
  };

  const DadBreedSelection = () => {
    router.push("/Search3"); // 'select-breed'는 견종 선택 스크린의 라우트 경로여야 합니다.
  };

  // 갤러리 접근 권한 요청
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("사진을 선택하기 위해서는 갤러리 접근 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  // 이미지 선택 핸들러
  const pickImage = async (setImage) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setImage(result.assets[0].uri); // assets 배열에서 첫 번째 항목의 uri를 사용합니다.
    }
  };

  // 이미지 업로드 함수
  const uploadImage = async (imageUri) => {
    if (!imageUri) return null;
    const blob = await fetch(imageUri).then((r) => r.blob());
    const storageRef = ref(getStorage(), `fimages/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  // Firebase에 정보 저장
  const saveToFirebase = async () => {
    setIsSaving(true);

    // 엄마 또는 아빠 종의 이름이 입력되었는지 확인
  if (!momnameBreed || !dadnameBreed) {
    Alert.alert(
      "필수 정보 누락",
      "엄마와 아빠의 종은 필수 정보입니다. 모두 입력해주세요."
    );
    setIsSaving(false);
    return;
  }
  
    try {
      const userUUID = await AsyncStorage.getItem("userUUID");
      if (!userUUID) {
        console.error("userUUID가 존재하지 않습니다.");
        Alert.alert("저장 오류", "사용자 식별자가 없습니다.");
        setIsSaving(false);
        return;
      }

      const profilesRef = collection(db, "parents");
      const docRef = doc(profilesRef, userUUID);
      const docSnap = await getDoc(docRef);

      // 기존 이미지 URL을 임시로 저장합니다.
      let oldMomImageUrl =
        docSnap.exists() && docSnap.data().mom
          ? docSnap.data().mom.imageUrl
          : "";
      let oldDadImageUrl =
        docSnap.exists() && docSnap.data().dad
          ? docSnap.data().dad.imageUrl
          : "";

      let newMomImageUrl = oldMomImageUrl;
      let newDadImageUrl = oldDadImageUrl;

      // 새 이미지가 있다면 업로드하고 URL을 업데이트합니다.
      if (momImage) {
        newMomImageUrl = await uploadImage(momImage);
      }
      if (dadImage) {
        newDadImageUrl = await uploadImage(dadImage);
      }

      // Firestore 문서를 업데이트합니다.
      await setDoc(
        docRef,
        {
          mom: {
            imageUrl: newMomImageUrl,
            namebreed: momnameBreed,
            sizeWeight: momsizeWeight,
            birthdateLifespan: mombirthdateLifespan,
            personality: mompersonality,
            geneticInfo: momgeneticInfo,
            good: momgood,
            intro: momIntro,
          },

          dad: {
            imageUrl: newDadImageUrl,
            namebreed: dadnameBreed,
            sizeWeight: dadsizeWeight,
            birthdateLifespan: dadbirthdateLifespan,
            personality: dadpersonality,
            geneticInfo: dadgeneticInfo,
            good: dadgood,
            intro: dadIntro,
          },
          userUUID: userUUID,
        },
        { merge: true }
      );

      // 새 이미지 업로드 후 기존 이미지가 다르면 삭제합니다.
      if (oldMomImageUrl && oldMomImageUrl !== newMomImageUrl) {
        const oldMomImageRef = ref(getStorage(), oldMomImageUrl);
        await deleteObject(oldMomImageRef);
      }
      if (oldDadImageUrl && oldDadImageUrl !== newDadImageUrl) {
        const oldDadImageRef = ref(getStorage(), oldDadImageUrl);
        await deleteObject(oldDadImageRef);
      }

      Alert.alert("저장 성공", "부모님 정보가 성공적으로 저장되었습니다.");
      router.push({
        pathname: `/momdad`,
      });
    } catch (error) {
      console.error("Firebase 저장 중 오류 발생:", error);
      Alert.alert("저장 오류", "정보 저장 중 문제가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {momImage ? (
          <Image source={{ uri: momImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>엄마 사진</Text>
          </View>
        )}
        <Button title="엄마 사진 변경" onPress={() => pickImage(setMomImage)} />

        <View style={styles.infoSection}>
          <Ionicons name="paw" size={24} color="#4fc3f7" />
          <TextInput
            placeholder="이름과 종을 입력하세요"
            placeholderTextColor="#999999"
            value={momnameBreed}
            onChangeText={setMomNameBreed}
            style={[styles.input, styles.inputTouchable]}
            onTouchStart={MomBreedSelection} // 견종 선택 화면으로 이동
          />
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="resize" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="크기 및 무게를 입력하세요"
              placeholderTextColor="#999999"
              value={momsizeWeight}
              onChangeText={setMomSizeWeight}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <Ionicons name="calendar" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="생년월일을 입력하세요"
              placeholderTextColor="#999999"
              value={mombirthdateLifespan}
              onChangeText={setMomBirthdateLifespan}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <Ionicons name="happy" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="성격을 입력하세요"
              placeholderTextColor="#999999"
              value={mompersonality}
              onChangeText={setMomPersonality}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <FontAwesome5 name="dna" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="유전 정보를 입력하세요"
              placeholderTextColor="#999999"
              value={momgeneticInfo}
              onChangeText={setMomGeneticInfo}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <Ionicons name="ribbon" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="수상 경려을 입력하세요"
              placeholderTextColor="#999999"
              value={momgood}
              onChangeText={setMomGood}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="기타정보를 입력하세요"
              placeholderTextColor="#999999"
              value={momIntro}
              onChangeText={setMomIntro}
              style={styles.input}
            />
          </View>
        </View>
      </View>

      <View style={styles.imageContainer}>
        {dadImage ? (
          <Image source={{ uri: dadImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>아빠 사진</Text>
          </View>
        )}
        <Button title="아빠 사진 변경" onPress={() => pickImage(setDadImage)} />

        <View style={styles.infoSection}>
          <Ionicons name="paw" size={24} color="#4fc3f7" />
          <TextInput
            placeholder="이름과 종을 입력하세요"
            placeholderTextColor="#999999"
            value={dadnameBreed}
            onChangeText={setDadNameBreed}
            style={[styles.input, styles.inputTouchable]}
            onTouchStart={DadBreedSelection} // 견종 선택 화면으로 이동
          />
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="resize" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="크기 및 무게를 입력하세요"
              placeholderTextColor="#999999"
              value={dadsizeWeight}
              onChangeText={setDadSizeWeight}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <Ionicons name="calendar" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="생년월일을 입력하세요"
              placeholderTextColor="#999999"
              value={dadbirthdateLifespan}
              onChangeText={setDadBirthdateLifespan}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <Ionicons name="happy" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="성격을 입력하세요"
              placeholderTextColor="#999999"
              value={dadpersonality}
              onChangeText={setDadPersonality}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <FontAwesome5 name="dna" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="유전 정보를 입력하세요"
              placeholderTextColor="#999999"
              value={dadgeneticInfo}
              onChangeText={setDadGeneticInfo}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <Ionicons name="ribbon" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="수상 경려을 입력하세요"
              placeholderTextColor="#999999"
              value={dadgood}
              onChangeText={setDadGood}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={24} color="#4fc3f7" />
          <View style={styles.infoText}>
            <TextInput
              placeholder="기타정보를 입력하세요"
              placeholderTextColor="#999999"
              value={dadIntro}
              onChangeText={setDadIntro}
              style={styles.input}
            />
          </View>
        </View>
      </View>

      {isSaving ? (
        <Text>저장 중...</Text>
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={saveToFirebase}>
          <Text style={styles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default momdadEdit;
