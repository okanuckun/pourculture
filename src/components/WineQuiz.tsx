import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Sparkles, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    emoji: string;
    description: string;
  }[];
}

const questions: Question[] = [
  {
    id: 'color',
    question: 'Hangi renk şarap tercih edersin?',
    options: [
      { value: 'red', label: 'Kırmızı', emoji: '🍷', description: 'Zengin, derin ve güçlü' },
      { value: 'white', label: 'Beyaz', emoji: '🥂', description: 'Taze, hafif ve ferah' },
      { value: 'orange', label: 'Orange', emoji: '🧡', description: 'Farklı, kompleks ve cesur' },
      { value: 'rose', label: 'Rosé', emoji: '🌸', description: 'Romantik ve yazlık' },
    ],
  },
  {
    id: 'style',
    question: 'Şarapta hangi tarza yakınsın?',
    options: [
      { value: 'funky', label: 'Funky', emoji: '🎸', description: 'Vahşi, doğal ve spontan' },
      { value: 'clean', label: 'Temiz', emoji: '✨', description: 'Zarif, net ve klasik' },
    ],
  },
  {
    id: 'acidity',
    question: 'Asitlik konusunda ne düşünüyorsun?',
    options: [
      { value: 'acidic', label: 'Asidik', emoji: '🍋', description: 'Canlı ve serinletici' },
      { value: 'soft', label: 'Yumuşak', emoji: '🍑', description: 'Yuvarlak ve kadifemsi' },
    ],
  },
  {
    id: 'occasion',
    question: 'Ne için şarap arıyorsun?',
    options: [
      { value: 'food', label: 'Yemek', emoji: '🍽️', description: 'Lezzetleri tamamlamak için' },
      { value: 'conversation', label: 'Sohbet', emoji: '💬', description: 'Keyifli bir akşam için' },
    ],
  },
];

interface WineRecommendation {
  name: string;
  grape: string;
  region: string;
  description: string;
  emoji: string;
  color: string;
}

const getRecommendation = (answers: Record<string, string>): WineRecommendation => {
  const { color, style, acidity, occasion } = answers;

  // Red wines
  if (color === 'red') {
    if (style === 'funky' && acidity === 'acidic') {
      return {
        name: 'Poulsard',
        grape: 'Poulsard',
        region: 'Jura, Fransa',
        description: 'Hafif gövdeli, funky aromalarla dolu, canlı asitli bir kırmızı. Sohbet için mükemmel!',
        emoji: '🍷',
        color: 'from-wine-red to-red-400',
      };
    }
    if (style === 'funky' && acidity === 'soft') {
      return {
        name: 'Gamay Naturel',
        grape: 'Gamay',
        region: 'Beaujolais, Fransa',
        description: 'Meyvemsi, yumuşak ve doğal. Carbonic maceration ile yapılmış, keyifli bir şarap.',
        emoji: '🍇',
        color: 'from-purple-600 to-wine-red',
      };
    }
    if (style === 'clean' && acidity === 'acidic') {
      return {
        name: 'Nerello Mascalese',
        grape: 'Nerello Mascalese',
        region: 'Etna, Sicilya',
        description: 'Volkanik topraktan gelen mineralli, zarif ve asidik bir kırmızı.',
        emoji: '🌋',
        color: 'from-red-600 to-orange-500',
      };
    }
    return {
      name: 'Pinot Noir',
      grape: 'Pinot Noir',
      region: 'Burgundy, Fransa',
      description: 'Klasik, zarif ve yuvarlak. Her duruma uygun, zamansız bir seçim.',
      emoji: '🎩',
      color: 'from-wine-red to-purple-600',
    };
  }

  // White wines
  if (color === 'white') {
    if (style === 'funky' && acidity === 'acidic') {
      return {
        name: 'Pét-Nat Blanc',
        grape: 'Çeşitli',
        region: 'Loire, Fransa',
        description: 'Doğal köpüren, canlı ve spontan. Parti şarabı!',
        emoji: '🎉',
        color: 'from-yellow-300 to-green-300',
      };
    }
    if (style === 'funky' && acidity === 'soft') {
      return {
        name: 'Skin Contact Muscat',
        grape: 'Muscat',
        region: 'Gürcistan',
        description: 'Aromatik, yumuşak ve egzotik. Farklı bir deneyim.',
        emoji: '🍯',
        color: 'from-amber-300 to-yellow-400',
      };
    }
    if (style === 'clean' && acidity === 'acidic') {
      return {
        name: 'Grüner Veltliner',
        grape: 'Grüner Veltliner',
        region: 'Avusturya',
        description: 'Temiz, mineral ve biber notalarıyla canlı. Yemekle harika!',
        emoji: '🌿',
        color: 'from-green-400 to-lime-300',
      };
    }
    return {
      name: 'Chenin Blanc',
      grape: 'Chenin Blanc',
      region: 'Loire, Fransa',
      description: 'Bal ve elma notaları, yumuşak ve dengeli.',
        emoji: '🍎',
        color: 'from-yellow-400 to-amber-300',
    };
  }

  // Orange wines
  if (color === 'orange') {
    if (style === 'funky') {
      return {
        name: 'Rkatsiteli Amber',
        grape: 'Rkatsiteli',
        region: 'Kakheti, Gürcistan',
        description: 'Qvevri\'de yapılmış, 8000 yıllık gelenek. Cesur ve kompleks.',
        emoji: '🏺',
        color: 'from-orange-500 to-amber-600',
      };
    }
    return {
      name: 'Ribolla Gialla',
      grape: 'Ribolla Gialla',
      region: 'Friuli, İtalya',
      description: 'Uzun maserasyon, zarif tanin ve turuncu meyveler.',
      emoji: '🍊',
      color: 'from-orange-400 to-yellow-500',
    };
  }

  // Rosé
  if (color === 'rose') {
    if (acidity === 'acidic') {
      return {
        name: 'Bandol Rosé',
        grape: 'Mourvèdre',
        region: 'Provence, Fransa',
        description: 'Ciddi bir rosé, mineralli ve kompleks.',
        emoji: '🌹',
        color: 'from-pink-400 to-rose-500',
      };
    }
    return {
      name: 'Cerasuolo d\'Abruzzo',
      grape: 'Montepulciano',
      region: 'Abruzzo, İtalya',
      description: 'Kiraz pembesi, meyve dolu ve keyifli.',
      emoji: '🍒',
      color: 'from-rose-400 to-pink-300',
    };
  }

  // Default
  return {
    name: 'Doğal Şarap Keşfi',
    grape: 'Yerel üzümler',
    region: 'Dünya',
    description: 'Her şişe bir macera. Keşfetmeye devam et!',
    emoji: '🌍',
    color: 'from-primary to-accent',
  };
};

export const WineQuiz = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const recommendation = showResult ? getRecommendation(answers) : null;

  return (
    <>
      {/* Quiz Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-wine-red p-1"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative flex items-center gap-4 rounded-[22px] bg-card px-6 py-4 transition-all group-hover:bg-card/80">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Wine className="h-7 w-7 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-lg font-bold text-foreground">Find Your Wine</h3>
            <p className="text-sm text-muted-foreground">Kişisel şarap rehberin</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </motion.button>

      {/* Quiz Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-wine-red/10 p-6">
                <div className="absolute -right-4 -top-4 text-8xl opacity-20">🍷</div>
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                    <Sparkles className="h-3 w-3" />
                    Kişisel Rehber
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-bold text-foreground">
                    Find Your Wine
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Birkaç soru ile sana en uygun şarabı bulalım
                  </p>
                </div>

                {/* Progress */}
                {!showResult && (
                  <div className="mt-4 flex gap-2">
                    {questions.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          index <= currentStep ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {!showResult ? (
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="mb-4 text-lg font-semibold text-foreground">
                        {questions[currentStep].question}
                      </h3>
                      <div className="grid gap-3">
                        {questions[currentStep].options.map((option) => (
                          <motion.button
                            key={option.value}
                            onClick={() => handleAnswer(questions[currentStep].id, option.value)}
                            className={`group flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                              answers[questions[currentStep].id] === option.value
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 hover:bg-secondary'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="text-3xl">{option.emoji}</span>
                            <div>
                              <p className="font-medium text-foreground">{option.label}</p>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Navigation */}
                      <div className="mt-6 flex items-center justify-between">
                        <button
                          onClick={goBack}
                          disabled={currentStep === 0}
                          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Geri
                        </button>
                        <span className="text-sm text-muted-foreground">
                          {currentStep + 1} / {questions.length}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="text-center"
                    >
                      <div
                        className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${recommendation?.color}`}
                      >
                        <span className="text-5xl">{recommendation?.emoji}</span>
                      </div>
                      <p className="mb-2 text-sm font-medium text-primary">
                        Sana özel önerimiz
                      </p>
                      <h3 className="font-display text-2xl font-bold text-foreground">
                        {recommendation?.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {recommendation?.grape} • {recommendation?.region}
                      </p>
                      <p className="mt-4 text-foreground">
                        {recommendation?.description}
                      </p>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={reset}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Tekrar Dene
                        </button>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Harika! 🍷
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
