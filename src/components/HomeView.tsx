import { useState, useEffect } from "react";
import { DeviceData } from "@/hooks/useFirebase";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HomeViewProps {
  devices: DeviceData;
  isConnected: boolean;
  onSetValue: (key: string, value: number) => void;
}

const EmptySlot = () => (
  <div className="flex items-center justify-center rounded-3xl border-2 border-dashed border-[hsl(var(--dashed-border))] bg-card p-10">
    <p className="text-muted-foreground text-sm">
      Waiting for structured data synchronization...
    </p>
  </div>
);

interface SensorChartData {
  time: string;
  value: number;
}

const SensorChart = ({
  name,
  device,
}: {
  name: string;
  device: { value: number; satuan?: string; batas_atas?: number };
}) => {
  const [history, setHistory] = useState<SensorChartData[]>([]);

  useEffect(() => {
    setHistory((prev) => {
      const now = new Date().toLocaleTimeString();
      const next = [...prev, { time: now, value: device.value }];
      return next.slice(-20);
    });
  }, [device.value]);

  return (
    <div className="rounded-3xl border-2 border-dashed border-[hsl(var(--dashed-border))] bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">{name}</h3>
        <span className="text-xs font-mono text-muted-foreground">
          {device.value} {device.satuan || ""}
        </span>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis
              domain={[0, device.batas_atas || 100]}
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const HomeView = ({ devices, isConnected, onSetValue }: HomeViewProps) => {
  const keys = Object.keys(devices);

  if (!isConnected || keys.length === 0) {
    return (
      <div className="space-y-5 px-6 pb-28">
        <EmptySlot />
        <div className="grid grid-cols-2 gap-5">
          <EmptySlot />
          <EmptySlot />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-6 pb-28">
      {keys.map((key) => {
        const device = devices[key];
        if (!device) return null;

        if (device.tipe === "switch") {
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-3xl border-2 border-dashed border-[hsl(var(--dashed-border))] bg-card p-5"
            >
              <div>
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">{key}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {device.value === 1 ? "ON" : "OFF"}
                </p>
              </div>
              <Switch
                checked={device.value === 1}
                onCheckedChange={(checked) => onSetValue(key, checked ? 1 : 0)}
              />
            </div>
          );
        }

        if (device.tipe === "dimmer") {
          return (
            <div
              key={key}
              className="rounded-3xl border-2 border-dashed border-[hsl(var(--dashed-border))] bg-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">{key}</h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {device.value} {device.satuan || ""}
                </span>
              </div>
              <Slider
                value={[device.value]}
                max={device.batas_atas || 1024}
                step={1}
                onValueChange={([v]) => onSetValue(key, v)}
              />
            </div>
          );
        }

        if (device.tipe === "sensor") {
          return <SensorChart key={key} name={key} device={device} />;
        }

        return null;
      })}
    </div>
  );
};

export default HomeView;
