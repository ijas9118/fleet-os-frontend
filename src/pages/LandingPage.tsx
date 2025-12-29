import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight lg:text-7xl">
          Modern Fleet Management <br className="hidden sm:inline" />
          <span className="text-primary">Reimagined.</span>
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
          Minimalistic, powerful, and black & white. Control your fleet with elegance and efficiency.
        </p>
      </div>
      <div className="flex gap-4">
        <Button size="lg">Start Inventory</Button>
        <Button size="lg" variant="outline">Learn More</Button>
      </div>
    </div>
  );
}
