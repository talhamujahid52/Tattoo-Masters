import {
  filterBlockedArtists,
  filterHiddenChats,
  filterHiddenPublications,
  filterHiddenReviews,
} from "../safetyFilters";

describe("safety filters", () => {
  it("reporting one tattoo hides only that tattoo", () => {
    const tattoos = [
      { document: { id: "tattoo-a", userId: "artist-a" } },
      { document: { id: "tattoo-b", userId: "artist-a" } },
      { document: { id: "tattoo-c", userId: "artist-b" } },
    ];

    expect(filterHiddenPublications(tattoos, [], ["tattoo-a"])).toEqual([
      tattoos[1],
      tattoos[2],
    ]);
  });

  it("blocking an owner hides all supported artist and content shapes", () => {
    const artists = [
      { id: "artist-a", data: { uid: "artist-a" } },
      { id: "artist-b", data: { uid: "artist-b" } },
    ];
    const tattoos = [
      { document: { id: "tattoo-a", userId: "artist-a" } },
      { id: "tattoo-b", userId: "artist-b" },
    ];
    const reviews = [
      { id: "review-a", user: "artist-a" },
      { id: "review-b", user: "artist-b" },
    ];

    expect(filterBlockedArtists(artists, ["artist-a"])).toEqual([
      artists[1],
    ]);
    expect(filterHiddenPublications(tattoos, ["artist-a"], [])).toEqual([
      tattoos[1],
    ]);
    expect(filterHiddenReviews(reviews, ["artist-a"], [])).toEqual([
      reviews[1],
    ]);
  });

  it("keeps separately reported items hidden after an owner is unblocked", () => {
    const reviews = [
      { id: "review-a", user: "artist-a" },
      { id: "review-b", user: "artist-a" },
    ];

    expect(filterHiddenReviews(reviews, [], ["review-a"])).toEqual([
      reviews[1],
    ]);
  });

  it("hides blocker-side chats but leaves a reverse-blocked chat readable", () => {
    const chats = [
      {
        id: "hidden-for-viewer",
        participants: ["viewer", "artist-a"],
        hiddenFor: ["viewer"],
      },
      {
        id: "reverse-block-history",
        participants: ["viewer", "artist-b"],
        disabledParticipants: ["viewer", "artist-b"],
      },
    ];

    expect(filterHiddenChats(chats, "viewer", ["artist-a"])).toEqual([
      chats[1],
    ]);
  });
});
