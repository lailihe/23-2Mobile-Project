// RecoList.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './RecoListStyles';
import RecoListItem from '../components//RecoListItem';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Progress from 'react-native-progress';
import db from '../firebase/firebaseConfig';
import Toast from 'react-native-toast-message';

export default function RecoList() {
    const [recordings, setRecordings] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [playbackInstance, setPlaybackInstance] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecording, setSelectedRecording] = useState(null);
    const [progress, setProgress] = useState(0);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedIdForDelete, setSelectedIdForDelete] = useState(null);
    const [playbackTime, setPlaybackTime] = useState('00:00'); // 초기 재생 시간 상태

    const fetchRecordingsFromFirestore = async () => {
      setRefreshing(true);
      try {
        const userUUID = await AsyncStorage.getItem('userUUID');
        if (!userUUID) {
          console.log('유저 ID가 AsyncStorage에 존재하지 않습니다.');
          setRefreshing(false);
          return;
        }

        const db = getFirestore();
        const recordingsQuery = query(collection(db, 'recordings'), where('userId', '==', userUUID));
        const querySnapshot = await getDocs(recordingsQuery);
        const fetchedRecordings = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date();
          return {
            id: doc.id,
            createdAt: createdAt, // Date 객체를 저장합니다.
            ...data
          };
        });
        
      
        setRecordings(fetchedRecordings);
        console.log("성공");
      } catch (error) {
        console.error('Firestore에서 녹음 파일 목록 가져오기 중 오류 발생:', error);
      } finally {
        setRefreshing(false);
      }
    };

    const playAudio = async (url) => {
      try {
        console.log('재생 시작');
        console.log(`재생할 파일 URL: ${url}`);
    
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
        setPlaybackInstance(sound);
        setIsPlaying(true);
    
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            stopAudio();
          }
        });
        sound.setOnPlaybackStatusUpdate(updateProgress);
      } catch (error) {
        console.error('재생 실패:', error);
        console.log(`재생 실패한 파일 URL: ${url}`);
      }
    };
    
    

    const stopAudio = async () => {
      console.log('재생 중지');
      if (playbackInstance) {
        await playbackInstance.stopAsync();
        await playbackInstance.unloadAsync();
        setPlaybackInstance(null);
        setIsPlaying(false);
      }
    };

    const onItemPress = (recording) => {
      setSelectedRecording(recording);
      setModalVisible(true);
    };

    useEffect(() => {
      fetchRecordingsFromFirestore();
    }, []);

    const onRefresh = () => {
      fetchRecordingsFromFirestore();
    };

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
        setProgress(status.positionMillis / status.durationMillis);
        // 재생 시간을 업데이트합니다. 아래 형식은 mm:ss 형태로 변환하는 한 예입니다.
        const minutes = Math.floor(status.positionMillis / 60000);
        const seconds = ((status.positionMillis % 60000) / 1000).toFixed(0);
        setPlaybackTime(
          `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        );
      }
    };    
    
    const showDeleteConfirmation = (id) => {
      setSelectedIdForDelete(id);
      setDeleteModalVisible(true);
    };

    const deleteRecording = async (id) => {
      try {
        await deleteDoc(doc(db, "recordings", id));
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
          {recordings.map((recording) => (
            <RecoListItem
              key={recording.id}
              recording={recording}
              onPress={onItemPress}
              onDelete={showDeleteConfirmation}
            />
          ))}
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

              <Progress.Bar 
                progress={progress} 
                width={200} 
                style={styles.progressBar} 
              />
              <Text style={styles.playbackTime}>{playbackTime}</Text>

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