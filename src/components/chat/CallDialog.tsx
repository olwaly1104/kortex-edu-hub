import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff } from "lucide-react";

const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("") || "?";

export function CallDialog({
  open, onClose, name, mode,
}: { open: boolean; onClose: () => void; name: string; mode: "audio" | "video" }) {
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [phase, setPhase] = useState<"ringing" | "connected">("ringing");

  useEffect(() => {
    if (!open) { setSeconds(0); setPhase("ringing"); setMuted(false); setVideoOff(false); return; }
    const r = setTimeout(() => setPhase("connected"), 1800);
    return () => clearTimeout(r);
  }, [open]);

  useEffect(() => {
    if (phase !== "connected") return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [phase]);

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 overflow-hidden max-w-md border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex flex-col items-center pt-10 pb-6 px-6">
          <Avatar className="w-24 h-24 ring-4 ring-white/10">
            <AvatarFallback className="text-2xl bg-primary/30 text-white font-medium">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-5 text-xl font-semibold">{name}</h3>
          <p className="mt-1 text-sm text-white/60 flex items-center gap-2">
            {mode === "video" ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            {phase === "ringing" ? "A chamar…" : time}
          </p>

          {mode === "video" && phase === "connected" && !videoOff && (
            <div className="mt-6 w-full aspect-video rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-white/40 text-xs">
              Vídeo simulado
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <Button
              onClick={() => setMuted((m) => !m)}
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            {mode === "video" && (
              <Button
                onClick={() => setVideoOff((v) => !v)}
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                {videoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
            )}
            <Button
              onClick={onClose}
              size="icon"
              className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
