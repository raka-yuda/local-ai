// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Box, VStack, HStack, Textarea, Button, Text, Flex, OrderedList, ListItem, Code, IconButton } from "@chakra-ui/react";
// import CodeBlock from './CodeBlock';
// import Sidebar from './Sidebar';
// import { ArrowForwardIcon } from '@chakra-ui/icons';

// function ChatStream() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const streamingMessageRef = useRef('');

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }

//   useEffect(scrollToBottom, [messages]);

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   if (!input.trim()) return;

//   //   const userMessage = { role: 'user', content: input };
//   //   setMessages(prevMessages => [...prevMessages, userMessage]);
//   //   setInput('');
//   //   setIsLoading(true);

//   //   try {
//   //     console.log('Sending request to /api/chat-stream');
//   //     const response = await fetch('/api/chat-stream', {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify({ message: input }),
//   //     });

//   //     if (!response.ok) {
//   //       throw new Error(`HTTP error! status: ${response.status}`);
//   //     }

//   //     const data = await response.json();
//   //     console.log('Received response:', data);

//   //     if (data.message) {
//   //       const assistantMessage = { role: 'assistant', content: data.message };
//   //       setMessages(prevMessages => [...prevMessages, assistantMessage]);
//   //     } else {
//   //       console.error('No message in response:', data);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error:', error);
//   //     setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const handleSubmit = useCallback(async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userMessage = { role: 'user', content: input };
//     setMessages(prevMessages => [...prevMessages, userMessage]);
//     setInput('');
//     setIsLoading(true);
//     streamingMessageRef.current = '';

//     try {
//       const response = await fetch('/api/chat-stream', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: input }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         const chunk = decoder.decode(value);
        
//         const lines = chunk.split('\n');
//         for (const line of lines) {
//           if (line.startsWith('data:')) {
//             const data = JSON.parse(line.slice(5));
//             let messageId;

//             if (data.type === 'message_start') {
//               messageId = data.message.id;
//             }

//             if (data.type === 'content_block_start' || data.type === 'content_block_delta') {
//               if (data.delta && data.delta.text) {
//                 streamingMessageRef.current += data.delta.text;
//                 setMessages(prevMessages => {
//                   const newMessages = [...prevMessages];
//                   const lastMessage = newMessages[newMessages.length - 1];
//                   if (lastMessage.role === 'assistant') {
//                     lastMessage.content = streamingMessageRef.current;
//                   } else {
//                     newMessages.push({ role: 'assistant', content: streamingMessageRef.current, id: messageId });
//                   }
//                   return newMessages;
//                 });
//               }
//             }
//             if (data.type === 'message_stop') {
//               setIsLoading(false);
//             }              
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [input]);

//   const renderMessage = (content) => {
//     const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
//     const inlineCodeRegex = /`([^`\n]+)`/g;
//     const orderedListRegex = /^\d+\.\s(.+)$/gm;
    
//     const parts = [];
//     let lastIndex = 0;
//     let match;

//     while ((match = codeBlockRegex.exec(content)) !== null) {
//       if (match.index > lastIndex) {
//         parts.push(renderTextWithInlineCodeAndLists(content.slice(lastIndex, match.index)));
//       }
//       const [, language, code] = match;
//       parts.push(<CodeBlock key={match.index} code={code.trim()} language={language || 'text'} />);
//       lastIndex = match.index + match[0].length;
//     }

//     if (lastIndex < content.length) {
//       parts.push(renderTextWithInlineCodeAndLists(content.slice(lastIndex)));
//     }

//     return parts.length > 0 ? parts : content;
//   };

//   const renderTextWithInlineCodeAndLists = (text) => {
//     const inlineCodeRegex = /`([^`\n]+)`/g;
//     const orderedListRegex = /^\d+\.\s(.+)$/gm;

//     let parts = [];
//     let lastIndex = 0;
//     let match;

//     // Handle inline code
//     while ((match = inlineCodeRegex.exec(text)) !== null) {
//       if (match.index > lastIndex) {
//         parts.push(text.slice(lastIndex, match.index));
//       }
//       parts.push(<Code key={match.index} px={1} bg="gray.100" borderRadius="sm">{match[1]}</Code>);
//       lastIndex = match.index + match[0].length;
//     }

//     if (lastIndex < text.length) {
//       parts.push(text.slice(lastIndex));
//     }

//     // Handle ordered lists
//     const listItems = text.match(orderedListRegex);
//     if (listItems) {
//       return (
//         <OrderedList>
//           {listItems.map((item, index) => (
//             <ListItem key={index}>{item.replace(/^\d+\.\s/, '')}</ListItem>
//           ))}
//         </OrderedList>
//       );
//     }

//     return parts;
//   };

//   return (
//     <Flex direction="column" h="100vh" w="100vw" overflow="hidden">
//       <Sidebar />
//       <Flex justify="center" flex={1} overflow="hidden" bg="gray.100" pt={8}>
//         <VStack 
//           flex={1} 
//           maxW="800px" 
//           h="100%" 
//           overflowY="auto" 
//           spacing={4} 
//           p={4} 
//           alignItems="stretch"
//           bg="white"
//           borderRadius="md"
//           boxShadow="md"
//           m={4}
//         >
//           {messages.map((msg, index) => (
//             <Box 
//               key={index} 
//               alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
//               bg={msg.role === 'user' ? 'teal.100' : 'gray.100'}
//               p={3}
//               borderRadius="lg"
//               maxW="70%"
//             >
//               <Text>{renderMessage(msg.content)}</Text>
//             </Box>
//           ))}
//           {isLoading && (
//             <Box alignSelf="flex-start" bg="gray.100" p={3} borderRadius="lg">
//               <Text fontStyle="italic" color="gray.500">
//                 Assistant is typing
//                 <span className="animate-pulse">...</span>
//               </Text>
//             </Box>
//           )}
//           <div ref={messagesEndRef} />
//         </VStack>
//       </Flex>
//       <Box as="form" onSubmit={handleSubmit} p={4} bg="white" borderTop="1px" borderColor="gray.200">
//         <HStack maxW="800px" mx="auto" spacing={3} alignItems="flex-end">
//           <Textarea
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Type your message..."
//             size="md"
//             borderRadius="md"
//             minH="40px"
//             maxH="200px"
//             resize="none"
//             overflowY="auto"
//             flex={1}
//           />
//           <IconButton
//             type="submit"
//             icon={<ArrowForwardIcon />}
//             isLoading={isLoading}
//             colorScheme="teal"
//             size="md"
//             borderRadius="md"
//             aria-label="Send message"
//           />
//         </HStack>
//       </Box>
//     </Flex>
//   );
// }

// export default ChatStream;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight } from "lucide-react";
import CodeBlock from './CodeBlock'; // Assuming you have a CodeBlock component
import Sidebar from './Sidebar'; // Assuming you have a Sidebar component
import useAutosizeTextArea from '@/hooks/useAutosizeTextArea';

function ChatStream() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const streamingMessageRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    streamingMessageRef.current = '';

    try {
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = JSON.parse(line.slice(5));
            let messageId;

            if (data.type === 'message_start') {
              messageId = data.message.id;
            }

            if (data.type === 'content_block_start' || data.type === 'content_block_delta') {
              if (data.delta && data.delta.text) {
                streamingMessageRef.current += data.delta.text;
                setMessages(prevMessages => {
                  const newMessages = [...prevMessages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content = streamingMessageRef.current;
                  } else {
                    newMessages.push({ role: 'assistant', content: streamingMessageRef.current, id: messageId });
                  }
                  return newMessages;
                });
              }
            }
            if (data.type === 'message_stop') {
              setIsLoading(false);
            }              
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const renderMessage = (content) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    const inlineCodeRegex = /`([^`\n]+)`/g;
    const orderedListRegex = /^\d+\.\s(.+)$/gm;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderTextWithInlineCodeAndLists(content.slice(lastIndex, match.index)));
      }
      const [, language, code] = match;
      parts.push(<CodeBlock key={match.index} code={code.trim()} language={language || 'text'} />);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(renderTextWithInlineCodeAndLists(content.slice(lastIndex)));
    }

    return parts.length > 0 ? parts : content;
  };

  const renderTextWithInlineCodeAndLists = (text) => {
    const inlineCodeRegex = /`([^`\n]+)`/g;
    const orderedListRegex = /^\d+\.\s(.+)$/gm;

    let parts = [];
    let lastIndex = 0;
    let match;

    // Handle inline code
    while ((match = inlineCodeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(<code key={match.index} className="px-1 bg-gray-100 rounded-sm">{match[1]}</code>);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    // Handle ordered lists
    const listItems = text.match(orderedListRegex);
    if (listItems) {
      return (
        <ol className="list-decimal list-inside">
          {listItems.map((item, index) => (
            <li key={index}>{item.replace(/^\d+\.\s/, '')}</li>
          ))}
        </ol>
      );
    }

    return parts;
  };

  const textAreaRef = useRef(null);

  useAutosizeTextArea(textAreaRef.current, input);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 ">
      <Sidebar />
      <div className="flex justify-center flex-1 overflow-hidden pt-8">
        <ScrollArea className="flex-1 max-w-3xl h-full bg-white rounded-[24px] shadow m-4">
          <div className="space-y-4 p-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-2xl max-w-[70%] ${
                  msg.role === 'user' ? 'ml-auto bg-teal-100 rounded-br-none' : 'mr-auto bg-gray-100 rounded-bl-none'
                }`}
              >
                <p>{renderMessage(msg.content)}</p>
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg bg-gray-100">
                <p className="italic text-gray-500">
                  Assistant is typing
                  <span className="animate-pulse">...</span>
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <form onSubmit={handleSubmit} className="pb-4">
        <div className="flex max-w-3xl mx-auto space-x-3 items-end rounded-[28px] bg-white p-2 shadow">
          <Textarea
            value={input}
            ref={textAreaRef}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[40px] max-h-[200px] resize-none overflow-y-auto flex-1 outline-none border-none rounded-[22px] ring-0 px-4 text-base"
            
          />
          <Button type="submit" disabled={isLoading} className={"rounded-full"}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {/* <div className='relative'>
          <Textarea
            value={input}
            ref={textAreaRef}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[40px] max-h-[200px] resize-none overflow-y-auto flex-1 outline-none border-none rounded-[3rem] max-w-3xl mx-auto pr-12"

          >
          </Textarea>
          <Button type="submit" disabled={isLoading} className={"absolute top-0 left-0 max-w-3xl mx-auto rounded-full"}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div> */}
      </form>
    </div>
    // <div className="flex h-screen bg-gray-100">
    //   <Sidebar />
    //   <main className="flex-1 p-8 md:ml-64">
    //     <div className="max-w-3xl mx-auto">
    //       <ScrollArea className="h-[calc(100vh-8rem)] bg-white rounded-md shadow-md p-4">
    //         <div className="space-y-4">
    //           {messages.map((msg, index) => (
    //             <div
    //               key={index}
    //               className={`p-3 rounded-lg max-w-[70%] ${msg.role === 'user' ? 'ml-auto bg-teal-100' : 'mr-auto bg-gray-100'
    //                 }`}
    //             >
    //               <p>{renderMessage(msg.content)}</p>
    //             </div>
    //           ))}
    //           {isLoading && (
    //             <div className="p-3 rounded-lg bg-gray-100">
    //               <p className="italic text-gray-500">
    //                 Assistant is typing
    //                 <span className="animate-pulse">...</span>
    //               </p>
    //             </div>
    //           )}
    //           <div ref={messagesEndRef} />
    //         </div>
    //       </ScrollArea>
    //       <form onSubmit={handleSubmit} className="mt-4">
    //         <div className="flex max-w-3xl mx-auto space-x-3 items-end">
    //           <Textarea
    //             value={input}
    //             onChange={(e) => setInput(e.target.value)}
    //             placeholder="Type your message..."
    //             className="min-h-[40px] max-h-[200px] resize-none overflow-y-auto flex-1"
    //           />
    //           <Button type="submit" disabled={isLoading}>
    //             <ArrowRight className="h-4 w-4" />
    //           </Button>
    //         </div>
    //       </form>
    //     </div>
    //   </main>
    // </div>
  );
}

export default ChatStream;