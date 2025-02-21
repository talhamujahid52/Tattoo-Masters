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

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export interface TattooStyle {
  selected: boolean;
  title: string;
}

export interface UserProfileFormData {
  aboutYou: string;
  city: string;
  fullName: string;
  images: string[];
  location: LocationData;
  profilePicture: string;
  showCityOnly: boolean;
  studio: string;
  studioName: string;
  tattooStyles: TattooStyle[];
  isArtist: boolean;
}
