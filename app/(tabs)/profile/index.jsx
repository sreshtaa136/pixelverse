import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import EmptyState from "@/components/EmptyState";
import { useEffect, useState } from "react";
import {
  getAllPosts,
  getUserPosts,
  searchPosts,
  signOut,
} from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import VideoCard from "@/components/VideoCard";
import { useGlobalContext } from "@/context/GlobalProvider";
import { icons } from "@/constants";
import InfoBox from "@/components/InfoBox";
import { router } from "expo-router";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: posts } = useAppwrite(() => getUserPosts(user?.$id));

  async function logout() {
    await signOut();
    setUser(null);
    setIsLogged(false);
    // replacing url makes sure that the
    // user can't come back to this page
    router.replace("/sign-in");
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="bg-primary h-full">
        <FlatList
          data={posts ?? []}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => <VideoCard video={item} />}
          ListHeaderComponent={() => (
            <FlatListHeader
              user={user}
              numPosts={posts.length}
              logout={logout}
            />
          )}
          // what to render when list is empty
          ListEmptyComponent={() => (
            <EmptyState
              title="No videos found"
              subtitle="Try uploading a video"
            />
          )}
        />
        {/* <StatusBar backgroundColor="#161622" style="light" /> */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const FlatListHeader = ({ user, numPosts, logout }) => {
  return (
    <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
      <View className="flex flex-row w-full justify-between mb-10 ">
        {/* edit button */}
        <TouchableOpacity onPress={() => router.push("/profile/edit")}>
          <Image source={icons.edit} resizeMode="contain" className="w-7 h-7" />
        </TouchableOpacity>
        {/* logout button */}
        <TouchableOpacity onPress={logout}>
          <Image
            source={icons.logout}
            resizeMode="contain"
            className="w-6 h-6"
          />
        </TouchableOpacity>
      </View>
      {/* user avatar */}
      <View className="w-[8em] h-[8em] border border-secondary rounded-[50%] flex justify-center items-center p-0.5">
        <Image
          source={{ uri: user?.avatar }}
          className="w-[100%] h-[100%] rounded-[50%]"
          resizeMode="cover"
        />
      </View>
      {/* username */}
      <InfoBox
        title={user?.username}
        containerStyles="mt-5"
        titleStyles="text-lg"
      />
      <View className="mt-5 flex flex-row">
        <InfoBox
          title={numPosts || 0}
          subtitle="Posts"
          titleStyles="text-xl"
          containerStyles="mr-10"
        />
        <InfoBox title="1.2k" subtitle="Followers" titleStyles="text-xl" />
      </View>
    </View>
  );
};

export default Profile;
