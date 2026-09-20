import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, CheckCircle2, XCircle, ArrowRight, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuizPage: React.FC = () => {
  const { isQuizOpen, closeQuiz, currentQuiz, isGeneratingQuiz, sendMessage } = useChat();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isQuizOpen) {
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setScore(0);
      setIsFinished(false);
    }
  }, [isQuizOpen]);

  if (!isQuizOpen) return null;

  const currentQ = currentQuiz[currentIndex];

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || !currentQ) return;
    setIsSubmitted(true);
    if (selectedOption === currentQ.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < currentQuiz.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleDiscussWithTutor = () => {
    closeQuiz();
    const isCorrect = selectedOption === currentQ?.correctAnswerIndex;
    if (!isCorrect && currentQ) {
      sendMessage(
        `I just took the quiz on ${currentQ.topic}. Can we dive deeper into why "${currentQ.options[currentQ.correctAnswerIndex]}" was the correct answer?`
      );
    } else if (currentQ) {
      sendMessage(
        `I completed the quiz on ${currentQ.topic} with score ${score + (isCorrect ? 1 : 0)}/${currentQuiz.length}. Can you challenge me with an edge case?`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-app-bg/60 backdrop-blur-sm" onClick={closeQuiz} />
      <div className="relative w-full max-w-md bg-app-surface border border-app-border rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-in-from-bottom">
        {/* Header */}
        <div className="p-4 border-b border-app-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-app-text-primary">
              <span className="font-semibold text-app-text-primary">Concept Check</span>
              {currentQ && (
                <>
                  <span>·</span>
                  <span className="text-app-text-primary">{currentQ.topic}</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-app-text-primary mt-0.5">
              {isFinished
                ? 'Evaluation Complete'
                : `Question ${currentIndex + 1} of ${currentQuiz.length || 3}`}
            </p>
          </div>

          <button
            onClick={closeQuiz}
            className="p-1 text-app-text-primary hover:text-app-text-primary rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {isGeneratingQuiz ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-app-border border-t-white rounded-lg animate-spin mx-auto" />
              <p className="text-xs font-medium text-app-text-primary">
                Generating questions from course context...
              </p>
            </div>
          ) : isFinished ? (
            /* Results */
            <div className="py-6 space-y-5 text-center">
              <div>
                <h4 className="text-xl font-semibold text-app-text-primary">Quiz Completed</h4>
                <p className="text-xs text-app-text-primary mt-1">
                  You answered <span className="font-semibold text-app-text-primary">{score}</span> out of{' '}
                  <span className="font-semibold text-app-text-primary">{currentQuiz.length}</span> correctly.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-app-bg border border-app-border text-xs space-y-1.5 max-w-sm mx-auto text-left">
                <div className="flex justify-between text-app-text-primary">
                  <span>Accuracy:</span>
                  <span className="font-semibold text-app-text-primary">
                    {Math.round((score / currentQuiz.length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-app-text-primary">
                  <span>Topic:</span>
                  <span className="font-medium text-app-text-primary">{currentQ?.topic}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={handleDiscussWithTutor}
                  className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white hover:text-black text-app-text-primary font-medium text-xs transition-colors"
                >
                  Discuss with Herculean Tutor
                </button>
                <button
                  onClick={closeQuiz}
                  className="px-3.5 py-2 rounded-lg bg-app-bg hover:bg-app-bg border border-app-border text-app-text-primary text-xs font-medium transition-colors"
                >
                  Return to Chat
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* Question */
            <div className="space-y-4">
              <h4 className="text-[15px] font-medium text-app-text-primary leading-snug">
                {currentQ.question}
              </h4>

              <div className="space-y-2">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctAnswerIndex;

                  let style =
                    'bg-app-bg border-app-border hover:border-white/40 text-app-text-primary';
                  if (isSelected && !isSubmitted) {
                    style = 'bg-app-bg border-white text-app-text-primary';
                  } else if (isSubmitted) {
                    if (isCorrect) {
                      style = 'bg-white/10 border-white text-app-text-primary';
                    } else if (isSelected && !isCorrect) {
                      style = 'bg-white/5 border-dashed border-white/50 text-app-text-primary/50 line-through';
                    } else {
                      style = 'bg-app-bg border-app-border text-app-text-primary opacity-40';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between text-xs ${style}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-lg text-[11px] font-semibold flex items-center justify-center border ${
                            isSelected
                              ? 'bg-app-accent text-black border-app-accent'
                              : 'bg-app-bg text-app-text-primary border-app-border'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-normal">{option}</span>
                      </div>

                      {isSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-app-text-primary shrink-0" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Feedback */}
              {isSubmitted && (
                <div
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    selectedOption === currentQ.correctAnswerIndex
                      ? 'bg-white/10 border-white text-app-text-primary'
                      : 'bg-app-bg border-white border-app-border text-app-text-muted'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Explanation:</span>
                  </div>
                  <p>{currentQ.explanation}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!isFinished && currentQ && (
          <div className="p-3 border-t border-app-border bg-app-bg flex items-center justify-between text-xs">
            <span className="text-app-text-primary font-mono text-[11px]">
              Score: {score} / {currentIndex + (isSubmitted ? 1 : 0)}
            </span>

            <div>
              {!isSubmitted ? (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={selectedOption === null}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white disabled:opacity-40 disabled:hover:bg-white/10 text-app-text-primary font-medium text-xs transition-colors"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-white text-black font-medium text-xs transition-colors flex items-center gap-1"
                >
                  <span>{currentIndex + 1 < currentQuiz.length ? 'Next' : 'Results'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
