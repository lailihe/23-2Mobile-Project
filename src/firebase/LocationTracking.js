// 위치 추적 기능 시작 중지 함수 구현
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';

let locationSubscription = null; // 위치 업데이트를 추적하는 변수
// 구독 객체: 

// 위치 추적 시작 함수
export const startLocationTracking = async (onLocationUpdate) => {
    // 사용자로부터 위치 추적 권한 요청
    let { status } = await Location.requestForegroundPermissionsAsync();
    // 권한 허용 X
    if (status !== 'granted') {
        Toast.show({
            type: 'error',
            position: 'bottom',
            text1: '위치 추적 권한이 필요합니다',
        });
        return;
    }

    // 위치 정보가 업데이트될 때마다 호출되는 함수
    locationSubscription = await Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.High, // 높은 정확도로 위치 추적
            distanceInterval: 10, // 위치가 10미터 변경될 때마다 업데이트
        },
        onLocationUpdate // 위치 업데이트될 때 호출될 콜백 함수->MeetingWalk.handleStartStopWalk에서 실행됨
    );

    Toast.show({
        type: 'info',
        position: 'bottom',
        text1: '위치 추적 시작됨',
    });
};

// 위치 추적 중지 함수
export const stopLocationTracking = () => {
    // locationSubscription이 존재하면 = 위치 추적이 활성화되어 있다면
    if (locationSubscription) {
        locationSubscription.remove(); // 위치 추적 취소
        locationSubscription = null; // 변수 초기화

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

