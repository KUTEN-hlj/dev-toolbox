const JWTDebugTool = {
    slug: "jwtdebug",
    icon: "🔐",
    name: "JWT 调试器",
    desc: "解析 JWT Token 查看内容",
    category: "调试",

    render(container) {
        container.innerHTML = `
            <div class="tool-page">
                <h2>🔐 JWT 调试器</h2>
                <p class="tool-desc">粘贴 JWT Token，查看 Header 和 Payload 内容（不验证签名）</p>
                <textarea class="tool-input" id="jwt-input" placeholder="在此粘贴 JWT Token (eyJhbG...)"></textarea>
                <div class="result-header"><span>解析结果</span><button class="btn-copy" id="jwt-copy">复制结果</button></div>
                <textarea class="tool-output" id="jwt-output" readonly placeholder="解析结果将显示在这里..." style="min-height:250px;"></textarea>
            </div>
        `;

        const input = container.querySelector("#jwt-input");
        const output = container.querySelector("#jwt-output");

        input.addEventListener("input", async () => {
            const text = input.value.trim();
            if (!text) { output.value = ""; return; }
            try {
                const d = await API.runTool("jwt-decode", text);
                output.value = d.error || d.result;
            } catch (e) {
                output.value = "请求失败: " + e.message;
            }
        });

        container.querySelector("#jwt-copy").onclick = () => {
            if (output.value) navigator.clipboard.writeText(output.value).then(() => App.toast("已复制", "success"));
        };
    },
};
