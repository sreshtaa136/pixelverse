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
import { signIn } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      formData.email === "" ||
      formData.password === ""
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await signIn(
        formData.email,
        formData.password,
      );
      setUser(result);
      setIsLogged(true);
      Alert.alert("Success", "User signed in successfully");
      // setUser(result);
      // setIsLogged(true);
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
            className="h-full w-full justify-center px-4"
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
              Sign in to Aura
            </Text>
            <FormField
              title="Email"
              value={formData.email}
              handleChangeText={(e) => setFormData({ ...formData, email: e })}
              otherStyles="mt-10"
              keyboardType="email-address"
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
              title={"Sign In"}
              containerStyles={"mt-12"}
              handlePress={handleSubmit}
              isLoading={isSubmitting}
            />
            <View className="flex justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-100 font-pregular">
                Don't have an account?
              </Text>
              <Link
                href="/sign-up"
                className="text-lg font-psemibold text-secondary underline"
              >
                Sign Up
              </Link>
            </View>
          </View>
        </ScrollView>
        <StatusBar backgroundColor="#161622" style="light" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default SignIn;
