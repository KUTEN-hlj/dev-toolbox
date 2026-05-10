const Base64Tool = {
    slug: "base64",

    render(container) {
        container.innerHTML = `
            <div class="tool-page">
                <h2>Base64 编解码</h2>
                <p class="tool-desc">在线 Base64 编码 / 解码工具，支持 UTF-8 文本</p>

                <div class="tool-actions">
                    <button class="btn btn-primary" id="b64-encode">编码 (Encode)</button>
                    <button class="btn btn-outline" id="b64-decode" style="color:var(--text);border-color:var(--border);">解码 (Decode)</button>
                    <button class="btn btn-outline" id="b64-clear" style="color:var(--text);border-color:var(--border);margin-left:auto;">清空</button>
                </div>

                <textarea class="tool-input" id="b64-input" placeholder="在此输入文本..."></textarea>

                <div class="result-header">
                    <span>结果</span>
                    <button class="btn-copy" id="b64-copy">复制结果</button>
                </div>
                <textarea class="tool-output" id="b64-output" readonly placeholder="结果将显示在这里..."></textarea>
            </div>
        `;

        let mode = "encode";
        const input = container.querySelector("#b64-input");
        const output = container.querySelector("#b64-output");
        const btnEncode = container.querySelector("#b64-encode");
        const btnDecode = container.querySelector("#b64-decode");

        function setMode(m) {
            mode = m;
            btnEncode.className = m === "encode" ? "btn btn-primary" : "btn btn-outline";
            btnEncode.style.color = m !== "encode" ? "var(--text)" : "";
            btnEncode.style.borderColor = m !== "encode" ? "var(--border)" : "";
            btnDecode.className = m === "decode" ? "btn btn-primary" : "btn btn-outline";
            btnDecode.style.color = m !== "decode" ? "var(--text)" : "";
            btnDecode.style.borderColor = m !== "decode" ? "var(--border)" : "";
        }

        async function run() {
            const text = input.value.trim();
            if (!text) { output.value = ""; return; }

            const slug = mode === "encode" ? "base64-encode" : "base64-decode";
            try {
                const data = await API.runTool(slug, text);
                output.value = data.error || data.result;
            } catch (e) {
                output.value = "请求失败: " + e.message;
            }
        }

        btnEncode.onclick = () => { setMode("encode"); run(); };
        btnDecode.onclick = () => { setMode("decode"); run(); };

        container.querySelector("#b64-clear").onclick = () => {
            input.value = "";
            output.value = "";
        };

        container.querySelector("#b64-copy").onclick = () => {
            if (output.value) {
                navigator.clipboard.writeText(output.value).then(() => App.toast("已复制到剪贴板", "success"));
            }
        };

        // Ctrl+Enter 执行
        input.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run();
        });
    },
};
