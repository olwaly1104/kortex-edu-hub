import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogIn, ArrowRight, MapPin, Phone, Mail, Globe,
  BookOpen, Users, Award, Building2, Microscope, Palette, Scale,
  Stethoscope, Cpu, Briefcase, Calendar, Newspaper, ChevronRight,
  Facebook, Instagram, Linkedin, Youtube, CheckCircle2, Quote, Sparkles,
} from "lucide-react";
import logoUpra from "@/assets/logo-upra.asset.json";

const faculdades = [
  { icon: Building2, name: "Ciências Exatas", desc: "Arquitectura, Engenharia Civil, Informática", cursos: 6 },
  { icon: Stethoscope, name: "Ciências da Saúde", desc: "Medicina, Enfermagem, Farmácia", cursos: 5 },
  { icon: Briefcase, name: "Economia e Gestão", desc: "Gestão, Contabilidade, Economia", cursos: 7 },
  { icon: Scale, name: "Direito", desc: "Direito, Ciências Jurídicas", cursos: 2 },
  { icon: Palette, name: "Ciências Sociais", desc: "Comunicação, Psicologia, Sociologia", cursos: 4 },
  { icon: Microscope, name: "Investigação", desc: "Centros de pesquisa e laboratórios", cursos: 3 },
];

const stats = [
  { value: "12.500+", label: "Estudantes activos" },
  { value: "27", label: "Cursos de licenciatura" },
  { value: "650+", label: "Professores e investigadores" },
  { value: "38", label: "Anos de história" },
];

const news = [
  { tag: "Admissões", date: "02 Jun 2026", title: "Candidaturas para o ano lectivo 2026/2027 já estão abertas", desc: "Inscreva-se até 30 de Julho para garantir o seu lugar nos cursos mais procurados da UPRA." },
  { tag: "Investigação", date: "28 Mai 2026", title: "Projecto de Arquitectura Sustentável conquista prémio nacional", desc: "Equipa da Faculdade de Ciências Exatas distinguida no Fórum de Inovação 2026." },
  { tag: "Eventos", date: "20 Mai 2026", title: "Semana Cultural UPRA reúne mais de 3.000 visitantes", desc: "Cinco dias de conferências, música, exposições e debates no Campus Central." },
];

const cursosDestaque = [
  "Arquitectura", "Medicina", "Engenharia Informática", "Direito",
  "Gestão de Empresas", "Enfermagem", "Engenharia Civil", "Psicologia",
];

const testimonials = [
  { name: "Ana Domingos", course: "Arquitectura · 5º ano", quote: "A UPRA deu-me as ferramentas técnicas e a visão crítica que precisava para construir o meu portfólio profissional." },
  { name: "Carlos Mateus", course: "Medicina · 6º ano", quote: "Os laboratórios e o corpo docente da Faculdade de Ciências da Saúde estão entre os melhores do país." },
  { name: "Joana Bento", course: "Engenharia Informática", quote: "Programa muito prático, com ligação directa ao mercado de trabalho. Já estou a estagiar antes de terminar o curso." },
];

export default function Website() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== Top bar ===== */}
      <div className="bg-primary/95 text-primary-foreground text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +244 222 000 000</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> info@upra.ao</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Luanda, Angola</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <a href="#" className="hover:opacity-80"><Facebook className="w-3.5 h-3.5" /></a>
            <a href="#" className="hover:opacity-80"><Instagram className="w-3.5 h-3.5" /></a>
            <a href="#" className="hover:opacity-80"><Linkedin className="w-3.5 h-3.5" /></a>
            <a href="#" className="hover:opacity-80"><Youtube className="w-3.5 h-3.5" /></a>
          </div>
        </div>
      </div>

      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/site" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">UPRA</p>
              <p className="text-[10px] text-muted-foreground">Universidade Privada de Angola</p>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            <a href="#sobre" className="text-foreground/80 hover:text-primary">Sobre</a>
            <a href="#faculdades" className="text-foreground/80 hover:text-primary">Faculdades</a>
            <a href="#cursos" className="text-foreground/80 hover:text-primary">Cursos</a>
            <a href="#noticias" className="text-foreground/80 hover:text-primary">Notícias</a>
            <a href="#contacto" className="text-foreground/80 hover:text-primary">Contacto</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/candidatar">
              <Button size="sm" className="h-9 gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm">
                <Sparkles className="w-4 h-4" /> Candidatar-me
              </Button>
            </Link>
            <Link to="/">
              <Button size="sm" variant="outline" className="h-9 gap-1.5">
                <LogIn className="w-4 h-4" /> Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="bg-secondary text-secondary-foreground mb-5">Candidaturas 2026/2027 abertas</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Formamos a próxima geração de líderes angolanos
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/80 max-w-xl">
              Há quase quatro décadas a oferecer ensino superior de excelência, com programas acreditados,
              campus moderno e ligação directa ao mercado de trabalho.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/candidatar">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2">
                  Candidatar-me agora <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 gap-2">
                  <LogIn className="w-4 h-4" /> Aceder ao Portal
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
              {stats.map(s => (
                <div key={s.label}>
                  <p className="text-2xl lg:text-3xl font-bold text-secondary">{s.value}</p>
                  <p className="text-xs text-primary-foreground/70 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-secondary/30 to-accent/20 border border-primary-foreground/20 backdrop-blur p-8 flex flex-col justify-end">
                <Quote className="w-10 h-10 text-secondary mb-3" />
                <p className="text-lg italic text-primary-foreground/95 leading-relaxed">
                  "Educar é formar cidadãos completos, capazes de transformar Angola e o mundo."
                </p>
                <p className="mt-4 text-sm font-semibold">Prof. Dr. João Mateus</p>
                <p className="text-xs text-primary-foreground/70">Reitor da UPRA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Sobre ===== */}
      <section id="sobre" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-3">Sobre a UPRA</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Uma universidade comprometida com a excelência académica
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Fundada em 1988, a Universidade Privada de Angola é uma referência no ensino superior em África Austral.
              Combinamos tradição académica com inovação tecnológica para preparar profissionais com pensamento crítico,
              competências técnicas sólidas e compromisso ético.
            </p>
            <div className="mt-6 space-y-2.5">
              {[
                "Cursos acreditados pelo Ministério do Ensino Superior",
                "Parcerias internacionais com mais de 40 universidades",
                "Campus moderno com laboratórios e biblioteca digital",
                "Apoio personalizado a cada estudante",
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: BookOpen, label: "Excelência académica", desc: "Currículos actualizados e alinhados ao mercado." },
              { icon: Users, label: "Comunidade global", desc: "Alunos e docentes de mais de 20 nacionalidades." },
              { icon: Award, label: "Reconhecimento", desc: "Universidade top 5 em Angola pelo ranking nacional." },
              { icon: Globe, label: "Mobilidade", desc: "Programas de intercâmbio em 4 continentes." },
            ].map(b => (
              <Card key={b.label} className="p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <b.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-foreground">{b.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Faculdades ===== */}
      <section id="faculdades" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3">Faculdades</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">As nossas faculdades</h2>
            <p className="mt-3 text-muted-foreground">
              Seis faculdades, 27 cursos de licenciatura e mais de uma dezena de pós-graduações.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {faculdades.map(f => (
              <Card key={f.name} className="p-6 hover:shadow-lg hover:border-primary/40 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Faculdade de {f.name}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{f.cursos} cursos</span>
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    Explorar <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Cursos destaque ===== */}
      <section id="cursos" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <Badge variant="outline" className="mb-3">Cursos em destaque</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Programas mais procurados</h2>
            </div>
            <Link to="/candidatar">
              <Button variant="outline" className="gap-2">Ver todos os cursos <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cursosDestaque.map(c => (
              <Card key={c} className="p-5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer group">
                <Cpu className="w-5 h-5 text-primary group-hover:text-primary-foreground mb-3" />
                <p className="font-semibold">{c}</p>
                <p className="text-xs opacity-70 mt-1">Licenciatura · 4 anos</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testemunhos ===== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3">Comunidade</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">O que dizem os nossos estudantes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <Card key={t.name} className="p-6">
                <Quote className="w-7 h-7 text-secondary mb-3" />
                <p className="text-sm text-foreground leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.course}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Notícias ===== */}
      <section id="noticias" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <Badge variant="outline" className="mb-3">Notícias</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Últimas novidades</h2>
            </div>
            <Button variant="outline" className="gap-2"><Newspaper className="w-4 h-4" /> Ver todas</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {news.map(n => (
              <Card key={n.title} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10 flex items-center justify-center">
                  <Newspaper className="w-12 h-12 text-primary/40" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-primary text-primary-foreground text-[10px]">{n.tag}</Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {n.date}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">{n.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{n.desc}</p>
                  <p className="mt-4 text-xs text-primary font-medium flex items-center gap-1">
                    Ler mais <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold">O seu futuro começa na UPRA</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Candidate-se ao ano lectivo 2026/2027 ou aceda ao portal para acompanhar a sua vida académica.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/candidatar">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2">
                Iniciar candidatura <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 gap-2">
                <LogIn className="w-4 h-4" /> Portal académico
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer id="contacto" className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="leading-tight">
                <p className="font-bold">UPRA</p>
                <p className="text-[10px] opacity-70">Universidade Privada de Angola</p>
              </div>
            </div>
            <p className="text-xs opacity-70 leading-relaxed">
              Há quase quatro décadas a formar profissionais que constroem o futuro de Angola e do mundo.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-8 h-8 rounded-lg bg-background/10 hover:bg-background/20 flex items-center justify-center"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-background/10 hover:bg-background/20 flex items-center justify-center"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-background/10 hover:bg-background/20 flex items-center justify-center"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-background/10 hover:bg-background/20 flex items-center justify-center"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-4">Institucional</p>
            <ul className="space-y-2 text-xs opacity-80">
              <li><a href="#sobre" className="hover:opacity-100">Sobre a UPRA</a></li>
              <li><a href="#faculdades" className="hover:opacity-100">Faculdades</a></li>
              <li><a href="#" className="hover:opacity-100">Reitoria</a></li>
              <li><a href="#" className="hover:opacity-100">Centro de investigação</a></li>
              <li><a href="#" className="hover:opacity-100">Biblioteca</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-4">Estudantes</p>
            <ul className="space-y-2 text-xs opacity-80">
              <li><Link to="/inscricoes" className="hover:opacity-100">Candidaturas</Link></li>
              <li><Link to="/" className="hover:opacity-100">Portal académico</Link></li>
              <li><a href="#" className="hover:opacity-100">Calendário lectivo</a></li>
              <li><a href="#" className="hover:opacity-100">Propinas e bolsas</a></li>
              <li><a href="#" className="hover:opacity-100">Apoio ao estudante</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-4">Contacto</p>
            <ul className="space-y-2.5 text-xs opacity-80">
              <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Av. Independência, Campus UPRA, Luanda, Angola</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +244 222 000 000</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> info@upra.ao</li>
              <li className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> www.upra.ao</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-[11px] opacity-70">
            <p>© 2026 Universidade Privada de Angola. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:opacity-100">Termos</a>
              <a href="#" className="hover:opacity-100">Privacidade</a>
              <a href="#" className="hover:opacity-100">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
