const smallNav = document.getElementById("smallNav");
const hamberger = document.getElementById("hamberger");
const closeIcon = document.getElementById("closeIcon");

function toggleNav() {
  // Toggle visibility of the smallNav div
  if (smallNav.classList.contains("d-none")) {
    smallNav.classList.remove("d-none");
    smallNav.classList.add("d-block");

    // Show the "X" icon and hide the hamburger icon
    hamberger.classList.add("d-none");
    closeIcon.classList.remove("d-none");
  } else {
    smallNav.classList.remove("d-block");
    smallNav.classList.add("d-none");

    // Show the hamburger icon and hide the "X" icon
    hamberger.classList.remove("d-none");
    closeIcon.classList.add("d-none");
  }
}
