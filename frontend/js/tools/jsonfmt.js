const JSONFmtTool = {
    slug: "jsonfmt",
    icon: "📋",
    name: "JSON 格式化",
    desc: "JSON 美化与压缩",
    category: "格式化",

    render(container) {
        container.innerHTML = `
            <div class="tool-page">
                <h2>📋 JSON 格式化</h2>
                <p class="tool-desc">格式化美化 JSON 或压缩为一行</p>
                <div class="tool-actions">
                    <button class="btn btn-primary" id="json-format">格式化</button>
                    <button class="btn btn-outline" id="json-minify" style="color:var(--text);border-color:var(--border);">压缩</button>
                    <button class="btn btn-outline" id="json-clear" style="color:var(--text);border-color:var(--border);margin-left:auto;">清空</button>
                </div>
                <textarea class="tool-input" id="json-input" placeholder="在此粘贴 JSON..."></textarea>
                <div class="result-header"><span>结果</span><button class="btn-copy" id="json-copy">复制结果</button></div>
                <textarea class="tool-output" id="json-output" readonly placeholder="结果将显示在这里..."></textarea>
            </div>
        `;

        let mode = "format";
        const input = container.querySelector("#json-input");
        const output = container.querySelector("#json-output");

        function setMode(m) { mode = m; container.querySelector("#json-format").className = m === "format" ? "btn btn-primary" : "btn btn-outline"; container.querySelector("#json-minify").className = m === "minify" ? "btn btn-primary" : "btn btn-outline"; }
        async function run() {
            const text = input.value.trim();
            if (!text) { output.value = ""; return; }
            const slug = mode === "format" ? "json-format" : "json-minify";
            try { const d = await API.runTool(slug, text); output.value = d.error || d.result; } catch (e) { output.value = "请求失败: " + e.message; }
        }
        container.querySelector("#json-format").onclick = () => { setMode("format"); run(); };
        container.querySelector("#json-minify").onclick = () => { setMode("minify"); run(); };
        container.querySelector("#json-clear").onclick = () => { input.value = ""; output.value = ""; };
        container.querySelector("#json-copy").onclick = () => { if (output.value) navigator.clipboard.writeText(output.value).then(() => App.toast("已复制", "success")); };
        input.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); });
    },
};
