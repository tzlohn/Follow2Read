async function loadDW() {
  const url = document.getElementById("urlInput").value;

  if (!url) {
    alert("Please paste a DW URL");
    return;
  }

  try {
    const res = await fetch(
      "/api/parse?url=" + encodeURIComponent(url)
    );

    const data = await res.json();

    console.log("PDF link:", data.pdfLink);

    if (data.pdfLink) {
      // 👉 觸發下載
      const a = document.createElement("a");
      a.href = data.pdfLink;
      a.download = "dw_article.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(data.message || "No PDF found.");
    }

  } catch (err) {
    console.error(err);
    alert("Error fetching PDF.");
  }
}