"use client";

import { useEffect, useState } from "react";
import { useInterval, useReducedMotionPref } from "@/lib/hooks";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%#";

/**
 * Cycles through `words` with a short "decoding" effect, like a trading terminal.
 * Screen readers get the full list once instead of random letters.
 */
export function ScrambleText({ words, className }: { words: readonly string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(words[0]);
  const reduced = useReducedMotionPref();

  // Move to the next word every 2.6 seconds (never for reduced motion).
  useInterval(() => setIndex((i) => (i + 1) % words.length), reduced ? null : 2600);

  // Scramble the letters for ~0.5s, revealing the new word from left to right.
  useEffect(() => {
    const target = words[index];
    const totalFrames = 14;
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const revealed = Math.floor((frame / totalFrames) * target.length);
      const scrambled = target
        .split("")
        .map((letter, i) => (i < revealed ? letter : CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]))
        .join("");
      setText(frame >= totalFrames ? target : scrambled);
      if (frame >= totalFrames) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [index, words]);

  return (
    <>
      <span aria-hidden className={className}>
        {text}
      </span>
      <span className="sr-only">{words.join(", ")}</span>
    </>
  );
}
