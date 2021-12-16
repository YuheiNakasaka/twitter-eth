import { Button } from "@chakra-ui/button";
import { ReactNode, forwardRef } from "react";

interface FlatButtonProps {
  children: ReactNode;
  onClick?: () => void;
}
export const FlatButton = forwardRef<HTMLButtonElement, FlatButtonProps>(
  ({ children, onClick }, ref) => {
    return (
      <Button
        ref={ref}
        border="0"
        backgroundColor="transparent"
        p="0"
        m="0"
        h="auto"
        display="inline"
        lineHeight="1.5"
        _hover={{ bg: "transparent" }}
        _focus={{ bg: "transparent" }}
        onClick={onClick}
      >
        {children}
      </Button>
    );
  }
);
