// 만남 요청, 만남 요청옴, 수락, 거절 대화상자
import { Alert } from 'react-native';

const MeetingRequestDialogs = {
    // 만남 요청 대화상자
    showMeetingRequestDialog: (name, profileInfo, onAccept) => {
        // 프로필 정보 표시
        const profileDetails = profileInfo ? `이름: ${profileInfo.name}\n견종: ${profileInfo.type}\n성별: ${profileInfo.gender}\n성격: ${profileInfo.characteristics}\n중성화 여부: ${profileInfo.spayedOrNeutered ? 'Yes' : 'No'}` : "";

        Alert.alert(
            "만남 요청",
            `${name}님에게 만남을 요청하시겠습니까?\n\n${profileDetails}`,
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

    // 만남 요청 수락/거절 대화상자
    showRequestDecisionDialog: (name, profileInfo, onAccept, onReject) => {
        const profileDetails = profileInfo ? 
            `이름: ${profileInfo.name}\n견종: ${profileInfo.type}\n성별: ${profileInfo.gender}\n성격: ${profileInfo.characteristics}\n중성화 여부: ${profileInfo.spayedOrNeutered ? 'Yes' : 'No'}` 
            : "";

        Alert.alert(
            "만남 요청",
            `${name}님이 만남을 요청하였습니다.\n\n${profileDetails}`,
            [
                { text: "수락", onPress: onAccept }, // 수락 버튼-onAccept 콜백 실행
                { text: "거절", onPress: onReject, style: "cancel" } // 거절 버튼, onReject 콜백 실행
            ],
            { cancelable: false }
        );
    },

    // 만남 거절 알림 대화상자
    showMeetingRejectedDialog: (name) => {
        Alert.alert(
            "만남 거절",
            `${name}님이 만남을 거절하였습니다.`,
            [{ text: "확인", onPress: () => console.log("Meeting Rejection Confirmed") }],
            { cancelable: false }
        );
    },

    // 만남 수락 알림 대화상자
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
