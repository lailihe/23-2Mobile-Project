import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import StartWalkBtn from '../components/Btn/StartWalkBtn';
import MeetingRequestDialogs from '../components/Dialog/MeetingRequestDialog';

const MeetingWalk = () => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isWalking, setIsWalking] = useState(false);

    useEffect(() => {
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
        })();
    }, []);

    const handleStartStopWalk = () => {
        setIsWalking(!isWalking);
    };

    // 버튼 핸들러 함수 (현재는 빈 기능)
    const handleRequestMeet = () => {
        MeetingRequestDialogs.showMeetingRequestDialog("***");
    };
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
                    <MapView
                        style={styles.map}
                        initialRegion={currentPosition}
                    >
                        <Marker coordinate={currentPosition} />
                    </MapView>
                ) : (
                    <Text>{errorMsg ? errorMsg : '위치 정보를 불러오는 중...'}</Text>
                )}
                <StartWalkBtn onPress={handleStartStopWalk} title={isWalking ? '산책 중지' : '산책 시작'} />
                <View style={styles.meetButtonContainer}>
                    <Button title="만남요청 대화상자" onPress={handleRequestMeet} />
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
