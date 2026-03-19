/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Trophy, 
  Brain, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Info,
  Layers,
  Menu,
  X,
  Award,
  GraduationCap,
  Library,
  ArrowRight,
  Puzzle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Images ---
import macaImg from './assets/maca.png';
import relogioImg from './assets/relogio.png';
import aveImg from './assets/ave.png';
import florestaImg from './assets/floresta.png';
import rosaImg from './assets/rosa.png';

// --- Types ---

interface UserProgress {
  completedModules: string[];
  quizScores: Record<string, number>;
  cardsViewed: number;
  viewedCardIds: number[];
  points: number;
  badges: string[];
  isGuideFinished: boolean;
  userName?: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  image?: string;
  description?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

// --- Data ---

const GLOSSARY: GlossaryTerm[] = [
  { term: "Denotação", definition: "Nível literal e descritivo da imagem, onde se reconhece o que está representado sem interpretações culturais profundas." },
  { term: "Conotação", definition: "Nível simbólico e interpretativo, onde entram em jogo valores culturais, ideológicos e afetivos do observador." },
  { term: "Iconografia", definition: "Identificação de temas, personagens e narrativas específicas em imagens, baseada no conhecimento de fontes literárias e tradições." },
  { term: "Iconologia", definition: "Interpretação do significado intrínseco, revelando a atitude básica de uma nação, período ou classe social através da imagem." },
  { term: "Erwin Panofsky", definition: "Historiador da arte que estabeleceu o método de três níveis para a análise e interpretação de imagens." },
  { term: "Nível Pré-iconográfico", definition: "Primeiro nível de análise de Panofsky: percepção de formas, cores e objetos naturais (ex: homem, árvore, casa)." },
  { term: "Semiótica", definition: "Ciência que estuda os signos e os processos de significação, fundamental para entender a comunicação visual." },
  { term: "Índice", definition: "Signo que mantém uma relação de causalidade ou contiguidade física com o objeto que representa (ex: fumaça, pegada)." },
  { term: "Ícone", definition: "Signo que representa o objeto por semelhança física ou analogia (ex: fotografia, desenho realista, mapa)." },
  { term: "Símbolo", definition: "Signo cuja relação com o objeto é arbitrária, baseada em convenções sociais ou culturais (ex: bandeira, cruz, logotipos)." }
];

// Pre-compute glossary helpers for performance
const SORTED_GLOSSARY_TERMS = [...GLOSSARY].sort((a, b) => b.term.length - a.term.length);
const GLOSSARY_REGEX = new RegExp(`(${SORTED_GLOSSARY_TERMS.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
const GLOSSARY_MAP = new Map(GLOSSARY.map(g => [g.term.toLowerCase(), g]));

const FLASHCARDS: Flashcard[] = [
  { id: 1, category: "Teoria", front: "O que é o nível pré-iconográfico?", back: "É a identificação primária de formas, cores e objetos naturais sem interpretação narrativa ou simbólica profunda." },
  { id: 2, category: "Semiótica", front: "Qual a diferença entre ícone e índice?", back: "O ícone assemelha-se ao objeto (foto), enquanto o índice é um vestígio ou causa física do objeto (fumaça indica fogo)." },
  { id: 3, category: "Método", front: "O que Panofsky define como Iconologia?", back: "A interpretação do significado intrínseco que reflete os valores, a filosofia e a mentalidade de uma civilização." },
  { id: 4, category: "Análise", front: "O que é a denotação na imagem?", back: "É o sentido óbvio, literal e descritivo da representação visual, comum a observadores de diferentes culturas." },
  { id: 5, category: "Informação", front: "Como a semiótica ajuda na indexação?", back: "Permite entender como os signos funcionam para atribuir metadados precisos que facilitem a recuperação da imagem." }
];

const QUIZ_1: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual o primeiro nível de análise proposto por Erwin Panofsky?",
    options: [
      "Nível Iconográfico",
      "Nível Iconológico",
      "Nível Pré-iconográfico",
      "Nível Semiótico"
    ],
    correctAnswer: 2,
    explanation: "O nível pré-iconográfico foca na percepção de formas, cores e objetos naturais antes de qualquer interpretação cultural."
  },
  {
    id: 2,
    question: "A identificação de uma cena como 'A Última Ceia' pertence a qual nível?",
    options: [
      "Pré-iconográfico",
      "Iconográfico",
      "Iconológico",
      "Denotativo"
    ],
    correctAnswer: 1,
    explanation: "O nível iconográfico identifica temas, personagens e narrativas específicas baseadas em conhecimentos literários ou culturais."
  },
  {
    id: 3,
    question: "Qual nível busca o 'significado intrínseco' e os valores de uma época?",
    options: [
      "Nível Pré-iconográfico",
      "Nível Iconográfico",
      "Nível Iconológico",
      "Nível Descritivo"
    ],
    correctAnswer: 2,
    explanation: "A iconologia busca entender a imagem como um sintoma cultural de uma sociedade ou período histórico."
  }
];

const QUIZ_2: QuizQuestion[] = [
  {
    id: 1,
    question: "Uma fotografia é classificada predominantemente como qual tipo de signo?",
    options: [
      "Símbolo",
      "Índice",
      "Ícone",
      "Metáfora"
    ],
    correctAnswer: 2,
    explanation: "O ícone representa o objeto por semelhança física, o que é a característica principal da fotografia realista."
  },
  {
    id: 2,
    question: "A fumaça que indica a existência de fogo é um exemplo de:",
    options: [
      "Ícone",
      "Índice",
      "Símbolo",
      "Convenção"
    ],
    correctAnswer: 1,
    explanation: "O índice mantém uma relação de causalidade ou contiguidade física com o objeto que representa."
  },
  {
    id: 3,
    question: "Qual autor discutiu a 'Retórica da Imagem' e os níveis de denotação e conotação?",
    options: [
      "Erwin Panofsky",
      "Charles Pierce",
      "Roland Barthes",
      "Umberto Eco"
    ],
    correctAnswer: 2,
    explanation: "Roland Barthes foi fundamental para a semiótica visual ao analisar como as imagens transmitem mensagens literais e simbólicas."
  }
];

const QUIZ_3: QuizQuestion[] = [
  {
    id: 1,
    question: "Analise a imagem abaixo. Qual o sentido DENOTATIVO predominante?",
    image: macaImg,
    description: "Uma maçã vermelha sobre uma mesa de madeira.",
    options: [
      "Tentação e pecado original",
      "Saúde e alimentação equilibrada",
      "Um fruto comestível de uma macieira",
      "O conhecimento proibido"
    ],
    correctAnswer: 2,
    explanation: "A denotação é o sentido literal: a imagem mostra apenas o fruto real, sem interpretações simbólicas."
  },
  {
    id: 2,
    question: "Nesta imagem de um relógio derretendo, qual o sentido CONOTATIVO mais provável?",
    image: relogioImg,
    description: "Um relógio de bolso que parece estar derretendo sobre uma superfície.",
    options: [
      "O relógio está com defeito técnico",
      "A fluidez e a relatividade do tempo",
      "O metal está em alta temperatura",
      "Um objeto circular de medição"
    ],
    correctAnswer: 1,
    explanation: "A conotação envolve o sentido figurado. Um relógio derretendo simboliza a passagem subjetiva ou a distorção do tempo."
  },
  {
    id: 3,
    question: "Ao ver esta imagem de uma pomba branca, qual interpretação é CONOTATIVA?",
    image: aveImg,
    description: "Uma ave branca voando contra um céu azul limpo.",
    options: [
      "Uma ave da família Columbidae",
      "Um animal com penas e bico",
      "O símbolo universal da paz",
      "Um ser vertebrado ovíparo"
    ],
    correctAnswer: 2,
    explanation: "A pomba branca é culturalmente associada à paz, o que constitui um significado conotativo (simbólico)."
  },
  {
    id: 4,
    question: "Qual descrição representa a DENOTAÇÃO desta imagem?",
    image: florestaImg,
    description: "Uma floresta densa com raios de sol atravessando as árvores.",
    options: [
      "O mistério do desconhecido",
      "A esperança que surge na escuridão",
      "Um ecossistema composto por árvores e vegetação",
      "O pulmão do mundo em perigo"
    ],
    correctAnswer: 2,
    explanation: "A denotação foca na descrição objetiva do que está presente na imagem: árvores e vegetação."
  },
  {
    id: 5,
    question: "Em uma propaganda de perfume, uma rosa vermelha é usada. Qual o sentido CONOTATIVO pretendido?",
    image: rosaImg,
    description: "Uma rosa vermelha com gotas de orvalho nas pétalas.",
    options: [
      "Uma flor do gênero Rosa",
      "Paixão, romance e sedução",
      "Uma planta com espinhos no caule",
      "Um vegetal que realiza fotossíntese"
    ],
    correctAnswer: 1,
    explanation: "Propagandas usam a conotação para associar produtos a sentimentos. A rosa vermelha evoca paixão e romance."
  }
];

// --- Components ---

const TooltipTerm = React.memo(({ term, item }: { term: string, item: GlossaryTerm }) => {
  const [show, setShow] = useState(false);
  
  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      <span className="cursor-help border-b-2 border-emerald-400/50 hover:border-emerald-500 hover:bg-emerald-50 transition-all px-0.5 rounded-sm font-medium text-slate-800">
        {term}
      </span>
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-50 block"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-black text-emerald-400 uppercase tracking-tighter block">{item.term}</span>
              <button onClick={(e) => { e.stopPropagation(); setShow(false); }} className="lg:hidden text-slate-400 hover:text-white">
                <X size={12} />
              </button>
            </div>
            <span className="leading-relaxed opacity-90 block">{item.definition}</span>
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900 block" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
});


const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
    <motion.div 
      className="bg-emerald-500 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

const Badge = ({ name, icon: Icon, unlocked }: { name: string, icon: React.ElementType, unlocked: boolean }) => (
  <div className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${unlocked ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400 grayscale'}`}>
    <Icon size={32} className="mb-2" />
    <span className="text-xs font-bold text-center uppercase tracking-wider">{name}</span>
  </div>
);

const renderTextWithTooltips = (text: string) => {
  if (!text) return "";
  const parts = text.split(GLOSSARY_REGEX);
  return parts.map((part, i) => {
    const item = GLOSSARY_MAP.get(part.toLowerCase());
    if (item) return <TooltipTerm key={`${part}-${i}`} term={part} item={item} />;
    return part;
  });
};

interface ViewProps {
  progress: UserProgress;
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
  setActiveTab: (tab: 'guide' | 'glossary' | 'cards' | 'quiz') => void;
  addPoints: (amount: number) => void;
  completeModule: (id: string) => void;
  canAccessAdvanced: boolean;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

const GuideView = ({ progress, completeModule, canAccessAdvanced, setActiveTab }: Pick<ViewProps, 'progress' | 'completeModule' | 'canAccessAdvanced' | 'setActiveTab'>) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const modules = [
    { 
      id: 'm1', 
      title: 'Introdução ao Reconhecimento de Imagens', 
      author: 'Aumont (2002)',
      content: 'O reconhecimento de imagens começa com a percepção biológica, mas evolui para uma interpretação cultural. É o processo de identificar formas, cores e texturas e atribuir-lhes significados. Na Ciência da Informação, entender como as imagens são lidas é crucial para sua organização e recuperação. A transição do olhar denotativo (literal) para o conotativo (simbólico) é o primeiro passo para a análise profunda.' 
    },
    { 
      id: 'm2', 
      title: 'O Método de Erwin Panofsky', 
      author: 'Joly (1996)',
      content: 'Erwin Panofsky propôs três níveis de análise: 1. Pré-iconográfico (descrição natural de formas e objetos); 2. Iconográfico (identificação de temas e narrativas específicas); 3. Iconológico (interpretação do significado intrínseco que reflete a mentalidade de uma época). Este método permite que o pesquisador vá além da superfície da imagem, alcançando suas raízes culturais e históricas.' 
    },
    { 
      id: 'm3', 
      title: 'Semiótica e a Natureza do Signo', 
      author: 'Dondis (2003)',
      content: 'Charles Pierce classificou os signos em três categorias principais: Ícones (semelhança), Índices (causalidade) e Símbolos (convenção). Lucia Santaella destaca como essa tríade é essencial para interpretar imagens no mundo contemporâneo. Entender se uma imagem funciona como um vestígio físico (índice) ou como uma representação cultural (símbolo) altera completamente a forma como ela deve ser indexada e recuperada.' 
    },
    { 
      id: 'm4', 
      title: 'Retórica da Imagem e Conotação', 
      author: 'Manguel (2001)',
      content: 'Roland Barthes explorou como as imagens "falam" através da conotação. Para Barthes, a denotação é o que a imagem mostra, enquanto a conotação é o que ela evoca. Em sua análise da publicidade, ele demonstrou que cada elemento visual é escolhido para transmitir uma mensagem ideológica ou emocional específica, criando uma "retórica" que guia a interpretação do observador.' 
    },
    { 
      id: 'm5', 
      title: 'Indexação e Representação de Imagens', 
      author: 'Smit (1996)',
      content: 'Johanna Smit discute os desafios de transformar a interpretação visual em metadados. A indexação de imagens exige a tradução de conceitos visuais para linguagens documentárias. O desafio é equilibrar a descrição objetiva (o que está lá) com a análise de conteúdo (o que significa), garantindo que diferentes usuários consigam encontrar a imagem através de termos de busca precisos e padronizados.' 
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <header className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-200 font-bold uppercase tracking-widest text-xs">
            <BookOpen size={14} /> Nível 1: Exploração de Conteúdo
          </div>
          <h2 className="text-3xl font-black italic tracking-tight">Reconhecimento de Imagens</h2>
          <p className="text-emerald-50 max-w-xl leading-relaxed">GUIA INTERATIVO DE ICIB89/ICI/UFBA. Domine os processos de interpretação visual.</p>
        </div>
        <Library className="absolute -right-8 -bottom-8 text-white/10 w-64 h-64 rotate-12" />
      </header>

      <div className="grid gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-8 rounded-3xl border-2 border-slate-100 bg-white space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          ))
        ) : (
          modules.map((module) => (
            <motion.div 
              key={module.id}
              layoutId={module.id}
              animate={progress.completedModules.includes(module.id) ? { scale: [1, 1.03, 1], transition: { duration: 0.5 } } : {}}
              className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 ${progress.completedModules.includes(module.id) ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white shadow-xl shadow-slate-200/50'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60">{module.author}</span>
                  <h3 className="text-2xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors">{module.title}</h3>
                </div>
                {progress.completedModules.includes(module.id) ? (
                  <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg shadow-emerald-200">
                    <CheckCircle2 size={20} />
                  </div>
                ) : (
                  <div className="bg-slate-100 text-slate-400 p-2 rounded-full">
                    <BookOpen size={20} />
                  </div>
                )}
              </div>
              <div className="text-slate-600 mb-8 leading-relaxed text-lg">{renderTextWithTooltips(module.content)}</div>
              {!progress.completedModules.includes(module.id) ? (
                <button 
                  onClick={() => completeModule(module.id)}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                >
                  Concluir Leitura <ChevronRight size={20} />
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full py-4 bg-emerald-100 text-emerald-700 font-black rounded-2xl flex items-center justify-center gap-3 border-2 border-emerald-200"
                >
                  <CheckCircle2 size={20} /> Módulo Concluído (+50 XP)
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <section className="mt-20 p-10 bg-slate-900 rounded-[3rem] text-slate-300 space-y-8 border-4 border-slate-800">
        <div className="flex items-center gap-3 text-white">
          <Library className="text-emerald-500" />
          <h3 className="text-2xl font-black italic">Referências</h3>
        </div>
        <div className="space-y-6 text-sm leading-relaxed font-mono">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full bg-slate-800" />
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
              </div>
            ))
          ) : (
            <>
          <p>AUMONT, Jacques. <b>A imagem</b>. 7. ed. Campinas, SP: Papirus, 2002.</p>
          <p>DONDIS, Donis A. <b>Sintaxe da linguagem visual</b>. São Paulo: Martins Fontes, 2003.</p>
          <p>JOLY, Martine. <b>Introdução à análise da imagem</b>. Campinas, SP: Papirus, 1996.</p>
          <p>MANGUEL, Alberto. <b>Lendo imagens</b>: uma história de amor e ódio. São Paulo: Companhia das Letras, 2001.</p>
          <p>SMIT, Johanna W. A representação da imagem. <b>Informare</b>, Rio de Janeiro, v. 2, n. 2, p. 28-36, jul./dez. 1996.</p>
            </>
          )}
        </div>
      </section>

      {canAccessAdvanced && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 p-8 rounded-3xl bg-emerald-50 border-4 border-emerald-200 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Trophy size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-emerald-900">Parabéns, {progress.userName || 'Estudante'}!</h3>
            <p className="text-emerald-700 font-medium">Você concluiu todas as leituras obrigatórias. Agora você está pronto para os desafios finais.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button 
              onClick={() => setActiveTab('cards')}
              className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-emerald-200 rounded-2xl font-black text-emerald-600 hover:bg-emerald-100 transition-all"
            >
              <Brain size={24} /> Praticar com Cards
            </button>
            <button 
              onClick={() => setActiveTab('quiz')}
              className="flex items-center justify-center gap-3 p-4 bg-emerald-600 rounded-2xl font-black text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
            >
              <HelpCircle size={24} /> Testar no Quiz
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const GlossaryView = () => {
  const [viewMode, setViewMode] = useState<'list' | 'study'>('list');
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < GLOSSARY.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-3xl font-bold text-slate-900">Glossário de Conceitos</h2>
          <p className="text-slate-600">Termos fundamentais da economia política do livro.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border-2 border-slate-100 shadow-sm">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Lista
          </button>
          <button 
            onClick={() => setViewMode('study')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'study' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Estudo
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {GLOSSARY.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                onClick={() => { setCurrentIndex(index); setViewMode('study'); }}
              >
                <h3 className="text-lg font-black text-emerald-600 mb-2 uppercase tracking-tighter group-hover:scale-105 origin-left transition-transform">{item.term}</h3>
                <p className="text-slate-600 leading-relaxed line-clamp-2">{item.definition}</p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="study"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl mx-auto space-y-10"
          >
            <div className="relative aspect-[4/3] sm:aspect-video bg-white rounded-[2.5rem] border-4 border-emerald-100 shadow-2xl flex flex-col items-center justify-center p-8 sm:p-12 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500/10">
                <motion.div 
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / GLOSSARY.length) * 100}%` }}
                />
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Conceito {currentIndex + 1} de {GLOSSARY.length}</span>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 italic tracking-tight leading-tight">
                    {GLOSSARY[currentIndex].term}
                  </h3>
                  <div className="h-px w-12 bg-emerald-200 mx-auto" />
                  <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
                    {GLOSSARY[currentIndex].definition}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex gap-1">
                {GLOSSARY.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-200'}`} 
                  />
                ))}
              </div>

              <button 
                onClick={handleNext} 
                disabled={currentIndex === GLOSSARY.length - 1}
                className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all shadow-xl"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CardsView = ({ progress, setProgress, setActiveTab, canAccessAdvanced }: Omit<ViewProps, 'addPoints' | 'completeModule'>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (canAccessAdvanced) {
      const cardId = FLASHCARDS[currentIndex].id;
      if (!progress.viewedCardIds.includes(cardId)) {
        setProgress(prev => ({
          ...prev,
          viewedCardIds: [...prev.viewedCardIds, cardId],
          cardsViewed: Math.max(prev.cardsViewed, prev.viewedCardIds.length + 1)
        }));
      }
    }
  }, [currentIndex, canAccessAdvanced]);

  if (!canAccessAdvanced) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 border-4 border-dashed border-slate-200">
          <Brain size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 italic">Artefatos Bloqueados</h2>
        <p className="text-slate-500 max-w-sm">Você precisa concluir a leitura de todos os módulos do Guia de Estudo para desbloquear os Cards Didáticos.</p>
        <button onClick={() => setActiveTab('guide')} className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all">Voltar ao Guia</button>
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < FLASHCARDS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  return (
    <div className="flex flex-col items-center space-y-12 py-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Cards Didáticos</h2>
        <p className="text-slate-600">Revise conceitos-chave de forma rápida.</p>
      </div>

      <div className="w-full max-w-md aspect-[3/4] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -50, rotateY: 10 }}
            className="w-full h-full cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div 
              className="w-full h-full relative transition-all duration-500 preserve-3d"
              animate={{ 
                rotateY: isFlipped ? 180 : 0,
                scale: [1, 1.03, 1]
              }}
              transition={{ 
                rotateY: { duration: 0.6, ease: "easeInOut" },
                scale: { duration: 0.3 }
              }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white border-4 border-emerald-100 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">{FLASHCARDS[currentIndex].category}</span>
                <h3 className="text-2xl font-bold text-slate-800">{renderTextWithTooltips(FLASHCARDS[currentIndex].front)}</h3>
                <p className="mt-6 text-slate-400 text-sm flex items-center gap-2"><Info size={14} /> Clique para virar</p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-emerald-600 text-white border-4 border-emerald-500 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center rotate-y-180 overflow-y-auto">
                <div className="text-lg leading-relaxed">{renderTextWithTooltips(FLASHCARDS[currentIndex].back)}</div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6">
        <button onClick={handlePrev} disabled={currentIndex === 0} className="p-3 rounded-full bg-white border border-slate-200 disabled:opacity-30 shadow-sm transition-all hover:bg-slate-50"><ChevronLeft /></button>
        <div className="flex items-center gap-3">
          <span className="font-black text-slate-800 text-lg">{currentIndex + 1} / {FLASHCARDS.length}</span>
          {progress.viewedCardIds.includes(FLASHCARDS[currentIndex].id) && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-emerald-100 text-emerald-600 p-1 rounded-full"
              title="Card Visualizado"
            >
              <CheckCircle2 size={14} />
            </motion.div>
          )}
        </div>
        <button onClick={handleNext} disabled={currentIndex === FLASHCARDS.length - 1} className="p-3 rounded-full bg-white border border-slate-200 disabled:opacity-30 shadow-sm transition-all hover:bg-slate-50"><ChevronRight /></button>
      </div>
    </div>
  );
};

const ChallengeView = ({ addPoints, canAccessAdvanced, setActiveTab }: Pick<ViewProps, 'addPoints' | 'canAccessAdvanced' | 'setActiveTab'>) => {
  const [selectedConcept, setSelectedConcept] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [wrongMatch, setWrongMatch] = useState<{concept: number, def: number} | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const concepts = useMemo(() => [
    { id: 1, term: "Denotação", defId: 101 },
    { id: 2, term: "Conotação", defId: 102 },
    { id: 3, term: "Iconografia", defId: 103 },
    { id: 4, term: "Índice", defId: 104 },
    { id: 5, term: "Ícone", defId: 105 }
  ], []);

  const definitions = useMemo(() => [
    { id: 104, text: "Signo com relação de causalidade física (ex: pegada)." },
    { id: 101, text: "Nível literal e descritivo da representação visual." },
    { id: 105, text: "Signo que representa o objeto por semelhança física." },
    { id: 102, text: "Nível simbólico e interpretativo da imagem." },
    { id: 103, text: "Identificação de temas e narrativas específicas." }
  ].sort(() => Math.random() - 0.5), []);

  if (!canAccessAdvanced) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 border-4 border-dashed border-slate-200">
          <Puzzle size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 italic">Desafio Bloqueado</h2>
        <p className="text-slate-500 max-w-sm">Conclua o Guia de Estudo para testar sua agilidade mental neste desafio de conceitos.</p>
        <button onClick={() => setActiveTab('guide')} className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all">Voltar ao Guia</button>
      </div>
    );
  }

  const handleMatch = (defId: number) => {
    if (selectedConcept === null) return;
    
    const concept = concepts.find(c => c.id === selectedConcept);
    if (concept?.defId === defId) {
      const newMatches = { ...matches, [selectedConcept]: defId };
      setMatches(newMatches);
      setSelectedConcept(null);
      addPoints(30);
      
      if (Object.keys(newMatches).length === concepts.length) {
        setIsFinished(true);
      }
    } else {
      setWrongMatch({ concept: selectedConcept, def: defId });
      setTimeout(() => setWrongMatch(null), 1000);
      setSelectedConcept(null);
    }
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center space-y-8"
      >
        <div className="w-32 h-32 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200">
          <Trophy size={64} />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 italic">Mestre dos Conceitos!</h2>
          <p className="text-slate-600 text-lg">Você relacionou todos os termos corretamente e provou seu domínio teórico.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setMatches({}); setIsFinished(false); }}
            className="px-8 py-4 bg-white border-2 border-emerald-500 text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all"
          >
            Jogar Novamente
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all"
          >
            Ir para o Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Desafio de Conexões</h2>
        <p className="text-slate-600">Relacione cada conceito à sua definição correta.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Concepts Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Conceitos</h3>
          {concepts.map((c) => (
            <button
              key={c.id}
              disabled={!!matches[c.id]}
              onClick={() => setSelectedConcept(c.id)}
              className={`w-full p-6 rounded-2xl border-2 font-bold transition-all text-left flex items-center justify-between group ${
                matches[c.id] 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-60' 
                  : selectedConcept === c.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg'
                    : wrongMatch?.concept === c.id
                      ? 'border-red-500 bg-red-50 text-red-700 animate-shake'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <span>{c.term}</span>
              {matches[c.id] && <CheckCircle2 size={20} />}
            </button>
          ))}
        </div>

        {/* Definitions Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Definições</h3>
          {definitions.map((d) => {
            const matchedConceptId = Object.keys(matches).find(key => matches[Number(key)] === d.id);
            return (
              <button
                key={d.id}
                disabled={!!matchedConceptId}
                onClick={() => handleMatch(d.id)}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-sm leading-relaxed text-left flex items-center justify-between group ${
                  matchedConceptId 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-60' 
                    : wrongMatch?.def === d.id
                      ? 'border-red-500 bg-red-50 text-red-700 animate-shake'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <span>{d.text}</span>
                {matchedConceptId && <CheckCircle2 size={20} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const QuizView = ({ progress, setProgress, setActiveTab, canAccessAdvanced, addPoints }: Omit<ViewProps, 'completeModule'>) => {
  const [activeQuiz, setActiveQuiz] = useState<1 | 2 | 3 | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  if (!canAccessAdvanced) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 border-4 border-dashed border-slate-200">
          <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 italic">Desafios Bloqueados</h2>
        <p className="text-slate-500 max-w-sm">A prova final só é liberada para aqueles que absorveram todo o conhecimento do Guia de Estudo.</p>
        <button onClick={() => setActiveTab('guide')} className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all">Voltar ao Guia</button>
      </div>
    );
  }

  const questions = activeQuiz === 1 ? QUIZ_1 : activeQuiz === 2 ? QUIZ_2 : QUIZ_3;

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
      addPoints(20);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      const finalScore = Math.round((score / questions.length) * 100);
      setProgress(prev => ({
        ...prev,
        quizScores: { ...prev.quizScores, [`quiz_${activeQuiz}`]: finalScore }
      }));
    }
  };

  const allQuizzesCompleted = Object.keys(progress.quizScores).length === 3;
  const averageScore = allQuizzesCompleted 
    ? Math.round((Object.values(progress.quizScores) as number[]).reduce((a, b) => a + b, 0) / 3)
    : 0;

  if (!activeQuiz) {
    return (
      <div className="space-y-8 pb-20">
        <header className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Quizzes</h2>
          <p className="text-slate-600">Teste seus conhecimentos e ganhe pontos.</p>
        </header>

        {allQuizzesCompleted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <Award size={120} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-200" />
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Jornada Concluída</span>
                </div>
                <h3 className="text-3xl font-black italic tracking-tight">Resultado Final</h3>
              </div>
              
              <div className="flex items-end gap-4">
                <div className="text-6xl font-black">{averageScore}%</div>
                <div className="pb-2">
                  <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest">Média Geral</p>
                  <p className="text-xs font-medium opacity-80">Você completou todos os desafios!</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold border border-white/10">
                  {progress.points} XP Acumulados
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold border border-white/10">
                  {Object.keys(progress.quizScores).length} Quizzes Feitos
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {Object.keys(progress.quizScores).length > 0 && !allQuizzesCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4"
          >
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Trophy size={14} className="text-amber-500" /> Histórico de Desempenho
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map(id => {
                const score = progress.quizScores[`quiz_${id}`];
                const hasTaken = score !== undefined;
                return (
                  <div key={id} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800">Quiz {id}</span>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {id === 1 ? 'Níveis de Panofsky' : id === 2 ? 'Semiótica e Signos' : 'Análise Visual'}
                        </p>
                      </div>
                      <span className={`text-sm font-black ${hasTaken ? (score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-600') : 'text-slate-300'}`}>
                        {hasTaken ? `${score}%` : 'Não realizado'}
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: hasTaken ? `${score}%` : 0 }}
                        className={`h-full rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      />
                    </div>
                    {hasTaken && (
                      <p className="text-[10px] font-bold italic text-slate-400">
                        {score === 100 ? 'Excelente! Domínio total.' : score >= 70 ? 'Bom desempenho, continue assim.' : 'Recomendamos revisar o conteúdo.'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { id: 1, title: 'Níveis de Panofsky', desc: 'Sobre o método pré-iconográfico, iconográfico e iconológico.' },
            { id: 2, title: 'Semiótica e Signos', desc: 'Sobre ícones, índices, símbolos e a retórica da imagem.' },
            { id: 3, title: 'Análise Visual', desc: 'Treine conotação e denotação com exemplos visuais reais.' }
          ].map(q => (
            <div key={q.id} className="p-6 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{q.title}</h3>
              <p className="text-slate-600 mb-6 flex-grow">{q.desc}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-sm font-bold text-slate-400">
                  {progress.quizScores[`quiz_${q.id}`] !== undefined ? `Melhor Score: ${progress.quizScores[`quiz_${q.id}`]}%` : 'Não iniciado'}
                </span>
                <button 
                  onClick={() => setActiveQuiz(q.id as 1 | 2 | 3)}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Começar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Quiz Finalizado!</h2>
        <p className="text-xl text-slate-600">Você acertou <span className="font-bold text-emerald-600">{score}</span> de <span className="font-bold">{questions.length}</span> questões.</p>
        <div className="w-full max-w-full bg-slate-100 h-4 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full" style={{ width: `${(score / questions.length) * 100}%` }} />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          {allQuizzesCompleted ? (
            <button 
              onClick={() => {
                setActiveQuiz(null);
                setShowResult(false);
                setScore(0);
                setCurrentQuestion(0);
                setIsAnswered(false);
                setSelectedOption(null);
              }}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <Award size={20} /> Ver Resultado Final
            </button>
          ) : (
            <button 
              onClick={() => {
                setShowResult(false);
                setScore(0);
                setCurrentQuestion(0);
                setIsAnswered(false);
                setSelectedOption(null);
              }}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> Refazer Quiz
            </button>
          )}
          <button 
            onClick={() => {
              setActiveQuiz(null);
              setShowResult(false);
              setScore(0);
              setCurrentQuestion(0);
              setIsAnswered(false);
              setSelectedOption(null);
            }}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
          >
            Voltar aos Quizzes
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <button onClick={() => setActiveQuiz(null)} className="text-slate-400 hover:text-slate-600 flex items-center gap-1"><ChevronLeft size={18} /> Sair</button>
        <span className="font-bold text-slate-500">Questão {currentQuestion + 1} de {questions.length}</span>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-800 leading-tight">{renderTextWithTooltips(q.question)}</h3>
        
        {q.image && (
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden border-4 border-white shadow-xl aspect-video relative group">
              <img 
                src={q.image} 
                alt="Análise Visual" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>
            {q.description && (
              <p className="text-sm italic text-slate-500 bg-slate-50 p-4 rounded-xl border-l-4 border-emerald-500">
                <span className="font-bold not-italic text-slate-700">Descrição:</span> {q.description}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => handleAnswer(i)}
              className={`p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between ${
                isAnswered 
                  ? i === q.correctAnswer 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : selectedOption === i 
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-100 bg-white opacity-40'
                  : 'border-slate-100 bg-white hover:border-emerald-200 active:bg-slate-50'
              }`}
            >
              <span className="font-medium">{opt}</span>
              {isAnswered && i === q.correctAnswer && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </motion.div>
              )}
              {isAnswered && selectedOption === i && i !== q.correctAnswer && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <XCircle size={20} className="text-red-500" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {isAnswered && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
        >
          <div className="font-bold text-slate-800 flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {selectedOption === q.correctAnswer ? (
                <CheckCircle2 className="text-emerald-600" size={24} />
              ) : (
                <XCircle className="text-red-600" size={24} />
              )}
            </motion.div>
            {selectedOption === q.correctAnswer ? 'Resposta Correta!' : 'Resposta Incorreta'}
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{q.explanation}</p>
          <button
            onClick={nextQuestion}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            {currentQuestion + 1 === questions.length ? 'Finalizar Quiz' : 'Próxima Questão'} <ArrowRight size={20} />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'guide' | 'glossary' | 'cards' | 'quiz' | 'challenge'>('guide');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [progress, setProgress] = useState<UserProgress>({
    completedModules: [],
    quizScores: {},
    cardsViewed: 0,
    viewedCardIds: [],
    points: 0,
    badges: [],
    isGuideFinished: false,
    userName: ''
  });

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('ufba_study_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new fields are initialized and merged correctly
        setProgress(prev => ({
          ...prev,
          ...parsed,
          viewedCardIds: Array.isArray(parsed.viewedCardIds) ? parsed.viewedCardIds : []
        }));
        if (!parsed.userName) setShowOnboarding(true);
      } catch (e) {
        console.error("Error parsing saved progress:", e);
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ufba_study_progress', JSON.stringify(progress));
  }, [progress]);

  const addPoints = (amount: number) => {
    setProgress(prev => ({ ...prev, points: prev.points + amount }));
  };

  const handleReset = () => {
    setProgress({ completedModules: [], quizScores: {}, cardsViewed: 0, viewedCardIds: [], points: 0, badges: [], userName: '', isGuideFinished: false });
    localStorage.removeItem('ufba_study_progress');
    setShowResetConfirm(false);
    setShowOnboarding(true);
  };
  const completeModule = (id: string) => {
    if (!progress.completedModules.includes(id)) {
      const newCompleted = [...progress.completedModules, id];
      const isFinished = newCompleted.length === 5;
      setProgress(prev => ({
        ...prev,
        completedModules: newCompleted,
        points: prev.points + 50,
        isGuideFinished: isFinished
      }));
    }
  };

  const totalProgress = useMemo(() => {
    const moduleWeight = (progress.completedModules.length / 5) * 40;
    const quizWeight = (Object.keys(progress.quizScores).length / 2) * 40;
    const cardWeight = (progress.viewedCardIds.length / FLASHCARDS.length) * 20;
    return Math.min(100, moduleWeight + quizWeight + cardWeight);
  }, [progress]);

  const userLevel = useMemo(() => {
    if (progress.points >= 1000) return { name: 'Mestre da Iconologia', lv: 4 };
    if (progress.points >= 500) return { name: 'Analista Visual', lv: 3 };
    if (progress.points >= 200) return { name: 'Observador Atento', lv: 2 };
    return { name: 'Novato', lv: 1 };
  }, [progress.points]);

  const canAccessAdvanced = progress.completedModules.length === 5;

  const renderContent = () => {
    switch (activeTab) {
      case 'guide': return <GuideView progress={progress} completeModule={completeModule} canAccessAdvanced={canAccessAdvanced} setActiveTab={setActiveTab} />;
      case 'glossary': return <GlossaryView />;
      case 'cards': return <CardsView progress={progress} setProgress={setProgress} setActiveTab={setActiveTab} canAccessAdvanced={canAccessAdvanced} />;
      case 'challenge': return <ChallengeView addPoints={addPoints} canAccessAdvanced={canAccessAdvanced} setActiveTab={setActiveTab} />;
      case 'quiz': return <QuizView progress={progress} setProgress={setProgress} setActiveTab={setActiveTab} canAccessAdvanced={canAccessAdvanced} addPoints={addPoints} />;
      default: return null;
    }
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 h-full bg-white p-6 space-y-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-600 font-black text-lg">
                  <GraduationCap /> <span>Interpretação de Imagens</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
                  aria-label="Fechar menu"
                >
                  <X size={24} />
                </button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-8 p-3 bg-emerald-50 rounded-2xl border border-emerald-100"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl shadow-inner text-white">
                  <GraduationCap size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Estudante</span>
                  <span className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{progress.userName || 'Visitante'}</span>
                </div>
              </motion.div>

              <nav className="space-y-2">
                {[
                  { id: 'guide', label: 'Guia de Estudo', icon: BookOpen },
                  { id: 'glossary', label: 'Glossário', icon: Layers },
                  { id: 'cards', label: 'Cards Didáticos', icon: Brain },
                  { id: 'challenge', label: 'Desafio Conexão', icon: Puzzle },
                  { id: 'quiz', label: 'Quizzes', icon: HelpCircle }
                ].map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    disabled={(item.id === 'quiz' || item.id === 'cards' || item.id === 'challenge') && !canAccessAdvanced}
                    onClick={() => { setActiveTab(item.id as any); setIsMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50'} ${((item.id === 'quiz' || item.id === 'cards' || item.id === 'challenge') && !canAccessAdvanced) ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                  >
                    <item.icon size={20} /> {item.label}
                    {(item.id === 'quiz' || item.id === 'cards' || item.id === 'challenge') && !canAccessAdvanced && <X size={14} className="ml-auto" />}
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-10 space-y-5 overflow-y-auto custom-scrollbar">
                <header className="text-center space-y-2">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <GraduationCap size={28} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 italic tracking-tight">Bem-vindo ao Guia Interativo</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">Prepare-se para explorar os processos de reconhecimento e interpretação de imagens. Mas antes, como devemos te chamar?</p>
                </header>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
                    <input 
                      type="text" 
                      value={progress.userName}
                      onChange={(e) => setProgress(prev => ({ ...prev, userName: e.target.value }))}
                      placeholder="Digite seu nome..."
                      className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold transition-all text-sm"
                    />
                  </div>
                </div>

                <button 
                  disabled={!progress.userName?.trim()}
                  onClick={() => setShowOnboarding(false)}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all shadow-xl"
                >
                  Começar Jornada
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <RotateCcw size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Reiniciar Progresso?</h3>
                <p className="text-slate-500">Isso apagará permanentemente todos os seus pontos, módulos concluídos e conquistas. Esta ação não pode ser desfeita.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleReset}
                  className="py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  Sim, Reiniciar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <GraduationCap size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Interpretação de Imagens</h1>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">GUIA INTERATIVO DE ICIB89/ICI/UFBA</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível {userLevel.lv}</span>
              <span className="text-sm font-black text-slate-800">{userLevel.name}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
              <Trophy className="text-amber-500" size={18} />
              <span className="font-black text-slate-800">{progress.points}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">XP</span>
            </div>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="p-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
              title="Reiniciar Progresso"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8">
            <div className="p-6 bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner text-white">
                  <GraduationCap size={28} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Estudante</span>
                  <span className="text-lg font-black text-slate-800 truncate max-w-[140px] leading-tight">{progress.userName || 'Visitante'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Progresso Geral</span>
                  <span>{Math.round(totalProgress)}%</span>
                </div>
                <ProgressBar progress={totalProgress} />
              </div>

              <nav className="space-y-1 pt-4">
                {[
                  { id: 'guide', label: 'Guia de Estudo', icon: BookOpen },
                  { id: 'glossary', label: 'Glossário', icon: Layers },
                  { id: 'cards', label: 'Cards Didáticos', icon: Brain },
                  { id: 'challenge', label: 'Desafio Conexão', icon: Puzzle },
                  { id: 'quiz', label: 'Quizzes', icon: HelpCircle }
                ].map((item) => (
                  <button
                    key={item.id}
                    disabled={(item.id === 'quiz' || item.id === 'cards' || item.id === 'challenge') && !canAccessAdvanced}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50'} ${((item.id === 'quiz' || item.id === 'cards' || item.id === 'challenge') && !canAccessAdvanced) ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                  >
                    <item.icon size={20} /> {item.label}
                    {(item.id === 'quiz' || item.id === 'cards' || item.id === 'challenge') && !canAccessAdvanced && <X size={14} className="ml-auto" />}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Conquistas</h4>
              <div className="grid grid-cols-2 gap-3">
                <Badge name="Leitor" icon={BookOpen} unlocked={progress.completedModules.length >= 1} />
                <Badge name="Focado" icon={Brain} unlocked={progress.viewedCardIds.length >= 3} />
                <Badge name="Expert" icon={Trophy} unlocked={Object.keys(progress.quizScores).length >= 1} />
                <Badge name="Mestre" icon={Award} unlocked={progress.points >= 500} />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow min-w-0 flex flex-col">
            <div className="flex-grow">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Credits */}
            <footer className="mt-20 py-12 border-t border-slate-200 text-center space-y-4 pb-32 lg:pb-12">
              <div className="flex items-center justify-center gap-2 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
                <Library size={14} className="text-emerald-500" /> Imagem: reconhecimento e interpretação
              </div>
              <p className="text-slate-500 text-xs font-medium">
                Plataforma de Apoio Pedagógico • <b>UFBA 2026</b>
              </p>
              <div className="flex justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="hover:text-emerald-600 transition-colors cursor-default">Semiótica</span>
                <span className="hover:text-emerald-600 transition-colors cursor-default">Iconografia</span>
                <span className="hover:text-emerald-600 transition-colors cursor-default">Panofsky</span>
              </div>
              <div className="pt-4 text-[9px] text-slate-300 uppercase tracking-tighter">
                &copy; {new Date().getFullYear()} Todos os direitos reservados aos autores dos textos originais.
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Desenvolvido com <span className="text-red-400">❤️</span> usando AI Studio pelo <b>Prof. Ramon Santana (ICI/UFBA)</b>
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex justify-between items-center z-40">
        {[
          { id: 'guide', icon: BookOpen, label: 'Guia' },
          { id: 'glossary', icon: Layers, label: 'Termos' },
          { id: 'cards', icon: Brain, label: 'Cards' },
          { id: 'challenge', icon: Puzzle, label: 'Desafio' },
          { id: 'quiz', icon: HelpCircle, label: 'Quiz' }
        ].map(item => (
          <button
            key={item.id}
            disabled={(item.id === 'quiz' || item.id === 'cards' || item.id === 'challenge') && !canAccessAdvanced}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'} ${((item.id === 'quiz' || item.id === 'cards' || item.id === 'challenge') && !canAccessAdvanced) ? 'opacity-20 grayscale' : ''}`}
          >
            <item.icon size={18} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
