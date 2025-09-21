import { StyleSheet, View, FlatList, Dimensions } from "react-native";
import Text from "@/components/Text";
import ImageGallery from "@/components/ImageGallery";
import React from "react";
import { useRealtimeUserLikedPublications } from "@/hooks/useRealtimeLikedPublications";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useSelector } from "react-redux";
import { Publication, TypesenseResult } from "@/hooks/useTypesense";

const FavouriteTattoos = () => {
  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const currentUserId = loggedInUser?.uid;
  const likedPublicationsData = useRealtimeUserLikedPublications(currentUserId);
  const totalLiked = likedPublicationsData?.likedPublications?.length ?? 0;

  return (
    <View style={{ flex: 1, paddingVertical: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingBottom: 16,
        }}
      >
        <Text size="p" weight="normal" color="#A7A7A7">
          {totalLiked ?? 0} liked tattoo{totalLiked !== 1 && "s"}
        </Text>
      </View>
      {likedPublicationsData?.likedPublications.length > 1 ? (
        <ImageGallery
          images={
            likedPublicationsData.likedPublications.map((item) => ({
              document: item,
            })) as TypesenseResult<Publication>[]
          }
        ></ImageGallery>
      ) : (
        <View style={styles.emptyContainer}>
          <Text size="h4" weight="medium" color="#A7A7A7">
            You have no favorite tattoos here
          </Text>
          <Text
            size="p"
            weight="normal"
            color="#A7A7A7"
            style={styles.emptyText}
          >
            Your favorited tattoos will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

export default FavouriteTattoos;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
  },
});
