import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/build/QuestionCard';
import { PreferenceSummary } from '@/components/build/PreferenceSummary';
import { QUESTIONS, TOTAL_QUESTIONS, type PreferenceAnswers } from '@/lib/buildQuestions';
import {
  readGuestAnswers,
  writeGuestAnswers,
  clearGuestAnswers,
  useBuyerPreferences,
} from '@/hooks/useBuyerPreferences';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';

const defaults: PreferenceAnswers = {
  profile_name: 'My perfect vehicle',
  preferred_features: [],
  trust_priorities: [],
  include_in_transit_vehicles: true,
  notification_preference: 'weekly',
};

export default function BuildYourPerfect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences, save } = useBuyerPreferences();
  const [params] = useSearchParams();
  const editId = params.get('edit');

  const [answers, setAnswers] = useState<PreferenceAnswers>(
    () => readGuestAnswers() ?? defaults,
  );
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Editing an existing profile
  useEffect(() => {
    if (!editId) return;
    const existing = preferences.find((p) => p.id === editId);
    if (existing) {
      const { id, buyer_id, created_at, updated_at, is_active, ...rest } = existing as any;
      setAnswers({ ...defaults, ...rest });
      setSavedId(editId);
    }
  }, [editId, preferences]);

  // Keep guest answers safe between visits
  useEffect(() => {
    if (!user) writeGuestAnswers(answers);
  }, [answers, user]);

  const question = QUESTIONS[step];
  const progress = Math.round(((step + 1) / TOTAL_QUESTIONS) * 100);

  const setField = (value: any, valueMax?: any) => {
    setAnswers((prev) => {
      const next: any = { ...prev };
      if (question.id === 'include_in_transit_vehicles') {
        next.include_in_transit_vehicles = value === 'true';
      } else if (question.id === 'commute_distance_km') {
        next.commute_distance_km = Number(value);
      } else {
        next[question.field] = value;
        if (question.fieldMax) next[question.fieldMax] = valueMax;
      }
      return next;
    });
  };

  const currentValue = useMemo(() => {
    const a: any = answers;
    if (question.id === 'include_in_transit_vehicles') {
      return a.include_in_transit_vehicles === false ? 'false' : 'true';
    }
    if (question.id === 'commute_distance_km') {
      return a.commute_distance_km ? String(a.commute_distance_km) : undefined;
    }
    return a[question.field];
  }, [answers, question]);

  const currentValueMax = question.fieldMax ? (answers as any)[question.fieldMax] : undefined;

  const advance = () => {
    if (step + 1 < TOTAL_QUESTIONS) setStep(step + 1);
    else finish();
  };

  const finish = async () => {
    setDone(true);
    if (!user) return;
    setSaving(true);
    const record = await save(answers, savedId ?? undefined);
    if (record) {
      setSavedId(record.id);
      clearGuestAnswers();
    }
    setSaving(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background/80">
        <Navigation />
        <main className="pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-7 w-7 text-primary" />
              </div>
              <h1 className="mt-4 text-3xl font-bold text-foreground">Your perfect vehicle profile</h1>
              <p className="mt-2 text-muted-foreground">
                {user
                  ? saving
                    ? 'Saving your answers…'
                    : 'Saved to your account. We will use this to surface the right cars.'
                  : 'Create a free account to save this and get matches as they appear.'}
              </p>
            </div>

            <PreferenceSummary answers={answers} />

            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => navigate('/marketplace?match=1')} className="gap-2">
                <Sparkles className="h-4 w-4" /> View my matches
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDone(false);
                  setStep(0);
                }}
              >
                Edit answers
              </Button>
              {user ? (
                <Button variant="ghost" onClick={() => navigate('/dashboard/buyer')}>
                  Go to my dashboard
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Create an account
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/80">
      <Navigation />
      <main className="pt-24 pb-32 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>
                Question {step + 1} of {TOTAL_QUESTIONS}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <QuestionCard
            key={question.id}
            question={question}
            value={currentValue}
            valueMax={currentValueMax}
            onChange={setField}
          />

          <div className="mt-10 flex items-center gap-3">
            <Button
              variant="outline"
              className="min-h-12"
              onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button variant="ghost" className="min-h-12" onClick={advance}>
              Skip
            </Button>
            <Button className="flex-1 min-h-12 gap-2" onClick={advance}>
              {step + 1 === TOTAL_QUESTIONS ? 'See my profile' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
