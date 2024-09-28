import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Box, VStack, Text, Flex, HStack, IconButton } from "@chakra-ui/react";
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Sidebar from './Sidebar';
import { Textarea } from "@/components/ui/textarea";
import useAutosizeTextArea from '@/hooks/useAutosizeTextArea';
import { Button } from './ui/button';
import { ArrowRight, Loader } from 'lucide-react';

function MDXChatStream() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef(null);
  const streamingMessageRef = useRef('');


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages, streamingMessage]);

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

  useEffect(() => {
    console.log("messages: ", messages)
  }, [messages]);

  useEffect(() => {
    console.log("stremingMessage: ", streamingMessage)
  }, [streamingMessage]);

  const renderMessage = (content) => {
    const parts = content.split('\n').map((part, index) => (
      <p key={index} whiteSpace="pre-wrap">{part}</p>
    ));
    return parts;
  };

  const textAreaRef = useRef(null);

  useAutosizeTextArea(textAreaRef.current, input);

  return (
    // <Flex direction="column" h="100vh" w="100vw" overflow="hidden">
    //   <Sidebar />
    //   <Flex justify="center" flex={1} overflow="hidden" bg="gray.100" pt={8}>
    //     <VStack 
    //       flex={1} 
    //       maxW="800px" 
    //       h="100%" 
    //       overflowY="auto" 
    //       spacing={4} 
    //       p={4} 
    //       alignItems="stretch"
    //       bg="white"
    //       borderRadius="md"
    //       boxShadow="md"
    //       m={4}
    //     >
    //       {messages.map((msg, index) => (
    //         <Box 
    //           key={index} 
    //           alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
    //           bg={msg.role === 'user' ? 'teal.100' : 'gray.100'}
    //           p={3}
    //           borderRadius="lg"
    //           maxW="70%"
    //         >
    //           {renderMessage(msg.content)}
    //         </Box>
    //       ))}
    //       {/* {streamingMessage && (
    //         <Box alignSelf="flex-start" bg="gray.100" p={3} borderRadius="lg" maxW="70%">
    //           {renderMessage(streamingMessage)}
    //         </Box>
    //       )} */}
    //       <div ref={messagesEndRef} />
    //     </VStack>
    //   </Flex>
    //   <Box as="form" onSubmit={handleSubmit} p={4} bg="white" borderTop="1px" borderColor="gray.200">
    //     <HStack maxW="800px" mx="auto" spacing={3} alignItems="flex-end">
    //       <Textarea
    //         value={input}
    //         onChange={(e) => setInput(e.target.value)}
    //         placeholder="Type your message..."
    //         size="md"
    //         borderRadius="md"
    //         minH="40px"
    //         maxH="200px"
    //         resize="none"
    //         overflowY="auto"
    //         flex={1}
    //       />
    //       <IconButton
    //         type="submit"
    //         icon={<ArrowForwardIcon />}
    //         isLoading={isLoading}
    //         colorScheme="teal"
    //         size="md"
    //         borderRadius="md"
    //         aria-label="Send message"
    //       />
    //     </HStack>
    //   </Box>
    // </Flex>
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 ">
      <Sidebar />
      <div className="flex justify-center flex-1 overflow-y-auto">
        <div className="flex flex-1 max-w-3xl bg-white rounded-[24px] shadow m-4 overflow-y-auto min-h-0 pb-4">
          <div className="flex flex-col p-4 pb-4 w-full h-full">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-2xl max-w-[70%] my-2 ${
                  msg.role === 'user' ? 
                    'ml-auto bg-primary rounded-br-none text-white' : 
                    'mr-auto bg-gray-100 rounded-bl-none'
                }`}
              >
                {/* <p>{renderMessage(msg.content)}</p> */}
                <p>{renderMessage(msg.content)}</p>
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg bg-gray-100 rounded-bl-none flex max-w-[70%]">
                <p className="italic text-gray-500">
                  Assistant is typing
                  <span className="animate-pulse">...</span>
                </p>
              </div>
            )}
            <div ref={messagesEndRef} className='mb-4'/>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="pb-4 px-4">
        <div className="flex max-w-3xl mx-auto space-x-3 items-end rounded-[28px] bg-white p-2 shadow">
          <Textarea
            value={input}
            ref={textAreaRef}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e); // Manually trigger submit when Enter is pressed
              }
            }}
            placeholder="Type your message..."
            className="min-h-[40px] max-h-[200px] resize-none overflow-y-auto flex-1 outline-none border-none rounded-[22px] ring-0 px-4 text-base"
          />
          <Button type="submit" disabled={isLoading} className={"rounded-full"}>
            
            {!isLoading 
              ? <ArrowRight className="h-4 w-4" /> 
              : <Loader className="h-4 w-4 animate-spin"/>
            }
          </Button>
        </div>
      </form>
    </div>
  );
}

export default MDXChatStream;