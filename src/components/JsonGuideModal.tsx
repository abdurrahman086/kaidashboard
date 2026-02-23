import { BookOpen, X } from "lucide-react";

interface JsonGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const codeSnippets = [
  {
    title: "1. Switch Digital (0 or 1)",
    note: "*Use 0 for OFF, 1 for ON.",
    code: `"lampu_teras": {
  "tipe": "switch",
  "value": 1
}`,
  },
  {
    title: "2. Dimmer Analog (SLIDER)",
    code: `"kipas_angin": {
  "tipe": "dimmer",
  "value": 512,
  "batas_atas": 1024,
  "satuan": "RPM"
}`,
  },
  {
    title: "3. Sensor Telemetri (Grafik)",
    code: `"suhu_ruang": {
  "tipe": "sensor",
  "value": 28.5,
  "batas_atas": 100,
  "satuan": "°C"
}`,
  },
];

const JsonGuideModal = ({ open, onClose }: JsonGuideModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-3xl bg-primary p-0 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 bg-primary px-6 py-5">
          <BookOpen size={28} className="text-primary-foreground" />
          <h2 className="text-xl font-bold text-primary-foreground">Guide Structure Json</h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="bg-card px-6 py-5 rounded-b-3xl max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-5 text-center">
            In order for your data to be readable by this website, the JSON format under your main node must be as follows:
          </p>

          <div className="space-y-5">
            {codeSnippets.map((snippet) => (
              <div key={snippet.title} className="rounded-2xl bg-card border border-border p-4 shadow-sm">
                <h3 className="text-sm font-bold text-primary mb-3">{snippet.title}</h3>
                <pre className="rounded-xl bg-code p-4 text-sm text-code-foreground overflow-x-auto font-mono">
                  {snippet.code}
                </pre>
                {snippet.note && (
                  <p className="mt-2 text-xs text-muted-foreground">{snippet.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonGuideModal;
