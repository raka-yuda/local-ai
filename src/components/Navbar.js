import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <Box bg="gray.100" px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Flex alignItems={'center'} gap={4}>
          <Link href="/">
            Home
          </Link>
          <Link href="/chat-stream">
            Chat Stream
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;