import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlay, Search } from "lucide-react";

// Tenor public API (no key required for low volume via featured/search demo endpoints).
// We use Tenor v2 with the public anonymous key "LIVDSRZULELA" (Tenor demo key, widely used).
const TENOR_KEY = "LIVDSRZULELA";
const ENDPOINT = "https://tenor.googleapis.com/v2";

interface Gif { id: string; preview: string; url: string; }

export function GifPicker({ onPick }: { onPick: (url: string) => void }) {
  const [q, setQ] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const url = q.trim()
      ? `${ENDPOINT}/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&client_key=upra&limit=24&media_filter=tinygif,gif`
      : `${ENDPOINT}/featured?key=${TENOR_KEY}&client_key=upra&limit=24&media_filter=tinygif,gif`;
    const t = setTimeout(() => {
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          const items: Gif[] = (data.results ?? []).map((r: any) => ({
            id: r.id,
            preview: r.media_formats?.tinygif?.url ?? r.media_formats?.gif?.url,
            url: r.media_formats?.gif?.url ?? r.media_formats?.tinygif?.url,
          })).filter((g: Gif) => g.preview && g.url);
          setGifs(items);
        })
        .catch(() => setGifs([]))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><ImagePlay className="w-4 h-4" /></Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-80 p-0">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar GIFs no Tenor…" className="pl-8 h-8 text-sm" />
          </div>
        </div>
        <div className="p-2 max-h-72 overflow-y-auto">
          {loading ? (
            <p className="text-center text-xs text-muted-foreground py-6">A carregar…</p>
          ) : gifs.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">Sem resultados.</p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {gifs.map((g) => (
                <button
                  key={g.id}
                  onClick={() => { onPick(g.url); setOpen(false); }}
                  className="rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all"
                >
                  <img src={g.preview} alt="gif" className="w-full h-24 object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
