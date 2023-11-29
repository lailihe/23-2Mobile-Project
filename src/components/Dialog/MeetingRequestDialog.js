// 만남 요청, 만남 요청옴, 수락, 거절 대화상자
import { Alert } from 'react-native';

const MeetingRequestDialogs = {
    showMeetingRequestDialog: (name, onAccept) => {
        Alert.alert(
            "만남 요청",
            `${name}님에게 만남을 요청하시겠습니까?`,
            [
                {
                    text: "Cancel", 
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: "OK", onPress: onAccept }
            ],
            { cancelable: false }
        );
    },

    showRequestDecisionDialog: (name, onAccept, onReject) => {
        Alert.alert(
            "만남 요청",
            `${name}님이 만남을 요청하였습니다.`,
            [
                {
                    text: "거절", 
                    onPress: onReject,
                    style: "cancel"
                },
                { text: "수락", onPress: onAccept }
            ],
            { cancelable: false }
        );
    },

    showMeetingRejectedDialog: (name) => {
        Alert.alert(
            "만남 거절",
            `${name}님이 만남을 거절하였습니다.`,
            [{ text: "확인", onPress: () => console.log("Meeting Rejection Confirmed") }],
            { cancelable: false }
        );
    },

    showMeetingAcceptedDialog: (name) => {
        Alert.alert(
            "만남 수락",
            `${name}님이 만남을 수락하였습니다.`,
            [{ text: "확인", onPress: () => console.log("Meeting Acceptance Confirmed") }],
            { cancelable: false }
        )
    },
};

export default MeetingRequestDialogs;
