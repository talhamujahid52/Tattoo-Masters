import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { uploadFileToFirebase } from "./fileFunctions";

/**
 * Adds a new user to Firebase Firestore.
 * @param userData The user data to add to the Firestore `Users` collection.
 * @param profilePicture The profile picture file to upload (optional).
 * @returns A promise that resolves when the user is successfully added.
 */
export const addUser = async (
  userData: {
    name: string;
    rating: number;
    location: string;
    reviewPasswordHash: string;
    userType: "simple" | "tattooArtist";
  },
  profilePicture: { uri: string; fileName?: string } | null,
): Promise<void> => {
  try {
    let profilePictureUrl = "";

    // Upload profile picture to Firebase Storage if provided
    if (profilePicture) {
      profilePictureUrl = await uploadFileToFirebase(
        profilePicture,
        "profilePictures",
      );
    }

    // Add user data to Firestore
    const userDocument = {
      ...userData,
      profilePicture: profilePictureUrl,
    };

    await firestore().collection("Users").add(userDocument);
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    throw new Error("Failed to add user.");
  }
};

export const createUserWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    return userCredential;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    ); // Use user input for login
    return userCredential;
  } catch (error) {
    throw error;
  }
};
