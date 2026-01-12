import { useEffect, useCallback } from "react";
import { socket } from "@/lib/socket";

/**
 * Custom hook để lắng nghe Socket.IO events
 * @param {string} event - Tên event cần lắng nghe
 * @param {function} callback - Callback function khi nhận event
 */
export const useSocket = (event, callback) => {
  const stableCallback = useCallback(callback, [callback]);

  useEffect(() => {
    socket.on(event, stableCallback);
    return () => socket.off(event, stableCallback);
  }, [event, stableCallback]);
};

export default useSocket;
