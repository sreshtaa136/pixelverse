import { Client, Account, ID, Avatars, Databases } from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.sreshtaa.pixelverse",
  projectId: "673982560010ce837ecd",
  databaseId: "6739847f00158a9f2cd1",
  userCollectionId: "673984be0009889b6d3d",
  videoCollectionId: "673984ec0025517b714e",
  storageId: "6739867e003e02d2304a",
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
    console.error(error);
    throw new Error(error);
  }
};

export async function signIn(email, password) {
  try {
    // Appwrite uses sessions to manage user authentication,
    // ensuring that only logged-in users can access specific features.
    const session = account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}
