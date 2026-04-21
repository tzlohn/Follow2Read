async function loadPage() {
  const url = document.getElementById("urlInput").value;

  console.log("URL:", url);

  if (!url) {
    alert("Please paste a URL");
    return;
  }

  try {
    const res = await fetch(
      window.location.origin +
      "/api/parse?url=" +
      encodeURIComponent(url)
    );

    const data = await res.json();

    console.log("API response:", data);

    const video = document.getElementById("video");
    const iframe = document.getElementById("iframe");

    // reset display
    video.style.display = "none";
    iframe.style.display = "none";
    video.src = "";
    iframe.src = "";

    // =========================
    // 🎬 處理影片
    // =========================

    if (data.iframeSrc) {
      let src = data.iframeSrc;

      console.log("Original iframeSrc:", src);

      // 👉 修正相對路徑
      if (src.startsWith("/")) {
        src = "https://learngerman.dw.com" + src;
      }

      console.log("Final iframe src:", src);

      iframe.src = src;
      iframe.style.display = "block";

    } else if (data.videoSrc) {
      console.log("Using video source:", data.videoSrc);

      video.src = data.videoSrc;
      video.style.display = "block";

    } else {
      console.warn("No video found, fallback to link");

      document.getElementById("right").innerHTML =
        `<p>No embeddable video found.</p>
         <a href="${url}" target="_blank">👉 Open on DW</a>`;
    }

    // =========================
    // 📄 處理文字
    // =========================

    if (data.text && data.text.length > 0) {
      console.log("Text length:", data.text.length);
      renderText(data.text);
    } else {
      console.warn("No text found");
      document.getElementById("right").innerHTML +=
        "<p>No text content found.</p>";
    }

  } catch (err) {
    console.error("Error loading page:", err);
    alert("Something went wrong. Check console.");
  }
}


// =========================
// 📄 文字渲染 + 斷句
// =========================

function renderText(text) {
  const container = document.getElementById("right");
  container.innerHTML = "";

  console.log("Raw text:", text.slice(0, 200));

  const sentences = text
    .replace(/\n/g, " ")
    .split(/(?<=[.!?])\s+/);

  console.log("Sentence count:", sentences.length);

  sentences.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "sentence";
    div.innerText = s;

    div.onclick = () => {
      const video = document.getElementById("video");

      // 👉 簡易時間同步（平均分配）
      if (video && video.duration) {
        const t = (i / sentences.length) * video.duration;
        console.log(`Jump to time: ${t}`);
        video.currentTime = t;
        video.play();
      } else {
        console.warn("Video not ready or using iframe");
      }
    };

    container.appendChild(div);
  });
}