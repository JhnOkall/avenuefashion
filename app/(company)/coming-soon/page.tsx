import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const ComingSoon = () => {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-primary lg:text-9xl">
            Not quite yet
          </h1>
          <p className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Coming Soon.
          </p>
          <p className="mb-4 text-lg font-light text-muted-foreground">
            We are working on it meanwhile, you'll find lots to explore on the
            home page.
          </p>
          <Button asChild size="lg" className="my-4">
            <Link href="/">Back to Homepage</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
