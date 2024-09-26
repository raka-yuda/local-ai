import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, VStack, Textarea, Text, Flex, HStack, IconButton } from "@chakra-ui/react";
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Sidebar from './Sidebar';

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
      <Text key={index} whiteSpace="pre-wrap">{part}</Text>
    ));
    return parts;
  };

  return (
    <Flex direction="column" h="100vh" w="100vw" overflow="hidden">
      <Sidebar />
      <Flex justify="center" flex={1} overflow="hidden" bg="gray.100" pt={8}>
        <VStack 
          flex={1} 
          maxW="800px" 
          h="100%" 
          overflowY="auto" 
          spacing={4} 
          p={4} 
          alignItems="stretch"
          bg="white"
          borderRadius="md"
          boxShadow="md"
          m={4}
        >
          {messages.map((msg, index) => (
            <Box 
              key={index} 
              alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              bg={msg.role === 'user' ? 'teal.100' : 'gray.100'}
              p={3}
              borderRadius="lg"
              maxW="70%"
            >
              {renderMessage(msg.content)}
            </Box>
          ))}
          {/* {streamingMessage && (
            <Box alignSelf="flex-start" bg="gray.100" p={3} borderRadius="lg" maxW="70%">
              {renderMessage(streamingMessage)}
            </Box>
          )} */}
          <div ref={messagesEndRef} />
        </VStack>
      </Flex>
      <Box as="form" onSubmit={handleSubmit} p={4} bg="white" borderTop="1px" borderColor="gray.200">
        <HStack maxW="800px" mx="auto" spacing={3} alignItems="flex-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            size="md"
            borderRadius="md"
            minH="40px"
            maxH="200px"
            resize="none"
            overflowY="auto"
            flex={1}
          />
          <IconButton
            type="submit"
            icon={<ArrowForwardIcon />}
            isLoading={isLoading}
            colorScheme="teal"
            size="md"
            borderRadius="md"
            aria-label="Send message"
          />
        </HStack>
      </Box>
    </Flex>
  );
}

export default MDXChatStream;