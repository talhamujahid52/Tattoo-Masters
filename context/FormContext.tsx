// FormContext.tsx
import React, { createContext, useState, ReactNode } from "react";

type Location = {
  latitude: number;
  longitude: number;
};

type TattooStyle = {
  title: string;
  selected: boolean;
};

type ImageObject = {
  uri: string;
  name: string;
  caption: string;
  styles: string[];
};

type FormData = {
  profilePicture: string | null;
  name: string;
  studio: string;
  studioName: string;
  city: string;
  location: Location;
  address: string;
  showCityOnly: boolean;
  tattooStyles: TattooStyle[];
  aboutYou: string;
  images: ImageObject[];
  reviewPassword: string;
  followersCount: number;
  facebookProfile: string;
  instagramProfile: string;
  twitterProfile: string;
};

type FormContextType = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

type FormProviderProps = {
  children: ReactNode;
};

const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>({
    profilePicture: null,
    name: "",
    studio: "",
    studioName: "",
    city: "",
    address: "",
    location: { latitude: 0, longitude: 0 },
    showCityOnly: false,
    tattooStyles: [],
    aboutYou: "",
    images: [
      { uri: "", name: "", caption: "", styles: [] },
      { uri: "", name: "", caption: "", styles: [] },
      { uri: "", name: "", caption: "", styles: [] },
      { uri: "", name: "", caption: "", styles: [] },
    ],
    reviewPassword: "",
    followersCount: 0,
    facebookProfile: "",
    instagramProfile: "",
    twitterProfile: "",
  });

  const [step, setStep] = useState<number>(1);

  return (
    <FormContext.Provider value={{ formData, setFormData, step, setStep }}>
      {children}
    </FormContext.Provider>
  );
};

export { FormContext, FormProvider };
