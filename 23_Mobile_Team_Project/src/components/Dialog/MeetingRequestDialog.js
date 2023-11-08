import { Alert } from 'react-native';

const MeetingRequestDialogs = {
    showMeetingRequestDialog: (name) => {
        Alert.alert(
            "만남 요청",
            `${name}님에게 만남을 요청하시겠습니까?`,
            [
                {
                    text: "Cancel", 
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: "OK", onPress: () => console.log("OK Pressed") }
            ],
            { cancelable: false }
        );
    },

    showRequestDecisionDialog: (name) => {
        Alert.alert(
            "만남 요청",
            `${name}님이 만남을 요청하였습니다.`,
            [
                {
                    text: "거절", 
                    onPress: () => console.log("거절 Pressed"),
                    style: "cancel"
                },
                { text: "수락", onPress: () => console.log("수락 Pressed") }
            ],
            { cancelable: false }
        );
    }
};

export default MeetingRequestDialogs;
