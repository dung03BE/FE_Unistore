import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Input } from "../ChatSocket/input";
import { Button } from "../ChatSocket/button";
import { useSelector } from 'react-redux';
import "../ChatSocket/ChatRoom.scss";
import GuiComment from './GuiComment';
import { BASE_URL } from "../../config";
const MESSAGE_BATCH_SIZE = 3; // Số tin nhắn hiển thị mỗi lần

const ChatRoom = ({ initialComments, productId }) => {
    const userDetails = useSelector(state => state.userReducer.userDetails);
    const fullName = userDetails?.fullName || 'Guest';
    // Nếu initialComments chưa sắp xếp giảm dần theo timestamp, bạn cần sắp xếp lại trước.
    const [messages, setMessages] = useState(
        (initialComments || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    );
    const [visibleCount, setVisibleCount] = useState(MESSAGE_BATCH_SIZE);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${BASE_URL}/ws-chat`),
            onConnect: () => {
                setConnected(true);
                client.subscribe('/topic/public', (message) => {
                    const incoming = JSON.parse(message.body);

                    // Chuyển đổi timestamp nếu cần
                    const formattedTimestamp = incoming.timestamp
                        ? new Date(incoming.timestamp).toISOString()
                        : new Date().toISOString();

                    const formatted = {
                        ...incoming,
                        username: incoming.sender || 'Guest',
                        timestamp: formattedTimestamp
                    };

                    setMessages(prev => [formatted, ...prev]);
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: (error) => {
                console.error('STOMP error:', error);
                setConnected(false);
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !connected) return;

        const messageObject = {
            content: newMessage,
            sender: fullName,
            type: 'CHAT',
            productId: productId,
            timestamp: new Date().toISOString()
        };

        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(messageObject)
        });

        // Xóa nội dung tin nhắn mà không tự thêm vào state
        setNewMessage('');
    };

    // Hiển thị các tin nhắn từ đầu mảng, với visibleCount bình luận (newest ở đầu)
    const displayedMessages = messages.slice(0, visibleCount);
    // Kiểm tra xem còn bình luận cũ để tải thêm không
    const canLoadMore = messages.length > visibleCount;

    const loadMore = () => {
        setVisibleCount(prev => prev + MESSAGE_BATCH_SIZE);
    };

    return (
        <div className="chat-room p-4">
            <form onSubmit={sendMessage} className="flex gap-4 items-center">
                <h2><GuiComment /></h2>
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1"
                />
                <Button type="submit" disabled={!connected}>Send</Button>
            </form>

            <div className="messages h-96 overflow-auto mb-4 border rounded p-2">
                {displayedMessages.map((msg, idx) => (
                    <div key={idx} className="mb-2 p-2 border-bottom">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src={`https://i.pravatar.cc/50?u=${msg.username}`}
                                alt="Avatar"
                                className="rounded-circle mr-2"
                                width="40"
                                height="40"
                            />
                            <div>
                                <div className="font-weight-bold">
                                    {msg.username || 'Guest'}
                                </div>
                                <div className="text-muted small">
                                    {new Date(msg.timestamp).toLocaleString()}
                                </div>
                                <div>{msg.content}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {canLoadMore && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <Button onClick={loadMore}>Tải thêm tin nhắn</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatRoom;
