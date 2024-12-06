import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import FormField from "@/components/FormField";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import * as DocumentPicker from "expo-document-picker";

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  // Dynamically update loading state based on player's status
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    video:
      // "https://videos.pexels.com/video-files/5377700/5377700-uhd_1440_2560_25fps.mp4",
      null,
    // thumbnail: null,
    prompt: "",
  });

  const player = useVideoPlayer(form.video?.uri, (player) => {
    player.loop = false;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

  // Function to open a document picker for selecting images or videos
  const openPicker = async (selectType) => {
    // Use the DocumentPicker to let the user select a file
    const result = await DocumentPicker.getDocumentAsync({
      // Restrict the allowed file types based on the input parameter `selectType`
      type:
        selectType === "image"
          ? ["image/png", "image/jpg"] // Allow only PNG and JPG images
          : ["video/mp4", "video/gif"], // Allow only MP4 and GIF videos
    });

    // Check if the user successfully selected a file
    if (!result.canceled) {
      // If the user selected an image
      if (selectType === "image") {
        // Update the `form` state with the selected image file
        setForm({
          ...form,
          thumbnail: result.assets[0], // Add the selected file as the `thumbnail`
        });
      }

      // If the user selected a video
      if (selectType === "video") {
        // Update the `form` state with the selected video file
        setForm({
          ...form,
          video: result.assets[0], // Add the selected file as the `video`
        });
      }
    } else {
      // If the user cancels the file picker
      if (result.assets[0]) {
        setTimeout(() => {
          Alert.alert("Document picked", JSON.stringify(result, null, 2));
        }, 100); // Add a slight delay before showing the alert for better UX
      }
    }
  };

  const submit = async () => {};

  useEffect(() => {
    setIsLoading(status === "loading");
  }, [status]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="bg-primary h-full">
        <ScrollView className="px-4 my-6">
          <Text className="text-2xl text-white font-psemibold mt-3">
            Upload a video
          </Text>
          {/* title */}
          <FormField
            title="Title"
            value={form.title}
            placeholder="Give your video a catchy title..."
            handleChangeText={(e) => setForm({ ...form, title: e })}
            otherStyles="mt-10"
          />
          {/* video */}
          <View className="mt-7 space-y-2">
            <Text className="text-base text-gray-100 font-pmedium mb-3">
              Upload Video
            </Text>
            <TouchableOpacity onPress={() => openPicker("video")}>
              {form.video ? (
                <View className="w-full h-60 rounded-2xl mt-6 overflow-hidden">
                  <VideoView
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    contentFit="cover"
                    player={player}
                    allowsFullscreen={true}
                    allowsPictureInPicture={false}
                    nativeControls={isLoading ? false : true}
                  />
                </View>
              ) : (
                <View className="w-full h-40 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
                  <View className="w-14 h-14 border border-dashed border-secondary-100 flex justify-center items-center">
                    <Image
                      source={icons.upload}
                      resizeMode="contain"
                      alt="upload"
                      className="w-1/2 h-1/2"
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {/* thumbnail */}
          <View className="mt-7 space-y-2">
            <Text className="text-base text-gray-100 font-pmedium mb-3">
              Thumbnail Image
            </Text>
            <TouchableOpacity onPress={() => openPicker("image")}>
              {form.thumbnail ? (
                <Image
                  source={{ uri: form.thumbnail.uri }}
                  resizeMode="cover"
                  className="w-full h-64 rounded-2xl"
                />
              ) : (
                <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    alt="upload"
                    className="w-5 h-5"
                  />
                  <Text className="text-sm text-gray-100 font-pmedium ml-3">
                    Choose a file
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {/* prompt */}
          <FormField
            title="AI Prompt"
            value={form.prompt}
            placeholder="The AI prompt of your video...."
            handleChangeText={(e) => setForm({ ...form, prompt: e })}
            otherStyles="mt-7"
          />
          {/* submit */}
          <CustomButton
            title="Submit & Publish"
            handlePress={submit}
            containerStyles="mt-10"
            isLoading={uploading}
          />
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Create;
