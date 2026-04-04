import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthSession } from "../auth/useAuthSession";
import { getSocketBaseUrl } from "./socketBaseUrl";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthSession();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!user?.id) {
            setSocket(null);
            return;
        }

        const s = io(getSocketBaseUrl(), {
            transports: ["websocket"],
            withCredentials: true,
            reconnection: true,
        });

        const joinUserRoom = () => {
            s.emit("user:online", user.id);
        };

        s.on("connect", joinUserRoom);
        s.on("reconnect", joinUserRoom);
        setSocket(s);

        return () => {
            s.off("connect", joinUserRoom);
            s.off("reconnect", joinUserRoom);
            s.disconnect();
            setSocket(null);
        };
    }, [user?.id]);

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
}

export function useSocket(): Socket | null {
    return useContext(SocketContext);
}
