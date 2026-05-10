const URLCodecTool = {
    slug: "urlcodec",
    icon: "🔗",
    name: "URL 编解码",
    desc: "URL 百分号编码与解码",
    category: "编解码",

    render(container) {
        container.innerHTML = `
            <div class="tool-page">
                <h2>🔗 URL 编解码</h2>
                <p class="tool-desc">对 URL 中的特殊字符进行编码/解码</p>
                <div class="tool-actions">
                    <button class="btn btn-primary" id="url-encode">编码 (Encode)</button>
                    <button class="btn btn-outline" id="url-decode" style="color:var(--text);border-color:var(--border);">解码 (Decode)</button>
                    <button class="btn btn-outline" id="url-clear" style="color:var(--text);border-color:var(--border);margin-left:auto;">清空</button>
                </div>
                <textarea class="tool-input" id="url-input" placeholder="在此输入 URL 或文本..."></textarea>
                <div class="result-header"><span>结果</span><button class="btn-copy" id="url-copy">复制结果</button></div>
                <textarea class="tool-output" id="url-output" readonly placeholder="结果将显示在这里..."></textarea>
            </div>
        `;

        let mode = "encode";
        const input = container.querySelector("#url-input");
        const output = container.querySelector("#url-output");

        function setMode(m) { mode = m; container.querySelector("#url-encode").className = m === "encode" ? "btn btn-primary" : "btn btn-outline"; container.querySelector("#url-decode").className = m === "decode" ? "btn btn-primary" : "btn btn-outline"; }
        async function run() {
            const text = input.value.trim();
            if (!text) { output.value = ""; return; }
            const slug = mode === "encode" ? "url-encode" : "url-decode";
            try { const d = await API.runTool(slug, text); output.value = d.error || d.result; } catch (e) { output.value = "请求失败: " + e.message; }
        }
        container.querySelector("#url-encode").onclick = () => { setMode("encode"); run(); };
        container.querySelector("#url-decode").onclick = () => { setMode("decode"); run(); };
        container.querySelector("#url-clear").onclick = () => { input.value = ""; output.value = ""; };
        container.querySelector("#url-copy").onclick = () => { if (output.value) navigator.clipboard.writeText(output.value).then(() => App.toast("已复制", "success")); };
        input.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); });
    },
};
