// MeetingContext.js
import React, { createContext, useState, useContext } from 'react';

const MeetingContext = createContext();

export const useMeeting = () => useContext(MeetingContext);

export const MeetingProvider = ({ children }) => {
    const [meetingId, setMeetingId] = useState(null);

    // 객체로 반환
    return (
        <MeetingContext.Provider value={{ meetingId, setMeetingId }}>
            {children}
        </MeetingContext.Provider>
    );
};