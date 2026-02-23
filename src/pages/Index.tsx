import { useState } from "react";
import Header from "@/components/Header";
import BottomNavbar from "@/components/BottomNavbar";
import HomeView from "@/components/HomeView";
import ConfigView from "@/components/ConfigView";
import JsonGuideModal from "@/components/JsonGuideModal";
import { useFirebase } from "@/hooks/useFirebase";

const Index = () => {
  const [activeView, setActiveView] = useState<"home" | "config">("home");
  const [showJsonGuide, setShowJsonGuide] = useState(false);

  const {
    config,
    setConfig,
    isConnected,
    devices,
    connect,
    saveStructure,
    setDeviceValue,
    startSimulator,
  } = useFirebase();

  const headerTitle = activeView === "home" ? "Dashboard" : "Configuration";

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={headerTitle}
        isConnected={isConnected}
        onOpenJsonGuide={() => setShowJsonGuide(true)}
      />

      <main className="pt-4">
        {activeView === "home" ? (
          <HomeView
            devices={devices}
            isConnected={isConnected}
            onSetValue={setDeviceValue}
          />
        ) : (
          <ConfigView
            config={config}
            isConnected={isConnected}
            onConfigChange={setConfig}
            onConnect={connect}
            onSaveStructure={saveStructure}
            onStartSimulator={startSimulator}
          />
        )}
      </main>

      <BottomNavbar activeView={activeView} onChangeView={setActiveView} />
      <JsonGuideModal open={showJsonGuide} onClose={() => setShowJsonGuide(false)} />
    </div>
  );
};

export default Index;
