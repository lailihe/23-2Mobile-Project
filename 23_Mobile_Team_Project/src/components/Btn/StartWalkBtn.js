import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const StartWalkBtn = ({ onPress, title }) => {
    const textStyle = title === '산책 중지'
        ? [styles.buttonText, styles.stopButtonText]
        : styles.buttonText;

    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onPress} style={styles.button}>
                <Text style={textStyle}>{title}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        padding: 10,
    },
    button: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#007AFF', // 부드러운 블루색
        fontSize: 18, 
    },
    stopButtonText: {
        color: 'red', // 산책 중지 버튼의 텍스트 색상을 빨간색으로 변경
    },
});

export default StartWalkBtn;
