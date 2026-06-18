import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Sorrisos", emojis: ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴"] },
  { label: "Gestos", emojis: ["👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","👋","🤝","🙏","✍️","💅","🤳","💪","🦾","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄"] },
  { label: "Coração", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","🔥","✨","🎉","🎊","🥳","🎁"] },
  { label: "Objetos", emojis: ["📱","💻","⌨️","🖥️","🖨️","🖱️","📷","📸","📹","🎥","📞","☎️","📟","📠","📺","📻","🎙️","⏰","⏱️","📅","📆","💼","📁","📂","📝","✏️","📌","📍","📎","🖇️","✂️","📐","📏"] },
  { label: "Comida", emojis: ["🍕","🍔","🍟","🌭","🍿","🥓","🥚","🍳","🥞","🧇","🥨","🥯","🍞","🥖","🥐","🧀","🥗","🥙","🌮","🌯","🥪","🍣","🍱","🍜","🍝","🍛","🍲","☕","🍵","🍺","🍷","🍸","🍹","🍾"] },
];

export function EmojiPicker({ onPick }: { onPick: (e: string) => void }) {
  const [tab, setTab] = useState(0);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Smile className="w-4 h-4" /></Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-80 p-0">
        <div className="flex border-b border-border">
          {GROUPS.map((g, i) => (
            <button
              key={g.label}
              onClick={() => setTab(i)}
              className={cn(
                "flex-1 py-2 text-[11px] font-medium transition-colors",
                tab === i ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1 p-2 max-h-56 overflow-y-auto">
          {GROUPS[tab].emojis.map((e, i) => (
            <button
              key={`${e}-${i}`}
              onClick={() => onPick(e)}
              className="h-8 w-8 flex items-center justify-center text-xl rounded hover:bg-muted transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
