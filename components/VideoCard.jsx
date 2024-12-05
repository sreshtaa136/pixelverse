import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import icons from "@/constants/icons";
import { useVideoPlayer, Video, VideoView } from "expo-video";
import { useEvent } from "expo";

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

  const player = useVideoPlayer(video, (player) => {
    player.loop = false;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

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
      <View className="flex justify-center items-center w-full h-60 rounded-xl mt-6 overflow-hidden relative">
        <VideoView
          style={{
            width: "100%",
            height: "100%",
          }}
          contentFit="cover"
          player={player}
          allowsFullscreen={true}
          allowsPictureInPicture={false}
          nativeControls={true}
        />
        {!isPlaying && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              console.log("status", player.status);
              // checking if the video has reached its end 
              if (player.currentTime === player.duration) {
                // console.log("ended");
                // resets the playback position to the beginning
                player.replay();
              }
              player.play();
            }}
            className="flex justify-center items-center absolute"
          >
            <Image
              source={icons.play}
              className="w-12 h-12"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default VideoCard;
