import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";
import { icons } from "@/constants";
import { useVideoPlayer, Video, VideoView } from "expo-video";
import { ResizeMode } from "expo-av";

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
  const player = useVideoPlayer(item.video, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // console.log("activeItem", activeItem);
  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        // <Video
        //   source={{ uri: item.video }}
        //   className="w-52 h-72 rounded-[33px] mt-3 bg-white/10"
        //   resizeMode={ResizeMode.CONTAIN}
        //   useNativeControls
        //   shouldPlay
        //   onPlaybackStatusUpdate={(status) => {
        //     if (status.didJustFinish) {
        //       setPlay(false);
        //     }
        //   }}
        // />
        <VideoView
          // style={styles.video}
          className="w-52 h-72 rounded-[33px] mt-3 bg-white/10"
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="relative flex justify-center items-center"
        >
          <ImageBackground
            source={{
              uri: item.thumbnail,
            }}
            className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

export default Trending;
