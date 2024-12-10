import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Button,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";
import { icons } from "@/constants";
import { useVideoPlayer, Video, VideoView } from "expo-video";
import { ResizeMode } from "expo-av";
import { useEvent } from "expo";

const Trending = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[0]);

  const viewableItemsChanged = ({ viewableItems }) => {
    // viewableItems: array of items that are currently
    // visible in the viewport
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.$id}
      horizontal
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        // An item is considered visible if at least
        // 70% of it is on the screen.
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 100 }} // initial horizontal scroll offset
      showsHorizontalScrollIndicator={false} // Hides the scrollbar
    />
  );
};

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.8,
  },
};

const TrendingItem = ({ activeItem, item }) => {
  const [play, setPlay] = useState(false);
  // console.log("video", item.video);
  // https://videos.pexels.com/video-files/5377700/5377700-uhd_1440_2560_25fps.mp4
  // https://videos.pexels.com/video-files/9783697/9783697-uhd_2732_1440_25fps.mp4
  // https://videos.pexels.com/video-files/4747138/4747138-hd_1920_1080_25fps.mp4
  // const vidSource = "https://videos.pexels.com/video-files/4747138/4747138-hd_1920_1080_25fps.mp4";

  const vidSource = item.video;
  const player = useVideoPlayer(vidSource, (player) => {
    player.loop = false;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

  // Dynamically update loading state based on player's status
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(status === "loading");
  }, [status]);

  return (
    <Animatable.View
      className="mr-2"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      <View className="flex justify-center items-center w-52 h-72 rounded-[33px] mt-3 overflow-hidden relative">
        <VideoView
          style={{
            width: "100%",
            height: "100%",
          }}
          contentFit="cover"
          player={player}
          allowsFullscreen={true}
          allowsPictureInPicture={false}
          nativeControls={isLoading ? false : true}
        />
        {!isPlaying &&
          (isLoading ? (
            <ActivityIndicator
              className="flex justify-center items-center absolute"
              size="small"
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
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
          ))}
      </View>
    </Animatable.View>
  );
};

export default Trending;
