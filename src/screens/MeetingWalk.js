// 메인 코드: 산책 중 만남을 관리 역할
// 이 코드는 사용자의 위치를 표시하고, 다른 사용자와의 만남 요청 및 응답 관리
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Animated, Dimensions, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; //  지도 표시 모듈
import * as Location from 'expo-location'; // 사용자 현재 위치 얻기 위한 모듈
//import Toast from 'react-native-toast-message'; // 토스트 메시지 표시 모듈
import styles from './MeetingWalkStyles';
import StartWalkBtn from '../components/Btn/StartWalkBtn'; // 산책 시작 및 중지 버튼 컴포넌트
import MeetingRequestDialogs from '../components/Dialog/MeetingRequestDialog'; // 만남 요청 및 응답 대화상자 컴포넌트
import { saveUserLocation } from '../firebase/SaveLocation'; // 사용자 위치를 Firebase에 저장하는 함수
import { getAllUserLocations } from '../firebase/UserLocationsManager'; // 모든 사용자의 위치를 가져오는 함수
import { sendMeetingRequest, listenForMeetingRequests, handleMeetingRequestResponse, listenToMeetingRequestStatus } from '../firebase/MeetingRequest'; // 만남 요청 및 응답을 처리하는 함수
import { getUsernameById } from '../firebase/UserLocationsManager'; // 사용자 ID를 기반으로 사용자 이름을 가져오는 함수

// MeetingStatusComponent 컴포넌트: 만남 중임을 보여주는 컴포넌트
// 두 사용자 아이콘과 만나중임을 나타내는 원형 애니메이션으로 구성
const MeetingStatusComponent = ({ userId, connectedUserId, animationValue }) => {
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
            {/* 사용자 ID 표시, ID 없으면 'N/A' 표시*/}
            <Text>{userId ? userId.substring(0, 3) : 'N/A'}</Text>
          </View>
          {/* 애니메이션 원들을 표시 */}
          <View style={{ flexDirection: 'row' }}>
            {circleElements}
          </View>
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../../assets/user_icon.png')} style={{ width: 50, height: 50 }} />
            {/* 연결된 사용자의 ID표시 */}
            <Text>{connectedUserId ? connectedUserId.substring(0, 3) : 'N/A'}</Text>
          </View>
        </View>
    );
};

// // 토스트 메시지의 설정 정의
// const toastConfig = {
//     success: ({ text1 }) => (
//       <View style={{ height: 40, width: '100%', backgroundColor: 'yellow' }}>
//         {/* 토스트 메시지 내용 표시 */}
//         <Text>{text1}</Text>
//       </View>
//     ),
//     // 추가 사용자 정의 토스트 유형을 여기에 정의 가능
// };

// 주요 컴포넌트로 애플리케이션 로직 담당
const MeetingWalk = () => {
    // 다양한 상태 관리 위한 useState 훅
    const [currentPosition, setCurrentPosition] = useState(null); // 현재 사용자 위치
    const [errorMsg, setErrorMsg] = useState(null); // 위치 권한 오류 메시지
    const [otherUsersPositions, setOtherUsersPositions] = useState([]); // 다른 사용자의 위치 배열
    const [isWalking, setIsWalking] = useState(false); // 산책 중 여부
    const [userId, setUserId] = useState(null); // 사용자 ID 상태
    const [locationSaved, setLocationSaved] = useState(false); // 위치 저장 여부
    const [meetingActive, setMeetingActive] = useState(false); // 만남 활성화 상태
    const [connectedUserId, setConnectedUserId] = useState(null); // 연결된 사용자의 ID
    const [animationValue] = useState(new Animated.Value(0)); // 애니메이션 값
    
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

            // 사용자의 위치를 Firebase에 저장하고 새로운 사용자 ID를 받아옴
            const newUserId = await saveUserLocation(location.coords.latitude, location.coords.longitude);
            if (newUserId) {
                setUserId(newUserId); // 새로운 사용자 ID를 상태에 저장
                setLocationSaved(true); // 위치 저장 완료 표시, 위치 저장 여부 true
            }
        })();
    }, [locationSaved]); // 의존성 배열에 locationSaved를 포함시켜 위치 저장 여부가 변경될 때만 이 useEffect가 실행되도록 함

    // 만남 요청 수신하고 처리하는 로직
    useEffect(() => {
        if (!userId) return; // 사용자 ID가 없다면 로직 실행X
    
        const unsub = listenForMeetingRequests(userId, (request) => {
            // 만남 요청 대화상자 표시
            MeetingRequestDialogs.showRequestDecisionDialog(request.fromUserId, () => {
                // '수락' 버튼 클릭 시 요청 수락 함수 호출
                handleMeetingRequestResponse(request.id, 'accepted')
                    .then(() => console.log("Request accepted"))
                    .catch((error) => console.error("Error accepting request:", error));
            }, () => {
                // '거절' 버튼 클릭 시
                handleMeetingRequestResponse(request.id, 'rejected')
                    .then(() => console.log("Request rejected"))
                    .catch((error) => console.error("Error rejecting request:", error));
            });
        });
    
        // 컴포넌트가 언마운트 되거나 userID가 변경될 때 수행될 클린업 함수
        return () => unsub && unsub();
    }, [userId]);

    // 만남 요청 상태를 추적하는 로직
    useEffect(() => {
        if (!userId) return;
    
        // 만남 요청 상태 변경 리스닝: 만남 요청 상태 변경될 때마다 실행
        const unsubscribe = listenToMeetingRequestStatus(userId, (status, toUserId) => {
            if (status === 'accepted') {
                // 상대방이 만남 요청을 수락한 경우
                getUsernameById(toUserId).then((toUserName) => {
                    // 상대방 이름을 가져와 수락된 것을 알리는 대화상자 보여줌
                    MeetingRequestDialogs.showMeetingAcceptedDialog(toUserName);
                    // 만남 상태 업데이트
                    setMeetingActive(true);
                    setConnectedUserId(toUserId); // 연결된 사용자 ID 설정
                    startAnimation(); // 애니메이션 시작
                });
            } else if (status === 'rejected') {
                // 상대방이 만남 요청 거절한 경우
                getUsernameById(toUserId).then((toUserName) => {
                    // 거절 대화상자 보여줌
                    MeetingRequestDialogs.showMeetingRejectedDialog(toUserName);
                    // 만남 상태 false
                    setMeetingActive(false);
                });
            }
        });

        // 만남 요청을 보낸 사용자에 대한 추가 로직
        const unsubscribeRequester = listenToMeetingRequestStatus(userId, (status, fromUserId) => {
            if (status === 'accepted') {
                //만남 요청 수락된 경우
                setMeetingActive(true);
                setConnectedUserId(fromUserId); // 연결된 사용자 ID 설정
                startAnimation(); // 애니메이션 시작
            }
        });

        // 컴포넌트 언마운트 시 리스너 해제
        return () => {
            unsubscribe();
            unsubscribeRequester();
        };

    }, [userId, animationValue]);

    //----------------------------------------새로추가-----------------
    // // 만남 요청을 수락하는 함수
    // const acceptMeetingRequest = (requestId, otherUserId) => {
    //     handleMeetingRequestResponse(requestId, 'accepted')
    //         .then(() => {
    //             console.log("Request accepted");
    //             // 만남 상태 업데이트
    //             setMeetingActive(true);
    //             setConnectedUserId(otherUserId);
    //             startAnimation();
    //         })
    //         .catch((error) => console.error("Error accepting request:", error));
    // };
    
    // //얘를 넣으면 수락 클릭시 컴포넌트가 둘다 잘 보이는데 거절 클리시 대화상자 안 뜸
    // useEffect(() => {
    //     if (!userId) return;

    //     const unsub = listenForMeetingRequests(userId, (request) => {
    //         // 만남 요청 받으면 수락/거절 대화상자 표시
    //         MeetingRequestDialogs.showRequestDecisionDialog(request.fromUserId, () => {
    //             acceptMeetingRequest(request.id, request.fromUserId);
    //         }, () => {
    //             // '거절' 버튼 클릭 시 로직
    //         });
    //     });
    
    //     return () => unsub && unsub();
    // }, [userId]);
    //----------------------------------------새로추가-----------------

    // 산책 시작 / 중지 버튼 동작 처리
    const handleStartStopWalk = () => {
        setIsWalking(!isWalking);
        if (!isWalking) {
            // 산책 시작 버튼 클릭 시
            const unsub = getAllUserLocations((users) => {
                // 여기서 users 배열의 각 객체가 userId를 포함하고 있는지 확인하고 다른 사용자의 위치를 업데이트
                setOtherUsersPositions(users);
            });
        } else {
            //산책 중지 버튼 클릭 시
            setOtherUsersPositions([]); // 다른 사용자 위치 초기화
            setMeetingActive(false); // 만남 활성화 상태를 false로 설정
            // setConnectedUserId(null); // 연결된 사용자 ID 초기화//얘로 인해 오류남
            // 토스트 메시지 표시
            // Toast.show({ 
            //   type: 'success',
            //   position: 'bottom',
            //   text1: '동반 산책이 종료되었습니다.'
            // });
        }
    };

    // 다른 사용자의 마커 클릭 시 호출되는 함수
    // userPos.name이 undefined일 경우, 대화 상자에 'undefined'가 표시됨
    // userPos 객체에 name 속성이 있는지, 그리고 이 속성이 제대로 설정되어 있는지 확인함
    const onMarkerPress = async (userPos) => {
        MeetingRequestDialogs.showMeetingRequestDialog(userPos.name, async () => {
            await sendMeetingRequest(userId, userPos.userId);
        });
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
                {/* 만남 상태 컴포넌트 표시 */}
                {meetingActive && <MeetingStatusComponent userId={userId} connectedUserId={connectedUserId} animationValue={animationValue} />}
                {/* 산책 시작/중지 버튼 */}
                <StartWalkBtn onPress={handleStartStopWalk} title={isWalking ? '산책 중지' : '산책 시작'} />
            </View>
        </View>
    );
};

// // Toast 컴포넌트는 MeetingWalk 컴포넌트의 가장 바깥쪽에 위치해야 함
// <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />

const screen = Dimensions.get('window');
const mapSize = screen.width;

export default MeetingWalk;

// 현재 진행상황
// 거절/수락 대화 상자 잘 뜸
// 수락 시 만남요청 보낸 사용자에게 만남 중 컴포넌트 뜸
// 산책 중지 클릭 시 컴포넌트 없앰

// 문제
// 만남 요청 받은 사용자에게 만남 중 컴포넌트 안 뜸
// 산책 중지 클릭 시 두 사용자의 컴포넌트 모두 없애야함
// 토스 메시지 안 뜸
