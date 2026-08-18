type IdCollection = readonly string[] | ReadonlySet<string>;

const toIdSet = (ids: IdCollection): ReadonlySet<string> =>
  Array.isArray(ids)
    ? new Set(ids.filter(Boolean))
    : new Set(Array.from(ids as ReadonlySet<string>));

const firstString = (...values: unknown[]): string | undefined =>
  values.find((value): value is string =>
    Boolean(typeof value === "string" && value),
  );

export const getArtistUserId = (artist: any): string | undefined =>
  firstString(
    artist?.uid,
    artist?.id,
    artist?.userId,
    artist?.data?.uid,
    artist?.data?.id,
    artist?.data?.userId,
    artist?.document?.uid,
    artist?.document?.userId,
  );

export const getContentOwnerId = (content: any): string | undefined =>
  firstString(
    content?.userId,
    content?.ownerId,
    content?.authorId,
    content?.user,
    content?.createdBy,
    content?.data?.userId,
    content?.data?.ownerId,
    content?.data?.authorId,
    content?.data?.user,
    content?.document?.userId,
    content?.document?.ownerId,
    content?.document?.authorId,
    content?.document?.user,
  );

export const getContentId = (content: any): string | undefined =>
  firstString(
    content?.id,
    content?.targetId,
    content?.publicationId,
    content?.reviewId,
    content?.data?.id,
    content?.document?.id,
  );

export const isUserBlocked = (
  userId: string | null | undefined,
  blockedUserIds: IdCollection,
) => Boolean(userId && toIdSet(blockedUserIds).has(userId));

export const filterBlockedArtists = <T>(
  artists: readonly T[],
  blockedUserIds: IdCollection,
): T[] => {
  const blocked = toIdSet(blockedUserIds);
  return artists.filter((artist) => {
    const userId = getArtistUserId(artist);
    return !userId || !blocked.has(userId);
  });
};

export const filterBlockedContent = <T>(
  content: readonly T[],
  blockedUserIds: IdCollection,
): T[] => {
  const blocked = toIdSet(blockedUserIds);
  return content.filter((item) => {
    const ownerId = getContentOwnerId(item);
    return !ownerId || !blocked.has(ownerId);
  });
};

export const filterHiddenPublications = <T>(
  publications: readonly T[],
  blockedUserIds: IdCollection,
  reportedPublicationIds: IdCollection,
): T[] => {
  const blocked = toIdSet(blockedUserIds);
  const reported = toIdSet(reportedPublicationIds);
  return publications.filter((publication) => {
    const ownerId = getContentOwnerId(publication);
    const publicationId = getContentId(publication);
    return (
      (!ownerId || !blocked.has(ownerId)) &&
      (!publicationId || !reported.has(publicationId))
    );
  });
};

export const filterHiddenReviews = <T>(
  reviews: readonly T[],
  blockedUserIds: IdCollection,
  reportedReviewIds: IdCollection,
): T[] => {
  const blocked = toIdSet(blockedUserIds);
  const reported = toIdSet(reportedReviewIds);
  return reviews.filter((review) => {
    const ownerId = getContentOwnerId(review);
    const reviewId = getContentId(review);
    return (
      (!ownerId || !blocked.has(ownerId)) &&
      (!reviewId || !reported.has(reviewId))
    );
  });
};

export const getChatParticipantIds = (chat: any): string[] => {
  const rawParticipants =
    chat?.participantIds ??
    chat?.participants ??
    chat?.userIds ??
    chat?.members ??
    chat?.data?.participantIds ??
    chat?.data?.participants ??
    chat?.data?.userIds ??
    chat?.data?.members;

  if (Array.isArray(rawParticipants)) {
    return rawParticipants.filter(
      (participant): participant is string => typeof participant === "string",
    );
  }

  if (rawParticipants && typeof rawParticipants === "object") {
    return Object.keys(rawParticipants);
  }

  return [];
};

export const filterHiddenChats = <T>(
  chats: readonly T[],
  currentUserId: string,
  blockedUserIds: IdCollection,
): T[] => {
  const blocked = toIdSet(blockedUserIds);
  return chats.filter((chat) => {
    const hiddenFor = Array.isArray((chat as any)?.hiddenFor)
      ? (chat as any).hiddenFor
      : Array.isArray((chat as any)?.data?.hiddenFor)
        ? (chat as any).data.hiddenFor
        : [];

    if (hiddenFor.includes(currentUserId)) return false;

    return !getChatParticipantIds(chat).some(
      (participantId) =>
        participantId !== currentUserId && blocked.has(participantId),
    );
  });
};
