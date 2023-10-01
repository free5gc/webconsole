import { createContext } from "react";

export interface User {
  username: string;
  token: string;
}

export interface UserContext {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const LoginContext = createContext<UserContext>({
  user: null,
  setUser: (user: User | null) => {
    console.log(user);
  },
});
