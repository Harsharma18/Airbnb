   const filterContainer = document.getElementById("filters"); 
   const rightArrow = document.getElementById("rightBtn");
   const leftArrow = document.getElementById("leftBtn");

   const manageIcons = () => {
       let maxScrollWidth = filterContainer.scrollWidth - filterContainer.clientWidth - 20;

       // Show/hide left arrow
       leftArrow.style.display = filterContainer.scrollLeft > 20 ? "block" : "none";
       
       // Show/hide right arrow
       rightArrow.style.display = filterContainer.scrollLeft >= maxScrollWidth ? "none" : "block";
   };

   rightArrow.addEventListener("click", () => {
       filterContainer.scrollLeft += 700;
       manageIcons();
   });

   leftArrow.addEventListener("click", () => {
       filterContainer.scrollLeft -= 700;
       manageIcons();
   });

   filterContainer.addEventListener("scroll", manageIcons);

   // Initialize visibility
   manageIcons();
   