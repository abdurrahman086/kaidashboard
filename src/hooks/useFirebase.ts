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

export function useFirebase() {
  const [config, setConfigState] = useState<FirebaseConfig>(loadConfig);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices] = useState<DeviceData>({});
  const appRef = useRef<FirebaseApp | null>(null);
  const dbRef = useRef<Database | null>(null);
  const intervalRef = useRef<number | null>(null);

  const setConfig = useCallback((c: FirebaseConfig) => {
    setConfigState(c);
    persistConfig(c);
  }, []);

  const connect = useCallback(() => {
    if (!config.apiKey || !config.databaseURL) return;
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
        setIsConnected(snap.val() === true);
      });

      const dataRef = ref(db, config.rootNode);
      onValue(dataRef, (snap) => {
        const data = snap.val();
        if (data && typeof data === "object") {
          setDevices(data as DeviceData);
        } else {
          setDevices({});
        }
      });
    } catch (e) {
      console.error("Firebase connection error:", e);
      setIsConnected(false);
    }
  }, [config]);

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
  }, []);

  const saveStructure = useCallback(
    (keyName: string, type: string, unit: string, maxValue: number) => {
      if (!dbRef.current || !isConnected) return;
      const nodeRef = ref(dbRef.current, `${config.rootNode}/${keyName}`);
      const data: Record<string, unknown> = { tipe: type, value: 0 };
      if (type === "dimmer" || type === "sensor") {
        data.satuan = unit;
        data.batas_atas = maxValue;
      }
      set(nodeRef, data);
    },
    [isConnected, config.rootNode]
  );

  const deleteDevice = useCallback(
    (keyName: string) => {
      if (!dbRef.current || !isConnected) return;
      const nodeRef = ref(dbRef.current, `${config.rootNode}/${keyName}`);
      remove(nodeRef);
    },
    [isConnected, config.rootNode]
  );

  const setDeviceValue = useCallback(
    (keyName: string, value: number) => {
      if (!dbRef.current || !isConnected) return;
      const valueRef = ref(dbRef.current, `${config.rootNode}/${keyName}/value`);
      set(valueRef, value);
    },
    [isConnected, config.rootNode]
  );

  const startSimulator = useCallback(
    (min: number, max: number, intervalMs: number) => {
      if (!dbRef.current || !isConnected) return;
      if (intervalRef.current) clearInterval(intervalRef.current);

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
    [isConnected, devices, config.rootNode]
  );

  const stopSimulator = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

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
