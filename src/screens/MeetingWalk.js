// 메인 코드: 산책 중 만남을 관리 역할
// 이 코드는 사용자의 위치를 표시하고, 다른 사용자와의 만남 요청 및 응답 관리
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Animated, Dimensions, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; //  지도 표시 모듈
import * as Location from 'expo-location'; // 사용자 현재 위치 얻기 위한 모듈
import styles from './MeetingWalkStyles';
import StartWalkBtn from '../components/Btn/StartWalkBtn'; // 산책 시작 및 중지 버튼 컴포넌트
import MeetingRequestDialogs from '../components/Dialog/MeetingRequestDialog'; // 만남 요청 및 응답 대화상자 컴포넌트
import { saveUserLocation } from '../firebase/SaveLocation'; // 사용자 위치를 Firebase에 저장하는 함수
import { getAllUserLocations, getProfileNameById, getProfileInfoById } from '../firebase/UserLocationsManager'; // 모든 사용자의 위치를 가져오는 함수
import { sendMeetingRequest, listenForMeetingRequests, handleMeetingRequestResponse, listenToMeetingRequestStatus,updateWalkActiveStatus, listenToWalkActive } from '../firebase/MeetingRequest'; // 만남 요청 및 응답을 처리하는 함수
import AsyncStorage from '@react-native-async-storage/async-storage'; // 로컬 저장소 시스템으로 애플리케이션을 종료하거나 디바이스를 재시작해도 데이터가 유지
import Toast from 'react-native-toast-message';
import { startLocationTracking, stopLocationTracking } from '../firebase/LocationTracking';

// MeetingStatusComponent 컴포넌트: 만남 중임을 보여주는 컴포넌트
// 두 사용자 아이콘과 만나중임을 나타내는 원형 애니메이션으로 구성
const MeetingStatusComponent = ({ userId, connectedUserId, animationValue }) => {
    const [userName, setUserName] = useState('');
    const [connectedUserName, setConnectedUserName] = useState('');

    // 컴포넌트가 마운트되거나 userId, connectedUserId가 변경될 때마다 사용자 이름을 조회하여 업데이트
    useEffect(() => {
        if (userId) {
            getProfileNameById(userId).then(name => setUserName(name));
        }
        if (connectedUserId) {
            getProfileNameById(connectedUserId).then(name => setConnectedUserName(name));
        }
    }, [userId, connectedUserId]);

    // 애니메이션 원 개수 정의
    const circleCount = 6; // 애니메이션 사용될 원의 개수
    const circleElements = []; // 원 저장 배열
  
    // 원 개수만큼 원을 생성하여 배열에 추가
    for (let i = 0; i < circleCount; i++) {
      circleElements.push(
        <Animated.View
          key={i}
          style={{
            // 애니메이션 값에 따라 투명도를 조절하여 애니메이션 효과 줌
            opacity: animationValue.interpolate({
              inputRange: [i, i + 1, i + 2],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            }),
            height: 10,
            width: 10,
            backgroundColor: 'blue',
            borderRadius: 5,
            margin: 2,
          }}
        />
      );
    }

    // 사용자 아이콘과 ID, 애니메이션된 원들을 화면에 표시
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../../assets/user_icon.png')} style={{ width: 50, height: 50 }} />
            {/* 사용자 이름 표시 */}
            <Text>{userName ? userName : 'N/A'}</Text>
          </View>
          {/* 애니메이션 원들을 표시 */}
          <View style={{ flexDirection: 'row' }}>
            {circleElements}
          </View>
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../../assets/user_icon.png')} style={{ width: 50, height: 50 }} />
            {/* 연결된 사용자의 이름 표시 */}
            <Text>{connectedUserName ? connectedUserName : 'N/A'}</Text>
          </View>
        </View>
    );
};

// 주요 컴포넌트로 애플리케이션 로직 담당
const MeetingWalk = () => {
    // 다양한 상태 관리 위한 useState 훅
    const [currentPosition, setCurrentPosition] = useState(null); // 현재 사용자 위치
    const [errorMsg, setErrorMsg] = useState(null); // 위치 권한 오류 메시지
    const [otherUsersPositions, setOtherUsersPositions] = useState([]); // 다른 사용자의 위치 배열
    const [isWalking, setIsWalking] = useState(false); // 산책 중 여부, 산책 버튼 상태 결정
    const [userId, setUserId] = useState(null); // 사용자 ID 상태
    const [locationSaved, setLocationSaved] = useState(false); // 위치 저장 여부
    const [meetingActive, setMeetingActive] = useState(false); // 만남 활성화 상태
    const [connectedUserId, setConnectedUserId] = useState(null); // 연결된 사용자의 ID
    const [animationValue] = useState(new Animated.Value(0)); // 애니메이션 값
    // 만남 활성화(시작) 상태 관리 훅 추가
    const [walkActive, setWalkActive] = useState(null);

    // 만남 상태 표시 애니메이션을 시작하는 함수
    const startAnimation = () => {
        const circleCount = 6; // 원하는 원의 개수 설정

        Animated.loop(
            Animated.sequence([
                Animated.timing(animationValue, { toValue: circleCount, duration: 3000, useNativeDriver: false }),
                Animated.timing(animationValue, { toValue: 0, duration: 3000, useNativeDriver: false })
            ])
        ).start();
    };

    // 위치 정보 가져오고, Firebase에 위치 저장
    useEffect(() => {
        (async () => {
            if (locationSaved) return; // 위치가 이미 저장되었다면 로직 실행 중지

            let { status } = await Location.requestForegroundPermissionsAsync(); // 위치 정보 접근 권한 요청
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied'); // 권한 거부된 경우 에러 메시지
                return;
            }

            let location = await Location.getCurrentPositionAsync({}); //  현재 위치 정보 가져옴
            setCurrentPosition({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });

             // AsyncStorage에서 uniqueId 가져오기
            const uniqueId = await AsyncStorage.getItem("userUUID");
            if (uniqueId) {
                // 위치 정보와 함께 uniqueId를 사용하여 위치 저장
                await saveUserLocation(uniqueId, location.coords.latitude, location.coords.longitude);
                setUserId(uniqueId); // uniqueId를 상태에 저장
                setLocationSaved(true); // 위치 저장 완료 표시
            }
        })();
    }, [locationSaved]); // 의존성 배열에 locationSaved를 포함시켜 위치 저장 여부가 변경될 때만 이 useEffect가 실행되도록 함

    // 만남 요청을 수신하고 처리하는 로직
    useEffect(() => {
        if (!userId) return;

        // 만남 요청을 실시간으로 감지하여
        // 만남 요청이 들어오면 콜백 함수 실행
        const unsub = listenForMeetingRequests(userId, (request) => {
            if (!meetingActive) {
                // 만남 요청 보낸 사용자 프로필 정보 가져옴
                getProfileInfoById(request.fromUserId).then((profileInfo) => {
                    MeetingRequestDialogs.showRequestDecisionDialog(profileInfo.name, profileInfo, () => {
                        // 대화상자에서 '수락'버튼 클릭될 때 로직
                        handleMeetingRequestResponse(request.id, 'accepted')
                            .then(() => {
                                console.log("산책 수락");
                                setMeetingActive(true); // 만남 상태 활성화
                                setConnectedUserId(request.fromUserId); // 연결된 사용자 ID 업데이트
                                startAnimation(); // 애니메이션 시작
                                // 산책 버튼(상태)를 '중지'로 변경
                                setIsWalking(true);const unsub = getAllUserLocations((users) => {
                                    // 여기서 users 배열의 각 객체가 userId를 포함하고 있는지 확인하고 다른 사용자의 위치를 업데이트
                                    setOtherUsersPositions(users);
                                });
                                setWalkActive(true); // 만남 상태를 활성화로 설정

                                // // 산책 시작 클릭 시 실시간 위치 추적
                                // startLocationTracking((location) => {
                                //     // 사용자의 현재 위치를 상태에 저장
                                //     setCurrentPosition({
                                //         latitude: location.coords.latitude,
                                //         longitude: location.coords.longitude,
                                //         latitudeDelta: 0.005,
                                //         longitudeDelta: 0.005,
                                //     });
                                // });
                            })
                            .catch((error) => console.error("Error accepting request:", error));
                    }, () => {isWalking
                        // 만남 요청 거절버튼 클릭 시
                        handleMeetingRequestResponse(request.id, 'rejected')
                            .then(() => console.log("산책 거절"))
                            .catch((error) => console.error("Error rejecting request:", error));
                    });
                }).catch((error) => {
                    console.error("Error getting profile info: ", error);
                });
            }
        });

        return () => unsub && unsub();
    }, [userId, , meetingActive]);


    // 만남 요청 상태를 추적하는 로직
    useEffect(() => {
        if (!userId) return;

        let lastStatus = null; // 이전 상태를 추적하기 위한 변수
    
        // 만남 요청 상태 변경 리스닝: 만남 요청 상태 변경될 때마다 실행
        const unsubscribe = listenToMeetingRequestStatus(userId, (status, toUserId) => {
            if (status === 'accepted' && status !== lastStatus) {
                // 상태가 'accepted'로 변경되고 이전 상태와 다른 경우에만 수행
                //이미 'accepted' 상태인 만남 요청에 대해서는 대화상자를 표시하지 않도록함
                lastStatus = status; // 이전 상태 업데이트
                // 상대방이 만남 요청을 수락한 경우
                getProfileNameById(toUserId).then((toUserName) => {
                    // 상대방 이름을 가져와 수락된 것을 알리는 대화상자 보여줌
                    MeetingRequestDialogs.showMeetingAcceptedDialog(toUserName);
                    // 만남 상태 업데이트
                    setMeetingActive(true);
                    setConnectedUserId(toUserId); // 연결된 사용자 ID 설정
                    startAnimation(); // 애니메이션 시작
                });
            } else if (status === 'rejected') {
                // 상대방이 만남 요청 거절한 경우
                getProfileNameById(toUserId).then((toUserName) => {
                    // 거절 대화상자 보여줌
                    MeetingRequestDialogs.showMeetingRejectedDialog(toUserName);
                    // 만남 상태 false
                    setMeetingActive(false);
                });
            }
        });

        // 컴포넌트 언마운트 시 리스너 해제
        return () => {
            unsubscribe();
        };

    }, [userId, animationValue]);

    console.log("walkActive", walkActive);
    console.log("meetingActive", meetingActive);
    console.log("\n");
    
    // 산책 시작 / 중지 버튼 동작 처리
    const handleStartStopWalk = async () => {
        setIsWalking(!isWalking);
        if (!isWalking) {
            // 산책 시작 버튼 클릭 시
            const unsub = getAllUserLocations((users) => {
                // 여기서 users 배열의 각 객체가 userId를 포함하고 있는지 확인하고 다른 사용자의 위치를 업데이트
                setOtherUsersPositions(users);
            });
            setWalkActive(true); // 상태를 활성화로 설정

            // 산책 시작 클릭 시 실시간 위치 추적
            startLocationTracking((location) => {
                // 사용자의 현재 위치를 상태에 저장
                setCurrentPosition({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            });
        } else {
            // 산책 중지 로직
            await updateWalkActiveStatus(userId, connectedUserId, false); // 현재 사용자와 연결된 사용자의 walkActive 업데이트
            setWalkActive(false); // 만남 비활성화
            setMeetingActive(false); // 만남 상태 비활성화
            setOtherUsersPositions([]); // 다른 사용자 위치 초기화
            stopLocationTracking(); // 실시간 위치 추적 중지
            Toast.show({
                type: 'info',
                position: 'bottom',
                text1: '산책이 중지되었습니다',
            });
            console.log("산책중지");
        }
    };

    // MeetingWalk.js
    useEffect(() => {
        if (!userId || !connectedUserId) return;

        const unsubscribe = listenToWalkActive(userId, connectedUserId, (isActive) => {
            // 변경 감지될 때 동작
            setWalkActive(isActive);
            setIsWalking(false);
            setMeetingActive(false);
            Toast.show({
                type: 'info',
                position: 'bottom',
                text1: '동반 산책이 종료되었습니다',
            });
            console.log("동반산책중지");
        });

        return () => unsubscribe();
    }, [userId, connectedUserId]);


    // 다른 사용자의 마커 클릭 시 호출되는 함수
    const onMarkerPress = async (userPos) => {
        const userName = await getProfileNameById(userPos.userId); // 프로필에서 이름 조회
        const profileInfo = await getProfileInfoById(userPos.userId); // 프로필 정보 조회

        if (userName) {
            MeetingRequestDialogs.showMeetingRequestDialog(userName, profileInfo, async () => {
                await sendMeetingRequest(userId, userPos.userId);
            });
        } else {
            console.log("사용자 이름을 찾을 수 없습니다.");
        }
    };


    return (
        <View style={styles.container}>
            {/* 타이틀 및 지도 표시 부분 */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>산책 중 만남</Text>
            </View>
            <View style={styles.contentContainer}>
                {currentPosition ? (
                    <MapView style={styles.map} initialRegion={currentPosition}>
                        {/* 내 위치 표시 */}
                        {currentPosition && <Marker coordinate={currentPosition} />}
                        {/* 다른 사용자들의 위치 마커 */}
                        {isWalking && otherUsersPositions.map((userPos, index) => (
                            <Marker
                                key={index}
                                coordinate={{ latitude: userPos.latitude, longitude: userPos.longitude }}
                                onPress={() => onMarkerPress(userPos)} // 전체 userPos 객체를 전달
                            />
                        ))}
                    </MapView>
                ) : (
                    <Text>{errorMsg ? errorMsg : '위치 정보를 불러오는 중...'}</Text>
                )}
               {/* 만남 상태 컴포넌트 표시: walkActive와 meetingActive가 모두 true일 때만 */}
            {walkActive && meetingActive && (
                <MeetingStatusComponent
                    userId={userId}
                    connectedUserId={connectedUserId}
                    animationValue={animationValue}
                />
            )}
                {/* 산책 시작/중지 버튼 */}
                <StartWalkBtn onPress={handleStartStopWalk} title={isWalking ? '산책 중지' : '산책 시작'} />
            </View>
            <Toast/>
        </View>
    );
};

const screen = Dimensions.get('window');
const mapSize = screen.width;

export default MeetingWalk;