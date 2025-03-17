document.addEventListener("DOMContentLoaded", function () {
  const markdownOutputElem = document.getElementById("markdownOutput");

  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
  });

  async function handleUrl() {
    const urlInput = document.getElementById("urlInput");
    if (!urlInput) {
      console.error("URL input element not found");
      return;
    }
    const url = urlInput.value.trim();
    if (!url) {
      showMessage("Please enter a valid URL", "alert");
      return;
    }
    try {
      const response = await fetch("/fetch-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      convertToMarkdown(data.html, data.filename);
    } catch (error) {
      showMessage("Error fetching URL", "alert");
      console.error("Error fetching URL:", error);
    }
  }

  function handleHtml() {
    const htmlInput = document.getElementById("htmlInput");
    if (!htmlInput) {
      console.error("HTML input element not found");
      return;
    }
    const html = htmlInput.value.trim();
    if (!html) {
      showMessage("There's no HTML in there!", "alert");
      return;
    }
    console.log("HTML input:", html); // Debugging: Check if HTML is captured
    convertToMarkdown(html);
  }

  function convertToMarkdown(html, filename) {
    const markdown = turndownService.turndown(html);
    const downloadButton = document.getElementById("downloadButton");
    if (!markdownOutput || !downloadButton) {
      console.error("Markdown output or download button not found");
      return;
    }
    markdownOutputElem.value = markdown;

    // Attach the download functionality dynamically
    downloadButton.addEventListener("click", () => downloadMd(markdown, filename));
  }

  function copyToClipboard() {
    if (!markdownOutputElem) {
      showMessage("Markdown output element not found", "status");
      console.error("Markdown output element not found");
      return;
    }

    // Check if the output field is empty or only contains whitespace
    if (!markdownOutputElem.value.trim()) {
      showMessage("No content to copy", "alert");
      return;
    }

    markdownOutputElem.select(); // Select the text field
    navigator.clipboard.writeText(markdownOutputElem.value).then(() => {
      showMessage("Markdown copied to clipboard", "status");
    }).catch((err) => {
      showMessage("Failed to copy to clipboard", "alert");
      console.error("Failed to copy text: ", err);
    });
  }

  function downloadMd(text, filename) {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element for downloading the file
    const a = document.createElement("a");
    a.href = url;

    // Use the provided filename or fallback to "download.md"
    a.download = filename || "download.md";

    // Trigger the download
    a.click();

    // Revoke the object URL after the download is complete
    URL.revokeObjectURL(url);
  }

  async function handleUrlAndCopy() {
    await handleUrl();
    copyToClipboard();
  }

  function showMessage(message, role="status") {
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.textContent = message;
    messageContainer.setAttribute("role", role);

    // Optionally, clear the message after a few seconds
    // setTimeout(() => {
    //   messageContainer.textContent = "";
    //   messageContainer.removeAttribute("role");
    // }, 5000); // Leave the message visible for 5 seconds
  }

  // Attach event listeners for all buttons
  const urlButton = document.getElementById("urlButton");
  if (urlButton) urlButton.addEventListener("click", handleUrl);

  const urlConvertCopyButton = document.getElementById("urlConvertCopyButton");
  if (urlConvertCopyButton) urlConvertCopyButton.addEventListener("click", handleUrlAndCopy);

  const htmlButton = document.getElementById("htmlButton");
  if (htmlButton) htmlButton.addEventListener("click", handleHtml);

  const copyButton = document.getElementById("copyButton");
  if (copyButton) copyButton.addEventListener("click", copyToClipboard);

  // Ensure the download button exists and is dynamically handled in `convertToMarkdown`
});
