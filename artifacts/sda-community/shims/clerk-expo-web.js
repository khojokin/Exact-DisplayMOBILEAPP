const React = require("react");

const MOCK_USER = {
  id: "preview-user",
  firstName: "Preview",
  lastName: "User",
  fullName: "Preview User",
  username: "preview_user",
  imageUrl: "",
  emailAddresses: [{ emailAddress: "preview@example.com", id: "email_1" }],
  primaryEmailAddressId: "email_1",
  primaryEmailAddress: { emailAddress: "preview@example.com" },
  publicMetadata: {},
  unsafeMetadata: {},
  reload: function() { return Promise.resolve(); },
  update: function() { return Promise.resolve(); },
};

const MOCK_SESSION = {
  id: "preview-session",
  userId: "preview-user",
  status: "active",
  getToken: function() { return Promise.resolve("preview-token"); },
};

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
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: "preview-user",
    sessionId: "preview-session",
    getToken: function() { return Promise.resolve("preview-token"); },
    signOut: function() { return Promise.resolve(); },
  };
}

function useUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: MOCK_USER,
  };
}

function useSession() {
  return {
    isLoaded: true,
    isSignedIn: true,
    session: MOCK_SESSION,
  };
}

function useSignIn() {
  return {
    isLoaded: true,
    signIn: {
      create: function() { return Promise.resolve({ status: "complete", createdSessionId: "preview-session" }); },
      prepareFirstFactor: function() { return Promise.resolve(); },
      attemptFirstFactor: function() { return Promise.resolve({ status: "complete", createdSessionId: "preview-session" }); },
    },
    setActive: function() { return Promise.resolve(); },
  };
}

function useSignUp() {
  return {
    isLoaded: true,
    signUp: {
      create: function() { return Promise.resolve({ status: "complete" }); },
      prepareEmailAddressVerification: function() { return Promise.resolve(); },
      attemptEmailAddressVerification: function() { return Promise.resolve({ status: "complete" }); },
    },
    setActive: function() { return Promise.resolve(); },
  };
}

function useClerk() {
  return {
    user: MOCK_USER,
    session: MOCK_SESSION,
    signOut: function() { return Promise.resolve(); },
    openSignIn: function() {},
    openSignUp: function() {},
  };
}

module.exports = {
  ClerkProvider,
  ClerkLoaded,
  SignedIn,
  SignedOut,
  useAuth,
  useUser,
  useSession,
  useSignIn,
  useSignUp,
  useClerk,
  withClerk: function(Component) { return Component; },
  withAuth: function(Component) { return Component; },
  withUser: function(Component) { return Component; },
};
