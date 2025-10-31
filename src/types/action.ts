export interface GlobalAction {
  label?: string; // Made optional as component might not need a label for GlobalActionButton
  action?: () => void; // Made optional as component might not need an action for GlobalActionButton
  icon?: React.ReactNode;
  color?: ButtonColor;
  variant?: ButtonVariant;
  disabled?: boolean;
  component?: React.ReactNode; // NEW: Allow rendering a custom React component directly
}