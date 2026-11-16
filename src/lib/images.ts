/** Public URL of an image in the Images bucket. */
export const imageUrl = (key: string) => `${process.env.NEXT_PUBLIC_IMAGES_URL}/${key}`;
