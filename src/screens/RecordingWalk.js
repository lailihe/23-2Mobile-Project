// (녹음 기능 메인 Screen)녹음 기능 구현 코드
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecoName from '../components/Dialog/RecoName';
import RecoList from './RecoList';
import styles from './RecordingWalkStyles';
import Icon from 'react-native-vector-icons/Ionicons';

export default function RecordingWalk() {
    const [recording, setRecording] = useState(null); // 녹음 객체 상태
    const [isRecording, setIsRecording] = useState(false); // 녹음 중 여부
    const [showRecoName, setShowRecoName] = useState(false); // 녹음 이름 지정 모달
    const [userUUID, setUserUUID] = useState(null); // 사용자 고유 ID
    const [recordTime, setRecordTime] = useState('00:00:00'); // 녹음 시간
    const [recordTimer, setRecordTimer] = useState(null); // 녹음 시간 타이머

    useEffect(() => {
        // AsyncStorage에서 uniqueId 가져오기
        const fetchUserUUID = async () => {
            const id = await AsyncStorage.getItem("userUUID");
            setUserUUID(id);
        };

        fetchUserUUID();
    }, []);

    // 녹음 시작 함수
    async function startRecording() {
        try {
            await Audio.requestPermissionsAsync(); // 녹음 권한 요청
            await Audio.setAudioModeAsync({ // 오디오 모드 설정
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(
               Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY // 고품질 녹음 옵션 설정
            );
            setRecording(recording); // 녹음 객체 상태 업데이트
            setIsRecording(true); // 녹음 중 상태 설정

            // 녹음 시간 계산을 위한 타이머 설정
            let seconds = 0;
            setRecordTimer(setInterval(() => {
            seconds++;
            setRecordTime(new Date(seconds * 1000).toISOString().substr(11, 8)); // 녹음 시간 업데이트
            }, 1000));
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    // 녹음 중지 및 RecoName(이름 지정 모달) 표시
    async function stopRecording() {
        setIsRecording(false);
        await recording.stopAndUnloadAsync(); // 녹음 중지 및 언로드
        const uri = recording.getURI(); // 녹음 파일 URI 가져오기
        console.log(`녹음된 파일 URI: ${uri}`); // 파일 URI 출력
        setShowRecoName(true); // 녹음 이름 지정 모달 표시
        if (recordTimer) {
            clearInterval(recordTimer); // 타이머 해제
            setRecordTimer(null);
          }
          setRecordTime('00:00:00'); // 녹음 시간 초기화
    }      

    // 녹음 저장 처리
    const handleSaveRecording = async (fileName) => {
        const uri = recording.getURI();
        await uploadAudioToFirebase(uri, fileName); // 파일 이름으로 오디오 업로드
        setShowRecoName(false); // 모달 닫기
        setRecording(null); // 녹음 상태 초기화
        Toast.show({
            type: 'success',
            position: 'bottom',
            text1: '대리 산책 녹음 저장',
        });
    };

    // 녹음 취소 처리
    const handleCancelRecording = () => {
        setShowRecoName(false); // 대화상자 닫기
        setRecording(null); // 녹음 상태 초기화
        Toast.show({
            type: 'success',
            position: 'bottom',
            text1: '녹음 저장 취소',
        });
    };

    //오디오 업로드 함수
    async function uploadAudioToFirebase(uri, fileName) {
        const userUUID = await AsyncStorage.getItem("userUUID");
        const response = await fetch(uri); // uri에서 오디오 데이터 가져오기
        const blob = await response.blob(); // blob 형태로 변환
        const storage = getStorage(); // firebase storage 객체 가져오기
        const storageRef = ref(storage, `Recordings/${userUUID}/${fileName}`); // 저장할 경로 설정
    
        Toast.show({
            type: 'info',
            position: 'bottom',
            text1: '녹음 파일 저장 중..',
        });
    
        const uploadTask = uploadBytesResumable(storageRef, blob); // 업로드 작업 생성
    
        // 업로드 상태 변경 리스너
        uploadTask.on('state_changed', 
            (snapshot) => {
                // 업로드 상태가 변경될 때마다 호출
                // 업로드 진행률 계산 및 로그 출력
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
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
                // 업로드 완료 처리
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('File available at', downloadURL);
    
                    // Firestore에 파일 메타데이터 기록
                    // 메타데이터: 다른 데이터를 설명하는 데이터
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