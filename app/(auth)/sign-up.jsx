import { View, Text, Image, Dimensions, Alert } from "react-native";
import React, { useState } from "react";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { images } from "../../constants";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { createUser, getCurrentUser } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      formData.username === "" ||
      formData.email === "" ||
      formData.password === ""
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createUser(
        formData.email,
        formData.password,
        formData.username
      );
      const currUser = await getCurrentUser();
      setUser(currUser);
      setIsLogged(true);
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="bg-primary h-full">
        <ScrollView contentContainerStyle={{ height: "100%" }}>
          <View
            className="h-full w-full justify-start px-4 mt-12"
            style={{
              minHeight: Dimensions.get("window").height - 100,
            }}
          >
            <Image
              source={images.logo}
              className="w-[10rem] h-[3rem]"
              resizeMode="contain"
            />
            <Text className="text-2xl text-white font-psemibold mt-12">
              Sign up to Aura
            </Text>
            <FormField
              title="Username"
              value={formData.username}
              handleChangeText={(e) =>
                setFormData({ ...formData, username: e })
              }
              otherStyles="mt-10"
            />
            <FormField
              title="Email"
              value={formData.email}
              handleChangeText={(e) => setFormData({ ...formData, email: e })}
              otherStyles="mt-7"
              keyboardType="email-address"
              textContentType="username" // Enables autofill for email
              autoComplete="username" // Enables autofill (RN >= 0.66)
            />
            <FormField
              title="Password"
              value={formData.password}
              handleChangeText={(e) =>
                setFormData({ ...formData, password: e })
              }
              otherStyles="mt-7"
            />
            <CustomButton
              title={"Sign Up"}
              containerStyles={"mt-12"}
              handlePress={handleSubmit}
              isLoading={isSubmitting}
            />
            <View className="flex justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-100 font-pregular">
                Already have an account?
              </Text>
              <Link
                href="/sign-in"
                className="text-lg font-psemibold text-secondary underline"
              >
                Sign In
              </Link>
            </View>
          </View>
        </ScrollView>
        <StatusBar backgroundColor="#161622" style="light" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default SignUp;
