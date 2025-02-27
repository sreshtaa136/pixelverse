import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export const signUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // Save user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: username,
      createdAt: new Date(),
    });
    console.log("User signed up and stored in Firestore:", user);
    return { ...user, username };
  } catch (error) {
    console.error("Error signing up:", error.message);
    const errorMessage = getErrorMessage(error.code);
    throw new Error(errorMessage);
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // Save user data in Firestore
    const userDetails = await getDoc(doc(db, "users", user.uid));
    if (userDetails.exists()) {
      console.log("User signed in:", userDetails.data());
      return userDetails.data();
    } else {
      throw new Error("User not found.");
    }
  } catch (error) {
    console.error("Error signing in:", error.message);
    const errorMessage = getErrorMessage(error.code);
    throw new Error(errorMessage);
  }
};

export const logOut = () => {
  auth.signOut();
};

// helper that returns a user-friendly error message for the given error code
const getErrorMessage = (errorCode) => {
  let errorMessage = "Something went wrong. Please try again.";
  // Map Firebase errors related to email and password authentication
  switch (errorCode) {
    case "auth/email-already-in-use":
      errorMessage = "This email is already registered. Try signing in.";
      break;
    case "auth/invalid-email":
      errorMessage = "Please enter a valid email address.";
      break;
    case "auth/internal-error":
      errorMessage = "An internal error occurred. Please try again later.";
      break;
    case "auth/too-many-requests":
      errorMessage = "Too many unsuccessful attempts. Please try again later.";
      break;
    case "auth/user-not-found":
      errorMessage = "No account found with this email. Please sign up.";
      break;
    case "auth/invalid-credential":
      errorMessage = "Incorrect password. Please try again.";
      break;
    case "auth/user-disabled":
      errorMessage =
        "This account has been disabled. Contact support for help.";
      break;
    default:
      errorMessage = "Something went wrong. Please try again.";
      break;
  }
  return errorMessage;
};
