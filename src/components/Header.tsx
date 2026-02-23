import { Monitor } from "lucide-react";

interface HeaderProps {
  title: string;
  isConnected: boolean;
  onOpenJsonGuide: () => void;
}

const Header = ({ title, isConnected, onOpenJsonGuide }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div>
        <span className="text-sm font-medium text-muted-foreground">Say Hi!</span>
        <h1 className="text-2xl font-black italic text-foreground leading-tight">
          To The <span>{title}</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenJsonGuide}
          className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
        >
          <Monitor size={16} />
          Structure JSON
        </button>
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            isConnected
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          <span
            className={`inline-block h-3 w-3 rounded-full animate-pulse-dot ${
              isConnected ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>
    </header>
  );
};

export default Header;
