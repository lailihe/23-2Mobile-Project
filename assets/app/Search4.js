import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const dogBreeds = [
  "골든리트리버",
  "그레이트데인",
  "그레이하운드",
  "꼬똥 드 툴레아",
  "닥스훈트",
  "달마시안",
  "도베르만",
  "래브라도 리트리버",
  "말라뮤트",
  "말티즈",
  "미니어처 불테리어",
  "미니핀",
  "믹스",
  "바셋하운드",
  "베들링턴테리어",
  "보더콜리",
  "보스턴테리어",
  "불독",
  "불테리어",
  "비글",
  "비숑프리제",
  "사모예드",
  "삽살개",
  "샤페이",
  "셰퍼드",
  "쉽독",
  "슈나우저",
  "스피츠",
  "시바견",
  "시베리안허스키",
  "시츄",
  "실키테리어",
  "아메리칸코커스패니얼",
  "아펜핀셔",
  "아프간하운드",
  "요크셔테리어",
  "웨스트 하이랜드 화이트 테리어",
  "웰시코기",
  "이탈리안 그레이하운드",
  "잉글리쉬불독",
  "잭러셀테리어",
  "제페니스 친",
  "진돗개",
  "차우차우",
  "차이니즈 크레스티드",
  "치와와(단모)",
  "치와와(장모)",
  "케리블루테리어",
  "코몬도르",
  "코커스패니얼",
  "콜리",
  "킹찰스스파니엘",
  "파피용",
  "퍼그",
  "페키니즈",
  "포메라니안",
  "폭스테리어",
  "푸들",
  "풀리",
  "프렌치불독",
  "피레니즈",
  "하운드",
];

const Search4 = () => {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filteredBreeds, setFilteredBreeds] = useState(dogBreeds);

  const searchFilter = (text) => {
    if (text) {
      const newData = dogBreeds.filter((item) => {
        const itemData = item ? item.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredBreeds(newData);
      setSearch(text);
    } else {
      setFilteredBreeds(dogBreeds);
      setSearch(text);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        // 'ProfileEdit' 스크린으로 네비게이트하면서 선택된 견종을 파라미터로 전달합니다.
        router.push({
          pathname: '/post',
          params: { filterBreed: item }, // 선택된 견종을 파라미터로 전달합니다.
        });
      }}
    >
      <MaterialCommunityIcons name="dog" size={30} color="pink" />
      <Text style={styles.title}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={search}
        placeholder="검색..."
        placeholderTextColor="#666666"
        onChangeText={(text) => searchFilter(text)}
      />
      <FlatList
        data={filteredBreeds}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 18,
  },
  textInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingLeft: 20,
    margin: 10,
    borderRadius: 10,
  },
});

export default Search4;
