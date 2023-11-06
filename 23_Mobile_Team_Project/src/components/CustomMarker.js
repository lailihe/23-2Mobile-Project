// 이 컴포넌트는 coordinate라는 prop을 받아, 지도 위에 마커 표시
import React from 'react';
import { Marker } from 'react-native-maps';

const CustomMarker = ({ coordinate }) => {
    // Marker 컴포넌트 반환. coordinate 매개변수는 Marker 위치 결정
    return (
        <Marker coordinate={coordinate}>
            {/* 이 부분에서 마커 커스터마이즈.
                 예) 이미지 마커로 사용: <Image source={require('../path/to/image.png')} style={{width: 50, height: 50}} */}
        </Marker>
    );
};

export default CustomMarker;
