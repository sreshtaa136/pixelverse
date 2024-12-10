import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
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
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { createVideoPost } from "@/lib/appwrite";

const Create = () => {
  const { user, refetchPosts, refetchUserPosts } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  // Dynamically update loading state based on player's status
  const [isFileLoading, setIsFileLoading] = useState(false);
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

  // Function to open a document picker for selecting images or videos
  const openPicker = async (selectType) => {
    // Use the DocumentPicker to let the user select from files
    // const result = await DocumentPicker.getDocumentAsync({
    //   // Restrict the allowed file types based on the input parameter `selectType`
    //   type:
    //     selectType === "image"
    //       ? ["image/png", "image/jpg", "image/jpeg"] // Allow only PNG and JPG images
    //       : ["video/mp4", "video/gif"], // Allow only MP4 and GIF videos
    // });

    // Use the ImagePicker to let the user select from gallery
    // No permissions request is necessary for launching the image library
    setIsFileLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === "image" ? ["images"] : ["videos"],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    setIsFileLoading(false);
    // Check if the user successfully selected a file
    if (!result.canceled && result.assets?.[0]) {
      const file = result.assets[0];
      const fileSize = file.fileSize;
      // console.log("FILE", file);
      // Check if file size exceeds 50MB
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
      if (fileSize > MAX_SIZE) {
        Alert.alert(
          "File Too Large",
          "Please select a file smaller than 50MB."
        );
        return; // Stop further processing
      }

      // If the user selected an image
      if (selectType === "image") {
        // Update the `form` state with the selected image file
        setForm({
          ...form,
          thumbnail: file, // Add the selected file as the `thumbnail`
        });
      }

      // If the user selected a video
      if (selectType === "video") {
        // Update the `form` state with the selected video file
        setForm({
          ...form,
          video: file, // Add the selected file as the `video`
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

  const submit = async () => {
    if (form.prompt === "" || form.title === "" || !form.video) {
      return Alert.alert("Please provide all fields");
    }
    setUploading(true);
    try {
      await createVideoPost({
        ...form,
        userId: user.$id,
      });
      Alert.alert("Success", "Post uploaded successfully");
      refetchPosts();
      refetchUserPosts();
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        title: "",
        video: null,
        thumbnail: null,
        prompt: "",
      });
      setUploading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={"bg-primary h-full"}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
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
                      allowsFullscreen={false}
                      allowsPictureInPicture={false}
                      nativeControls={false}
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
        </KeyboardAvoidingView>
        {isFileLoading && (
          <View className="justify-center items-center absolute w-full h-[120%] bg-black-200/60 top-0 left-0 z-50">
            <ActivityIndicator size="large" />
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Create;
