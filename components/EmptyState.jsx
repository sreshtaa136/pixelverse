import { router } from "expo-router";
import { View, Text, Image } from "react-native";
import { images } from "@/constants";
import CustomButton from "./CustomButton";

const EmptyState = ({ title, subtitle }) => {
  return (
    <View className="flex justify-center items-center px-4">
      <Image
        source={images.empty}
        resizeMode="contain"
        className="w-[270px] h-[216px]"
      />
      <Text className="text-2xl text-center font-psemibold text-white mt-2">
        {title}
      </Text>
      <Text className="text-md font-pmedium text-gray-100">{subtitle}</Text>
      <CustomButton
        title="Back to Explore"
        handlePress={() => router.push("/home")}
        containerStyles="w-80 my-9"
      />
    </View>
  );
};

export default EmptyState;
