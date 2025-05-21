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
  aboutYou: string;
  address: string;
  city: string;
  createdAt: number;
  email: string;
  followedArtists: any[];
  fullName: string;
  id: string;
  images: string[];
  isArtist: boolean;
  likedTattoos: any[];
  location: LocationData;
  name: string;
  phoneNumber: string;
  profilePicture: string;
  profilePictureDeleteUrls: ProfilePictureDeleteUrls;
  profilePictureHigh: string;
  profilePictureMedium: string;
  profilePictureSmall: string;
  profilePictureVeryHigh: string;
  showCityOnly: boolean;
  studio: string;
  studioName: string;
  tattooStyles: string[];
  uid: string;
}

export interface LocationData {
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
  name: string;
  images: {
    uri: string;
    name: string;
    caption: string;
    styles: string[];
  }[];
  location: LocationData;
  address: string;
  profilePicture: string;
  showCityOnly: boolean;
  studio: string;
  studioName: string;
  tattooStyles: string[];
  isArtist: boolean;
}
