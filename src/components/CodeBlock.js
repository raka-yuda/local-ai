import React from 'react';
import { Box, Button, HStack, Text, useClipboard } from "@chakra-ui/react";

function CodeBlock({ code, language }) {
  const { hasCopied, onCopy } = useClipboard(code);

  return (
    <Box borderWidth={1} borderRadius="md" overflow="hidden" my={4}>
      <HStack bg="gray.100" p={2} justifyContent="space-between">
        <Text fontSize="sm">{language}</Text>
        <Button onClick={onCopy} size="sm">
          {hasCopied ? 'Copied!' : 'Copy'}
        </Button>
      </HStack>
      <Box p={4} bg="gray.50" overflowX="auto">
        <pre style={{ margin: 0 }}>
          <code style={{ whiteSpace: 'pre', wordBreak: 'keep-all', overflowWrap: 'normal' }}>
            {code}
          </code>
        </pre>
      </Box>
    </Box>
  );
}

export default CodeBlock;