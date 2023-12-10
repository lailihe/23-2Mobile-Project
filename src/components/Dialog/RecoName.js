// 녹음기능파트 - 모달로 파일 이름 입력과 저장 기능 구현 코드
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal } from 'react-native';
import styles from './RecoNameStyles'; // 스타일 가져오기

export default function RecoName({ visible, onClose, onSave }) {
    const [fileName, setFileName] = useState(''); // 파일 이름 저장할 state 선언

    // 저장 버튼 클릭 시 실행 함수
    const handleSave = () => {
        onSave(fileName); // onSave 콜백 함수에 fielName 전달
        setFileName(''); // 파일 이름 초기화
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TextInput
                        style={styles.input}
                        placeholder="파일 이름 입력"
                        value={fileName}
                        onChangeText={setFileName} // 텍스트 변경될 때마다 fielName 업데이트
                        autoFocus
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave} // 저장 버튼 클릭 시 hanleSave 실행
                        >
                            <Text style={styles.buttonText}>저장</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose} // 취소 버튼 클릭 시
                        >
                            <Text style={styles.buttonText}>취소</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
