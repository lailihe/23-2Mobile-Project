// RecoListItem.js
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import styles from './RecoListItemStyles'; // 해당 스타일을 정의해야 합니다.
import Icon from 'react-native-vector-icons/Ionicons';

const RecoListItem = ({ recording, onPress, onDelete }) => {
    // Firestore Timestamp를 Date 객체로 변환
    const date = new Date(recording.createdAt.seconds * 1000);
    // 날짜 형식 지정
    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Seoul'
    }).format(date);

    return (
      <View style={styles.listItem}>
        <TouchableOpacity style={styles.item} onPress={() => onPress(recording)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.title}>{recording.fileName}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
            <TouchableOpacity onPress={() => onDelete(recording.id)} style={styles.deleteIcon}>
              <Icon name="trash" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
  );
};


export default RecoListItem;
