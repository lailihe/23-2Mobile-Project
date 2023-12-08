import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 아이콘 사용을 위한 임포트
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, doc, deleteDoc,  getDoc} from "firebase/firestore";
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import { db } from "../firebase/firebaseConfig"; // 실제 경로로 교체하세요
import styles from "../../components/styles/ProfileViewstyle";
const ProfileView = () => {

    // 상태 훅들
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [gender, setGender] = useState("");
    const [image, setImage] = useState(null);
    const [spayedOrNeutered, setSpayedOrNeutered] = useState("미완료"); // 중성화 여부
    const [vaccinated, setVaccinated] = useState("미완료"); // 예방접종 여부
    const [characteristics, setCharacteristics] = useState(""); // 성격 및 특징
    const [date, setDate] = useState("");
    const [number, setNumber] = useState("");
    const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리하는 변수

    const onRefresh = () => {
        // 스크롤을 아래로 끌어당기면 실행되는 새로고침 함수
        setRefreshing(true);
        // 데이터를 새로 불러오고 새로고침 상태를 업데이트합니다.
        fetchProfileData();
        setRefreshing(false);
    };
    const fetchProfileData = async () => {
        try {
            // 예를 들어, 사용자 아이디를 기반으로 프로필 데이터를 조회합니다.
            // 여기서는 'userId'가 현재 로그인한 사용자의 아이디라고 가정합니다.
            const savedUUID = await AsyncStorage.getItem("userUUID");

            if (savedUUID) {
                const querySnapshot = await getDocs(collection(db, "profiles"));
                querySnapshot.forEach((doc) => {
                    if (doc.data().userUUID === savedUUID) {
                        const data = doc.data();
                        //
                        setName(data.name);
                        setType(data.type);
                        setGender(data.gender);
                        setImage(data.imageUrl);
                        setDate(data.date); // 데이터베이스에 저장되어 있는 date 값 변수명과 같게
                        setSpayedOrNeutered(data.spayedOrNeutered);
                        setVaccinated(data.vaccinated);
                        setNumber(data.number);
                        setCharacteristics(data.characteristics);
                    }
                });
            }
        } catch (error) {
            console.log("프로필 데이터 불러오기 오류:", error);
        }
    };


    useEffect(() => {
        fetchProfileData();
    }, [refreshing]);
    

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

    const deleteProfile = async () => {
        try {
            const savedUUID = await AsyncStorage.getItem("userUUID");
            if (savedUUID) {
                // Firestore에서 프로필 조회 및 이미지 URL 가져오기
                const docRef = doc(db, "profiles", savedUUID);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const imageUrl = docSnap.data().imageUrl;
    
                    // Firebase 스토리지에서 이미지 삭제
                    if (imageUrl) {
                        const storage = getStorage();
                        const imageRef = storageRef(storage, imageUrl);
                        await deleteObject(imageRef);
                    }
    
                    // Firestore에서 프로필 삭제
                    await deleteDoc(docRef);
    
                    console.log("프로필이 삭제되었습니다.");
                    alert("프로필이 삭제되었습니다.");
                    // 추가 작업 (예: 홈 화면으로 이동)
                }
            }
        } catch (error) {
            console.error("프로필 삭제 중 오류 발생: ", error);
            alert("프로필 삭제 중 오류가 발생했습니다: " + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
            refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {/* 프로필 이미지 */}
                <View style={styles.imageContainer}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.profileImage} />
                    ) : (
                        <Text style={styles.noImageText}>이미지 없음</Text>
                    )}
                </View>

                {/* 정보 리스트 */}
                <View style={styles.infoSection}>
                    <Ionicons name="paw" size={24} color="#4fc3f7" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>반려견 이름</Text>
                        <Text style={styles.infoContent}>{name}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Ionicons name="paw" size={24} color="#4fc3f7" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>반려견 견종</Text>
                        <Text style={styles.infoContent}>{type}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Ionicons name="male-female" size={24} color="#4fc3f7" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>성별</Text>
                        <Text style={styles.infoContent}>{gender}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Ionicons name="calendar" size={24} color="#4fc3f7" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>생년월일</Text>
                        <Text style={styles.infoContent}>{date}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Ionicons name="hardware-chip-outline" size={24} color="#4fc3f7" /> 
                     <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>반려동물 등록번호</Text>
                        <Text style={styles.infoContent}>{number}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Ionicons name="medkit" size={24} color="#4fc3f7" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>중성화 여부</Text>
                        <Text style={styles.infoContent}>{spayedOrNeutered}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Ionicons name="shield-checkmark" size={24} color="#4fc3f7" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>예방접종 여부</Text>
                        <Text style={styles.infoContent}>{vaccinated}</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Ionicons name="paw" size={24} color="#4fc3f7" />
                    <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>성격 및 특징</Text>
                        <Text style={styles.infoContent}>{characteristics}</Text>
                    </View>
                </View>
                {/* 삭제 버튼 */}
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>프로필 삭제</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};


export default ProfileView;