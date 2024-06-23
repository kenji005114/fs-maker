import { createContext } from "react";
interface Links {
  chrome: string;
  firefox: string;
  github: string;
}

export const LinksContext = createContext<Links | null>(null);
