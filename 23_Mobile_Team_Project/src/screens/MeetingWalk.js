// 사용자의 현재 위치를 지도에 표시하는 메인 화면
// useState와 useEffect를 사용하여 사용자의 위치를 상태로 관리하고, 위치가 변경될 때마다 지도를 업데이트
//위치 서비스를 사용하여 사용자의 현재 위치를 받아오고, 이를 지도에 표시하는 기능 수행
//사용자의 위치에 대한 권한 요청, 현재 위치의 좌표 가져오기, 해당 위치에 마커 표시 과정 포함
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView from 'react-native-maps'; // 지도를 표시하기 위한 컴포넌트
import CustomMarker from '../components/CustomMarker'; // 사용자 정의 마커 컴포넌트
import * as Location from 'expo-location'; // Expo 위치 서비스 API

const MeetingWalk = () => {
    // 사용자의 현재 위치 상태 관리
    const [currentPosition, setCurrentPosition] = useState(null);

    // 컴포넌트가 마운트될 때 위치 정보를 가져오는 useEffect 훅 사용
    useEffect(() => {
        // 사용자 위치 접근 권한을 요청하고 위치 정보 가져오는 함수
        const requestLocationPermission = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            // 현재 위치 정보를 가져와서 상태 업데이트
            let location = await Location.getCurrentPositionAsync({});
            setCurrentPosition({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922, // 지도의 위도 범위
                longitudeDelta: 0.0421, // 지도의 경도 범위
            });
        };

        // 위치 권한 요청 및 위치 정보 업데이트 함수 실행
        requestLocationPermission();
    }, []);

    // UI 렌더링
    return (
        <View style={styles.container}>
            {currentPosition && (
                // 현재 위치가 있을 경우 MapView를 렌더링, 사용자 정의 마커 표시
                <MapView
                    style={styles.map}
                    initialRegion={currentPosition}
                >
                    <CustomMarker coordinate={currentPosition} />
                </MapView>
            )}
        </View>
    );
};

// 스타일 정의
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});

export default MeetingWalk;
