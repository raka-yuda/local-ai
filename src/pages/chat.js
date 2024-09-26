import React from 'react';
import dynamic from 'next/dynamic';

// const ChatStream = dynamic(() => import('../components/ChatStream'), {
//   ssr: false,
// });

const Chat = () => {
  return (
    <div>
      <h1>Chat</h1>
      {/* <ChatStream /> */}
    </div>
  );
};

export default Chat;