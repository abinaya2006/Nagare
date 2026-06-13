// ─── Emotion characters ───────────────────────────────────────────────────────

export interface Emotion {
  id: string;
  name: string;
  color: string;       // primary brand color
  bgColor: string;     // light wash for backgrounds
  textColor: string;   // dark text on bgColor
  borderColor: string; // subtle border
}

export const EMOTIONS: Record<string, Emotion> = {
  spark: {
    id: 'spark',
    name: 'Spark',
    color: '#EF9F27',
    bgColor: '#FEF3E2',
    textColor: '#633806',
    borderColor: '#F6D98A',
  },
  drift: {
    id: 'drift',
    name: 'Drift',
    color: '#85B7EB',
    bgColor: '#EBF4FF',
    textColor: '#0C447C',
    borderColor: '#B5D4F4',
  },
  surge: {
    id: 'surge',
    name: 'Surge',
    color: '#F0997B',
    bgColor: '#FDF0EC',
    textColor: '#712B13',
    borderColor: '#F5C4B3',
  },
  haze: {
    id: 'haze',
    name: 'Haze',
    color: '#AFA9EC',
    bgColor: '#F0EEFB',
    textColor: '#3C3489',
    borderColor: '#CECBF6',
  },
  edge: {
    id: 'edge',
    name: 'Edge',
    color: '#5DCAA5',
    bgColor: '#ECFAF4',
    textColor: '#085041',
    borderColor: '#9FE1CB',
  },
};

// ─── Question types ───────────────────────────────────────────────────────────

export type QuestionType = 'single' | 'multi' | 'slots';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  emotion: keyof typeof EMOTIONS;
  narrator: string;
  question: string;
}

export interface SingleQuestion extends BaseQuestion {
  type: 'single';
  options: string[];
}

export interface MultiQuestion extends BaseQuestion {
  type: 'multi';
  options: string[];
  max?: number;
  hint?: string;
}

export interface SlotsQuestion extends BaseQuestion {
  type: 'slots';
  hint: string;
}

export type Question = SingleQuestion | MultiQuestion | SlotsQuestion;

export type SingleAnswer = number;
export type MultiAnswer = number[];
export type SlotsAnswer = string[];
export type AnswerValue = SingleAnswer | MultiAnswer | SlotsAnswer | null;

export type OnboardingAnswers = Record<string, AnswerValue>;

// ─── Question bank ────────────────────────────────────────────────────────────

export const QUESTIONS: Question[] = [
  {
    id: 'peak_time',
    type: 'single',
    emotion: 'spark',
    narrator: 'Spark wants to know',
    question: 'When does your brain feel like its best self?',
    options: [
      'Early morning, before 11',
      'Afternoon, after I settle in',
      'Evening, when the day slows',
      'Late night — just me and quiet',
      'Honestly, it shifts with my mood',
    ],
  },
  {
    id: 'work_style',
    type: 'single',
    emotion: 'surge',
    narrator: 'Surge is curious',
    question: 'How would you describe the way you work?',
    options: [
      "I'd rather finish early and breathe",
      'Deadlines light a fire in me',
      'Slow and steady works best',
      'I chase whatever has my energy right now',
      "No idea — still figuring it out",
    ],
  },
  {
    id: 'focus_span',
    type: 'single',
    emotion: 'haze',
    narrator: 'Haze is asking',
    question: 'How long can you focus before your mind starts wandering?',
    options: [
      '15 – 25 minutes',
      '30 – 45 minutes',
      '45 – 60 minutes',
      '60 – 90 minutes',
      'More than 90 minutes, easily',
    ],
  },
  {
    id: 'distractions',
    type: 'multi',
    emotion: 'drift',
    narrator: 'Drift notices',
    question: 'What usually pulls your attention away?',
    hint: 'Catch all that apply',
    options: [
      'Social media',
      'People around me',
      'Phone notifications',
      'My own thoughts',
      'Switching between tasks',
      'Hunger',
      'Nothing, really',
    ],
  },
  {
    id: 'day_fullness',
    type: 'single',
    emotion: 'spark',
    narrator: 'Spark checks in',
    question: 'How full does a typical day feel for you?',
    options: [
      'Pretty open',
      'Moderately packed',
      'Busy but manageable',
      'Controlled chaos',
    ],
  },
  {
    id: 'deadline_style',
    type: 'single',
    emotion: 'surge',
    narrator: 'Surge is honest',
    question: "What's your real relationship with deadlines?",
    options: [
      "I finish early — it's just who I am",
      'I land right on time',
      'I drift a little, then catch up',
      'I fight for my life every single time',
    ],
  },
  {
    id: 'energy_drains',
    type: 'multi',
    emotion: 'edge',
    narrator: 'Edge observes',
    question: 'Which tasks leave you most drained?',
    hint: 'Catch all that apply',
    options: [
      'Studying',
      'Meetings',
      'Creative work',
      'Coding',
      'Chores',
      'Social interactions',
      'Admin & paperwork',
    ],
  },
  {
    id: 'energy_sources',
    type: 'multi',
    emotion: 'haze',
    narrator: 'Haze wonders',
    question: 'What kind of work actually gives you energy?',
    hint: 'Catch all that apply',
    options: [
      'Learning new things',
      'Building projects',
      'Creative work',
      'Working with people',
      'Physical activity',
      'Getting organized',
      'Solving hard problems',
    ],
  },
  {
    id: 'break_preference',
    type: 'single',
    emotion: 'drift',
    narrator: 'Drift suggests',
    question: 'When do you naturally reach for a break?',
    options: [
      'Every 25 minutes, like clockwork',
      'Around 45 minutes in',
      'After a solid hour',
      'When my body tells me to',
      'I forget breaks exist',
    ],
  },
  {
    id: 'blocked_times',
    type: 'slots',
    emotion: 'edge',
    narrator: 'Edge needs this',
    question: "Are there times you'd never want tasks scheduled?",
    hint: "Classes, meals, prayer, commute, family time — whatever's off-limits.",
  },
  {
    id: 'sleep',
    type: 'single',
    emotion: 'drift',
    narrator: 'Drift is gentle here',
    question: 'How much sleep do you usually get?',
    options: [
      'Under 5 hours',
      '5 – 6 hours',
      '6 – 7 hours',
      '7 – 8 hours',
      'More than 8 hours',
    ],
  },
  {
    id: 'struggle',
    type: 'single',
    emotion: 'haze',
    narrator: 'Haze knows this feeling',
    question: "What's the biggest thing that gets in your way?",
    options: [
      'Getting started at all',
      'Staying focused once I do',
      'Knowing what to work on first',
      'The distractions that creep in',
      'Time slipping by unnoticed',
      'Following through consistently',
    ],
  },
  {
    id: 'nani_involvement',
    type: 'single',
    emotion: 'spark',
    narrator: 'Spark is excited',
    question: 'How much do you want NANI involved in your day?',
    options: [
      'Just nudge me when needed',
      'Suggest a loose schedule',
      'Actively optimize my time',
      'Take charge — just tell me what to do',
    ],
  },
  {
    id: 'goals',
    type: 'multi',
    emotion: 'edge',
    narrator: 'Edge keeps it real',
    question: "What are you actually trying to do right now?",
    hint: 'Pick up to 3',
    max: 3,
    options: [
      'Ace my exams',
      'Build something',
      'Balance work and life better',
      'Reduce stress',
      'Build better habits',
      'Stop procrastinating',
      'Stay more consistent',
      'Get more done overall',
      'Make time for myself',
    ],
  },
];
