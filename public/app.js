document.addEventListener("DOMContentLoaded", function () {
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
      alert("Please enter a valid URL!");
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
      console.error("Error fetching URL:", error);
      alert("Error fetching URL");
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
      alert("No HTML content provided!");
      return;
    }
    console.log("HTML input:", html); // Debugging: Check if HTML is captured
    convertToMarkdown(html);
  }

  function convertToMarkdown(html, filename) {
    const markdown = turndownService.turndown(html);
    const markdownOutput = document.getElementById("markdownOutput");
    const downloadButton = document.getElementById("downloadButton");
    if (!markdownOutput || !downloadButton) {
      console.error("Markdown output or download button not found");
      return;
    }
    markdownOutput.value = markdown;

    // Attach the download functionality dynamically
    downloadButton.addEventListener('click', () => downloadMd(markdown, filename));
  }

  function copyToClipboard() {
    const output = document.getElementById("markdownOutput");
    if (!output) {
      console.error("Markdown output element not found");
      return;
    }

    // Copy markdown to clipboard
    output.select();
    navigator.clipboard.writeText(output.value).then(() => {
      alert("Copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy to clipboard.");
    });
  }

  function downloadMd(text, filename) {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element for downloading the file
    const a = document.createElement("a");
    a.href = url;

    // Use the provided filename or fallback to 'download.md'
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

  // Attach event listeners for all buttons
  const urlButton = document.getElementById("urlButton");
  if (urlButton) urlButton.addEventListener("click", handleUrl);

  const urlConvertCopyButton = document.getElementById('urlConvertCopyButton');
  if (urlConvertCopyButton) urlConvertCopyButton.addEventListener('click', handleUrlAndCopy);

  const htmlButton = document.getElementById("htmlButton");
  if (htmlButton) htmlButton.addEventListener("click", handleHtml);

  const copyButton = document.getElementById("copyButton");
  if (copyButton) copyButton.addEventListener("click", copyToClipboard);

  // Ensure the download button exists and is dynamically handled in `convertToMarkdown`
});
