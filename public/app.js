const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**'
});

async function handleUrl() {
  const url = document.getElementById('urlInput').value;
  try {
    const response = await fetch('/fetch-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const html = await response.text();
    convertToMarkdown(html);
  } catch (error) {
    alert('Error fetching URL');
  }
}

function handleHtml() {
  const html = document.getElementById('htmlInput').value;
  if (!html.trim()) {
      alert("No HTML content provided!");
      return;
  }
  console.log("HTML input:", html); // Debugging: Check if HTML is captured
  convertToMarkdown(html);
}

function convertToMarkdown(html) {
  const markdown = turndownService.turndown(html);
  document.getElementById('markdownOutput').value = markdown;
}

function copyToClipboard() {
  const output = document.getElementById('markdownOutput');
  output.select();
  navigator.clipboard.writeText(output.value);
}

function downloadMd() {
  const text = document.getElementById('markdownOutput').value;
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted.md';
  a.click();
}
