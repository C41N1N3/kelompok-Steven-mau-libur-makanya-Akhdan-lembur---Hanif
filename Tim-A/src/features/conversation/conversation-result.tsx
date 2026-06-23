import { CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { ConversationScore } from "@/lib/ai/conversation-scorer";

type Props = {
  score: ConversationScore;
};

export function ConversationResult({ score }: Props) {
  return (
    <div className="space-y-5 rounded-lg border bg-muted/30 p-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-medium text-muted-foreground">
              Overall score
            </p>
            <h2 className="text-3xl font-semibold">{score.overallScore}</h2>
          </div>
          <CheckCircle2 className="size-10 text-emerald-600" />
        </div>
        <Progress value={score.overallScore} className="mt-3 h-2" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Relevance" value={score.relevanceScore} />
        <Metric label="Completeness" value={score.completenessScore} />
        <Metric label="Fluency" value={score.fluencyScore} />
        <Metric label="Confidence" value={score.confidenceScore} />
      </div>

      <FeedbackList
        icon={TrendingUp}
        title="Strengths"
        items={score.strengths}
      />
      <FeedbackList
        icon={Lightbulb}
        title="Next practice focus"
        items={score.improvementTips}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-background p-3 ring-1 ring-border">
      <div className="flex items-center justify-between text-base">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <Progress value={value} className="mt-2 h-1.5" />
    </div>
  );
}

function FeedbackList({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof TrendingUp;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
        <Icon className="size-4" />
        {title}
      </h3>
      <ul className="mt-2 space-y-1.5 text-base text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
