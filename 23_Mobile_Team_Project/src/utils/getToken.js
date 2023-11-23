import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  // 프로젝트 ID 전달
  const token = (await Notifications.getExpoPushTokenAsync({
    experienceId: '2351bdc8-90af-4e0e-85b8-bef458a8334f',
  })).data;
  console.log(token);
  // 이 토큰을 데이터베이스에 저장
}
