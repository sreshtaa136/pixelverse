import { Image, StyleSheet, Platform, View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { images } from "@/constants";
import SearchInput from "@/components/SearchInput";
import Trending from "@/components/Trending";
import EmptyState from "@/components/EmptyState";
import { useState } from "react";

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // reload data
    setRefreshing(false);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="bg-primary h-full">
        {/* 
          FlatLists support horizontal and vertical scrolling.
          which is why we use a flatlist here and not ScrollView. 
          because we need scrolls in both directions 
        */}
        <FlatList
          // data={[]}
          data={[{ $id: 1 }, { $id: 2 }, { $id: 3 }]}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <Text className="text-white text-2xl">{item.$id}</Text>
          )}
          ListHeaderComponent={FlatListHeader}
          // what to render when list is empty
          ListEmptyComponent={() => (
            <EmptyState
              title="No videos found"
              subtitle="Be the first one to upload"
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        {/* <StatusBar backgroundColor="#161622" style="light" /> */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const FlatListHeader = () => {
  return (
    <View className="my-6 px-4 space-y-6">
      <View className="justify-between items-center flex-row mb-6">
        <View>
          <Text className="font-pmedium text-md text-gray-100">
            Welcome back
          </Text>
          <Text className="text-white text-2xl font-psemibold">Sreshtaa</Text>
        </View>
        <View>
          <Image
            source={images.logoSmall}
            className="w-9 h-10"
            resizeMode="contain"
          />
        </View>
      </View>
      <SearchInput placeholder={"Search for a video topic"} />
      <View className="w-full flex-1 pt-5 pb-8 mt-6">
        <Text className="text-lg font-pregular text-gray-100 mb-3">
          Trending Videos
        </Text>
        <Trending posts={[{ $id: 1 }, { $id: 2 }, { $id: 3 }] ?? []} />
        {/* <Trending posts={latestPosts ?? []} /> */}
      </View>
    </View>
  );
};

export default Home;
