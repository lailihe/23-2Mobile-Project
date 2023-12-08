import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import db from '../firebase/firebaseConfig'; // Firestore 인스턴스 임포트
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecoName from '../components/Dialog/RecoName';
import RecoList from './RecoList';
import styles from './RecordingWalkStyles';
import Icon from 'react-native-vector-icons/Ionicons';
//import { getFirestore, doc, setDoc } from 'firebase/firestore';

export default function RecordingWalk() {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [showRecoName, setShowRecoName] = useState(false);
    const [userUUID, setUserUUID] = useState(null);
    const [recordTime, setRecordTime] = useState('00:00:00');
    const [recordTimer, setRecordTimer] = useState(null);

    useEffect(() => {
        // AsyncStorage에서 uniqueId 가져오기
        const fetchUserUUID = async () => {
            const id = await AsyncStorage.getItem("userUUID");
            setUserUUID(id);
        };

        fetchUserUUID();
    }, []);

    async function startRecording() {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(
               Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);

             // 타이머 초기화
            let seconds = 0;
            setRecordTimer(setInterval(() => {
            seconds++;
            setRecordTime(new Date(seconds * 1000).toISOString().substr(11, 8));
            }, 1000));
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    // 녹음 중지 및 RecoName 대화상자 표시
    async function stopRecording() {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log(`녹음된 파일 URI: ${uri}`); // 파일 URI 출력
        setShowRecoName(true);
        if (recordTimer) {
            clearInterval(recordTimer);
            setRecordTimer(null);
          }
          setRecordTime('00:00:00');
    }      

    // "저장" 클릭 이벤트 처리
    const handleSaveRecording = async (fileName) => {
        const uri = recording.getURI();
        await uploadAudioToFirebase(uri, fileName); // 파일 이름으로 업로드
        setShowRecoName(false); // 대화상자 닫기
        setRecording(null); // 녹음 상태 초기화
        Toast.show({
            type: 'success',
            position: 'bottom',
            text1: '대리 산책 녹음 저장',
        });
    };

    // "취소" 클릭 이벤트 처리
    const handleCancelRecording = () => {
        setShowRecoName(false); // 대화상자 닫기
        setRecording(null); // 녹음 상태 초기화
        Toast.show({
            type: 'success',
            position: 'bottom',
            text1: '녹음 저장 취소',
        });
    };



    async function uploadAudioToFirebase(uri, fileName) {
        const userUUID = await AsyncStorage.getItem("userUUID");
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const storageRef = ref(storage, `Recordings/${userUUID}/${fileName}`);
    
        Toast.show({
            type: 'info',
            position: 'bottom',
            text1: '녹음 파일 저장 중..',
        });
    
        const uploadTask = uploadBytesResumable(storageRef, blob);
    
        uploadTask.on('state_changed', 
            (snapshot) => {
                // 업로드 상태가 변경될 때마다 호출됩니다.
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                // ...
            },  
            (error) => {
                console.error('Audio upload error: ', error);
                Toast.show({
                    type: 'error',
                    position: 'bottom',
                    text1: '녹음 파일 저장 오류',
                });
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('File available at', downloadURL);
    
                    // Firestore에 파일 메타데이터 기록
                    const db = getFirestore();
                    await addDoc(collection(db, "recordings"), {
                        userId: userUUID,
                        fileName: fileName,
                        url: downloadURL,
                        createdAt: new Date()
                    });
    
                    Toast.show({
                        type: 'success',
                        position: 'bottom',
                        text1: '녹음 파일 저장 완료',
                    });
    
                } catch (error) {
                    console.error('Error saving recording metadata to Firestore:', error);
                    Toast.show({
                        type: 'error',
                        position: 'bottom',
                        text1: '녹음 메타데이터 저장 오류',
                    });
                }
            }
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>나의 대리 산책 기록</Text>
            <RecoList />
            <View style={styles.buttonContainer}>
                {!isRecording ? (
                    <TouchableOpacity style={styles.button} onPress={startRecording}>
                    <Icon name="mic-outline" size={30} color="#4CD964" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={stopRecording}>
                    <Icon name="square-outline" size={30} color="#FF3B30" />
                    </TouchableOpacity>
                )}
            </View>
            {isRecording && (
                <Text style={styles.recordingTimer}>{recordTime}</Text>
            )}
            <RecoName
                visible={showRecoName}
                onSave={handleSaveRecording}
                onClose={handleCancelRecording}
            />
            <Toast />
        </View>
    );
}