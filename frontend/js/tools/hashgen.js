const HashGenTool = {
    slug: "hashgen",
    icon: "🔒",
    name: "密码哈希",
    desc: "生成 MD5/SHA 系列哈希值",
    category: "安全",

    render(container) {
        container.innerHTML = `
            <div class="tool-page">
                <h2>🔒 密码哈希生成</h2>
                <p class="tool-desc">输入文本，生成 MD5 / SHA1 / SHA256 / SHA512 哈希值</p>
                <textarea class="tool-input" id="hash-input" placeholder="在此输入要哈希的文本..."></textarea>
                <div class="result-header"><span>哈希结果</span><button class="btn-copy" id="hash-copy">复制结果</button></div>
                <textarea class="tool-output" id="hash-output" readonly placeholder="哈希结果将显示在这里..." style="min-height:200px;"></textarea>
            </div>
        `;

        const input = container.querySelector("#hash-input");
        const output = container.querySelector("#hash-output");

        async function run() {
            const text = input.value;
            if (!text) { output.value = ""; return; }
            try { const d = await API.runTool("hash-gen", text); output.value = d.error || d.result; } catch (e) { output.value = "请求失败: " + e.message; }
        }

        input.addEventListener("input", () => run());
        container.querySelector("#hash-copy").onclick = () => {
            if (output.value) navigator.clipboard.writeText(output.value).then(() => App.toast("已复制", "success"));
        };
    },
};
