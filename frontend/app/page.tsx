"use client";

import Image from "next/image";
import Link from "next/link";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Button } from "@/components/ui/button";

function BackgroundBeamsWithCollisionBackground() {
  return (
    <BackgroundBeamsWithCollision>
      <div className="flex flex-col items-center justify-center space-y-6 px-4">
        <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
          The Mini Payment Gateway
          <br />
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
              <span className="">TransFi Interview...</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
              <span className="">TransFi Interview...</span>
            </div>
          </div>
        </h2>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/auth?type=login">
            <Button size="lg" className="w-full sm:w-auto">Login</Button>
          </Link>

          <Link href="/auth?type=signup">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Signup
            </Button>
          </Link>
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}

export default function Home() {
  return <BackgroundBeamsWithCollisionBackground />;
}
