# MyGrammar Quiz — Angular Web App Specification

> **Version**: 1.0
> **Date**: 2026-04-05
> **Goal**: A scalable, offline-capable iPad grammar quiz app. Question banks are stored as independent JSON files; the main menu loads them dynamically. The UI is built with Angular.

---

## 1. Project Overview

### Core Design Principles

| Principle | Description |
|:----------|:------------|
| **Data/UI separation** | Questions live in standalone JSON files; no code changes needed to add a new quiz |
| **Dynamic loading** | The home screen reads a single `index.json` to discover all available quizzes |
| **Offline-first** | Angular PWA with Service Worker caching — works without a network connection |
| **iPad-first** | Touch targets ≥ 44 px, Apple Pencil Scribble support on fill-in questions |
| **Self-graded fill-in** | Fill-in answers are not auto-graded; students reveal the answer and self-assess |

---

## 2. System Architecture

```
MyGrammar Quiz App
│
├── Angular Frontend (SPA)
│   ├── HomeModule        ← main menu, lists available quizzes
│   ├── QuizModule        ← question engine, renders by question type
│   └── ResultModule      ← score summary, answer review
│
└── /assets/quizzes/      ← static JSON quiz data folder
    ├── index.json        ← quiz directory (source of truth for the menu)
    ├── unit1_plural.json
    ├── unit2_nouns.json
    ├── unit3_pronouns.json
    └── ...               ← unlimited expansion
```

### Data Flow

```
App starts
  → GET /assets/quizzes/index.json
  → Render quiz cards on home screen
  → User selects a quiz
  → GET /assets/quizzes/{filename}.json
  → QuizEngine initialises → renders questions one by one → tallies score
```

---

## 3. JSON Schema

### 3.1 Quiz Directory (`index.json`)

```json
{
  "version": "1.0",
  "quizzes": [
    {
      "id": "unit1_plural",
      "title": "Unit 1 — Singular & Plural",
      "subtitle": "Adding -s and -es to nouns",
      "emoji": "📚",
      "color": "#10b981",
      "tags": ["nouns", "plural"],
      "difficulty": 1,
      "file": "unit1_plural.json",
      "questionCount": 15
    },
    {
      "id": "unit2_nouns",
      "title": "Unit 2 — Common & Proper Nouns",
      "subtitle": "Naming regular vs. special things",
      "emoji": "🏙️",
      "color": "#6366f1",
      "tags": ["nouns", "capitalization"],
      "difficulty": 1,
      "file": "unit2_nouns.json",
      "questionCount": 13
    }
  ]
}
```

**Field reference**:

| Field | Type | Required | Description |
|:------|:-----|:--------:|:------------|
| `id` | string | ✅ | Unique identifier |
| `title` | string | ✅ | Display name |
| `subtitle` | string | ✅ | Short description |
| `emoji` | string | ✅ | Card icon |
| `color` | string | ✅ | Theme colour (hex) |
| `tags` | string[] | ✅ | Category labels |
| `difficulty` | 1 \| 2 \| 3 | ✅ | Difficulty level |
| `file` | string | ✅ | Name of the quiz JSON file |
| `questionCount` | number | ✅ | Number of questions (display only) |

---

### 3.2 Quiz File (`unit1_plural.json`)

```json
{
  "meta": {
    "id": "unit1_plural",
    "version": "1.0",
    "title": "Unit 1 — Singular & Plural",
    "subject": "English Grammar",
    "level": "Elementary Grade 3–4",
    "created": "2026-04-05",
    "description": "Practice making nouns plural with -s and -es rules."
  },
  "settings": {
    "shuffle": true,
    "maxQuestions": null
  },
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "difficulty": 1,
      "tags": ["plural", "-s"],
      "question": "My friend and I have two ___.",
      "options": ["bag", "bags", "bagges", "baggs"],
      "answer": 1,
      "explanation": "More than one bag → bags (general rule: add -s)."
    },
    {
      "id": "q2",
      "type": "true-false",
      "difficulty": 1,
      "tags": ["plural", "-es"],
      "question": "\"Watchs\" is the correct plural of \"watch\".",
      "answer": false,
      "explanation": "Words ending in -ch add -es. The correct plural is \"watches\"."
    },
    {
      "id": "q3",
      "type": "fill-in",
      "difficulty": 2,
      "tags": ["plural", "-es"],
      "question": "One watch → Two ___.",
      "answer": "watches",
      "acceptedAnswers": ["watches", "Watches"],
      "hint": "Hint: words ending in -ch add -es",
      "explanation": "watch → watches (ends in -ch, so add -es)"
    },
    {
      "id": "q4",
      "type": "categorize",
      "difficulty": 2,
      "tags": ["plural", "sorting"],
      "question": "Sort each word into the correct plural rule:",
      "items": ["cat", "box", "dog", "watch", "dish"],
      "categories": [
        { "label": "Add -s",  "answers": ["cat", "dog"] },
        { "label": "Add -es", "answers": ["box", "watch", "dish"] }
      ],
      "explanation": "cat/dog → add -s;  box/watch/dish → add -es"
    },
    {
      "id": "q5",
      "type": "reorder",
      "difficulty": 3,
      "tags": ["sentence", "word-order"],
      "question": "Arrange the words to form a correct sentence:",
      "words": ["apple", "I", "an", "eat"],
      "answer": ["I", "eat", "an", "apple"],
      "explanation": "Correct sentence: \"I eat an apple.\""
    }
  ]
}
```

---

### 3.3 Question Type Schemas (TypeScript interfaces)

#### `multiple-choice`

```typescript
interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];      // 2–6 choices
  answer: number;         // index of the correct option (0-based)
  explanation: string;
  hint?: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}
```

#### `true-false`

```typescript
interface TrueFalseQuestion {
  id: string;
  type: 'true-false';
  question: string;
  answer: boolean;
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}
```

#### `fill-in` — Apple Pencil Scribble

```typescript
interface FillInQuestion {
  id: string;
  type: 'fill-in';
  question: string;           // contains ___ as a placeholder
  answer: string;             // primary correct answer
  acceptedAnswers: string[];  // all accepted variants (incl. capitalisation)
  hint?: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}
```

> **Self-grading flow**: Fill-in questions are not auto-graded. After writing, the
> student taps **"Reveal Answer"** to see the correct answer, then taps
> **"✓ Got it"** or **"✗ Missed it"** to self-assess. The score is updated accordingly.

#### `categorize`

```typescript
interface CategorizeQuestion {
  id: string;
  type: 'categorize';
  question: string;
  items: string[];
  categories: {
    label: string;
    answers: string[];
  }[];
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}
```

#### `reorder`

```typescript
interface ReorderQuestion {
  id: string;
  type: 'reorder';
  question: string;
  words: string[];    // shuffled word list shown to the student
  answer: string[];   // correct order
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
}
```

---

## 4. Angular Project Structure

### 4.1 Technology Stack

| Technology | Version | Notes |
|:-----------|:-------:|:------|
| Angular | 18+ | Standalone Components architecture |
| Angular Router | 18+ | Home / Quiz / Result pages |
| Angular PWA | 18+ | Service Worker for offline support |
| HttpClient | built-in | Loads JSON quiz files |
| Angular Animations | built-in | Question transition animations |
| SCSS | — | Styling (CSS variables, dark theme) |

> **Not used**: NgRx, PrimeNG, Angular Material — kept intentionally lightweight.

---

### 4.2 Directory Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── quiz-index.model.ts      ← TypeScript types for index.json
│   │   │   └── question.model.ts        ← Union type for all question types
│   │   └── services/
│   │       ├── quiz-loader.service.ts   ← Fetches JSON into Angular Signals
│   │       └── quiz-engine.service.ts   ← Scoring, progress management
│   │
│   ├── features/
│   │   ├── home/
│   │   │   ├── home.component.ts        ← Main menu
│   │   │   └── quiz-card.component.ts   ← Individual quiz card
│   │   │
│   │   ├── quiz/
│   │   │   ├── quiz.component.ts        ← Question container (main flow)
│   │   │   ├── progress-bar.component.ts
│   │   │   └── question-types/
│   │   │       ├── multiple-choice.component.ts
│   │   │       ├── true-false.component.ts
│   │   │       ├── fill-in.component.ts
│   │   │       ├── categorize.component.ts
│   │   │       └── reorder.component.ts
│   │   │
│   │   └── result/
│   │       ├── result.component.ts      ← Score summary
│   │       └── review-item.component.ts ← Per-question review row
│   │
│   └── app.routes.ts                    ← Route definitions
│
├── assets/
│   └── quizzes/
│       ├── index.json                   ← 🔑 Master quiz registry
│       ├── unit1_plural.json
│       ├── unit2_nouns.json
│       └── unit3_pronouns.json
│
└── styles/
    ├── _variables.scss                  ← Design tokens (colours, spacing, fonts)
    ├── _mixins.scss
    └── global.scss
```

---

### 4.3 Routes

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component'),
    title: 'MyGrammar Quiz'
  },
  {
    path: 'quiz/:quizId',
    loadComponent: () => import('./features/quiz/quiz.component'),
    title: 'Quiz'
  },
  {
    path: 'result',
    loadComponent: () => import('./features/result/result.component'),
    title: 'Results'
  },
  { path: '**', redirectTo: '' }
];
```

---

### 4.4 Core Service Interfaces

#### `QuizLoaderService`

```typescript
@Injectable({ providedIn: 'root' })
export class QuizLoaderService {
  /** Fetches the quiz directory */
  loadIndex(): Observable<QuizIndex>;

  /** Fetches a specific quiz file */
  loadQuiz(filename: string): Observable<QuizData>;
}
```

#### `QuizEngineService`

```typescript
@Injectable({ providedIn: 'root' })
export class QuizEngineService {
  // Angular 18 Signals
  currentQuestion  = signal<Question | null>(null);
  currentIndex     = signal<number>(0);
  totalQuestions   = signal<number>(0);
  score            = signal<number>(0);
  isAnswered       = signal<boolean>(false);
  results          = signal<QuizResult[]>([]);

  init(quiz: QuizData): void;
  submitAnswer(answer: unknown): AnswerResult;
  nextQuestion(): void;
  getResultSummary(): ResultSummary;
}
```

---

## 5. Screen Specifications

### 5.1 Home Screen (`/`)

**Responsibilities**:
- Fetch and parse `/assets/quizzes/index.json`
- Render a scrollable list of quiz cards
- Support tag-based filtering (e.g. nouns / pronouns / verbs)
- Display question count, difficulty stars, and theme colour per card
- Navigate to `/quiz/:quizId` on card tap

**Wireframe**:

```
┌─────────────────────────────────────┐
│  ✏️  MyGrammar Quiz                 │
│  Tap a unit to start practicing     │
│                                     │
│  [All]  [nouns]  [pronouns]  [...]  │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ 📚  Unit 1 — Singular & Plural│  │
│  │     Adding -s and -es         │  │
│  │     ★☆☆  15 questions  →     │  │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ 🏙️  Unit 2 — Common & Proper │  │
│  │     Regular vs. special nouns │  │
│  │     ★☆☆  13 questions  →     │  │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

### 5.2 Quiz Screen (`/quiz/:quizId`)

**Responsibilities**:
- Read the `quizId` route parameter, map it to the `file` field in `index.json`
- Render questions one at a time with a progress bar and live score at the top
- Dispatch to the correct question-type component based on `question.type`
- Display explanation feedback after each answer
- After the last question, navigate to `/result`

**Dynamic component dispatch**:

```html
<!-- quiz.component.html — Angular 17+ @switch syntax -->
@switch (currentQuestion()?.type) {
  @case ('multiple-choice') { <app-multiple-choice [question]="currentQuestion()" /> }
  @case ('true-false')      { <app-true-false      [question]="currentQuestion()" /> }
  @case ('fill-in')         { <app-fill-in         [question]="currentQuestion()" /> }
  @case ('categorize')      { <app-categorize       [question]="currentQuestion()" /> }
  @case ('reorder')         { <app-reorder          [question]="currentQuestion()" /> }
}
```

**Fill-in UX flow (Apple Pencil Scribble)**:

```
Step 1  →  Large input field rendered (height ≥ 52 px, no autocorrect)
            Student writes with Apple Pencil inside the field
            iPadOS Scribble converts handwriting to text automatically

Step 2  →  Student taps "Reveal Answer"
            Correct answer appears in large green text

Step 3  →  Student taps "✓ Got it"  or  "✗ Missed it"
            Score updated, explanation shown, "Next Question" button appears
```

---

### 5.3 Result Screen (`/result`)

**Data source**: `QuizEngineService.getResultSummary()`

**Content**:
- Circular score ring (CSS `conic-gradient`)
- Score label (e.g. 8 / 12 — 67%)
- Motivational message based on percentage
- Per-question review list (question text + ✅ / ❌)
- **"Try Again"** button — resets and restarts the same quiz
- **"Choose Another Unit"** button — returns to home screen

---

## 6. SOP — Adding a New Quiz (No Code Required)

> Adding a new quiz bank requires exactly **two steps** and **zero code changes**.

### Step 1 — Create the quiz JSON file

Drop a new file in `src/assets/quizzes/`, e.g. `unit4_verbs.json`:

```json
{
  "meta": {
    "id": "unit4_verbs",
    "title": "Unit 4 — Action Verbs",
    ...
  },
  "questions": [ ... ]
}
```

### Step 2 — Register it in the directory

Add one entry to the `quizzes` array in `src/assets/quizzes/index.json`:

```json
{
  "id": "unit4_verbs",
  "title": "Unit 4 — Action Verbs",
  "subtitle": "What people and things do",
  "emoji": "🏃",
  "color": "#f59e0b",
  "tags": ["verbs"],
  "difficulty": 1,
  "file": "unit4_verbs.json",
  "questionCount": 12
}
```

The next time the app loads, the new quiz will appear automatically on the home screen.

---

## 7. iPad Optimisation Requirements

| Item | Specification |
|:-----|:-------------|
| Minimum touch target | 44 × 44 px (Apple HIG) |
| Fill-in input height | ≥ 52 px |
| Minimum font size | 16 px (prevents iOS auto-zoom) |
| Disable page zoom | `<meta name="viewport" content="user-scalable=no">` |
| Scribble compatibility | `autocomplete="off"` `autocorrect="off"` `spellcheck="false"` |
| Safe area insets | `padding-bottom: env(safe-area-inset-bottom)` |
| Apple Pencil pressure (future) | `PointerEvent.pressure` — canvas-based question types only |
| PWA | `manifest.webmanifest` + Service Worker registration |

---

## 8. Design Tokens

```scss
// styles/_variables.scss
:root {
  // Backgrounds
  --color-bg:       #0f172a;
  --color-surface:  rgba(255, 255, 255, 0.07);
  --color-border:   rgba(255, 255, 255, 0.12);

  // Text
  --color-text:     #f8fafc;
  --color-muted:    #94a3b8;

  // Semantic
  --color-correct:  #10b981;
  --color-wrong:    #ef4444;
  --color-accent:   #6366f1;

  // Spacing
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;

  // Border radius
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;

  // Typography
  --font-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
```

---

## 9. Feature Backlog

| Feature | Priority | Notes |
|:--------|:--------:|:------|
| Tag-based filtering on home screen | High | Filter by nouns / verbs / pronouns |
| Missed-questions review mode | High | Replay only questions answered incorrectly |
| Random mixed-quiz mode | Medium | Pull N questions from multiple JSON files |
| Offline JSON pre-caching | Medium | Service Worker caches all quiz files at install time |
| Teacher quiz-builder UI | Medium | Web form that exports a valid quiz JSON |
| Sound effects | Low | Correct / incorrect audio feedback |
| Multilingual UI | Low | i18n support (English / Chinese interface toggle) |
| Student score history | Low | LocalStorage persistence across sessions |

---

## 10. Project Setup Commands

```bash
# Scaffold a new Angular project with PWA support
npx -y @angular/cli@latest new mygrammar-quiz \
  --routing --style=scss --ssr=false

cd mygrammar-quiz

# Add PWA (offline support)
ng add @angular/pwa

# Start development server
ng serve --open

# Production build
ng build --configuration production

# Run unit tests
ng test
```

---

*Spec version 1.0 — created 2026-04-05*
