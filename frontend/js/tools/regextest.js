const RegexTestTool = {
    slug: "regextest",
    icon: "🔍",
    name: "正则测试器",
    desc: "在线正则表达式测试",
    category: "调试",

    render(container) {
        container.innerHTML = `
            <div class="tool-page">
                <h2>🔍 正则测试器</h2>
                <p class="tool-desc">输入正则表达式和测试文本，查看匹配结果</p>
                <div class="tool-inline" style="margin-bottom:12px;">
                    <span style="font-size:13px;color:var(--text-muted);white-space:nowrap;">正则: /</span>
                    <input type="text" id="regex-pattern" placeholder="正则表达式">
                    <span style="font-size:13px;color:var(--text-muted);white-space:nowrap;">/</span>
                    <input type="text" id="regex-flags" placeholder="标志" style="max-width:60px;" maxlength="5">
                    <button class="btn btn-primary" id="regex-run">匹配</button>
                </div>
                <textarea class="tool-input" id="regex-input" placeholder="在此输入测试文本..."></textarea>
                <div class="result-header"><span>匹配结果</span></div>
                <textarea class="tool-output" id="regex-output" readonly placeholder="匹配结果将显示在这里..." style="min-height:200px;"></textarea>
            </div>
        `;

        const pattern = container.querySelector("#regex-pattern");
        const flags = container.querySelector("#regex-flags");
        const input = container.querySelector("#regex-input");
        const output = container.querySelector("#regex-output");

        async function run() {
            const text = input.value;
            if (!text || !pattern.value) { output.value = ""; return; }
            try {
                const d = await API.request("POST", "/tools/regex-test", { text, pattern: pattern.value, flags: flags.value });
                output.value = d.error || d.result;
            } catch (e) { output.value = "请求失败: " + e.message; }
        }

        container.querySelector("#regex-run").onclick = run;
        [pattern, flags, input].forEach(el => {
            el.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); });
        });
    },
};
