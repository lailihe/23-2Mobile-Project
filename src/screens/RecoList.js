// 녹음 파일 목록 관리 및 재생 화면 구현 코드
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './RecoListStyles';
import RecoListItem from '../components//RecoListItem'; // 녹음 파일 목록 아이템 컴포넌트
import Icon from 'react-native-vector-icons/Ionicons';
import * as Progress from 'react-native-progress'; // 진행 상태 표시 바
import db from '../firebase/firebaseConfig';
import Toast from 'react-native-toast-message';

export default function RecoList() {
    const [recordings, setRecordings] = useState([]); // 녹음 파일 목록 상태
    const [refreshing, setRefreshing] = useState(false); // 새로고침 상태
    const [playbackInstance, setPlaybackInstance] = useState(null); // 오디오 재생 상태
    const [isPlaying, setIsPlaying] = useState(false); // 재생 여부
    const [modalVisible, setModalVisible] = useState(false); // 모달 창
    const [selectedRecording, setSelectedRecording] = useState(null); // 선택된 녹음 파일
    const [progress, setProgress] = useState(0); // 재생 진행률
    const [deleteModalVisible, setDeleteModalVisible] = useState(false); // 삭제 확인 모달
    const [selectedIdForDelete, setSelectedIdForDelete] = useState(null); // 삭제할 녹음 파일 ID
    const [playbackTime, setPlaybackTime] = useState('00:00'); // 초기 재생 시간 상태

    // firestore에서 녹음 파일 데이터 가져오는 함수
    const fetchRecordingsFromFirestore = async () => {
      setRefreshing(true);
      try {
        const userUUID = await AsyncStorage.getItem('userUUID');
        if (!userUUID) {
          console.log('유저 ID가 AsyncStorage에 존재하지 않습니다.');
          setRefreshing(false);
          return;
        }

        // firestore에서 사용자 녹음 파일 데이터 조회
        const db = getFirestore();
        const recordingsQuery = query(collection(db, 'recordings'), where('userId', '==', userUUID));
        const querySnapshot = await getDocs(recordingsQuery);
        const fetchedRecordings = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date();
          return {
            id: doc.id,
            createdAt: createdAt, // Date 객체 저장
            ...data
          };
        });
        
      
        setRecordings(fetchedRecordings); // 녹음 파일 목록 상태 업데이트
        console.log("성공");
      } catch (error) {
        console.error('Firestore에서 녹음 파일 목록 가져오기 중 오류 발생:', error);
      } finally {
        setRefreshing(false);
      }
    };

    // 오디오 파일 재생 함수
    const playAudio = async (url) => {
      try {
        console.log('재생 시작');
        console.log(`재생할 파일 URL: ${url}`);
    
        // 오디오 파일 재생을 위한 객체 생성
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
        setPlaybackInstance(sound); // 재생 객체 상태 업데이트
        setIsPlaying(true); // 재생 여부
    
        // 재생 상태 업데이트를 위한 이벤트 리스너
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            stopAudio(); // 재생 끝나면 오디오 정지
          }
        });
        sound.setOnPlaybackStatusUpdate(updateProgress); // 진행률 업데이트 함수 호출
      } catch (error) {
        console.error('재생 실패:', error);
        console.log(`재생 실패한 파일 URL: ${url}`);
      }
    };
    
    // 오디오 정지 함수
    const stopAudio = async () => {
      console.log('재생 중지');
      if (playbackInstance) {
        await playbackInstance.stopAsync();
        await playbackInstance.unloadAsync();
        setPlaybackInstance(null); // 재생 객체 초기화
        setIsPlaying(false);
      }
    };

    // 녹음 파일 아이템 선택 시 호출 함수
    const onItemPress = (recording) => {
      setSelectedRecording(recording); // 선택된 녹음 파일 상태 업데이트
      setModalVisible(true); // 모달 창 표시
    };

    // 컴포넌트 연결 시 firestore에서 녹음 파일 데이터 가져옴
    useEffect(() => {
      fetchRecordingsFromFirestore();
    }, []);

    // 새로고침 함수
    const onRefresh = () => {
      fetchRecordingsFromFirestore();
    };

    // firestore timestamp를 지역화된 문자열로
    const formatDate = (timestamp) => {
      if (!timestamp) return '';

      // Firestore Timestamp를 Date 객체로 변환
      const date = new Date(timestamp.seconds * 1000);
      // 날짜 형식 지정
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Seoul'
      }).format(date);
    };

    // 모달 밖 클릭 시 모달 닫기
    const closeModal = () => {
      setModalVisible(false);
      if (isPlaying) {
        stopAudio();
      }
    };

    // 오디오 재생 상태 업데이트 함수
    const updateProgress = (status) => {
      if (status.isPlaying && status.durationMillis > 0) {
        setProgress(status.positionMillis / status.durationMillis); // 진행률 상태 업데이트
        // 재생 시간을 업데이트. 아래 형식은 mm:ss 형태로 변환.
        const minutes = Math.floor(status.positionMillis / 60000); // 분 계산
        const seconds = ((status.positionMillis % 60000) / 1000).toFixed(0); // 초 계산
        setPlaybackTime(
          `${minutes}:${seconds < 10 ? '0' : ''}${seconds}` // 재생 시간 상태 업데이트
        );
      }
    };    
    
    // 녹음 파일 삭제 확인 모달
    const showDeleteConfirmation = (id) => {
      setSelectedIdForDelete(id);
      setDeleteModalVisible(true);
    };

    // 녹음 파일 삭제 함수
    const deleteRecording = async (id) => {
      try {
        await deleteDoc(doc(db, "recordings", id)); // 녹음 파일 삭제
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: '녹음 파일이 삭제되었습니다.',
        });
        // 삭제 후 리스트 업데이트
        fetchRecordingsFromFirestore();
      } catch (error) {
        console.error("Error removing recording: ", error);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: '녹음 파일 삭제에 실패하였습니다.',
        });
      }
      setDeleteModalVisible(false);
    };
    
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchRecordingsFromFirestore} />
          }
        >
          {/* 녹음 파일 목록 아이템을 반복하여 표시합니다. */}
          {recordings.map((recording) => (
            <RecoListItem
              key={recording.id}
              recording={recording}
              onPress={onItemPress}
              onDelete={showDeleteConfirmation}
            />
          ))}

          {/* 삭제 확인 모달 */}
          <Modal
            visible={deleteModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>정말로 이 녹음 파일을 삭제하시겠습니까?</Text>
                <View style={styles.modalButtons}>
                  <Button title="삭제" onPress={() => deleteRecording(selectedIdForDelete)} />
                  <Button title="취소" onPress={() => setDeleteModalVisible(false)} />
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>

        {/* 오디오 재생 모달 */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={closeModal}
          >
            <View style={styles.modalContent}>
              <Text style={styles.audioTitle}>{selectedRecording?.fileName}</Text>
              <Text style={styles.audioDate}>{formatDate(selectedRecording?.createdAt)}</Text>

              {/* 진행 상태 표시 바 */}
              <Progress.Bar 
                progress={progress} 
                width={200} 
                style={styles.progressBar} 
              />
              <Text style={styles.playbackTime}>{playbackTime}</Text>

            {/* 재생 컨트롤 버튼 */}
            <View style={styles.controlContainer}>
              {isPlaying ? (
                <TouchableOpacity style={styles.controlButton} onPress={stopAudio}>
                  <Icon name="pause-circle" style={styles.controlIcon} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.controlButton} onPress={() => playAudio(selectedRecording?.url)}>
                  <Icon name="play-circle" style={styles.controlIcon} />
                </TouchableOpacity>
              )}
            </View>
            </View>
          </TouchableOpacity>
        </Modal>
        <Toast />
      </View>
    );
};