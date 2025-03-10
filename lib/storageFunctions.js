import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
} from "firebase/firestore";
import { storage, db, algoliaClient } from "../firebaseConfig";

export const createVideoPost = async ({
  userId,
  title,
  prompt,
  video,
  thumbnail,
}) => {
  try {
    // TODO: DELETE IN ALGOLIA AND FIRESTORE IF ANY UPLOAD FAILS

    if (!video) {
      throw new Error("No video file provided");
    }

    // Convert video file to blob
    const videoResponse = await fetch(video.uri);
    const videoBlob = await videoResponse.blob();

    // Create a unique path for the video in Firebase Storage
    const timestamp = Date.now();
    const videoRef = ref(storage, `videos/${userId}/${timestamp}.mp4`);

    // Upload video file with progress tracking
    const videoUploadTask = uploadBytesResumable(videoRef, videoBlob);

    return new Promise((resolve, reject) => {
      videoUploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optional: Track upload progress
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Video upload is ${progress}% done`);
        },
        (error) => {
          console.error("Error uploading video:", error);
          reject(error);
        },
        async () => {
          // Get the video URL after upload is complete
          const videoUrl = await getDownloadURL(videoUploadTask.snapshot.ref);

          let thumbnailUrl = null;
          if (thumbnail) {
            try {
              // Convert thumbnail to blob
              const thumbResponse = await fetch(thumbnail.uri);
              const thumbBlob = await thumbResponse.blob();

              // Create a storage reference for the thumbnail
              const thumbRef = ref(
                storage,
                `thumbnails/${userId}/${timestamp}.jpg`
              );

              // Upload thumbnail
              await uploadBytesResumable(thumbRef, thumbBlob);
              thumbnailUrl = await getDownloadURL(thumbRef);
            } catch (thumbError) {
              console.error("Error uploading thumbnail:", thumbError);
            }
          }

          try {
            // Store metadata in Firestore
            const postDocRef = await addDoc(collection(db, "videos"), {
              creator: userId,
              title,
              prompt,
              video: videoUrl,
              thumbnail: thumbnailUrl, // Store thumbnail URL if available
              createdAt: new Date(),
            });
            console.log("Video post created:", postDocRef.id);

            // manually sync to algolia
            await algoliaClient.saveObject({
              indexName: "videos",
              body: {
                objectID: postDocRef.id,
                creator: userId,
                title,
                prompt,
                video: videoUrl,
                thumbnail: thumbnailUrl,
              },
            });
            console.log("✅ Video added to Algorlia:", postDocRef.id);

            resolve({ videoUrl, thumbnailUrl, postId: postDocRef.id });
          } catch (error) {
            console.error("❌ Firestore write failed:", error);
            reject(error); // Ensure errors propagate
          }
        }
      );
    });
  } catch (error) {
    console.error("Failed to create video post:", error);
    throw error;
  }
};

export const searchVideos = async (queryText) => {
  try {
    const { results } = await algoliaClient.search([
      {
        indexName: "videos",
        query: queryText,
        params: {
          restrictSearchableAttributes: ["title", "prompt"],
          typoTolerance: false,
        },
      },
    ]);
    const hits = results[0].hits;
    console.log("search results: ", hits);

    // extract unique user IDs
    const userIds = [...new Set(hits.map((video) => video.creator))];
    // fetch user details
    let usersMap = await getUsersMap(userIds);

    // merge video data with user details
    const videosWithCreators = hits.map((video) => ({
      ...video,
      creator: usersMap[video.creator] || {},
    }));
    console.log("videosWithCreators:", videosWithCreators);

    return videosWithCreators;
  } catch (error) {
    console.error("Algolia search error:", error);
    throw error;
  }
};

export const getAllPosts = async () => {
  try {
    // fetch all videos
    const res = await getDocs(collection(db, "videos"));
    const videos = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // extract unique user IDs
    const userIds = [...new Set(videos.map((video) => video.creator))];
    // fetch user details
    let usersMap = await getUsersMap(userIds);

    // merge video data with user details
    const videosWithCreators = videos.map((video) => ({
      ...video,
      creator: usersMap[video.creator] || {},
    }));
    console.log("videosWithCreators:", videosWithCreators);

    return videosWithCreators;
  } catch (error) {
    console.error("Failed to get all posts:", error);
    throw error;
  }
};

export const getLatestPosts = async () => {
  try {
    // get the 5 newest videos
    const q = query(
      collection(db, "videos"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const res = await getDocs(q);
    const videos = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return videos;
  } catch (error) {
    console.error("Failed to get all posts:", error);
    throw error;
  }
};

export const getUserPosts = async (uid) => {
  try {
    const q = query(collection(db, "videos"), where("creator", "==", uid));
    const data = await getDocs(q);
    const posts = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    console.log("POSTS: ", posts);
    return posts;
  } catch (error) {
    console.error("Failed to get user posts:", error);
    throw error;
  }
};

export const updateUserProfile = async (form) => {
  const { avatar, userId, username } = form;
  try {
    if (!userId || userId == "") {
      return;
    }

    let dataToUpdate = {};
    let avatarUrl = "";
    if (avatar) {
      try {
        // Convert avatar to blob
        const res = await fetch(avatar.uri);
        const blob = await res.blob();

        // Create a storage reference for the avatar
        const avatarRef = ref(storage, `avatars/${userId}.jpg`);

        // Upload avatar
        await uploadBytesResumable(avatarRef, blob);
        avatarUrl = await getDownloadURL(avatarRef);
      } catch (error) {
        console.error("Error uploading avatar:", error);
      }
      if (avatarUrl !== "") {
        dataToUpdate["avatar"] = avatarUrl;
      }
    }

    if (username !== "") {
      dataToUpdate["username"] = username;
    }

    const userRef = doc(db, "users", userId);
    const updatedUser = await updateDoc(userRef, dataToUpdate);
    console.log("User updated successfully: ", updatedUser);
    return true;
  } catch (error) {
    throw new Error(error);
  }
};

const getUsersMap = async (userIds) => {
  try {
    // fetch user details in a single query
    let usersMap = {};
    if (userIds.length > 0) {
      const usersQuery = query(
        collection(db, "users"),
        where("uid", "in", userIds)
      );
      const users = await getDocs(usersQuery);
      users.forEach((doc) => {
        usersMap[doc.id] = {
          username: doc.data().username,
          avatar: doc.data().avatar || null,
        };
      });
    }
    console.log("usersMap: ", usersMap);
    return usersMap;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    throw error;
  }
};
