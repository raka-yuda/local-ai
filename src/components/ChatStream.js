import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Loader, LoaderCircle, LoaderCircleIcon } from "lucide-react";
import CodeBlock from '@/components/CodeBlock'; 
import Sidebar from '@/components/Sidebar'; 
import useAutosizeTextArea from '@/hooks/useAutosizeTextArea';
import { Badge } from '@/components/ui/badge';

const InlineCode = ({ code }) => {
  return (
    <Badge className="font-mono bg-gray-100 text-gray-700 p-1 rounded">
      {code}
    </Badge>
  );
};


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

  // const renderMessage = (content) => {
  //   const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
  //   const inlineCodeRegex = /`([^`\n]+)`/g;
  //   const orderedListRegex = /^\d+\.\s(.+)$/gm;
    
  //   const parts = [];
  //   let lastIndex = 0;
  //   let match;

  //   while ((match = codeBlockRegex.exec(content)) !== null) {
  //     if (match.index > lastIndex) {
  //       parts.push(renderTextWithInlineCodeAndLists(content.slice(lastIndex, match.index)));
  //     }
  //     const [, language, code] = match;
  //     parts.push(<CodeBlock key={match.index} code={code.trim()} language={language || 'text'} />);
  //     lastIndex = match.index + match[0].length;
  //   }

  //   if (lastIndex < content.length) {
  //     parts.push(renderTextWithInlineCodeAndLists(content.slice(lastIndex)));
  //   }

  //   return parts.length > 0 ? parts : content;
  // };

  // const renderTextWithInlineCodeAndLists = (text) => {
  //   const inlineCodeRegex = /`([^`\n]+)`/g;
  //   const orderedListRegex = /^\d+\.\s(.+)$/gm;

  //   let parts = [];
  //   let lastIndex = 0;
  //   let match;

  //   // Handle inline code
  //   while ((match = inlineCodeRegex.exec(text)) !== null) {
  //     if (match.index > lastIndex) {
  //       parts.push(text.slice(lastIndex, match.index));
  //     }
  //     parts.push(<code key={match.index} className="px-1 bg-gray-100 rounded-sm">{match[1]}</code>);
  //     lastIndex = match.index + match[0].length;
  //   }

  //   if (lastIndex < text.length) {
  //     parts.push(text.slice(lastIndex));
  //   }

  //   // Handle ordered lists
  //   const listItems = text.match(orderedListRegex);
  //   if (listItems) {
  //     return (
  //       <ol className="list-decimal list-inside">
  //         {listItems.map((item, index) => (
  //           <li key={index}>{item.replace(/^\d+\.\s/, '')}</li>
  //         ))}
  //       </ol>
  //     );
  //   }

  //   return parts;
  // };

  const renderMessage = (content) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    const inlineCodeRegex = /`([^`\n]+)`/g;
    const orderedListRegex = /^\d+\.\s(.+)$/gm;
  
    const parts = [];
    let lastIndex = 0;
    let match;
  
    // Handle code blocks
    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderTextWithInlineCodeAndLists(content.slice(lastIndex, match.index)));
      }
      const [, language, code] = match;
      parts.push(<CodeBlock key={match.index} code={code.trim()} language={language || 'text'} />);
      lastIndex = match.index + match[0].length;
    }
  
    // Handle remaining text after the last code block
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
      // Using Badge component from ShadCN UI for inline code style
      parts.push(
        <Badge key={match.index} className="font-mono bg-gray-400 text-white px-1 rounded-sm">
          {match[1]}
        </Badge>
      );
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

export default ChatStream;