import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // 아이콘 사용을 위한 임포트
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // 실제 경로로 교체하세요
const ProfileView = () => {
    const params = useGlobalSearchParams();

    // 상태 훅들
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [gender, setGender] = useState("");
    const [image, setImage] = useState(null);
    const [spayedOrNeutered, setSpayedOrNeutered] = useState("no"); // 중성화 여부
    const [vaccinated, setVaccinated] = useState("no"); // 예방접종 여부
    const [characteristics, setCharacteristics] = useState(""); // 성격 및 특징
    const [birthdate, setBirthdate] = useState("");



    useEffect(() => {
        if (params) {
            setName(params.name || "");
            setType(params.type || "");
            setGender(params.gender || "");
            setImage(params.imageUrl || null);
            setSpayedOrNeutered(params.spayedOrNeutered || "no");
            setVaccinated(params.vaccinated || "no");
            setCharacteristics(params.characteristics || "");
            setBirthdate(params.birthdate || "");
        }


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
                            //
                            setName(data.name);
                            setType(data.type);
                            setGender(data.gender);
                            setImage(data.imageUrl);
                            setBirthdate(data.birthdate); // 데이터베이스에 저장되어 있는 date 값 변수명과 같게
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

        fetchProfileData();
    }, [params]);

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
                const docRef = doc(db, "profiles", savedUUID);
                await deleteDoc(docRef);

                console.log("프로필이 삭제되었습니다.");
                alert("프로필이 삭제되었습니다.");
                // 추가 작업 (예: 홈 화면으로 이동)
            }
        } catch (error) {
            console.error("프로필 삭제 중 오류 발생: ", error);
            alert("프로필 삭제 중 오류가 발생했습니다: " + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
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
                        <Text style={styles.infoContent}>{birthdate}</Text>
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

// 스타일 정의
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        paddingTop: 50,
    },
    imageContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
    },
    profileImage: {
        width: 130,
        height: 130,
        borderRadius: 100, // 원형 이미지
        alignSelf: "center", // 가운데 정렬
        overflow: "hidden", // 이미지가 테두리를 넘지 않도록 처리
        marginBottom: 20,
    },
    noImageText: {
        fontSize: 16,
        color: "#666",
    },
    infoSection: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#cccccc",
        padding: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    infoText: {
        marginLeft: 10,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    infoContent: {
        fontSize: 14,
        color: "#666",
    },
    deleteButton: {
        backgroundColor: "red",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        margin: 20,
    },
    deleteButtonText: {
        color: "white",
        fontSize: 16,
    },
    // ... 나머지 스타일
});

export default ProfileView;