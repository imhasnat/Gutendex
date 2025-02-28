function toggleSpinner(show = true) {
  const spinner = document.getElementById("spinnerOverlay");
  if (show) {
    spinner.classList.remove("hidden");
  } else {
    spinner.classList.add("hidden");
  }
}
