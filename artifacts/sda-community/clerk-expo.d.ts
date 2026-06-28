declare module "@clerk/clerk-expo" {
  import type { ComponentType, ReactNode } from "react";

  export const ClerkProvider: ComponentType<{ children?: ReactNode }>;
  export const ClerkLoaded: ComponentType<{ children?: ReactNode }>;
  export const SignedIn: ComponentType<{ children?: ReactNode }>;
  export const SignedOut: ComponentType<{ children?: ReactNode }>;

  export function useAuth(): {
    isLoaded: boolean;
    isSignedIn: boolean;
    userId: string | null;
    sessionId: string | null;
    getToken: () => Promise<string | null>;
    signOut: () => Promise<void>;
  };

  export function useUser(): {
    isLoaded: boolean;
    isSignedIn: boolean;
    user: any;
  };

  export function useSession(): {
    isLoaded: boolean;
    isSignedIn: boolean;
    session: any;
  };

  export function useSignIn(): {
    isLoaded: boolean;
    signIn: {
      create: (...args: any[]) => Promise<any>;
      prepareFirstFactor: (...args: any[]) => Promise<any>;
      attemptFirstFactor: (...args: any[]) => Promise<any>;
      resetPassword: (...args: any[]) => Promise<any>;
    };
    setActive: (...args: any[]) => Promise<void>;
  };

  export function useSignUp(): {
    isLoaded: boolean;
    signUp: {
      create: (...args: any[]) => Promise<any>;
      prepareEmailAddressVerification: (...args: any[]) => Promise<any>;
      attemptEmailAddressVerification: (...args: any[]) => Promise<any>;
    };
    setActive: (...args: any[]) => Promise<void>;
  };

  export function useClerk(): {
    user: any;
    session: any;
    signOut: () => Promise<void>;
    openSignIn: () => void;
    openSignUp: () => void;
  };

  export function withClerk<T>(component: T): T;
  export function withAuth<T>(component: T): T;
  export function withUser<T>(component: T): T;
}