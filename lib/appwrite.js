import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.sreshtaa.pixelverse",
  projectId: "6756a208002c6ebb43fe",
  databaseId: "6756bd2800220d0de0e0",
  userCollectionId: "6756be88002d48e3eab0",
  videoCollectionId: "6756c0a8002634b6f462",
  storageId: "6756c1ea0034689b0585",
  // OLD: sreshtaa.t@gmail.com
  // projectId: "673982560010ce837ecd",
  // databaseId: "6739847f00158a9f2cd1",
  // userCollectionId: "673984be0009889b6d3d",
  // videoCollectionId: "673984ec0025517b714e",
  // storageId: "6739867e003e02d2304a",
};

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Register User
export const createUser = async (email, password, username) => {
  console.log("createUser", email, password, username);
  try {
    // creates a user in Appwrite's authentication system
    // manages secure login and session handling.
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) throw Error;

    // creates a URL for an avatar image based on the initials
    const avatarUrl = avatars.getInitials(username);
    // log in the newly created user using their email and password.
    await signIn(email, password);
    // stores the user's profile details
    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        username,
        email,
        avatar: avatarUrl,
      }
    );
    return newUser;
  } catch (error) {
    console.error("createUser", error);
    throw new Error(error);
  }
};

async function checkActiveSession() {
  try {
    // Retrieve the current account information
    const user = await getAccount();
    console.log("User is already logged in");
    return user; // Returns the logged-in user's data if a session is active
  } catch (error) {
    // console.error("No active session:", error.message);
    return null; // Indicates no active session
  }
}

export async function signIn(email, password) {
  try {
    // Check if there's an active session
    const activeUser = await checkActiveSession();
    if (activeUser) {
      return activeUser;
    }

    // Handle mismatched sessions
    if (activeUser && activeUser.email !== email) {
      console.log(
        `Active session for ${activeUser.email} detected. Logging out...`
      );
      await account.deleteSessions(); // Logs out the current user
    }

    // Appwrite uses sessions to manage user authentication,
    // ensuring that only logged-in users can access specific features.
    const session = account.createEmailPasswordSession(email, password);
    console.log("New session created for user:", email);
    return session;
  } catch (error) {
    console.error(error);
    throw new Error("signIn", error);
  }
}

// Get Account
export async function getAccount() {
  try {
    // retrieves the account data of the logged-in user
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log("getCurrentUser", error);
    return null;
  }
}

export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    return posts.documents;
  } catch (error) {
    throw new Error("getAllPosts",error);
  }
}

// get the 7 latest videos in the database
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt", Query.limit(7))]
    );
    return posts.documents;
  } catch (error) {
    throw new Error("getLatestPosts",error);
  }
}

export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.search("title", query)]
    );
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getUserPosts(uid) {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.equal("creator", uid), Query.orderDesc("$createdAt")]
    );
    return posts.documents;
  } catch (error) {
    throw new Error("getUserPosts",error);
  }
}

export async function signOut() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error);
  }
}

export async function uploadFile(file, type) {
  if (!file) return;

  // Destructure the file object to extract the MIME type and other properties
  // const { mimeType, ...rest } = file;
  // Create an asset object that includes the MIME type and remaining file properties
  // const asset = { type: mimeType, ...rest };

  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };
  // console.log("FILE", file);

  try {
    // Upload the file to the Appwrite storage bucket
    const uploadedFile = await storage.createFile(
      config.storageId, // The ID of the storage bucket
      ID.unique(), // Generate a unique ID for the uploaded file
      asset // File data to be uploaded
    );
    // Get a preview/playback URL for the uploaded file based on its type
    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getFilePreview(fileId, type) {
  let fileUrl;
  try {
    // Check the file type to determine the appropriate URL generation method
    if (type === "video") {
      // For videos, generate a playback URL
      fileUrl = storage.getFileView(
        config.storageId, // ID of the storage bucket
        fileId // The unique ID of the file
      );
    } else if (type === "image") {
      // For images, generate a preview URL with additional settings
      fileUrl = storage.getFilePreview(
        config.storageId, // ID of the storage bucket
        fileId, // The unique ID of the file
        2000, // Maximum width for the image preview
        2000, // Maximum height for the image preview
        "top", // Cropping position for the image
        100 // Image quality (percentage)
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

export async function createVideoPost(form) {
  try {
    // Upload both the thumbnail and the video simultaneously
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"), // Upload the thumbnail file
      uploadFile(form.video, "video"), // Upload the video file
    ]);

    // Once both files are uploaded, create a new document in the Appwrite database
    const newPost = await databases.createDocument(
      config.databaseId, // ID of the Appwrite database
      config.videoCollectionId, // ID of the collection where the post will be stored
      ID.unique(), // Generate a unique ID for the new document
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );
    return newPost;
  } catch (error) {
    throw new Error(error);
  }
}
