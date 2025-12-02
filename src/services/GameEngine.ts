// src/services/GameEngine.ts
import { GameCard, GameState, SCORE_CONFIG, GridSize } from '../types/game.types';
import { FashionItem } from '../types/fashion.types';

export class GameEngine {
  private cards: GameCard[] = [];
  private matchedPairs: number = 0;
  private firstCard: GameCard | null = null;
  private secondCard: GameCard | null = null;
  private canFlip: boolean = true;
  private timeLeft: number = 0;
  private timeElapsed: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  private score: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private matchTimes: number[] = [];
  private lastMatchTime: number = Date.now();
  private startTime: number = Date.now();
  private difficultyLevel: number;
  private onStateChange?: (state: GameState) => void;

  constructor(
    private fashionItems: FashionItem[],
    private gridSize: GridSize,
    private timeLimit: number,
    difficultyLevel: number = 1,
    onStateChange?: (state: GameState) => void
  ) {
    this.difficultyLevel = difficultyLevel;
    this.onStateChange = onStateChange;
    this.initializeGame();
  }

  private initializeGame(): void {
    this.cards = this.generateCards();
    this.matchedPairs = 0;
    this.timeLeft = this.timeLimit;
    this.timeElapsed = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.matchTimes = [];
    this.startTime = Date.now();
    this.lastMatchTime = Date.now();
  }

  private generateCards(): GameCard[] {
    const totalPairs = (this.gridSize.rows * this.gridSize.cols) / 2;
    const selectedItems = this.fashionItems.slice(0, totalPairs);
    const cards: GameCard[] = [];

    selectedItems.forEach((item, index) => {
      const pairId = `pair-${index}`;
      
      // Create two cards for each fashion item
      cards.push({
        id: `${pairId}-a`,
        fashionItemId: item.id,
        imageUrl: item.image_url,
        thumbnailUrl: item.thumbnail_url,
        category: item.category,
        isFlipped: false,
        isMatched: false,
        pairId,
      });

      cards.push({
        id: `${pairId}-b`,
        fashionItemId: item.id,
        imageUrl: item.image_url,
        thumbnailUrl: item.thumbnail_url,
        category: item.category,
        isFlipped: false,
        isMatched: false,
        pairId,
      });
    });

    return this.shuffleArray(cards);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public flipCard(cardId: string): GameState {
    if (!this.canFlip || this.isPaused || this.isGameOver) {
      return this.getGameState();
    }

    const card = this.cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) {
      return this.getGameState();
    }

    card.isFlipped = true;

    if (!this.firstCard) {
      this.firstCard = card;
    } else if (!this.secondCard && card.id !== this.firstCard.id) {
      this.secondCard = card;
      this.checkForMatch();
    }

    const state = this.getGameState();
    this.onStateChange?.(state);
    return state;
  }

  private checkForMatch(): void {
    if (!this.firstCard || !this.secondCard) return;

    this.canFlip = false;

    const isMatch = this.firstCard.pairId === this.secondCard.pairId;

    if (isMatch) {
      // Match found!
      this.firstCard.isMatched = true;
      this.secondCard.isMatched = true;
      this.matchedPairs++;
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);

      // Calculate match time
      const matchTime = (Date.now() - this.lastMatchTime) / 1000;
      this.matchTimes.push(matchTime);
      this.lastMatchTime = Date.now();

      // Calculate score
      this.calculateScore(matchTime);

      // Check if game is won
      if (this.matchedPairs === this.cards.length / 2) {
        this.endGame(true);
      }

      // Reset immediately for matches
      this.firstCard = null;
      this.secondCard = null;
      this.canFlip = true;

      const state = this.getGameState();
      this.onStateChange?.(state);
    } else {
      // No match - reset combo
      this.combo = 0;

      // Reset after delay
      setTimeout(() => {
        if (this.firstCard && this.secondCard && !this.firstCard.isMatched) {
          this.firstCard.isFlipped = false;
          this.secondCard.isFlipped = false;
        }
        this.firstCard = null;
        this.secondCard = null;
        this.canFlip = true;

        const state = this.getGameState();
        this.onStateChange?.(state);
      }, 1000);
    }
  }

  private calculateScore(matchTime: number): void {
    // Base score for match
    let matchScore = SCORE_CONFIG.BASE_MATCH_SCORE;

    // Combo bonus
    if (this.combo > 1) {
      matchScore *= Math.pow(SCORE_CONFIG.COMBO_MULTIPLIER, this.combo - 1);
    }

    // Time bonus (faster = more points)
    if (matchTime < 3) {
      matchScore += SCORE_CONFIG.TIME_BONUS_PER_SECOND * (3 - matchTime);
    }

    // Difficulty multiplier
    const difficultyMultiplier = SCORE_CONFIG.DIFFICULTY_MULTIPLIERS[
      this.difficultyLevel as keyof typeof SCORE_CONFIG.DIFFICULTY_MULTIPLIERS
    ] || 1;
    matchScore *= difficultyMultiplier;

    this.score += Math.round(matchScore);
  }

  public startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (!this.isPaused && !this.isGameOver) {
        this.timeLeft--;
        this.timeElapsed++;

        if (this.timeLeft <= 0) {
          this.endGame(false);
        }

        const state = this.getGameState();
        this.onStateChange?.(state);
      }
    }, 1000);
  }

  public pauseGame(): void {
    this.isPaused = true;
    const state = this.getGameState();
    this.onStateChange?.(state);
  }

  public resumeGame(): void {
    this.isPaused = false;
    this.lastMatchTime = Date.now();
    const state = this.getGameState();
    this.onStateChange?.(state);
  }

  private endGame(isWon: boolean): void {
    console.log('🏁 GameEngine.endGame called:', { isWon, matchedPairs: this.matchedPairs, totalPairs: this.cards.length / 2 });
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    this.isGameOver = true;
    this.canFlip = false;

    const state = this.getGameState();
    console.log('🏁 Calling onStateChange with isGameOver:', state.isGameOver);
    this.onStateChange?.(state);
  }

  public getGameState(): GameState {
    return {
      cards: [...this.cards],
      matchedPairs: this.matchedPairs,
      totalPairs: this.cards.length / 2,
      timeLeft: this.timeLeft,
      timeElapsed: this.timeElapsed,
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      isGameOver: this.isGameOver,
      isWon: this.matchedPairs === this.cards.length / 2,
      isPaused: this.isPaused,
    };
  }

  public getPerformanceMetrics() {
    const avgMatchTime = this.matchTimes.length > 0
      ? this.matchTimes.reduce((a, b) => a + b, 0) / this.matchTimes.length
      : 0;

    const totalTime = (Date.now() - this.startTime) / 1000;
    const accuracy = this.cards.length > 0
      ? this.matchedPairs / (this.cards.length / 2)
      : 0;

    const comboFrequency = this.matchedPairs > 0
      ? this.maxCombo / this.matchedPairs
      : 0;

    // Performance score (0-100)
    const speedScore = Math.max(0, 100 - (avgMatchTime * 10));
    const accuracyScore = accuracy * 100;
    const comboScore = comboFrequency * 100;
    const performanceScore = (speedScore + accuracyScore + comboScore) / 3;

    return {
      avg_match_time: avgMatchTime,
      accuracy_rate: accuracy,
      combo_frequency: comboFrequency,
      speed_score: speedScore,
      difficulty_score: this.difficultyLevel * 20,
      performance_score: performanceScore,
    };
  }

  public destroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public reset(): void {
    this.destroy();
    this.initializeGame();
  }
}
