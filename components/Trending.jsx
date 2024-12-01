import { View, Text } from "react-native";
import React from "react";
import { FlatList } from "react-native-gesture-handler";

const Trending = ({ posts }) => {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.$id}
      horizontal
      renderItem={({ item }) => (
        <Text className="text-white text-xl">{item.$id}</Text>
      )}
    />
  );
};

export default Trending;
