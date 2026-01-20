import Link from "next/link";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Layers,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Layers,
    title: "Structured Outputs",
    description:
      "Get organized, actionable results in your preferred format. Plans, checklists, emails, and more.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description:
      "Built on production-grade infrastructure. Get results in seconds, not minutes.",
  },
  {
    icon: Shield,
    title: "Production Ready",
    description:
      "Enterprise-grade reliability with comprehensive error handling and logging.",
  },
  {
    icon: Sparkles,
    title: "Intelligent Context",
    description:
      "The agent understands your goals and constraints to deliver tailored results.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">
                PydanticPilot
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/app">
                <Button variant="outline" className="rounded-xl bg-transparent">
                  Open Workspace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary text-secondary-foreground text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Full-Stack AI Agent
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance mb-6">
            Transform goals into
            <br />
            <span className="text-muted-foreground">structured action</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            PydanticPilot turns your objectives into organized, actionable
            outputs. Get plans, checklists, and summaries tailored to your
            needs in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app">
              <Button size="lg" className="rounded-xl gap-2 h-12 px-6">
                Open Workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/app">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl h-12 px-6 bg-transparent"
              >
                View Demo Flow
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Built for productivity
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to turn ideas into action, powered by
              cutting-edge AI technology.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary mb-4">
                  <feature.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to transform your goals into actionable results.
            </p>
          </div>
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Define your goal",
                description:
                  "Enter your objective and any relevant context. The more detail you provide, the better the output.",
              },
              {
                step: "02",
                title: "Choose your format",
                description:
                  "Select the output format that works best for you: plans, checklists, email drafts, or summaries with action items.",
              },
              {
                step: "03",
                title: "Get structured results",
                description:
                  "Receive organized, actionable output instantly. Save to history, export, or run again with different parameters.",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="flex gap-6 items-start p-6 rounded-2xl border border-border bg-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Open the workspace and experience the power of structured AI outputs.
            No signup required.
          </p>
          <Link href="/app">
            <Button size="lg" className="rounded-xl gap-2 h-12 px-8">
              Open Workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">
              PydanticPilot
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js and Pydantic AI
          </p>
        </div>
      </footer>
    </div>
  );
}
