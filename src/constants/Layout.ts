// This file will hold layout-related constants for the entire app.

// We are making the icons smaller, but increasing the padding to keep the total height consistent.

// Previous size was 34, new size is 30.
export const TAB_ICON_SIZE = 30;

// Previous padding was 14. We increase it to 16 to compensate for the smaller icon size.
// (Old height: 34 + 14*2 = 62. New height: 30 + 16*2 = 62. Total height is preserved).
export const TAB_ICON_VERTICAL_PADDING = 16;

// This will now automatically calculate to the same content height as before.
export const TAB_BAR_CONTENT_HEIGHT = TAB_ICON_SIZE + TAB_ICON_VERTICAL_PADDING * 2;
