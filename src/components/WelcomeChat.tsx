import React, { useState, useEffect, useRef } from "react";

export interface ChatMessage {
  name?: string;
  msg?: string;
  delay?: number;
  align?: "left" | "right";
}

interface WelcomeChatProps {
  messages: ChatMessage[];
  onNavigateSlide: (id: string) => void;
}

export const WelcomeChat: React.FC<WelcomeChatProps> = ({
  messages,
  onNavigateSlide,
}) => {
  const [activeMessageIndex, setActiveMessageIndex] = useState<number>(0);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveMessageIndex(0);
    setTypingMessageIndex(0);

    if (!messages || messages.length === 0) return;

    let index = 0;
    let timer: NodeJS.Timeout;

    const processNext = () => {
      if (index >= messages.length) {
        setTypingMessageIndex(null);
        return;
      }

      const currentMsg = messages[index];
      const delay = currentMsg.delay || 1200;

      // Step 1: Render current message bubble in typing state
      setTypingMessageIndex(index);
      setActiveMessageIndex(index + 1);

      // Step 2: After `delay`, morph typing indicator into text
      timer = setTimeout(() => {
        setTypingMessageIndex(null);
        index++;
        if (index < messages.length) {
          timer = setTimeout(() => {
            processNext();
          }, 350);
        }
      }, delay);
    };

    processNext();

    return () => clearTimeout(timer);
  }, [messages]);

  // Smooth auto-scroll chat to bottom as new messages arrive or morph
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeMessageIndex, typingMessageIndex]);

  const handleMsgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A") {
      const href = target.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        onNavigateSlide(href.substring(1));
      }
    }
  };

  return (
    <div id="wrapper" className="chatwrap">
      <div className="chat">
        <div ref={chatContainerRef} className="chat-container-welcome">
          <div className="chat-message-list" onClick={handleMsgClick}>
            {messages &&
              messages.slice(0, activeMessageIndex).map((item, idx) => {
                const isCurrentlyTyping = typingMessageIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`message-bubble-wrapper ${
                      item.align === "right" ? "message-right" : "message-left"
                    } ${isCurrentlyTyping ? "is-typing-state" : "is-text-state"}`}
                  >
                    <div className="message-content">
                      <img
                        src="/images/profile-small.png"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%232C4251'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%23FDFFFC' font-size='16' font-family='sans-serif'>DD</text></svg>";
                        }}
                        className={`profpic ${isCurrentlyTyping ? "typing-avatar" : ""}`}
                        alt="David Dumont"
                      />
                      <div className="message-bubble">
                        {isCurrentlyTyping ? (
                          <div className="typing-indicator-inner">
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                          </div>
                        ) : (
                          <div
                            className="message-text-inner"
                            dangerouslySetInnerHTML={{ __html: item.msg || "" }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
