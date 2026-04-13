import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Sparkles, ArrowRight, ArrowLeft, RotateCcw, History, User, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
    question: 'Which wine color do you prefer?',
    options: [
      { value: 'red', label: 'Red', emoji: '🍷', description: 'Rich, deep and bold' },
      { value: 'white', label: 'White', emoji: '🥂', description: 'Fresh, light and crisp' },
      { value: 'orange', label: 'Orange', emoji: '🧡', description: 'Unique, complex and daring' },
      { value: 'rose', label: 'Rosé', emoji: '🌸', description: 'Romantic and summery' },
    ],
  },
  {
    id: 'style',
    question: 'What wine style suits you?',
    options: [
      { value: 'funky', label: 'Funky', emoji: '🎸', description: 'Wild, natural and spontaneous' },
      { value: 'clean', label: 'Clean', emoji: '✨', description: 'Elegant, precise and classic' },
    ],
  },
  {
    id: 'acidity',
    question: 'How do you feel about acidity?',
    options: [
      { value: 'acidic', label: 'Acidic', emoji: '🍋', description: 'Vibrant and refreshing' },
      { value: 'soft', label: 'Soft', emoji: '🍑', description: 'Round and velvety' },
    ],
  },
  {
    id: 'occasion',
    question: 'What are you looking for wine for?',
    options: [
      { value: 'food', label: 'Food', emoji: '🍽️', description: 'To complement flavors' },
      { value: 'conversation', label: 'Conversation', emoji: '💬', description: 'For a pleasant evening' },
    ],
  },
];

interface WineFromDB {
  id: string;
  name: string;
  grape: string;
  region: string;
  country: string;
  winemaker: string | null;
  description: string | null;
  image_url: string | null;
  price_range: string | null;
  color: string;
  style: string;
  acidity: string;
  occasion: string[];
  alcohol_percentage: number | null;
  year: number | null;
  is_featured: boolean;
}

interface QuizResult {
  id: string;
  answers: Record<string, string>;
  recommendation_name: string;
  recommendation_grape: string | null;
  recommendation_region: string | null;
  created_at: string;
}

const colorGradients: Record<string, string> = {
  red: 'from-wine-red to-red-400',
  white: 'from-yellow-300 to-amber-200',
  orange: 'from-orange-400 to-amber-500',
  rose: 'from-pink-400 to-rose-300',
};

const colorEmojis: Record<string, string> = {
  red: '🍷',
  white: '🥂',
  orange: '🍊',
  rose: '🌸',
};

const answerLabels: Record<string, Record<string, string>> = {
  color: { red: 'Red', white: 'White', orange: 'Orange', rose: 'Rosé' },
  style: { funky: 'Funky', clean: 'Clean' },
  acidity: { acidic: 'Acidic', soft: 'Soft' },
  occasion: { food: 'Food', conversation: 'Conversation' },
};

export const WineQuiz = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pastResults, setPastResults] = useState<QuizResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingWines, setIsLoadingWines] = useState(false);
  const [recommendedWines, setRecommendedWines] = useState<WineFromDB[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPastResults = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('wine_quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPastResults((data || []).map(item => ({
        ...item,
        answers: item.answers as Record<string, string>
      })));
    } catch (error) {
      console.error('Error fetching past results:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchMatchingWines = async (quizAnswers: Record<string, string>) => {
    setIsLoadingWines(true);
    try {
      // First try exact match
      let query = supabase
        .from('wines')
        .select('*')
        .eq('color', quizAnswers.color)
        .eq('style', quizAnswers.style)
        .eq('acidity', quizAnswers.acidity)
        .limit(3);

      let { data, error } = await query;

      if (error) throw error;

      // If no exact matches, try with just color and style
      if (!data || data.length === 0) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('wines')
          .select('*')
          .eq('color', quizAnswers.color)
          .eq('style', quizAnswers.style)
          .limit(3);

        if (fallbackError) throw fallbackError;
        data = fallbackData;
      }

      // If still no matches, try with just color
      if (!data || data.length === 0) {
        const { data: colorData, error: colorError } = await supabase
          .from('wines')
          .select('*')
          .eq('color', quizAnswers.color)
          .limit(3);

        if (colorError) throw colorError;
        data = colorData;
      }

      setRecommendedWines(data || []);
    } catch (error) {
      console.error('Error fetching wines:', error);
      setRecommendedWines([]);
    } finally {
      setIsLoadingWines(false);
    }
  };

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => {
        setShowResult(true);
        fetchMatchingWines(newAnswers);
      }, 300);
    }
  };

  const saveResult = async (wine: WineFromDB) => {
    if (!user) {
      toast.info('Sign in to save your results', {
        action: {
          label: 'Sign In',
          onClick: () => navigate('/auth'),
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('wine_quiz_results').insert({
        user_id: user.id,
        answers,
        recommendation_name: wine.name,
        recommendation_grape: wine.grape,
        recommendation_region: `${wine.region}, ${wine.country}`,
      });

      if (error) throw error;
      toast.success('Result saved!');
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
    setShowHistory(false);
    setRecommendedWines([]);
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const openHistory = () => {
    setShowHistory(true);
    fetchPastResults();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

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
            <p className="text-sm text-muted-foreground">Your personal wine guide</p>
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
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-wine-red/10 p-6">
                <div className="absolute -right-4 -top-4 text-8xl opacity-20">🍷</div>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                      <Sparkles className="h-3 w-3" />
                      Personal Guide
                    </span>
                    {user && (
                      <button
                        onClick={openHistory}
                        className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <History className="h-3 w-3" />
                        History
                      </button>
                    )}
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-bold text-foreground">
                    {showHistory ? 'Past Results' : 'Find Your Wine'}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {showHistory 
                      ? 'Wine recommendations from your past quizzes'
                      : 'Answer a few questions to find your perfect wine'}
                  </p>
                </div>

                {/* Progress */}
                {!showResult && !showHistory && (
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
                  {showHistory ? (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : pastResults.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                            <Wine className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">No saved results yet</p>
                          <button
                            onClick={reset}
                            className="mt-4 text-sm font-medium text-primary hover:underline"
                          >
                            Take your first quiz!
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pastResults.map((result) => (
                            <div
                              key={result.id}
                              className="rounded-2xl border border-border bg-secondary/50 p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-foreground">
                                    {result.recommendation_name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {result.recommendation_grape} • {result.recommendation_region}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(result.created_at)}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {Object.entries(result.answers as Record<string, string>).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground"
                                  >
                                    {answerLabels[key]?.[value] || value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={reset}
                          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    </motion.div>
                  ) : !showResult ? (
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
                          Back
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
                    >
                      {isLoadingWines ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                          <p className="text-muted-foreground">Finding wines for you...</p>
                        </div>
                      ) : recommendedWines.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary">
                            <Wine className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <h3 className="font-display text-xl font-bold text-foreground mb-2">
                            Wine not found
                          </h3>
                          <p className="text-muted-foreground text-sm mb-6">
                            No wines matching these criteria yet. Try different options!
                          </p>
                          <button
                            onClick={reset}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-center mb-6">
                            <p className="text-sm font-medium text-primary mb-1">
                              Our recommendations for you
                            </p>
                            <h3 className="font-display text-xl font-bold text-foreground">
                              We found {recommendedWines.length} wines! 🎉
                            </h3>
                          </div>

                          <div className="space-y-4">
                            {recommendedWines.map((wine, index) => (
                              <motion.div
                                key={wine.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="rounded-2xl border border-border bg-secondary/30 overflow-hidden"
                              >
                                <div className={`h-2 bg-gradient-to-r ${colorGradients[wine.color] || 'from-primary to-accent'}`} />
                                <div className="p-4">
                                  <div className="flex items-start gap-3">
                                    {wine.image_url ? (
                                      <img
                                        src={wine.image_url}
                                        alt={wine.name}
                                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                                      />
                                    ) : (
                                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorGradients[wine.color] || 'from-primary to-accent'}`}>
                                        <span className="text-2xl">{colorEmojis[wine.color] || '🍷'}</span>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-foreground truncate">
                                        {wine.name}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {wine.grape} • {wine.region}, {wine.country}
                                      </p>
                                      {wine.winemaker && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          🍇 {wine.winemaker}
                                        </p>
                                      )}
                                    </div>
                                    {wine.price_range && (
                                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                        {wine.price_range}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {wine.description && (
                                    <p className="mt-3 text-sm text-foreground/80">
                                      {wine.description}
                                    </p>
                                  )}

                                  <div className="mt-3 flex items-center justify-between">
                                    <div className="flex gap-2">
                                      {wine.year && (
                                        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                                          {wine.year}
                                        </span>
                                      )}
                                      {wine.alcohol_percentage && (
                                        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                                          {wine.alcohol_percentage}%
                                        </span>
                                      )}
                                    </div>
                                    {user && (
                                      <button
                                        onClick={() => saveResult(wine)}
                                        disabled={isSaving}
                                        className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                                      >
                                        {isSaving ? 'Saving...' : 'Save'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* User status */}
                          {!user && (
                            <div className="mt-4 rounded-xl bg-secondary p-3 text-sm text-muted-foreground text-center">
                              <User className="inline-block h-4 w-4 mr-1" />
                              <span>Sign in to save your results</span>
                            </div>
                          )}

                          <div className="mt-6 flex gap-3">
                            <button
                              onClick={reset}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Try Again
                            </button>
                            <button
                              onClick={() => setIsOpen(false)}
                              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                              Great! 🍷
                            </button>
                          </div>
                        </>
                      )}
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
