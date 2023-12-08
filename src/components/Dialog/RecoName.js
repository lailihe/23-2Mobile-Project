// RecoName.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal } from 'react-native';
import styles from './RecoNameStyles'; // 스타일 가져오기

export default function RecoName({ visible, onClose, onSave }) {
    const [fileName, setFileName] = useState('');

    const handleSave = () => {
        onSave(fileName);
        setFileName('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TextInput
                        style={styles.input}
                        placeholder="파일 이름 입력"
                        value={fileName}
                        onChangeText={setFileName}
                        autoFocus
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>저장</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>취소</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
