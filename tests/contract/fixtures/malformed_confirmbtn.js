// Intentional SyntaxError fixture — must FAIL `node --check`.
// Mirrors the live regression: `if confirmBtn)` without '('.
function showSuitableCaptchaPanel() {
  if confirmBtn) {
    confirmBtn.hidden = false;
  }
}
