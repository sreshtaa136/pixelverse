import {
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  RefreshControl,
  Alert,
} from "react-native";
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
import { useEffect, useState } from "react";
import { getAllPosts, getLatestPosts } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import VideoCard from "@/components/VideoCard";

const Home = () => {
  const { user } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  // higher order function (custom)
  const { data: posts, refetch: refetchPosts } = useAppwrite(getAllPosts);

  const onRefresh = async () => {
    setRefreshing(true);
    // reload data
    await refetchPosts();
    setRefreshing(false);
  };

  // console.log("posts", posts);

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
          data={posts ?? []}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <VideoCard video={item} />}
          ListHeaderComponent={() => <FlatListHeader user={user} />}
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

const FlatListHeader = ({ user }) => {
  const { data: latestPosts } = useAppwrite(getLatestPosts);
  // console.log("first", latestPosts);
  return (
    <View className="my-6 px-4 space-y-6">
      <View className="justify-between items-center flex-row mb-6">
        <View>
          <Text className="font-pmedium text-md text-gray-100">
            Welcome back
          </Text>
          <Text className="text-white text-2xl font-psemibold">
            {user?.username}
          </Text>
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
        {latestPosts && latestPosts.length > 0 && (
          <Trending posts={latestPosts} />
        )}
        {/* <Trending posts={latestPosts ?? []} /> */}
      </View>
    </View>
  );
};

export default Home;
