import { Image } from "@chakra-ui/react";

export const HeaderTabType = {
  Home: "home",
  Profile: "profile",
};

interface CircleAvatarProps {
  iconUrl: string;
  size?: string;
}

export const CircleAvatar = ({ size, iconUrl }: CircleAvatarProps) => {
  return (
    <Image
      alt="icon"
      src={iconUrl}
      w="100%"
      maxW={size || "5rem"}
      borderRadius="full"
      boxSize={size || "5rem"}
      objectFit="cover"
    />
  );
};
