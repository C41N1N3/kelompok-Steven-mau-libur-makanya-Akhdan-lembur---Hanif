"use client";

import { Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Difficulty, DifficultyConfig } from "@/features/difficulty/rules";
import { VocabularyPractice } from "@/features/practice/vocabulary-practice";
import { speakGreek } from "@/lib/audio/tts";
import type { PracticeItem } from "@/server/queries/practice";

type Props = {
  lessonId: string;
  difficulty: Difficulty;
  config: DifficultyConfig;
  items: PracticeItem[];
  autoStart?: boolean;
};

export function ListeningPractice(props: Props) {
  return (
    <VocabularyPractice
      {...props}
      mode="listening"
      title="Listening drill"
      description="Play each Greek prompt, then choose the matching answer."
      renderPromptAction={(item) => (
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-[16px] border-[#7c571e]/30 bg-white px-5 text-base font-semibold text-[#4f4539] hover:bg-[#fbf6f1]"
          onClick={() => speakGreek(item.greek ?? item.prompt)}
        >
          <Volume2 className="size-5" />
          Play prompt
        </Button>
      )}
    />
  );
}
