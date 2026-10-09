import * as Linking from "expo-linking";

export type OwnLinkType = "artist" | "tattoo";

// Matches our own share links inside free text, e.g.
// https://www.tattoomasters.app/artist/<id> or https://tattoomasters.app/tattoo/<id>
export const OWN_LINK_PATTERN =
  /https?:\/\/(?:www\.)?tattoomasters\.app\/(?:artist|tattoo)\/[^\s/?#]+(?:[?#][^\s]*)?/gi;

// Maps a shared link (https://tattoomasters.app/artist/<id>, /tattoo/<id>, or
// the same paths on the custom scheme) to the route that shows it.
export const routeFromLaunchURL = (
  url: string,
): { pathname: string; params: Record<string, string> } | null => {
  try {
    const { scheme, hostname, path, queryParams } = Linking.parse(url);
    // On the custom scheme (myapp://artist/<id>) the first segment parses as
    // the hostname, so put it back in front of the path.
    const isWebLink = scheme === "https" || scheme === "http";
    const fullPath = isWebLink
      ? path
      : [hostname, path].filter(Boolean).join("/");
    const match = fullPath?.match(/^\/?(artist|tattoo)\/([^/?#]+)\/?$/);
    if (!match) return null;
    const params: Record<string, string> = {};
    Object.entries(queryParams ?? {}).forEach(([key, value]) => {
      if (typeof value === "string") params[key] = value;
    });
    return { pathname: `/${match[1]}/${match[2]}`, params };
  } catch {
    return null;
  }
};

export const parseOwnLink = (
  url: string,
): { type: OwnLinkType; id: string } | null => {
  const route = routeFromLaunchURL(url);
  if (!route) return null;
  const [, type, id] = route.pathname.split("/");
  if (type !== "artist" && type !== "tattoo") return null;
  return { type, id };
};

// Every own link found in a piece of text.
export const findOwnLinks = (text: string | undefined | null) => {
  if (!text) return [];
  const links: { type: OwnLinkType; id: string }[] = [];
  for (const match of text.match(OWN_LINK_PATTERN) ?? []) {
    const parsed = parseOwnLink(match);
    if (parsed) links.push(parsed);
  }
  return links;
};
