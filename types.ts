export enum AppView {
  IDENTITY = 'IDENTITY',
  CANVAS = 'CANVAS',
  UTILITY = 'UTILITY',
  CODE = 'CODE',
  HISTORY = 'HISTORY'
}

export interface Character {
  id: string;
  name: string;
  description: string; // The "learned" prompt description
  thumbnail: string;
}

export interface GenerationItem {
  id: string;
  type: 'image' | 'code';
  content: string; // Image URL or Code string
  prompt: string;
  timestamp: number;
  metadata?: {
    model: string;
    style?: string;
    characterId?: string;
  };
}

export interface AppState {
  currentView: AppView;
  characters: Character[];
  history: GenerationItem[];
  credits: number;
  selectedCharacterId: string | null;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  stylePreset?: string;
  character?: Character;
  strength?: number; // Consistency strength
}
