export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface ProfilePictureDeleteUrls {
  high: string;
  medium: string;
  small: string;
  veryHigh: string;
}

export interface UserFirestore {
  createdAt: FirebaseTimestamp;
  email: string;
  followedArtists: string[]; // Adjust if followedArtists should contain objects instead of strings
  isArtist: boolean;
  likedTattoos: string[]; // Adjust if likedTattoos should contain objects instead of strings
  name: string;
  profilePicture: string;
  profilePictureDeleteUrls: ProfilePictureDeleteUrls;
  profilePictureHigh: string;
  profilePictureMedium: string;
  profilePictureSmall: string;
  profilePictureVeryHigh: string;
  uid: string;
}
