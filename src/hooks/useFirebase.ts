import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp, deleteApp, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
  Database,
} from "firebase/database";

export interface FirebaseConfig {
  apiKey: string;
  databaseURL: string;
  rootNode: string;
}

export interface DeviceData {
  [key: string]: {
    tipe: string;
    value: number;
    batas_atas?: number;
    satuan?: string;
  };
}

const STORAGE_KEY = "firebase_iot_config";

function loadConfig(): FirebaseConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { apiKey: "", databaseURL: "", rootNode: "Monitoring" };
}

function persistConfig(config: FirebaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

type LogFn = (message: string, type?: "info" | "success" | "error" | "warn") => void;

export function useFirebase(addLog?: LogFn) {
  const [config, setConfigState] = useState<FirebaseConfig>(loadConfig);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices] = useState<DeviceData>({});
  const appRef = useRef<FirebaseApp | null>(null);
  const dbRef = useRef<Database | null>(null);
  const intervalRef = useRef<number | null>(null);
  const log = useCallback((msg: string, type?: "info" | "success" | "error" | "warn") => {
    addLog?.(msg, type);
  }, [addLog]);

  const setConfig = useCallback((c: FirebaseConfig) => {
    setConfigState(c);
    persistConfig(c);
  }, []);

  const connect = useCallback(() => {
    if (!config.apiKey || !config.databaseURL) {
      log("Error: API Key and Database URL are required", "error");
      return;
    }
    try {
      if (appRef.current) {
        deleteApp(appRef.current);
      }
      const app = initializeApp({
        apiKey: config.apiKey,
        databaseURL: config.databaseURL,
      });
      appRef.current = app;
      const db = getDatabase(app);
      dbRef.current = db;

      const connectedRef = ref(db, ".info/connected");
      onValue(connectedRef, (snap) => {
        const connected = snap.val() === true;
        setIsConnected(connected);
        if (connected) {
          log(`Database Connected to ${config.databaseURL}`, "success");
        }
      });

      const dataRef = ref(db, config.rootNode);
      onValue(dataRef, (snap) => {
        const data = snap.val();
        if (data && typeof data === "object") {
          // Normalize: iterate keys, default null/"" values to 0
          const normalized: DeviceData = {};
          Object.keys(data).forEach((key) => {
            const node = data[key];
            if (!node || typeof node !== "object") return;
            normalized[key] = {
              tipe: node.tipe || "sensor",
              value: (node.value === null || node.value === undefined || node.value === "") ? 0 : Number(node.value),
              batas_atas: node.batas_atas != null ? Number(node.batas_atas) : undefined,
              satuan: node.satuan || undefined,
            };
          });
          setDevices(normalized);
        } else {
          setDevices({});
        }
      });
    } catch (e: any) {
      log(`Error: ${e.message || e}`, "error");
      console.error("Firebase connection error:", e);
      setIsConnected(false);
    }
  }, [config, log]);

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (appRef.current) {
      deleteApp(appRef.current);
      appRef.current = null;
      dbRef.current = null;
    }
    setIsConnected(false);
    setDevices({});
    log("Database Disconnected", "warn");
  }, [log]);

  const saveStructure = useCallback(
    (keyName: string, type: string, unit: string, maxValue: number) => {
      if (!dbRef.current || !isConnected) return;
      const nodeRef = ref(dbRef.current, `${config.rootNode}/${keyName}`);
      const data: Record<string, unknown> = {
        tipe: type,
        value: 0,
        satuan: unit || "",
        batas_atas: maxValue || 100,
      };
      set(nodeRef, data);
      log(`New node "${keyName}" created successfully`, "success");
    },
    [isConnected, config.rootNode, log]
  );

  const deleteDevice = useCallback(
    (keyName: string) => {
      if (!dbRef.current || !isConnected) return;
      const nodeRef = ref(dbRef.current, `${config.rootNode}/${keyName}`);
      remove(nodeRef);
      log(`Node "${keyName}" deleted`, "warn");
    },
    [isConnected, config.rootNode, log]
  );

  const setDeviceValue = useCallback(
    (keyName: string, value: number) => {
      if (!dbRef.current || !isConnected) return;
      const valueRef = ref(dbRef.current, `${config.rootNode}/${keyName}/value`);
      set(valueRef, value);
      log(`Value updated for ${keyName}: ${value}`, "info");
    },
    [isConnected, config.rootNode, log]
  );

  const startSimulator = useCallback(
    (min: number, max: number, intervalMs: number) => {
      if (!dbRef.current || !isConnected) return;
      if (intervalRef.current) clearInterval(intervalRef.current);
      log(`Simulator started (min: ${min}, max: ${max}, interval: ${intervalMs}ms)`, "success");

      intervalRef.current = window.setInterval(() => {
        Object.keys(devices).forEach((key) => {
          const device = devices[key];
          if (!device) return;
          let val: number;
          if (device.tipe === "switch") {
            val = Math.round(Math.random());
          } else {
            val = Math.random() * (max - min) + min;
            val = parseFloat(val.toFixed(2));
          }
          const valueRef = ref(dbRef.current!, `${config.rootNode}/${key}/value`);
          set(valueRef, val);
        });
      }, intervalMs);
    },
    [isConnected, devices, config.rootNode, log]
  );

  const stopSimulator = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      log("Simulator stopped", "warn");
    }
  }, [log]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
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
  };
}
