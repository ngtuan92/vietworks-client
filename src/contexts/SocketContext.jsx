import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { accessToken: token, user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token && user) {
      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
      const newSocket = io(socketUrl, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
