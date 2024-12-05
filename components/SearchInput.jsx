import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";
import { usePathname } from "expo-router";

const SearchInput = ({ placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  return (
    <View
      className={`w-full h-16 px-4 bg-black-100 rounded-2xl border-2 ${
        isFocused ? "border-secondary" : "border-black-200"
      } flex flex-row items-center justify-between`}
    >
      <TextInput
        className={`text-base mt-0.5 text-white flex-1 font-pregular`}
        value={query}
        placeholder={placeholder}
        placeholderTextColor="#CDCDE0"
        onChangeText={(e) => setQuery(e)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <TouchableOpacity>
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
