import * as React from "react";
import {
  View,
  useWindowDimensions,
  Dimensions,
  StyleSheet,
} from "react-native";
import { TabView, SceneMap, TabBar, TabViewProps } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FavouriteArtists from "@/app/artist/FavouriteArtists";
import FavouriteTattoos from "@/app/artist/FavouriteTattoos";

interface Route {
  key: string;
  title: string;
}

const FirstRoute: React.FC = () => (
  <View style={{ flex: 1, backgroundColor: "#ff4081" }} />
);

const SecondRoute: React.FC = () => <View style={{ flex: 1 }} />;

const renderScene = SceneMap({
  first: FavouriteArtists,
  second: FavouriteTattoos,
});

const routes: Route[] = [
  { key: "first", title: "Artists" },
  { key: "second", title: "Tattoos" },
];

const TabViewExample: React.FC = () => {
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState<number>(0);
  const { width } = Dimensions.get("window");

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{
        backgroundColor: "white",
        height: 40,
        borderRadius: 40,
        margin: 5,
        width: (width * 0.6) / 2 - 10,
      }}
      style={{
        backgroundColor: "#000",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: width * 0.6,
        alignSelf: "center",
      }}
      activeColor="black"
      inactiveColor="white"
      indicatorContainerStyle={{
        backgroundColor: "#1A1A1A",
        borderRadius: 40,
      }}
    />
  );

  return (
    <TabView
      renderTabBar={renderTabBar}
      style={{ paddingTop: insets.top, backgroundColor: "#000" }}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      // pagerStyle={{ backgroundColor: "green" }}
    />
  );
};

export default TabViewExample;
