import { useState, useCallback, useRef } from "react";

export interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error" | "warn";
}

export function useActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsRef = useRef<LogEntry[]>([]);

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", { hour12: false });
    const entry: LogEntry = { time, message, type };
    logsRef.current = [...logsRef.current, entry];
    setLogs([...logsRef.current]);
  }, []);

  const clearLogs = useCallback(() => {
    logsRef.current = [];
    setLogs([]);
  }, []);

  return { logs, addLog, clearLogs };
}
