import { useSelector } from "react-redux";
const useGetArtist = (artistId: any) => {
  const artistObject = useSelector((state: any) => {
    const allArtists = state.artist.allArtists;
    const artist = allArtists.find((item: any) => item.id === artistId);
    return artist;
  });
  return artistObject;
};

export default useGetArtist;
