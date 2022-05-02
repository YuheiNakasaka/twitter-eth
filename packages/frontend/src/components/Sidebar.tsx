import Link from "next/link";
import {
  Flex,
  Box,
  Text,
  Icon,
  Spacer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Heading,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { RiHome7Line, RiHome7Fill } from "react-icons/ri";
import { BsPerson, BsPersonFill, BsTwitter, BsGithub } from "react-icons/bs";
import { FaEthereum } from "react-icons/fa";
import { FlatButton } from "components/FlatButton";
import { useRef } from "react";

export const HeaderTabType = {
  Home: "home",
  Profile: "profile",
};

interface SideBarProps {
  account: string | null | undefined;
  type: string;
}

export const SideBar = ({ account, type }: SideBarProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Flex
        flexBasis={{
          base: "100%",
          xl: "20ch",
        }}
        flexGrow={1}
        flexDir={{
          base: "row",
          xl: "column",
        }}
        borderX={{
          base: "1px solid #eee",
          xl: "0",
        }}
        borderBottom={{
          base: "1px solid #eee",
          xl: "0",
        }}
      >
        <Flex
          h={{
            base: "auto",
            xl: "100vh",
          }}
          flexDir={{
            base: "row",
            xl: "column",
          }}
          position={{
            base: "relative",
            xl: "fixed",
          }}
          top={{
            base: "auto",
            xl: 0,
          }}
        >
          <Flex
            p={{
              base: "1rem 1rem 1rem 1rem",
              xl: "1rem",
            }}
          >
            <Link href={`/`} passHref>
              <FlatButton>
                <Icon
                  as={BsTwitter}
                  mr="1rem"
                  fontSize="2rem"
                  fontWeight="bold"
                  color="#1DA1F2"
                />
              </FlatButton>
            </Link>
          </Flex>
          <Link href={`/`} passHref>
            <FlatButton>
              <Flex
                p={{
                  base: "1rem",
                  xl: "1rem",
                }}
              >
                <Icon
                  as={type == HeaderTabType.Home ? RiHome7Fill : RiHome7Line}
                  mr="1rem"
                  fontSize="2rem"
                />
                <Text
                  fontSize="1.4rem"
                  fontWeight={type == HeaderTabType.Home ? "bold" : "normal"}
                  display={{
                    base: "none",
                    xl: "block",
                  }}
                >
                  Home
                </Text>
              </Flex>
            </FlatButton>
          </Link>
          {account && (
            <Link href={`/${account}`} passHref>
              <FlatButton>
                <Flex
                  p={{
                    base: "1rem",
                    xl: "0 1rem 1rem 1rem",
                  }}
                >
                  <Icon
                    as={type == HeaderTabType.Profile ? BsPersonFill : BsPerson}
                    mr="1rem"
                    fontSize="2rem"
                  />
                  <Text
                    fontSize="1.4rem"
                    fontWeight={
                      type == HeaderTabType.Profile ? "bold" : "normal"
                    }
                    display={{
                      base: "none",
                      xl: "block",
                    }}
                  >
                    Profile
                  </Text>
                </Flex>
              </FlatButton>
            </Link>
          )}
          <Spacer />
          <FlatButton onClick={onOpen}>
            <Flex
              p={{
                base: "1rem",
                xl: "0 1rem 1rem 1rem",
              }}
            >
              <Icon as={FaEthereum} mr="1rem" fontSize="1.5rem" />
              <Text
                fontSize="1rem"
                fontWeight={"normal"}
                display={{
                  base: "none",
                  xl: "block",
                }}
              >
                zkSync
              </Text>
            </Flex>
          </FlatButton>
        </Flex>
      </Flex>

      <Modal
        onClose={onClose}
        finalFocusRef={btnRef}
        isOpen={isOpen}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Twitter ETH on Ethereum(zkSync)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir="column" flexWrap="wrap" justifyContent="start">
              <Box mb="1rem">
                <Heading size="md" pb="0.5rem">
                  About
                </Heading>
                <Text>
                  Twitter ETH is a new dapp like the Twitter. The all data
                  exists full on-chain, so all action required very high gas
                  fee😎
                </Text>
              </Box>
              <Box mb="1rem">
                <Heading size="md" pb="0.5rem">
                  Features
                </Heading>
                <Text>・Home(global timeline)</Text>
                <Text>・Profile(my timeline)</Text>
                <Text>・Follow/Unfollow</Text>
                <Text>・Followings list</Text>
                <Text>・Followers list</Text>
                <Text>・Posting text tweets</Text>
                <Text>・Uploading tiny images(~5KB) to on-chain</Text>
                <Text>・Auto-Mint a tweet text as a NFT</Text>
                <Text>・Likes(Only once)</Text>
                <Text>・RTs(Many times)</Text>
                <Text>・Comments</Text>
                <Text>・NFT Icon</Text>
                <Text>・Nobody can delete all actions.</Text>
                <Text>
                  ・Likes and RT will keep the count at the time you do them.
                </Text>
              </Box>
              <Box mb="1rem">
                <Heading size="md" pb="0.5rem">
                  Links
                </Heading>
                <ChakraLink
                  href="https://github.com/YuheiNakasaka/twitter-eth/tree/zksync"
                  isExternal
                >
                  <Icon as={BsGithub} mr="1rem" fontSize="1.5rem" />
                </ChakraLink>
                <ChakraLink href="https://twitter.com/razokulover" isExternal>
                  <Icon as={BsTwitter} mr="1rem" fontSize="1.5rem" />
                </ChakraLink>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
