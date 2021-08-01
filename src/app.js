window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("button");
  console.log("hello world");
  console.log(button);

  button.addEventListener("click", () => {
    alert("hello");
    const title = document.querySelector("h1");
    title.style.color = "red";
  });
});
