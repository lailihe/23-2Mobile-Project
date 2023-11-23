import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import StartWalkBtn from '../components/Btn/StartWalkBtn';
import MeetingRequestDialogs from '../components/Dialog/MeetingRequestDialog';
import { saveUserLocation } from '../firebase/SaveLocation';
import { getAllUserLocations } from '../utils/UserLocationsManager';
import { showMeetingRequest } from '../utils/MeetingRequest';
//----------------------------------------------------
// import * as Notifications from 'expo-notifications';
// import { registerForPushNotificationsAsync } from '../utils/getToken';

const MeetingWalk = () => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [otherUsersPositions, setOtherUsersPositions] = useState([]);
    const [isWalking, setIsWalking] = useState(false);

    useEffect(() => {
        //------------------------------------------------------------
        // Expo Push Notifications 권한 요청 및 토큰 등록
        //registerForPushNotificationsAsync();
        // Expo Push Notifications 수신 리스너 설정
        // const subscription = Notifications.addNotificationReceivedListener(notification => {
        //     // 여기서 notification.data는 푸시 알림과 함께 전송된 데이터입니다.
        //     // 만남 요청 알림인 경우에만 대화상자를 띄웁니다.
        //     if (notification.data.type === 'meetingRequest') {
        //       MeetingRequestDialogs.showRequestDecisionDialog();
        //     }
        // });
        //------------------------------------------------------------

        // 위치 권한 요청 및 현재 위치 가져오기
        (async () => {
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
    
            // Firestore에 위치 저장
            saveUserLocation(location.coords.latitude, location.coords.longitude);
            // 컴포넌트가 언마운트될 때 리스너를 제거합니다.
            return () => subscription.remove();
        })();
    }, []);

    
    const handleStartStopWalk = () => {
        setIsWalking(!isWalking);
        if (!isWalking) {
            // 산책 시작: 다른 사용자들의 위치 가져오기
            const unsub = getAllUserLocations(setOtherUsersPositions);
            // 필요한 경우 unsub 함수를 사용하여 리스너 해제
        } else {
            // 산책 중지: 다른 사용자들의 위치 정보 제거
            setOtherUsersPositions([]);
        }
    };

    // 다른 사용자의 마커를 클릭했을 때 호출되는 함수
    const onMarkerPress = (userId) => {
        showMeetingRequest(userId);
    };
    
    // 버튼 핸들러 함수 (현재는 빈 기능)
    const handleAcceptReject = () => {
        MeetingRequestDialogs.showRequestDecisionDialog("***");
    };

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
                                onPress={() => onMarkerPress(userPos.userId)}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    titleContainer: {
        width: '90%',
        padding: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: screen.height / 50,
    },
    map: {
        width: mapSize,
        height: mapSize,
        marginBottom: 20,
    },
    meetButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        padding: 20,
    },
});

export default MeetingWalk;
