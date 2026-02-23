import { useEffect, useRef } from "react";
import { LogEntry } from "@/hooks/useActivityLog";
import { Terminal } from "lucide-react";

interface ActivityLogProps {
  logs: LogEntry[];
}

const colorMap: Record<LogEntry["type"], string> = {
  info: "text-[hsl(var(--terminal-foreground))]",
  success: "text-[hsl(142,71%,65%)]",
  error: "text-[hsl(var(--destructive))]",
  warn: "text-[hsl(45,93%,58%)]",
};

const ActivityLog = ({ logs }: ActivityLogProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="mx-6 mb-28 rounded-3xl overflow-hidden border border-border">
      <div className="flex items-center gap-2 px-5 py-3 bg-[hsl(220,20%,12%)]">
        <Terminal size={14} className="text-[hsl(var(--terminal-foreground))]" />
        <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--terminal-muted))]">
          Activity Log
        </span>
      </div>
      <div className="bg-[hsl(var(--terminal-bg))] p-4 h-48 overflow-y-auto font-mono text-xs leading-relaxed">
        {logs.length === 0 && (
          <p className="text-[hsl(var(--terminal-muted))]">
            $ waiting for events...
          </p>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-[hsl(var(--terminal-muted))] shrink-0">
              [{log.time}]
            </span>
            <span className={colorMap[log.type]}>{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ActivityLog;
