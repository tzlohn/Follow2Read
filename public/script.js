async function loadPage() {
  const url = document.getElementById("urlInput").value;

  const res = await fetch(`/api/parse?url=${encodeURIComponent(url)}`);
  const data = await res.json();

  const video = document.getElementById("video");
  const iframe = document.getElementById("iframe");

  video.style.display = "none";
  iframe.style.display = "none";

  // 🎬 video / iframe handling
  if (data.iframeSrc) {
    iframe.src = data.iframeSrc;
    iframe.style.display = "block";
  } else if (data.videoSrc) {
    video.src = data.videoSrc;
    video.style.display = "block";
  }

  renderText(data.text);
}

function renderText(text) {
  const container = document.getElementById("right");
  container.innerHTML = "";

  const sentences = text
    .replace(/\n/g, " ")
    .split(/(?<=[.!?])\s+/);

  sentences.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "sentence";
    div.innerText = s;

    div.onclick = () => {
      const video = document.getElementById("video");

      // simple sync approximation
      if (video && video.duration) {
        const t = (i / sentences.length) * video.duration;
        video.currentTime = t;
        video.play();
      }
    };

    container.appendChild(div);
  });
}