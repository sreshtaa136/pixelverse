import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { storage, db } from "../firebaseConfig";

export const createVideoPost = async ({
  userId,
  title,
  prompt,
  video,
  thumbnail,
}) => {
  try {
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

export const getAllPosts = async () => {
  try {
    const result = await getDocs(collection(db, "videos"));
    // result.forEach((doc) => {
    //   // doc.data() is never undefined for query doc snapshots
    //   console.log(doc.id, " => ", doc.data());
    // });
    return result;
  } catch (error) {
    console.error("Failed to get all posts:", error);
    throw error;
  }
};

export const getUserPosts = async (uid) => {
  try {
    const q = query(collection(db, "videos"), where("creator", "==", uid));
    const data = await getDocs(q);
    const posts = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    console.log("POSTS: ", posts);
    return posts;
  } catch (error) {
    console.error("Failed to get user posts:", error);
    throw error;
  }
};
