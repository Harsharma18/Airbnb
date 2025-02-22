let taxSwitch = document.getElementById('tax');
let taxLabel = document.querySelector("label[for='tax']"); 

taxSwitch.addEventListener("change", () => {
    let normalPrices = document.querySelectorAll(".normal-price");
    let taxPrices = document.querySelectorAll(".tax-price");

    normalPrices.forEach((price, index) => {
        if (taxSwitch.checked) {
            taxPrices[index].classList.add("show"); 
            normalPrices[index].style.display = "none"; 
            taxLabel.textContent = "Display price after taxes"; // Change label
        } else {
            taxPrices[index].classList.remove("show"); 
            normalPrices[index].style.display = "block"; 
            taxLabel.textContent = "Display price before taxes"; // Reset label
        }
    });
});