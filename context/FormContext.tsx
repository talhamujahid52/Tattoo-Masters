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

type FormData = {
  name: string;
  studio: string;
  studioName: string;
  city: string;
  location: Location;
  address: string;
  showCityOnly: boolean;
  tattooStyles: TattooStyle[];
  aboutYou: string;
  images: string[];
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
    name: "",
    studio: "",
    studioName: "",
    city: "",
    address: "",
    location: { latitude: 0, longitude: 0 },
    showCityOnly: true,
    tattooStyles: [
      { title: "Tribal", selected: false },
      { title: "Geometric", selected: false },
      { title: "Black and White", selected: false },
    ],
    aboutYou: "",
    images: ["", "", "", ""],
  });

  const [step, setStep] = useState<number>(1);

  return (
    <FormContext.Provider value={{ formData, setFormData, step, setStep }}>
      {children}
    </FormContext.Provider>
  );
};

export { FormContext, FormProvider };
