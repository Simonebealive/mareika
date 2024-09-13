/* eslint-disable no-undef */
const searchKey = decodeURI(location.pathname.split("/").pop());
const searchSpanElement = document.querySelector("#search-key");
searchSpanElement.innerHTML = searchKey;
let searchResult = null;
(async () => {
  searchResult = await getProductsByTag(searchKey);
  if (searchResult.length) {
    createProductCards(searchResult, ".card-container", "search");
  } else {
    console.warn("No search result found");
  }
})();
