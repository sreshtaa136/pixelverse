import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";

const SearchInput = ({
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={`w-full h-16 px-4 bg-black-100 rounded-2xl border-2 ${
        isFocused ? "border-secondary" : "border-black-200"
      } flex flex-row items-center justify-between`}
    >
      <TextInput
        className={`text-base mt-0.5 text-white flex-1 font-pregular`}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#7B7B8B"
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      <TouchableOpacity>
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
