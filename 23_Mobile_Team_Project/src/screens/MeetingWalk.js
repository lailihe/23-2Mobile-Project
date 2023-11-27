// 산책 중 만남을 관리 역할
// 이 코드는 사용자의 위치를 표시하고, 다른 사용자와의 만남 요청 및 응답 관리

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import styles from './MeetingWalkStyles';
import StartWalkBtn from '../components/Btn/StartWalkBtn'; // 산책 시작 및 중지 버튼 컴포넌트
import MeetingRequestDialogs from '../components/Dialog/MeetingRequestDialog'; // 만남 요청 및 응답 대화상자 컴포넌트
import { saveUserLocation } from '../firebase/SaveLocation'; // 사용자 위치를 Firebase에 저장하는 함수
import { getAllUserLocations } from '../utils/UserLocationsManager'; // 모든 사용자의 위치를 가져오는 함수
import { showMeetingRequest } from '../utils/MeetingRequest'; // 만남 요청을 표시하는 유틸리티 함수
import { sendMeetingRequest, listenForMeetingRequests, handleMeetingRequestResponse, listenToMeetingRequestStatus } from '../firebase/firebaseServices'; // 만남 요청 및 응답을 처리하는 함수
import { getUsernameById } from '../utils/UserLocationsManager'; // 사용자 ID를 기반으로 사용자 이름을 가져오는 함수

const MeetingWalk = () => {
    const [currentPosition, setCurrentPosition] = useState(null); // 현재 사용자 위치
    const [errorMsg, setErrorMsg] = useState(null); // 위치 권한 오류 메시지
    const [otherUsersPositions, setOtherUsersPositions] = useState([]); // 다른 사용자의 위치 배열
    const [isWalking, setIsWalking] = useState(false); // 산책 중 여부
    const [userId, setUserId] = useState(null); // 사용자 ID 상태
    const [locationSaved, setLocationSaved] = useState(false); // 위치 저장 여부 상태 추가

    // 위치 정보 가져오기 및 저장
    useEffect(() => {
        (async () => {
            if (locationSaved) return; // 위치가 이미 저장되었다면 로직 실행 중지

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentPosition({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });

            // 사용자의 위치를 Firebase에 저장하고 새로운 사용자 ID를 받아옴
            const newUserId = await saveUserLocation(location.coords.latitude, location.coords.longitude);
            if (newUserId) {
                setUserId(newUserId);
                setLocationSaved(true); // 위치 저장 완료 표시
            }
        })();
    }, [locationSaved]); // 의존성 배열에 locationSaved 추가

    useEffect(() => {
        if (!userId) return;
    
        const unsub = listenForMeetingRequests(userId, (request) => {
            MeetingRequestDialogs.showRequestDecisionDialog(request.fromUserId, () => {
                // '수락' 버튼 클릭 시
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
    
        return () => unsub && unsub();
    }, [userId]);

    // 만남 요청 상태 변경을 리스닝하는 로직
    useEffect(() => {
        if (!userId) return;
    
        // 만남 요청 상태 변경 리스닝
        const unsubscribe = listenToMeetingRequestStatus(userId, (status, toUserId) => {
            if (status === 'accepted') {
                getUsernameById(toUserId).then((toUserName) => {
                    MeetingRequestDialogs.showMeetingAcceptedDialog(toUserName);
                });
            } else if (status === 'rejected') {
                getUsernameById(toUserId).then((toUserName) => {
                    MeetingRequestDialogs.showMeetingRejectedDialog(toUserName);
                });
            }
        });
    
        return () => unsubscribe();
    }, [userId]);

    // 산책 시작 또는 중지 처리
    const handleStartStopWalk = () => {
        setIsWalking(!isWalking);
        if (!isWalking) {
            const unsub = getAllUserLocations((users) => {
                // 여기서 users 배열의 각 객체가 userId를 포함하고 있는지 확인하고 다른 사용자의 위치를 업데이트
                setOtherUsersPositions(users);
            });
        } else {
            setOtherUsersPositions([]); // 산책 중지 시 다른 사용자 위치 초기화
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
    
    // 버튼 핸들러 함수 (현재는 빈 기능)
    const handleAcceptReject = () => {
        MeetingRequestDialogs.showRequestDecisionDialog("***");
    };

    // // 만남 요청 응답 대화상자 표시
    // const showResponseDialog = (request) => {
    //     MeetingRequestDialogs.showRequestDecisionDialog(request.fromUserId, () => {
    //         // '수락' 버튼 클릭 시
    //         handleMeetingRequestResponse(request.id, 'accepted')
    //             .then(() => console.log("Request accepted"))
    //             .catch((error) => console.error("Error accepting request:", error));
    //     }, () => {
    //         // '거절' 버튼 클릭 시
    //         handleMeetingRequestResponse(request.id, 'rejected')
    //             .then(() => console.log("Request rejected"))
    //             .catch((error) => console.error("Error rejecting request:", error));
    //     });
    // };


    return (
        <View style={styles.container}>
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
                <StartWalkBtn onPress={handleStartStopWalk} title={isWalking ? '산책 중지' : '산책 시작'} />
                <View style={styles.meetButtonContainer}>
                    <Button title="수락,거절 대화상자" onPress={handleAcceptReject} />
                </View>
            </View>
        </View>
    );
};

const screen = Dimensions.get('window');
const mapSize = screen.width;

export default MeetingWalk;
