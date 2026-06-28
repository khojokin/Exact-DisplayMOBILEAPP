const { useSession } = require("../lib/session");

function ClerkProvider({ children }) {
  return children;
}

function ClerkLoaded({ children }) {
  return children;
}

function SignedIn({ children }) {
  return children;
}

function SignedOut() {
  return null;
}

function useAuth() {
  const { userId, isLoaded, resetSession } = useSession();
  return {
    isLoaded,
    isSignedIn: !!userId,
    userId,
    sessionId: userId ? `session-${userId}` : null,
    getToken: async () => null,
    signOut: resetSession,
  };
}

function useUser() {
  const { user, isLoaded, isSignedIn } = useSession();
  return {
    isLoaded,
    isSignedIn,
    user: user
      ? {
          ...user,
          emailAddresses: user.primaryEmailAddress
            ? [{ emailAddress: user.primaryEmailAddress.emailAddress, id: "email_1" }]
            : [],
          primaryEmailAddressId: user.primaryEmailAddress ? "email_1" : null,
          reload: async () => undefined,
          update: async () => undefined,
          publicMetadata: {},
          unsafeMetadata: {},
        }
      : null,
  };
}

function useSessionShim() {
  const { userId, isLoaded } = useSession();
  return {
    isLoaded,
    isSignedIn: !!userId,
    session: userId ? { id: `session-${userId}`, userId, status: "active", getToken: async () => null } : null,
  };
}

function useSignIn() {
  return {
    isLoaded: true,
    signIn: {
      create: async () => ({ status: "complete", createdSessionId: "local-session" }),
      prepareFirstFactor: async () => undefined,
      attemptFirstFactor: async () => ({ status: "complete", createdSessionId: "local-session" }),
      resetPassword: async () => ({ status: "complete", createdSessionId: "local-session" }),
    },
    setActive: async () => undefined,
  };
}

function useSignUp() {
  return {
    isLoaded: true,
    signUp: {
      create: async () => ({ status: "complete", createdUserId: "local-user", createdSessionId: "local-session" }),
      prepareEmailAddressVerification: async () => undefined,
      attemptEmailAddressVerification: async () => ({ status: "complete", createdSessionId: "local-session" }),
    },
    setActive: async () => undefined,
  };
}

function useClerk() {
  const { user, resetSession } = useSession();
  return {
    user,
    session: null,
    signOut: resetSession,
    openSignIn: () => undefined,
    openSignUp: () => undefined,
  };
}

module.exports = {
  ClerkProvider,
  ClerkLoaded,
  SignedIn,
  SignedOut,
  useAuth,
  useUser,
  useSession: useSessionShim,
  useSignIn,
  useSignUp,
  useClerk,
  withClerk: (Component) => Component,
  withAuth: (Component) => Component,
  withUser: (Component) => Component,
};