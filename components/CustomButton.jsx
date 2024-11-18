import { View, Text } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

const CustomButton = ({
  title,
  containerStyles,
  handlePress,
  textStyles,
  isLoading,
}) => {
  console.log("CustomButton rendered, handlePress:", handlePress);
  return (
    <TouchableOpacity
      // onPress={console.log("Button pressed!")}
      onPress={handlePress}
      activeOpacity={0.7} // button opacity once pressed
      className={`bg-secondary rounded-md min-h-[62px] justify-center items-center ${containerStyles} ${
        isLoading && "opacity-50"
      }`}
      disabled={isLoading}
    >
      <Text className={`text-primary font-psemibold text-lg ${textStyles}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
