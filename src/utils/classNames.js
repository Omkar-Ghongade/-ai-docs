/**
 * Utility function to conditionally join CSS class names together
 * @param  {...string} classes - CSS class names to join
 * @returns {string} - Joined class names with extra spaces removed
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
} 