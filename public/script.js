async function loadDW() {
  const url = document.getElementById("urlInput").value;

  if (!url) {
    alert("Please paste a DW URL");
    return;
  }

  const res = await fetch(
    "/api/parse?url=" + encodeURIComponent(url)
  );

  const data = await res.json();

  console.log("PDF link:", data.pdfLink);

  if (data.pdfLink) {
    // 👉 直接觸發下載
    const a = document.createElement("a");
    a.href = data.pdfLink;
    a.download = "dw_article.pdf"; // 可自訂檔名
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    alert("No PDF found on this page.");
  }
}


// 🎙 錄音功能
let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    document.getElementById("audioPlayback").src = url;
  };

  mediaRecorder.start();
}

function stopRecording() {
  mediaRecorder.stop();
}
