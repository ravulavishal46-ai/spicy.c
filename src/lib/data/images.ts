/**
 * All photography lives in this one file so it is easy to swap for your own
 * restaurant shots later. Each entry is an Unsplash photo id.
 * If a photo can't load, <FoodImage> shows a designed fallback instead.
 */
export function unsplash(id: string, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export const photos = {
  hero: unsplash("1504674900247-0877df9cc836", 1800),
  chef: unsplash("1556910103-1c02745aae4d", 1400),
  kitchen: unsplash("1517248135467-4c7edcad34c4", 1400),
  spices: unsplash("1596040033229-a9821ebd058d", 1400),
  chilies: unsplash("1583119022894-919a68a3d0e3", 1400),
  auth: unsplash("1555939594-58d7cb561ad1", 1400),
} as const;
