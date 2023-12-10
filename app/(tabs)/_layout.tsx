import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';
import { MaterialCommunityIcons, Foundation, AntDesign, Entypo, Ionicons  } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="ProfileView"
        options={{
          title: '강아지 정보',
          tabBarIcon: () => <MaterialCommunityIcons name="dog" size={30} color="pink" />,
      headerStyle: {
        backgroundColor: "#4fc3f7", // 헤더의 배경색
      },
      headerTitleStyle: {
        fontSize: 20, // 헤더 타이틀의 폰트 크기
        fontWeight: "bold", // 헤더 타이틀의 폰트 두께
        color: "white", // 헤더 타이틀의 색상
      },
          headerRight: () => (
            <Link href="/ProfileEdit" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="edit"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      
      <Tabs.Screen
        name="post"
        options={{
          title: '강아지 소개팅',
          tabBarIcon: () => <AntDesign name="hearto" size={24} color="pink" />,
          headerStyle: {
            backgroundColor: "#4fc3f7", // 헤더의 배경색
          },
          headerTitleStyle: {
            fontSize: 20, // 헤더 타이틀의 폰트 크기
            fontWeight: "bold", // 헤더 타이틀의 폰트 두께
            color: "white", // 헤더 타이틀의 색상
          },
          headerRight: () => (
            <Link href="/MyMessage" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="envelope-o"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      
      <Tabs.Screen
        name="walk"
        options={{
          title: '산책',
          tabBarIcon: () => <Foundation name="guide-dog" size={30} color="pink" />,
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

      <Tabs.Screen
        name="index"
        options={{
          title: '대리 산책 구함',
          tabBarIcon: () => <Ionicons name="person" size={24} color="pink" />,
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

<Tabs.Screen
        name="walk2"
        options={{
          title: '대리 산책 기록',
          tabBarIcon: () => <Entypo name="baidu" size={24} color="pink" />,
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
    </Tabs>
  );
}