import React from "react";
import {
  KeyboardAwareScrollView as ControllerKeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
  KeyboardProvider,
} from "react-native-keyboard-controller";

/**
 * Scroll view for form screens. While the keyboard is open it pads the end of
 * the content by the keyboard height, so everything stays reachable by
 * scrolling, and it keeps the focused input above the keyboard.
 *
 * It carries its own KeyboardProvider (as StepperForm and GiftedChat do)
 * because the app has no root one. The added padding is a trailing child of
 * the content container, so that container must be able to grow: use
 * `flexGrow: 1`, never `flex: 1`, in `contentContainerStyle`.
 */
const KeyboardAwareScrollView = ({
  children,
  ...rest
}: React.PropsWithChildren<KeyboardAwareScrollViewProps>) => (
  <KeyboardProvider>
    <ControllerKeyboardAwareScrollView
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ControllerKeyboardAwareScrollView>
  </KeyboardProvider>
);

export default KeyboardAwareScrollView;
