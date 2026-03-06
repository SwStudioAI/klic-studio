import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Film, Sparkles, Play } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative flex flex-col items-center justify-center px-4 py-24 md:py-36 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/50 to-background" />
        <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Sparkles className="h-4 w-4" />
          AI-powered video creation
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          Create stunning video stories with{" "}
          <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            kLic
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl">
          Write scripts, design scenes, and render professional videos — all
          from your browser. Share your stories with the world.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/studio">
              <Film className="mr-2 h-4 w-4" />
              Open Studio
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/explore">
              <Play className="mr-2 h-4 w-4" />
              Explore
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Write",
              description:
                "Craft your story with a powerful script editor. Add scenes, set durations, and build your narrative.",
            },
            {
              title: "Design",
              description:
                "Upload images and audio for each scene. Arrange and reorder with drag & drop.",
            },
            {
              title: "Render & Share",
              description:
                "One-click render to produce a polished video. Publish and share with your audience.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 text-card-foreground"
            >
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
