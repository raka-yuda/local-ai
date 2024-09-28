// import React from 'react';
// import { Box, Button, HStack, Text, useClipboard } from "@chakra-ui/react";

// function CodeBlock({ code, language }) {
//   const { hasCopied, onCopy } = useClipboard(code);

//   return (
//     <Box borderWidth={1} borderRadius="md" overflow="hidden" my={4}>
//       <HStack bg="gray.100" p={2} justifyContent="space-between">
//         <Text fontSize="sm">{language}</Text>
//         <Button onClick={onCopy} size="sm">
//           {hasCopied ? 'Copied!' : 'Copy'}
//         </Button>
//       </HStack>
//       <Box p={4} bg="gray.50" overflowX="auto">
//         <pre style={{ margin: 0 }}>
//           <code style={{ whiteSpace: 'pre', wordBreak: 'keep-all', overflowWrap: 'normal' }}>
//             {code}
//           </code>
//         </pre>
//       </Box>
//     </Box>
//   );
// }

// export default CodeBlock;

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast';
import { ClipboardIcon, CheckIcon } from '@radix-ui/react-icons';

function CodeBlock({ code, language }) {
  // const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    // toast({
    //   title: 'Code copied!',
    //   description: 'You have copied the code to your clipboard.',
    // });

    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Card className="my-4 border bg-white">
      <CardHeader className="flex flex-row justify-between items-center p-0 pb-1 px-4 bg-gray-100 rounded-t-lg ">
        {/* <div className="flex items-center justify-between space-x-2">
        </div> */}
        <span className="text-xs font-mono">{language}</span>
        <Button size="sm" onClick={onCopy} variant="outline" className={"mt-0"}>
          {hasCopied ? <CheckIcon className="mr-2" /> : <ClipboardIcon className="mr-2" />}
          {hasCopied ? 'Copied!' : 'Copy'}
        </Button>
      </CardHeader>
      <CardContent className="p-4 bg-gray-50 overflow-auto rounded-b-lg text-sm">
        <pre className="m-0">
          <code className="whitespace-pre break-all">{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

export default CodeBlock;
