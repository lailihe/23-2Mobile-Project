// 녹음 파일 목록 항목을 표시하는 컴포넌트
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import styles from './RecoListItemStyles'; // 해당 스타일을 정의해야 합니다.
import Icon from 'react-native-vector-icons/Ionicons';

const RecoListItem = ({ recording, onPress, onDelete }) => {
    // Firestore에서 받아온 Timestamp를 JavaScript의 Date 객체로 변환
    const date = new Date(recording.createdAt.seconds * 1000);

    // 날짜 및 시간 형식 지정(한국어 형식, 아시아/서울 시간대)
    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Seoul'
    }).format(date);

    // 각 녹음 파일에 대한 정보와 삭제 아이콘을 포함하는 목록 항목 렌더링
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
