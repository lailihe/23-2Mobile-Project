import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';

let locationSubscription = null;

export const startLocationTracking = async (onLocationUpdate) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Toast.show({
            type: 'error',
            position: 'bottom',
            text1: '위치 추적 권한이 필요합니다',
        });
        return;
    }

    locationSubscription = await Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // 10미터마다 업데이트
        },
        onLocationUpdate
    );

    Toast.show({
        type: 'info',
        position: 'bottom',
        text1: '위치 추적 시작됨',
    });
};


export const stopLocationTracking = () => {
    if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;

        Toast.show({
            type: 'info',
            position: 'bottom',
            text1: '위치 추적 중지됨',
        });

        console.log("위치 추적 중지됨");
    } else {
        console.log("위치 추적 중지 실패: locationSubscription이 정의되지 않았거나 remove 메서드가 없습니다.");
    }
};

