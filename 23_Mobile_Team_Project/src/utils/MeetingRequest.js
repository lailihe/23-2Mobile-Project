import MeetingRequestDialogs from '../components/Dialog/MeetingRequestDialog';

const showMeetingRequest = (userId) => {
  MeetingRequestDialogs.showMeetingRequestDialog(`사용자 ${userId}`);
};

export { showMeetingRequest };
