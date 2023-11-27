import React, { createContext, useState } from 'react';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({
    name: "",
    type: "",
    gender: "",
    image: null,
    spayedOrNeutered: "no",
    vaccinated: "no",
    characteristics: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    date: new Date(),
  });

  return (
    <ProfileContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};
