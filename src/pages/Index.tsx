import { useState } from "react";
import Header from "@/components/Header";
import BottomNavbar from "@/components/BottomNavbar";
import HomeView from "@/components/HomeView";
import ConfigView from "@/components/ConfigView";
import JsonGuideModal from "@/components/JsonGuideModal";
import ActivityLog from "@/components/ActivityLog";
import { useFirebase } from "@/hooks/useFirebase";
import { useActivityLog } from "@/hooks/useActivityLog";

const Index = () => {
  const [activeView, setActiveView] = useState<"home" | "config">("home");
  const [showJsonGuide, setShowJsonGuide] = useState(false);
  const { logs, addLog } = useActivityLog();

  const {
    config,
    setConfig,
    isConnected,
    devices,
    connect,
    disconnect,
    saveStructure,
    deleteDevice,
    setDeviceValue,
    startSimulator,
    stopSimulator,
  } = useFirebase(addLog);

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
          <>
            <HomeView
              devices={devices}
              isConnected={isConnected}
              onSetValue={setDeviceValue}
              onDelete={deleteDevice}
            />
            <ActivityLog logs={logs} />
          </>
        ) : (
          <ConfigView
            config={config}
            isConnected={isConnected}
            onConfigChange={setConfig}
            onConnect={connect}
            onDisconnect={disconnect}
            onSaveStructure={saveStructure}
            onStartSimulator={startSimulator}
            onStopSimulator={stopSimulator}
          />
        )}
      </main>

      <BottomNavbar activeView={activeView} onChangeView={setActiveView} />
      <JsonGuideModal open={showJsonGuide} onClose={() => setShowJsonGuide(false)} />
    </div>
  );
};

export default Index;
