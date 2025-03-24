import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import { useEffect, useState } from "react";
import useFunction from "@/lib/useFunction";
import VideoCard from "@/components/VideoCard";
import { searchVideos } from "@/lib/storageFunctions";
import { icons } from "@/constants";

const Search = () => {
  const { query } = useLocalSearchParams();
  // higher order function (custom)
  const {
    data: posts,
    refetch,
    isLoading,
  } = useFunction(() => searchVideos(query));

  useEffect(() => {
    refetch();
  }, [query]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="bg-primary h-full">
        <FlatList
          data={posts ?? []}
          keyExtractor={(item) => item.objectID}
          renderItem={({ item }) => <VideoCard video={item} />}
          ListHeaderComponent={() => <FlatListHeader query={query} />}
          // what to render when list is empty
          ListEmptyComponent={() =>
            isLoading ? (
              <ActivityIndicator size="medium" />
            ) : (
              <EmptyState
                title="No videos found"
                subtitle="No videos found for this search"
              />
            )
          }
        />
        {/* <StatusBar backgroundColor="#161622" style="light" /> */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const FlatListHeader = ({ query }) => {
  return (
    <View className="my-6 px-4">
      {/* back button */}
      <TouchableOpacity
        className="w-full items-start mb-5"
        onPress={() => router.back()}
      >
        <Image
          source={icons.arrowBack}
          resizeMode="contain"
          className="w-7 h-7"
        />
      </TouchableOpacity>
      <Text className="font-pmedium text-md text-gray-100">Search results</Text>
      <Text className="text-white text-2xl font-psemibold">{query}</Text>
      <View className="mt-6 mb-8">
        <SearchInput
          placeholder={"Search for a video topic"}
          initialQuery={query}
        />
      </View>
    </View>
  );
};

export default Search;
