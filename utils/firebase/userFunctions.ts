import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { uploadFileToFirebase } from "./fileFunctions";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { UserFirestore, UserProfileFormData } from "@/types/user";

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
// Function to update the user's profile in the "Users" collection
export const updateUserProfile = async (
  userId: string,
  formData: UserProfileFormData,
): Promise<void> => {
  try {
    await firestore()
      .collection("Users")
      .doc(userId)
      .set(formData, { merge: true });
    console.log("User updated successfully!");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
/**
 * Fetches the updated user document from Firestore using the provided user ID.
 *
 * @param uid - The unique ID of the user.
 * @returns A Promise that resolves with the User object if found, or null if no user exists.
 */
export const getUpdatedUser = async (
  uid: string,
): Promise<UserFirestore | null> => {
  try {
    const userDoc = await firestore().collection("Users").doc(uid).get();
    if (!userDoc.exists) {
      console.warn(`User with id ${uid} does not exist.`);
      return null;
    }
    // Return the user data as a User type.
    return userDoc.data() as UserFirestore;
  } catch (error) {
    console.error(`Error fetching user with id ${uid}:`, error);
    throw error;
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

interface User {
  id: string; // Firestore document id (should be present in every document)
  data: Record<string, unknown>; // Arbitrary fields from the document, using unknown to avoid assuming a shape
}

export const getUsers = async (): Promise<User[]> => {
  try {
    // Reference to the 'Users' collection
    const usersCollectionRef = firestore().collection("Users");

    // Fetch documents from the 'Users' collection
    const querySnapshot = await usersCollectionRef.get();

    // Map through the documents to return the list of user data
    const usersList: User[] = querySnapshot.docs.map((doc) => ({
      id: doc.id, // Document ID (Firestore automatically provides this)
      data: doc.data(), // User document fields (unknown shape)
    }));

    return usersList;
  } catch (error) {
    console.error("Error fetching users: ", error);
    throw new Error("Failed to retrieve users from Firestore");
  }
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo: any = await GoogleSignin.signIn();
    console.log("User Info:", userInfo);

    const idToken: string = userInfo.data.idToken as string;
    let userCredential;
    if (!idToken) {
      const accessToken: string = userInfo.accessToken as string;
      const googleCredential = auth.GoogleAuthProvider.credential(
        null,
        accessToken,
      );
      userCredential = await auth().signInWithCredential(googleCredential);
    } else {
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      userCredential = await auth().signInWithCredential(googleCredential);
    }

    const user = userCredential.user;
    console.log("User signed in:", user);

    // Check if user exists in Firestore (in "users" collection)
    const userDocRef = firestore().collection("Users").doc(user.uid);
    const userDoc = await userDocRef.get();
    console.log("User Doc: ", userDoc.data());

    if (!userDoc.exists) {
      // User does not exist in Firestore, create a new user document
      await userDocRef.set({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        profilePicture: user.photoURL,
        followedArtists: [],
        likedTattoos: [],
        isArtist: false,
        createdAt: firestore.FieldValue.serverTimestamp(), // Add timestamp for user creation
      });
      console.log("User added to Firestore!");
      return userDoc.data();
    } else {
      console.log("User already exists in Firestore");
    }

    console.log("User signed in and data saved to Firestore!");
  } catch (error) {
    alert(error);
    console.log("Google Sign-In error:", error);
  }
};

export const toggleLikePublication = async (
  publicationId: string,
  userId: string,
) => {
  const publicationRef = firestore()
    .collection("publications")
    .doc(publicationId);
  const userRef = firestore().collection("Users").doc(userId);

  try {
    await firestore().runTransaction(async (transaction) => {
      // Get the user document to check likedItems
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User does not exist");
      }
      const userData = userDoc.data() || {};
      const likedItems: string[] = userData.likedItems || [];

      // Determine if the publication is already liked
      const alreadyLiked = likedItems.includes(publicationId);
      const incrementValue = alreadyLiked ? -1 : 1;

      // Update publication: increment or decrement likes
      transaction.update(publicationRef, {
        likes: firestore.FieldValue.increment(incrementValue),
      });

      // Update user: remove or add publicationId to likedItems array
      transaction.update(userRef, {
        likedItems: alreadyLiked
          ? firestore.FieldValue.arrayRemove(publicationId)
          : firestore.FieldValue.arrayUnion(publicationId),
      });
    });
    console.log("Publication like toggled successfully.");
  } catch (error) {
    console.error("Error toggling publication like:", error);
  }
};
