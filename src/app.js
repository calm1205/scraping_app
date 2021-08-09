// 次のページのURLを作成
const nextPageURL = (document, mainURL, nextPageSelector) => {
  if (!nextPageSelector) return false;
  const nextPageDOM = document.querySelector(nextPageSelector);
  const nextPageHref = nextPageDOM?.getAttribute("href");
  if (!nextPageHref) return false;
  const domain = mainURL.match(/^http.*:\/\/[^\/]+\//)[0];
  const nextPageURLIsAbsolute = /^http/.test(nextPageHref);
  if (nextPageURLIsAbsolute) {
    return nextPageHref;
  } else {
    return domain + nextPageHref;
  }
};

// スクレイピング結果をファイルでダウンロード
const makeOutputFile = (output) => {
  let blob = new Blob([output], { type: "text/plan" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "output.txt";
  link.click();
};

// スクレイピング
const scraping = async (output, args) => {
  const { url, parentSelector, selectors, nextPageSelector } = args;
  const result = await fetch(url);
  const html = await result.text();
  const parser = new DOMParser();
  const virtualDocument = parser.parseFromString(html, "text/html");

  Array.from(virtualDocument.querySelectorAll(parentSelector)).forEach(
    (dom) => {
      selectors.forEach((selector, index) => {
        output += dom.querySelector(selector).textContent;
        if (selectors.length != index + 1) {
          output += ",";
        }
      });
      output += "\r\n";
    }
  );

  const nextURL = nextPageURL(virtualDocument, url, nextPageSelector);
  if (nextURL) {
    args.url = nextURL;
    scraping(output, args);
  } else {
    makeOutputFile(output);
    const scrapingButton = document.getElementById("scraping");
    scrapingButton.textContent = "Start Scraping";
    scrapingButton.disabled = false;
    return false;
  }
};

// +ボタンでフォームを追加
const addNewInput = (box, button) => {
  const index = button.getAttribute("data-id");
  const newInput = `<div class="input_form">
                      <p>Child Selector: ${index}</p>
                      <input type="text" class="selector" />
                    </div>`;
  box.insertAdjacentHTML("beforebegin", newInput);
  button.setAttribute("data-id", Number(index) + 1);
};

window.addEventListener("DOMContentLoaded", () => {
  // +ボタンでフォームを追加
  const addSelectorBox = document.getElementById("add_selector");
  const addSelectorButton = document.getElementById("add");
  addSelectorButton.addEventListener("click", () =>
    addNewInput(addSelectorBox, addSelectorButton)
  );

  // Scrapingボタンでスクレイピングの開始
  const scrapingButton = document.getElementById("scraping");
  scrapingButton.addEventListener("click", () => {
    const output = "";
    const selectorsDOM = Array.from(document.querySelectorAll(".selector"));
    const selectorsValue = [];
    selectorsDOM.forEach((dom) => {
      if (dom.value) selectorsValue.push(dom.value);
    });
    const args = {
      url: document.getElementById("url").value,
      parentSelector: document.getElementById("parent_selector").value,
      selectors: selectorsValue,
      nextPageSelector: document.getElementById("next_page").value,
    };
    scrapingButton.textContent = "Now Scraping ...";
    scrapingButton.disabled = true;
    scraping(output, args);
  });
});
