import { useState } from "react";
import type { FirebaseConfig } from "@/hooks/useFirebase";

interface ConfigViewProps {
  config: FirebaseConfig;
  isConnected: boolean;
  onConfigChange: (config: FirebaseConfig) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onSaveStructure: (keyName: string, type: string, unit: string, maxValue: number) => void;
  onStartSimulator: (min: number, max: number, interval: number) => void;
  onStopSimulator: () => void;
}

const ConfigView = ({
  config,
  isConnected,
  onConfigChange,
  onConnect,
  onDisconnect,
  onSaveStructure,
  onStartSimulator,
  onStopSimulator,
}: ConfigViewProps) => {
  const [keyName, setKeyName] = useState("");
  const [type, setType] = useState("switch");
  const [unit, setUnit] = useState("");
  const [maxValue, setMaxValue] = useState("1024");

  const [simMin, setSimMin] = useState("0");
  const [simMax, setSimMax] = useState("100");
  const [simInterval, setSimInterval] = useState("2000");

  const inputClass =
    "w-full rounded-2xl bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  const disabledOverlay = !isConnected
    ? "pointer-events-none opacity-50 select-none"
    : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-28">
      {/* Firebase Config Card */}
      <div className="rounded-3xl border-2 border-dashed border-[hsl(var(--dashed-border))] bg-card p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Firebase Config
        </h2>
        <input
          type="password"
          placeholder="API Key"
          value={config.apiKey}
          onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
          className={inputClass}
          disabled={isConnected}
        />
        <input
          type="url"
          placeholder="https://yourdatabase.firebaseio.com"
          value={config.databaseURL}
          onChange={(e) => onConfigChange({ ...config, databaseURL: e.target.value })}
          className={inputClass}
          disabled={isConnected}
        />
        <input
          type="text"
          placeholder="Root Node (e.g. Monitoring)"
          value={config.rootNode}
          onChange={(e) => onConfigChange({ ...config, rootNode: e.target.value })}
          className={inputClass}
          disabled={isConnected}
        />
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="w-full rounded-2xl bg-destructive py-3.5 text-sm font-bold text-destructive-foreground transition-opacity hover:opacity-90"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Connect Database
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Builder Parameter Card */}
        <div
          className={`rounded-3xl border-2 border-dashed border-[hsl(var(--dashed-border))] bg-card p-6 space-y-4 transition-opacity ${disabledOverlay}`}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Builder Parameter
          </h2>
          <input
            type="text"
            placeholder="Key Name (e.g. suhu)"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={inputClass}
            >
              <option value="switch">Switch</option>
              <option value="dimmer">Dimmer</option>
              <option value="sensor">Sensor (Telemetri)</option>
            </select>
            <input
              type="text"
              placeholder="Unit (°C, %)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={inputClass}
            />
          </div>
          <input
            type="number"
            placeholder="Max Value (Default: 100/1024)"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={() => {
              if (keyName.trim()) {
                onSaveStructure(keyName.trim(), type, unit, Number(maxValue) || 1024);
                setKeyName("");
              }
            }}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Save Structure
          </button>
        </div>

        {/* Global Simulator Card */}
        <div
          className={`rounded-3xl border-2 border-dashed border-[hsl(var(--dashed-border))] bg-card p-6 space-y-4 transition-opacity ${disabledOverlay}`}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Global Simulator
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">MIN</label>
              <input
                type="number"
                value={simMin}
                onChange={(e) => setSimMin(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">MAX</label>
              <input
                type="number"
                value={simMax}
                onChange={(e) => setSimMax(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <input
            type="number"
            placeholder="Interval (ms)"
            value={simInterval}
            onChange={(e) => setSimInterval(e.target.value)}
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                onStartSimulator(
                  Number(simMin) || 0,
                  Number(simMax) || 100,
                  Number(simInterval) || 2000
                )
              }
              className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Run Simulator
            </button>
            <button
              onClick={onStopSimulator}
              className="w-full rounded-2xl bg-secondary py-3 text-sm font-bold text-secondary-foreground transition-opacity hover:opacity-90"
            >
              Stop Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigView;
