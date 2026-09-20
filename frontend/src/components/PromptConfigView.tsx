import React, { useState } from 'react';
import { Shield, Check, RotateCcw } from 'lucide-react';

export const PromptConfigView: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState(
`You are a Herculean tutor for a university course.
Never give direct answers.
Always reply with 1–2 guiding questions that help the student discover the concept themselves.
Keep replies short and encouraging.
If the student is stuck after 2–3 exchanges, give a small hint.`
  );

  const [hintThreshold, setHintThreshold] = useState(3);
  const [strictness, setStrictness] = useState('High');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSystemPrompt(
`You are a Herculean tutor for a university course.
Never give direct answers.
Always reply with 1–2 guiding questions that help the student discover the concept themselves.
Keep replies short and encouraging.
If the student is stuck after 2–3 exchanges, give a small hint.`
    );
    setHintThreshold(3);
    setStrictness('High');
  };

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold text-app-text-primary uppercase tracking-wider">
          Herculean Protocol Directives
        </h4>
        <p className="text-xs text-app-text-primary mt-0.5">
          Configure how the Herculean engine steers student dialogues across course modules
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Prompt Editor */}
        <div className="md:col-span-2 bg-app-bg border border-app-border rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-app-text-primary">
              System Instruction
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-app-text-primary hover:text-app-text-primary flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Default
            </button>
          </div>

          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full bg-app-bg border border-app-border focus:border-app-accent rounded-lg p-3 text-xs text-app-text-primary focus:outline-none transition-colors leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="text-app-text-primary flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-app-text-primary" />
              <span>Direct Answer Prevention: Active</span>
            </div>

            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white hover:text-black text-app-text-primary font-medium transition-colors flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Directives</span>
              )}
            </button>
          </div>
        </div>

        {/* Tuning Controls */}
        <div className="bg-app-bg border border-app-border rounded-lg p-5 space-y-4">
          <h4 className="text-xs font-semibold text-app-text-primary uppercase tracking-wider">
            Protocol Controls
          </h4>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-app-text-primary">Struggle Threshold:</span>
              <span className="text-app-text-primary font-semibold">{hintThreshold} turns</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={hintThreshold}
              onChange={(e) => setHintThreshold(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-app-bg"
            />
            <p className="text-[11px] text-app-text-primary">
              Dialogue exchanges required before providing a progressive hint.
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-app-border">
            <span className="text-xs text-app-text-primary block">Inquiry Strictness:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {['Moderate', 'High', 'Strict'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setStrictness(lvl)}
                  className={`py-1 rounded text-xs font-medium border transition-colors ${
                    strictness === lvl
                      ? 'bg-app-bg text-app-text-primary border-app-accent'
                      : 'bg-app-bg text-app-text-primary border-app-border hover:border-app-border'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
