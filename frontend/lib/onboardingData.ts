// ─── Onboarding data: questions, emotions, types ─────────────────────────────

export type QuestionType = 'single' | 'multi' | 'timeline' | 'goals';

export interface Emotion {
  name: string;
  color: string;       // hex, primary orb color
  bg: string;          // light wash
  text: string;        // dark readable on bg
  border: string;
  note: number;        // Web Audio frequency (Hz) for piano note
}

export const EMOTIONS: Record<string, Emotion> = {
  spark: { name: 'Spark',  color: '#EFB34C', bg: '#FEF8EC', text: '#7A4A08', border: '#F6D98A', note: 523  },
  drift: { name: 'Drift',  color: '#85B7EB', bg: '#EBF4FF', text: '#0C447C', border: '#B5D4F4', note: 440  },
  surge: { name: 'Surge',  color: '#F0997B', bg: '#FDF0EC', text: '#712B13', border: '#F5C4B3', note: 494  },
  haze:  { name: 'Haze',   color: '#AFA9EC', bg: '#F0EEFB', text: '#3C3489', border: '#CECBF6', note: 466  },
  edge:  { name: 'Edge',   color: '#5DCAA5', bg: '#ECFAF4', text: '#085041', border: '#9FE1CB', note: 392  },
};

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  emotion: keyof typeof EMOTIONS;
  narrator: string;   // short italic hint above question
  question: string;
}

export interface SingleQuestion extends BaseQuestion { type: 'single'; options: string[] }
export interface MultiQuestion  extends BaseQuestion { type: 'multi';  options: string[]; max?: number; hint?: string }
export interface TimelineQuestion extends BaseQuestion { type: 'timeline' }
export interface GoalsQuestion  extends BaseQuestion { type: 'goals';  options: string[]; max: number }

export type Question = SingleQuestion | MultiQuestion | TimelineQuestion | GoalsQuestion;

export type SingleAnswer  = number;
export type MultiAnswer   = number[];
export type TimelineAnswer = { label: string; start: string; end: string }[];
export type GoalsAnswer   = number[];
export type AnswerValue   = SingleAnswer | MultiAnswer | TimelineAnswer | GoalsAnswer | null;
export type OnboardingAnswers = Record<string, AnswerValue>;

export const QUESTIONS: Question[] = [
  {
    id: 'peak_time', type: 'single', emotion: 'spark',
    narrator: 'Morning energy often shapes the entire day.',
    question: 'When does your mind feel most capable?',
    options: ['Early morning, before 11', 'Afternoon, once settled', 'Evening, when things slow', 'Late night — just me and quiet', 'It shifts with my mood'],
  },
  {
    id: 'work_style', type: 'single', emotion: 'surge',
    narrator: 'How you work reveals a lot about what you need.',
    question: 'Which best describes your natural work rhythm?',
    options: ["I finish early and breathe easy", 'Deadlines light a fire in me', 'Slow and steady, always', 'I chase whatever holds my energy', "Still figuring this out"],
  },
  {
    id: 'focus_span', type: 'single', emotion: 'haze',
    narrator: 'There is no wrong answer here — only honest ones.',
    question: 'How long can you hold deep focus before your mind drifts?',
    options: ['15 – 25 minutes', '30 – 45 minutes', '45 – 60 minutes', '60 – 90 minutes', 'More than 90 minutes'],
  },
  {
    id: 'distractions', type: 'multi', emotion: 'drift',
    narrator: 'Naming distractions takes away some of their power.',
    question: 'What usually pulls your attention away?',
    hint: 'Select everything that applies',
    options: ['Social media', 'People around me', 'Phone notifications', 'My own thoughts', 'Jumping between tasks', 'Hunger', 'Nothing much, really'],
  },
  {
    id: 'day_fullness', type: 'single', emotion: 'spark',
    narrator: 'Knowing your load helps us plan without overwhelm.',
    question: 'How full does a typical day feel for you?',
    options: ['Pretty open', 'Moderately packed', 'Busy but I manage', 'Pure chaos, honestly'],
  },
  {
    id: 'deadline_style', type: 'single', emotion: 'surge',
    narrator: 'Honesty here will make your schedule actually work.',
    question: 'What is your real relationship with deadlines?',
    options: ["I finish early — always", 'I land right on time', 'I drift a little, then catch up', 'I fight for my life every time'],
  },
  {
    id: 'energy_drains', type: 'multi', emotion: 'edge',
    narrator: 'We plan around energy, not against it.',
    question: 'Which tasks leave you most drained?',
    hint: 'Select all that apply',
    options: ['Studying', 'Meetings', 'Creative work', 'Coding', 'Chores', 'Social interactions', 'Admin and paperwork'],
  },
  {
    id: 'energy_sources', type: 'multi', emotion: 'haze',
    narrator: 'These are the moments worth protecting.',
    question: 'What kind of work actually gives you energy?',
    hint: 'Select all that apply',
    options: ['Learning new things', 'Building projects', 'Creative work', 'Working with people', 'Physical activity', 'Getting organized', 'Solving hard problems'],
  },
  {
    id: 'break_preference', type: 'single', emotion: 'drift',
    narrator: 'Breaks are not laziness. They are part of the flow.',
    question: 'When do you naturally reach for a break?',
    options: ['Every 25 minutes', 'Around 45 minutes in', 'After a full hour', 'When my body tells me', 'I forget breaks exist'],
  },
  {
    id: 'blocked_times', type: 'timeline', emotion: 'edge',
    narrator: 'We will never schedule over things that matter.',
    question: 'Are there times you never want tasks scheduled?',
  },
  {
    id: 'sleep', type: 'single', emotion: 'drift',
    narrator: 'Sleep shapes everything. No judgment here.',
    question: 'How much sleep do you usually get?',
    options: ['Under 5 hours', '5 – 6 hours', '6 – 7 hours', '7 – 8 hours', 'More than 8 hours'],
  },
  {
    id: 'struggle', type: 'single', emotion: 'haze',
    narrator: 'Every mind has its particular friction point.',
    question: 'What is your biggest productivity struggle?',
    options: ['Getting started', 'Staying focused', 'Prioritizing what matters', 'Avoiding distractions', 'Time slipping away', 'Following through'],
  },
  {
    id: 'nani_involvement', type: 'single', emotion: 'spark',
    narrator: 'NANI will match exactly how involved you want it to be.',
    question: 'How much do you want NANI in your day?',
    options: ['Just nudge me when needed', 'Suggest a loose schedule', 'Actively optimize my time', 'Take full charge — tell me what to do'],
  },
  {
    id: 'goals', type: 'goals', emotion: 'edge',
    narrator: 'Choose what actually matters to you right now.',
    question: 'What are you here to do?',
    max: 3,
    options: ['Ace my exams', 'Build something', 'Balance work and life', 'Reduce stress', 'Build better habits', 'Stop procrastinating', 'Stay consistent', 'Get more done', 'Make time for myself'],
  },
];

// Summary labels for completion screen
export const SUMMARY_LABELS: Record<string, string> = {
  peak_time:         'Peak Energy',
  focus_span:        'Focus Window',
  break_preference:  'Break Style',
  goals:             'Main Goal',
};
