
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

let soundOn = true;
document.getElementById("toggleSound").addEventListener("click", () => {
  soundOn = !soundOn;
  alert("Sound " + (soundOn ? "On" : "Off"));
});

// Placeholder navigation
document.querySelectorAll(".game-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    alert("Launching " + btn.textContent.trim());
  });
});
