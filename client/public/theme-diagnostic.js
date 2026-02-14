// Theme Diagnostic Script
// Run this in the browser console to diagnose theme issues

console.log("=== THEME DIAGNOSTIC ===");

// 1. Check if data-theme attribute is set
const htmlElement = document.documentElement;
const currentTheme = htmlElement.getAttribute("data-theme");
console.log("1. Current data-theme attribute:", currentTheme);

// 2. Check computed CSS variables
const computedStyle = getComputedStyle(htmlElement);
console.log("2. CSS Variables:");
console.log(
  "   --color-primary:",
  computedStyle.getPropertyValue("--color-primary"),
);
console.log("   --color-bg:", computedStyle.getPropertyValue("--color-bg"));
console.log("   --color-text:", computedStyle.getPropertyValue("--color-text"));

// 3. Check localStorage
const authStorage = localStorage.getItem("auth-storage");
if (authStorage) {
  try {
    const parsed = JSON.parse(authStorage);
    console.log(
      "3. Theme in localStorage:",
      parsed?.state?.user?.preferences?.theme,
    );
  } catch (e) {
    console.log("3. Error parsing localStorage:", e);
  }
} else {
  console.log("3. No auth-storage in localStorage");
}

// 4. Try setting theme manually
console.log("4. Testing manual theme change to 'green'...");
htmlElement.setAttribute("data-theme", "green");
setTimeout(() => {
  const newBg = getComputedStyle(htmlElement).getPropertyValue("--color-bg");
  console.log("   Background color after setting green:", newBg);
  console.log("   Did it change? Expected: #ecfdf5 (emerald-50)");
}, 100);

console.log("=== END DIAGNOSTIC ===");
