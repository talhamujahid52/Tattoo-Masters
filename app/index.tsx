import { Text, View } from "react-native";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { router } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button
        title="Login"
        onPress={() => {
          router.push({
            pathname: "/(auth)/Welcome",
          });
        }}
      ></Button>
      <Input inputMode="password"></Input>
    </View>
  );
}
