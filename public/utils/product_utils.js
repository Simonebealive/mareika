const setImageActive = (imgSelector, imgSliderSelector) => {
    // exampleImgSelector = "product-images img";
    // exampleImgSliderSelector = "image-slider";
    const productImages = document.querySelectorAll(imgSelector);
    const productImageSlide = document.querySelector(imgSliderSelector);
    let activeImageSlide = 0;
    productImages.forEach((item, i) => {
      item.addEventListener("click", function () {
        productImages[activeImageSlide].classList.remove("active");
        item.classList.add("active");
        productImageSlide.style.backgroundImage = `url('$(item.src)')`;
        activeImageSlide = i;
      });
    });
  };