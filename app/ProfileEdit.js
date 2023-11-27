//npm install @react-native-community/datetimepicker --save
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "./firebaseConfig"; // 실제 경로로 교체하세요
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { collection, doc, getDocs, addDoc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // 아이콘 사용을 위한 임포트
import FontAwesome from "react-native-vector-icons/FontAwesome";
import uuid from "react-native-uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileEdit = () => {
  const router = useRouter();

  useEffect(() => {
    // 컴포넌트 마운트시 갤러리 접근 권한 요청
    requestPermission();
    fetchProfileData();
  }, []);

  // 상태 훅들
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState(null);
  const [spayedOrNeutered, setSpayedOrNeutered] = useState("no"); // 중성화 여부
  const [vaccinated, setVaccinated] = useState("no"); // 예방접종 여부
  const [characteristics, setCharacteristics] = useState(""); // 성격 및 특징

  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  // 키보드를 숨기는 함수
  const dismissKeyboard = () => Keyboard.dismiss();

  // 날짜 선택 핸들러 업데이트
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);

    // 날짜를 'YYYY년 MM월 DD일' 형식으로 변환하여 상태 업데이트
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const day = currentDate.getDate();

    setBirthYear(year.toString());
    setBirthMonth(month.toString());
    setBirthDay(day.toString());
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const fetchProfileData = async () => {
    try {
      // 예를 들어, 사용자 아이디를 기반으로 프로필 데이터를 조회합니다.
      // 여기서는 'userId'가 현재 로그인한 사용자의 아이디라고 가정합니다.
      const savedUUID = await AsyncStorage.getItem("userUUID");

      if (savedUUID) {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        querySnapshot.forEach((doc) => {
          if (doc.data().uniqueId === savedUUID) {
            const data = doc.data();

            setName(data.name);
            setType(data.type);
            setGender(data.gender);
            setImage(data.imageUrl);
            setBirthYear(data.birthYear); // 이 부분은 실제 데이터 형식에 따라 다를 수 있습니다.
            setSpayedOrNeutered(data.spayedOrNeutered);
            setVaccinated(data.vaccinated);
            setCharacteristics(data.characteristics);
          }
        });
      }
    } catch (error) {
      console.log("프로필 데이터 불러오기 오류:", error);
    }
  };

  // 이미지 선택기
  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setImage(selectedImage.uri); // 임시로 이미지 URI를 상태에 저장
    }
  };

  // 이미지 업로드 및 저장
  const handleUpload = async (selectedImageUri) => {
    if (selectedImageUri) {
      const response = await fetch(selectedImageUri);
      const blob = await response.blob();
      const storage = getStorage();
      const imagePath = "images/" + new Date().toISOString();
      const imageRef = storageRef(storage, imagePath);

      await uploadBytes(imageRef, blob);

      // uploadBytes가 완료된 후에 getDownloadURL 호출
      const imageUrl = await getDownloadURL(imageRef);

      return { imageUrl, imagePath }; // 이미지 URL과 경로 반환
    }
    return null;
  };

  const handleSave = async () => {
    try {
      const imageUrl = await handleUpload(); // 먼저 이미지 업로드 후 URL을 가져옴
      const formattedDate = `${date.getFullYear()}년 ${
        date.getMonth() + 1
      }월 ${date.getDate()}일`;
      // 고유 식별자 생성 (예: UUID)

      let uniqueId;
      const savedUUID = await AsyncStorage.getItem("userUUID");
      if (savedUUID) {
        uniqueId = savedUUID;
      } else {
        uniqueId = uuid.v4();
      }

      await setDoc(doc(db, "profiles", uniqueId), {
        uniqueId: uniqueId, // 고유 식별자 저장
        name: name,
        type: type,
        gender: gender,
        imageUrl: imageUrl || image,
        birthdate: formattedDate, // Saving formatted birthdate
        spayedOrNeutered: spayedOrNeutered,
        vaccinated: vaccinated,
        characteristics: characteristics,
      });
      // UUID를 AsyncStorage에 저장
      await AsyncStorage.setItem("userUUID", uniqueId);

      console.log("프로필 저장됨!");
      alert("프로필이 저장되었습니다!");
      router.push({
        pathname: `/ProfileView`,
        params: {
            name: name,
            type: type,
            gender: gender,
            imageUrl: image,
            birthdate: formattedDate,
            spayedOrNeutered: spayedOrNeutered,
            vaccinated: vaccinated,
            characteristics: characteristics,
        },

      });
    } catch (error) {
      console.error("프로필 저장 중 오류 발생: ", error);
      alert("프로필 저장 중 오류가 발생했습니다: " + error.message);
      // 추가적인 오류 처리 로직을 여기에 작성할 수 있습니다.
      // 예를 들어, 사용자에게 오류를 알리고, 현재 페이지에 머물게 하거나 다른 행동을 취할 수 있습니다.
    }
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

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          <View style={styles.container}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {image ? (
                <Image source={{ uri: image }} style={styles.profileImage} />
              ) : (
                <Text style={styles.imagePickerText}>이미지</Text>
              )}
            </TouchableOpacity>

            <View style={styles.action}>
              <FontAwesome name="user-o" color="#4fc3f7" size={20} />
              <TextInput
                placeholder="반려동물 이름"
                placeholderTextColor="#666666"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
                style={styles.input} // 여기서 styles.input은 infoContent와 유사한 스타일로 설정
              />
            </View>

            <View style={styles.action}>
              <Ionicons name="paw" size={24} color="#4fc3f7" />
              <TextInput
                placeholder="반려견 견종"
                placeholderTextColor="#666666"
                autoCorrect={false}
                value={type}
                onChangeText={setType}
                style={styles.input}
              />
            </View>

            <View style={styles.action}>
              <Ionicons name="male-female" size={24} color="#4fc3f7" />
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    gender === "male" ? styles.selected : null,
                  ]}
                  onPress={() => setGender("male")}
                >
                  <Text style={styles.buttonText}>남아</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    gender === "female" ? styles.selected : null,
                  ]}
                  onPress={() => setGender("female")}
                >
                  <Text style={styles.buttonText}>여아</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.action}>
              <Ionicons name="calendar" size={24} color="#4fc3f7" />
              <View style={styles.dateContainer}>
                <Button onPress={showDatepicker} title="날짜 선택" />
              </View>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode={mode}
                  is24Hour={true}
                  display="default"
                  onChange={onChange}
                />
              )}
            </View>
            <View style={styles.action}>
              {/* 중성화 여부 선택 */}
              <View style={styles.switchContainer}>
                <Ionicons name="medkit" size={24} color="#4fc3f7" />
                <Text>중성화</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      spayedOrNeutered === "yes" ? styles.selected : null,
                    ]}
                    onPress={() => setSpayedOrNeutered("yes")}
                  >
                    <Text style={styles.buttonText}>예</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      spayedOrNeutered === "no" ? styles.selected : null,
                    ]}
                    onPress={() => setSpayedOrNeutered("no")}
                  >
                    <Text style={styles.buttonText}>아니요</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.action}>
              {/* 예방접종 여부 선택 */}
              <Ionicons name="shield-checkmark" size={24} color="#4fc3f7" />
              <Text>예방접종</Text>
              <View style={styles.switchContainer}>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      vaccinated === "yes" ? styles.selected : null,
                    ]}
                    onPress={() => setVaccinated("yes")}
                  >
                    <Text style={styles.buttonText}>예</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      vaccinated === "no" ? styles.selected : null,
                    ]}
                    onPress={() => setVaccinated("no")}
                  >
                    <Text style={styles.buttonText}>아니요</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* 성격 및 특징 입력 필드 */}
            <Text>성격 및 특징</Text>
            <TextInput
              value={characteristics}
              onChangeText={setCharacteristics}
              style={styles.multilineInput}
              multiline
              numberOfLines={4}
              placeholder="성격, 습관, 좋아하는 것 등"
            />
            {/* 저장 버튼 */}
            <Button title="저장하기" onPress={handleSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  action: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  button: {
    backgroundColor: "white",
    padding: 10,
    borderWidth: 1,
    borderColor: "orange",
    borderRadius: 5,
  },
  selected: {
    backgroundColor: "orange",
  },
  buttonText: {
    color: "black",
  },
  container: {
    padding: 20,
    backgroundColor: "#F9FAFB", // 부드러운 배경색
    flex: 1,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 100, // 원형 이미지
    alignSelf: "center", // 가운데 정렬
    overflow: "hidden", // 이미지가 테두리를 넘지 않도록 처리
    marginBottom: 20,
  },
  input: {
    borderColor: "#D1D5DB", // 부드러운 테두리 색상
    borderWidth: 1,
    borderRadius: 8, // 입력 필드 모서리 둥글게
    marginBottom: 12,
    padding: 10,
    backgroundColor: "white", // 입력 필드 배경색
    fontSize: 16, // 텍스트 크기
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateInput: {
    width: "32%",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "white",
    textAlign: "center", // 텍스트 가운데 정렬
  },
  imagePicker: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB", // 이미지 선택기 배경색
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    alignSelf: "center",
  },
  imagePickerText: {
    color: "#9CA3AF", // 글씨 색상
    fontWeight: "bold", // 글씨 굵게
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  multilineInput: {
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
    textAlignVertical: "top", // 안드로이드에서 멀티라인 정렬
    marginBottom: 12,
    paddingTop: 0,
    height: 100, // 높이를 주어 멀티라인 입력 가능하게 함
  },
  // 추가적인 스타일 ...
});

export default ProfileEdit;
