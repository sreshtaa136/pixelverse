import { Image, StyleSheet, Platform, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { images } from "../constants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomButton from "../components/CustomButton";
import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import "react-native-url-polyfill/auto";
import { useGlobalContext } from "@/context/GlobalProvider";

export default function App() {
  const { loading, isLogged } = useGlobalContext();

  // if (!loading && isLogged) return <Redirect href="/home" />;
  // UNTIL APPWRITE WORKS AGAIN 
  if (!loading && !isLogged) return <Redirect href="/home" />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="bg-primary h-full">
        <ScrollView contentContainerStyle={{ height: "100%" }}>
          <View className="h-full w-full flex justify-center items-center px-4">
            <Image
              source={images.logo}
              className="w-[10rem] h-[3rem]"
              resizeMode="contain"
            />
            <Image
              source={images.cards}
              className="max-w-[380px] w-full h-[25rem] mt-7"
              resizeMode="contain"
            />
            <View className="relative mt-5 px-8">
              <Text className="text-3xl text-white font-bold text-center">
                Discover Endless Possibilities with{" "}
                <Text className="text-secondary-200">Aora</Text>
              </Text>
              <Image
                source={images.path}
                className="w-[5rem] h-[2rem] absolute -right-0 -bottom-4"
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-lg mt-7 font-pregular text-center">
              Where Creativity Meets Innovation: Embark on a Journey of
              Limitless Exploration with Aora
            </Text>
            <CustomButton
              title="Continue with Email"
              handlePress={() => router.push("/sign-in")}
              containerStyles="w-full mt-8"
            />
          </View>
        </ScrollView>
        {/* <StatusBar backgroundColor="#161622" style="light" /> */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
