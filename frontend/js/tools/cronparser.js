const CronParserTool = {
    slug: "cronparser",
    icon: "⏰",
    name: "Cron 解析",
    desc: "Cron 表达式解析与预览",
    category: "时间",

    render(container) {
        container.innerHTML = `
            <div class="tool-page">
                <h2>⏰ Cron 表达式解析</h2>
                <p class="tool-desc">输入 Cron 表达式，查看下次执行时间</p>
                <div class="tool-inline" style="margin-bottom:16px;">
                    <input type="text" id="cron-input" placeholder="例如: */5 * * * *" value="0 9 * * 1-5">
                    <button class="btn btn-primary" id="cron-run">解析</button>
                </div>
                <textarea class="tool-output" id="cron-output" readonly placeholder="解析结果将显示在这里..." style="min-height:240px;"></textarea>
            </div>
        `;

        const input = container.querySelector("#cron-input");
        const output = container.querySelector("#cron-output");

        async function run() {
            const text = input.value.trim();
            if (!text) { output.value = ""; return; }
            try { const d = await API.runTool("cron-parser", text); output.value = d.error || d.result; } catch (e) { output.value = "请求失败: " + e.message; }
        }

        container.querySelector("#cron-run").onclick = run;
        input.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
        // 自动执行一次
        run();
    },
};
