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
import { updateUserProfile, getUserData } from "@/lib/storageFunctions";
import { getCurrentUser } from "@/lib/appwrite";
import useFunction from "@/lib/useFunction";

const EditProfile = () => {
  const { user, refreshUserData } = useGlobalContext();
  // const {
  //   data: user,
  //   refetch: refetchUser,
  //   isLoading: isUserLoading,
  // } = useFunction(getCurrentUser);
  const [uploading, setUploading] = useState(false);
  // Dynamically update loading state based on player's status
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    avatar: null,
    email: "",
  });
  const [userDetails, setUserDetails] = useState("");
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  // Function to open a document picker for selecting images or videos
  const openPicker = async () => {
    // Use the ImagePicker to let the user select from gallery
    // No permissions request is necessary for launching the image library
    setIsFileLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
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
        return;
      }
      // Update the `form` state with the selected image file
      setForm({
        ...form,
        avatar: file,
      });
    } else {
      // If the user cancels the file picker
      if (result.assets[0]) {
        setTimeout(() => {
          Alert.alert("Document picked", JSON.stringify(result, null, 2));
        }, 100); // Add a slight delay before showing the alert for better UX
      }
    }
    setIsFileLoading(false);
  };

  const submit = async () => {
    if (form.username === "") {
      return Alert.alert("Please enter a username");
    }
    setUploading(true);
    try {
      await updateUserProfile({
        ...form,
        userId: user.uid,
      });
      Alert.alert("Success", "Profile updated successfully");
      refreshUserData();
      router.push("/profile");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        username: "",
        avatar: null,
        email: "",
      });
      setUploading(false);
    }
  };

  const refreshUserDetails = async () => {
    try {
      setUserDetailsLoading(true);
      const res = await getUserData(user?.uid);
      console.log("edit page", res);
      setUserDetails(res);
    } catch (error) {
      console.error("Error loading user details in the edit page");
    } finally {
      setUserDetailsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserDetails();
  }, []);

  useEffect(() => {
    if (!userDetailsLoading && (!form.username || !form.email)) {
      setForm({
        ...form,
        username: userDetails.username,
        email: userDetails.email,
      });
    }
  }, [userDetailsLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={"bg-primary h-full"}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView className="px-4 my-6">
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
            <Text className="text-2xl text-white font-psemibold mt-3">
              Edit profile
            </Text>
            {/* avatar */}
            <View className="mt-7 space-y-2">
              <Text className="text-base text-gray-100 font-pmedium mb-3">
                Avatar
              </Text>
              <TouchableOpacity onPress={() => openPicker()}>
                {form.avatar?.uri || userDetails.avatar ? (
                  <View className="flex flex-row justify-start gap-3 items-center">
                    <View className="w-[8em] h-[8em] border border-secondary rounded-[50%] flex justify-center items-center p-0.5 relative">
                      <Image
                        key={form.avatar?.uri || userDetails.avatar}
                        source={
                          form.avatar?.uri
                            ? { uri: form.avatar.uri }
                            : { uri: userDetails.avatar }
                        }
                        className="w-[100%] h-[100%] rounded-[50%]"
                        resizeMode="cover"
                      />
                      <View className="flex absolute bg-white/30 w-full h-full rounded-[50%] justify-center items-center">
                        <Image
                          source={icons.camera}
                          resizeMode="contain"
                          alt="upload"
                          className="w-8 h-8 z-40"
                        />
                      </View>
                    </View>
                    <Text className="text-sm text-gray-100 font-pmedium ml-3">
                      Choose a picture
                    </Text>
                  </View>
                ) : (
                  <View className="flex flex-row justify-start gap-3 items-center">
                    <View className="w-[8em] h-[8em] bg-black-100 border-2 border-black-200 rounded-[50%]  p-0.5 flex justify-center items-center">
                      <Image
                        source={icons.camera}
                        resizeMode="contain"
                        alt="upload"
                        className="w-8 h-8 z-40"
                      />
                    </View>
                    <Text className="text-sm text-gray-100 font-pmedium ml-3">
                      Choose a picture
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            {/* Username */}
            <FormField
              title="Username"
              value={form.username}
              handleChangeText={(e) => setForm({ ...form, username: e })}
              otherStyles="mt-10"
            />
            {/* email */}
            <FormField
              title="Email"
              value={form.email}
              editable={false}
              otherStyles="mt-7"
              inputStyles="text-gray-400"
            />
            {/* submit */}
            <CustomButton
              title="Update"
              handlePress={submit}
              containerStyles="mt-10"
              isLoading={uploading}
            />
          </ScrollView>
        </KeyboardAvoidingView>
        {(isFileLoading || uploading || userDetailsLoading) && (
          <View className="justify-center items-center absolute w-full h-[120%] bg-black-200/60 top-0 left-0 z-50">
            <ActivityIndicator size="large" />
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default EditProfile;
