import { Home, Compass } from "lucide-react";

interface BottomNavbarProps {
  activeView: "home" | "config";
  onChangeView: (view: "home" | "config") => void;
}

const BottomNavbar = ({ activeView, onChangeView }: BottomNavbarProps) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-8 rounded-3xl bg-navbar px-12 py-4 shadow-lg">
        <button
          onClick={() => onChangeView("home")}
          className={`flex flex-col items-center transition-transform ${
            activeView === "home" ? "scale-110" : "opacity-70 hover:opacity-100"
          }`}
        >
          <Home
            size={28}
            className={activeView === "home" ? "text-green-400" : "text-navbar-foreground"}
          />
        </button>
        <button
          onClick={() => onChangeView("config")}
          className={`flex flex-col items-center transition-transform ${
            activeView === "config" ? "scale-110" : "opacity-70 hover:opacity-100"
          }`}
        >
          <Compass
            size={28}
            className={activeView === "config" ? "text-green-400" : "text-navbar-foreground"}
          />
        </button>
      </div>
    </nav>
  );
};

export default BottomNavbar;
