import { Injectable, signal, computed } from '@angular/core';

export type Lang = 'en' | 'zh';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    appTitle: 'MyGrammar Quiz',
    appSubtitle: 'Choose a book to start',
    version: 'Version',
    versions: 'versions',
    noVersions: 'No versions yet',
    units: 'units',
    quizzes: 'quizzes',
    noUnits: 'No units yet',
    noQuizzes: 'No quizzes yet',
    questions: 'questions',
    next: 'Next Question',
    submit: 'Submit',
    check: 'Check Answer',
    revealAnswer: 'Reveal Answer',
    gotIt: 'Got it',
    missedIt: 'Missed it',
    tryAgain: 'Try Again',
    chooseAnother: 'Choose Another Unit',
    score: 'Score',
    resultTitle: 'Quiz Complete!',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    explanation: 'Explanation',
    questionOf: 'of',
    difficulty: 'Difficulty',
    hintLabel: 'Hint',
    fillInPlaceholder: 'Type your answer here...',
    categorizeInstruction: 'Tap a word, then tap a category to place it',
    reorderInstruction: 'Tap words in the correct order',
    true: 'True',
    false: 'False',
    reset: 'Reset',
    motivationPerfect: 'Perfect score! Amazing!',
    motivationGreat: 'Great job! Keep it up!',
    motivationGood: 'Good effort! Review and try again!',
    motivationKeepTrying: 'Keep practicing! You\'ll improve!',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    review: 'Review',
    loading: 'Loading...',
    bestScore: 'Best',
    attempts: 'attempts',
    resetScores: 'Reset All Scores',
    resetConfirm: 'Reset all quiz scores? This cannot be undone.',
    viewHistory: 'History',
    attemptHistory: 'Attempt History',
    noAttempts: 'No quiz attempts yet',
    viewDetail: 'View Detail',
    studentAnswer: 'Your answer',
    selfGradedLabel: 'Self-graded',
    backToHome: 'Back',
    attemptDate: 'Date',
    questionsCorrect: 'correct',
  },
  zh: {
    appTitle: 'MyGrammar 文法測驗',
    appSubtitle: '選擇課本開始練習',
    version: '版本',
    versions: '個版本',
    noVersions: '尚無版本',
    units: '個單元',
    quizzes: '個測驗',
    noUnits: '尚無單元',
    noQuizzes: '尚無測驗',
    questions: '題',
    next: '下一題',
    submit: '送出',
    check: '檢查答案',
    revealAnswer: '顯示答案',
    gotIt: '答對了',
    missedIt: '答錯了',
    tryAgain: '再試一次',
    chooseAnother: '選擇其他單元',
    score: '得分',
    resultTitle: '測驗完成！',
    correct: '正確！',
    incorrect: '錯誤',
    explanation: '解析',
    questionOf: '/',
    difficulty: '難度',
    hintLabel: '提示',
    fillInPlaceholder: '在此輸入答案...',
    categorizeInstruction: '點選單字，再點選分類放入',
    reorderInstruction: '依正確順序點選單字',
    true: '對',
    false: '錯',
    reset: '重設',
    motivationPerfect: '滿分！太厲害了！',
    motivationGreat: '表現很好！繼續加油！',
    motivationGood: '不錯！複習後再試一次！',
    motivationKeepTrying: '繼續練習，你會進步的！',
    yourAnswer: '你的答案',
    correctAnswer: '正確答案',
    review: '複習',
    loading: '載入中...',
    bestScore: '最佳',
    attempts: '次',
    resetScores: '清除所有成績',
    resetConfirm: '確定清除所有測驗成績？此操作無法復原。',
    viewHistory: '歷史紀錄',
    attemptHistory: '測驗歷史',
    noAttempts: '尚無測驗紀錄',
    viewDetail: '查看詳情',
    studentAnswer: '你的答案',
    selfGradedLabel: '自行評分',
    backToHome: '返回',
    attemptDate: '日期',
    questionsCorrect: '題答對',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  lang = signal<Lang>(this.detectLang());
  translations = computed(() => translations[this.lang()]);

  t(key: string): string {
    return translations[this.lang()][key] ?? key;
  }

  toggle(): void {
    this.lang.update(l => (l === 'en' ? 'zh' : 'en'));
    localStorage.setItem('lang', this.lang());
  }

  private detectLang(): Lang {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'zh') return saved;
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  }
}
