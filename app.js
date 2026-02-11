// 1. 定義資料
const playlist = [
    { title: "第一個音檔", url: "Der Kleine Prinz.mp3" },
    { title: "第二個音檔", url: "Audio1.mp3" }
];

// 設定你想載入的文字檔路徑
const textFileUrl = 'content.txt'; 

// 2. 初始化頁面內容
async function initPage() {
    const audioContainer = document.getElementById('audio-list');
    const textContainer = document.getElementById('text-content');

    // --- 渲染音檔列表 ---
    playlist.forEach(item => {
        const div = document.createElement('div');
        div.className = 'audio-item';
        div.innerHTML = `
            <h3>${item.title}</h3>
            <audio controls>
                <source src="${item.url}" type="audio/mpeg">
                您的瀏覽器不支援 audio 元素。
            </audio>
        `;
        audioContainer.appendChild(div);
    });

    // --- 載入外部 .txt 檔案 ---
    textContainer.textContent = myExternalText;
}

// 執行初始化
window.onload = initPage;
