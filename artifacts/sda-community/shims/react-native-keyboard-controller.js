const React = require("react");
const { ScrollView } = require("react-native");

function KeyboardProvider({ children }) { return children; }
function KeyboardAwareScrollView({ children, ...props }) {
  return React.createElement(ScrollView, props, children);
}
function KeyboardAvoidingView({ children, ...props }) {
  return React.createElement("div", null, children);
}
function KeyboardStickyView({ children }) { return children; }
function KeyboardToolbar() { return null; }

function useKeyboardController() { return { enabled: false }; }
function useKeyboardHandler() {}
function useReanimatedKeyboardAnimation() { return { height: { value: 0 }, state: { value: 0 } }; }
function useKeyboardContext() { return {}; }

module.exports = {
  KeyboardProvider,
  KeyboardAwareScrollView,
  KeyboardAvoidingView,
  KeyboardStickyView,
  KeyboardToolbar,
  useKeyboardController,
  useKeyboardHandler,
  useReanimatedKeyboardAnimation,
  useKeyboardContext,
};
