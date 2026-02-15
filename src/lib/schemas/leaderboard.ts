import { z } from "zod";

export const LeaderboardEntrySchema = z.object({
  name: z.string(),
  type: z.enum(["tool", "skill", "model", "application", "workflow"]),
  subcategory: z.enum([
    "coding",
    "design",
    "ui-ux",
    "video-gen",
    "prompt-engineering",
    "project-building",
    "research",
    "productivity",
    "devops",
    "data",
    "audio",
    "writing",
    "other",
  ]),
  status: z.enum(["used", "researched"]),
  rank: z.number().int().positive(),
  use_case: z.string(),
  where_used: z.string().optional(),
  verdict: z.string(),
  doc_link: z.string().optional(),
  date_added: z.coerce.date(),
  date_updated: z.coerce.date(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
