import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Download, ExternalLink, Star, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const categories = ["Todos", "Matemática", "Programação", "Física", "Economia", "Direito", "Engenharia"];

const books = [
  { id: "1", title: "Cálculo Vol. 1", author: "James Stewart", category: "Matemática", year: 2020, pages: 892, rating: 4.8, available: true },
  { id: "2", title: "Álgebra Linear e Aplicações", author: "Howard Anton", category: "Matemática", year: 2019, pages: 654, rating: 4.5, available: true },
  { id: "3", title: "Introdução à Programação com Python", author: "Nilo Ney Coutinho", category: "Programação", year: 2021, pages: 480, rating: 4.6, available: true },
  { id: "4", title: "Física Universitária Vol. 1", author: "Young & Freedman", category: "Física", year: 2018, pages: 720, rating: 4.7, available: false },
  { id: "5", title: "Microeconomia: Teoria e Aplicações", author: "Robert Pindyck", category: "Economia", year: 2022, pages: 560, rating: 4.3, available: true },
  { id: "6", title: "Estruturas de Dados em C", author: "André Backes", category: "Programação", year: 2020, pages: 340, rating: 4.4, available: true },
  { id: "7", title: "Mecânica dos Materiais", author: "R.C. Hibbeler", category: "Engenharia", year: 2021, pages: 890, rating: 4.6, available: true },
  { id: "8", title: "Introdução ao Direito Civil", author: "Carlos Roberto Gonçalves", category: "Direito", year: 2023, pages: 620, rating: 4.2, available: true },
];

const colors = ["#1E3A8A", "#F97316", "#0D9488", "#7C3AED", "#DC2626", "#059669", "#D97706", "#6366F1"];

export default function StudentLibrary() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = books.filter(b => {
    const matchCategory = activeCategory === "Todos" || b.category === activeCategory;
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Biblioteca Virtual
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{books.length} livros disponíveis no acervo digital</p>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar título ou autor..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
              activeCategory === cat ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Books grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filtered.map((book, i) => (
          <Card key={book.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            {/* Book cover placeholder */}
            <div className="h-40 flex items-center justify-center relative" style={{ backgroundColor: colors[i % colors.length] + "15" }}>
              <BookOpen className="w-12 h-12" style={{ color: colors[i % colors.length] }} />
              {book.available && (
                <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">Disponível</span>
              )}
              {!book.available && (
                <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Indisponível</span>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-sm font-semibold text-foreground leading-tight">{book.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{book.year}</span>
                <span>{book.pages} pág.</span>
                <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-warning fill-warning" />{book.rating}</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-2 py-0.5 bg-muted rounded-full w-fit">{book.category}</span>
              <div className="mt-auto pt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" disabled={!book.available}>
                  <ExternalLink className="w-3 h-3" /> Ler Online
                </Button>
                <Button size="sm" className="flex-1 text-xs gap-1" disabled={!book.available}>
                  <Download className="w-3 h-3" /> Descarregar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">Nenhum livro encontrado.</div>
      )}
    </div>
  );
}
