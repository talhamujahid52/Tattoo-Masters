import { Text, View } from "react-native";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Welcome from "./(auth)/Welcome";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  return <Welcome></Welcome>;
}
