import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import icons from "@/constants/icons";

const VideoCard = ({
  video: {
    title,
    thumbnail,
    prompt,
    video,
    creator: { username, avatar },
  },
}) => {
  const [play, setPlay] = useState(false);

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex flex-row flex-1 justify-center items-center">
          {/* user avatar */}
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          {/* title and subtitle col */}
          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              /* 
                Used to truncate the text with an ellipsis after
                computing the text layout, including line wrapping,
                such that the total number of lines does not exceed
                this number.
              */
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        {/* menu */}
        <View>
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>
      {/* video */}
      {play ? (
        <View>
          <Image
            source={{ uri: thumbnail }}
            className="w-9 h-10"
            resizeMode="contain"
          />
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-6 relative flex justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full"
            resizeMode="contain"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
