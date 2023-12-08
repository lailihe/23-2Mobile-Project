import React, { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, Link } from "expo-router";
import { useColorScheme, Pressable } from "react-native";
import Colors from "../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [currentUserUUID, setCurrentUserUUID] = useState(null);

  useEffect(() => {
    // AsyncStorage에서 현재 로그인한 사용자의 UUID를 가져옵니다.
    const fetchCurrentUserUUID = async () => {
      const savedUUID = await AsyncStorage.getItem("userUUID");
      setCurrentUserUUID(savedUUID);
    };

    fetchCurrentUserUUID();
  }, []);
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "My Modal Title", // 여기에 원하는 모달 제목을 입력하세요
          }}
        />

        <Stack.Screen
          name="ProfileEdit"
          options={{
            title: "정보 수정",
            headerStyle: {
              backgroundColor: "#4fc3f7", // 헤더의 배경색
            },
            headerTitleStyle: {
              fontSize: 20, // 헤더 타이틀의 폰트 크기
              fontWeight: "bold", // 헤더 타이틀의 폰트 두께
              color: "white", // 헤더 타이틀의 색상
            },
          }}
        />

        <Stack.Screen
          name="Search"
          options={{
            title: "반려견 종",
            headerStyle: {
              backgroundColor: "#4fc3f7", // 헤더의 배경색
            },
            headerTitleStyle: {
              fontSize: 20, // 헤더 타이틀의 폰트 크기
              fontWeight: "bold", // 헤더 타이틀의 폰트 두께
              color: "white", // 헤더 타이틀의 색상
            },
          }}
        />

        <Stack.Screen
          name="Search2"
          options={{
            title: "반려견 종",
            headerStyle: {
              backgroundColor: "#4fc3f7", // 헤더의 배경색
            },
            headerTitleStyle: {
              fontSize: 20, // 헤더 타이틀의 폰트 크기
              fontWeight: "bold", // 헤더 타이틀의 폰트 두께
              color: "white", // 헤더 타이틀의 색상
            },
          }}
        />

        <Stack.Screen
          name="Search3"
          options={{
            title: "반려견 종",
            headerStyle: {
              backgroundColor: "#4fc3f7", // 헤더의 배경색
            },
            headerTitleStyle: {
              fontSize: 20, // 헤더 타이틀의 폰트 크기
              fontWeight: "bold", // 헤더 타이틀의 폰트 두께
              color: "white", // 헤더 타이틀의 색상
            },
          }}
        />

        <Stack.Screen
          name="Search4"
          options={{
            title: "반려견 종",
            headerStyle: {
              backgroundColor: "#4fc3f7", // 헤더의 배경색
            },
            headerTitleStyle: {
              fontSize: 20, // 헤더 타이틀의 폰트 크기
              fontWeight: "bold", // 헤더 타이틀의 폰트 두께
              color: "white", // 헤더 타이틀의 색상
            },
          }}
        />

        <Stack.Screen
          name="momdadEdit"
          options={{
            title: "부모정보 수정",
            headerStyle: {
              backgroundColor: "#4fc3f7", // 헤더의 배경색
            },
            headerTitleStyle: {
              fontSize: 20, // 헤더 타이틀의 폰트 크기
              fontWeight: "bold", // 헤더 타이틀의 폰트 두께
              color: "white", // 헤더 타이틀의 색상
            },
          }}
        />

        <Stack.Screen
          name="messages"
          options={{
            title: "메세지",
            headerStyle: {
              backgroundColor: "#4fc3f7", // 헤더의 배경색
            },
            headerTitleStyle: {
              fontSize: 20, // 헤더 타이틀의 폰트 크기
              fontWeight: "bold", // 헤더 타이틀의 폰트 두께
              color: "white", // 헤더 타이틀의 색상
            },
          }}
        />

        <Stack.Screen
          name="MyMessage"
          options={{
            title: "메세지함",
            headerStyle: {
              backgroundColor: "#4fc3f7", // 헤더의 배경색
            },
            headerTitleStyle: {
              fontSize: 20, // 헤더 타이틀의 폰트 크기
              fontWeight: "bold", // 헤더 타이틀의 폰트 두께
              color: "white", // 헤더 타이틀의 색상
            },
          }}
        />

        <Stack.Screen
          name="momdad"
          options={({ route }) => ({
            title: "부모 사진",
            headerStyle: {
              backgroundColor: "#4fc3f7",
            },
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
            },
            headerRight: () =>
              route.params.userUUID === currentUserUUID ? (
                <Link href="/momdadEdit" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <FontAwesome
                        name="edit"
                        size={25}
                        color={Colors[colorScheme ?? "light"].text}
                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              ) : null,
          })}
        />
      </Stack>
    </ThemeProvider>
  );
}
