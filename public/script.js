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

  const container = document.getElementById("rightTop");
  container.innerHTML = "";

  if (data.pdfLink) {
    const iframe = document.createElement("iframe");
    iframe.src = data.pdfLink;
    container.appendChild(iframe);
  } else {
    container.innerHTML = "<p>No PDF found.</p>";
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
