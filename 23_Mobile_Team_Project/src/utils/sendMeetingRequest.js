//Firestore에 저장된 만남 요청을 감지하고, 대상 사용자의 Expo Push Token을 사용하여 알림을 보냄
const functions = require('firebase-functions');
const fetch = require('node-fetch');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendMeetingRequest = functions.firestore
    .document('meetingRequests/{userId}')
    .onCreate(async (snapshot, context) => {
        // Firestore 문서에서 데이터를 가져옵니다
        const requestData = snapshot.data();
        const expoPushToken = requestData.targetUserToken;

        // Expo Push API를 사용하여 알림을 보냅니다
        const message = {
            to: expoPushToken,
            title: '만남 요청',
            body: '새로운 만남 요청이 있습니다.',
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    });