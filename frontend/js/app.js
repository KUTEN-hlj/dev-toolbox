const App = {
    tools: {},
    categories: {},

    async init() {
        this.defineTools();
        this.renderSidebar();
        this.renderWelcome();
        this.bindAuth();
        this.restoreSession();
        this.bindTopbarLogin();

        // 点击 Logo 返回首页
        document.querySelector(".logo").addEventListener("click", () => {
            location.hash = "";
            this.renderWelcome();
        });

        const hash = location.hash.slice(1);
        if (hash && this.tools[hash]) this.loadTool(hash);

        window.addEventListener("hashchange", () => {
            const h = location.hash.slice(1);
            if (h && this.tools[h]) this.loadTool(h);
            else this.renderWelcome();
        });
    },

    // ===== 工具元数据 =====
    defineTools() {
        const list = [
            { slug: "base64", module: Base64Tool, icon: "📝", name: "Base64 编解码", desc: "Base64 编码与解码，支持 UTF-8 文本", cat: "编解码", catKey: "encode" },
            { slug: "urlcodec", module: URLCodecTool, icon: "🔗", name: "URL 编解码", desc: "URL 百分号编码与解码", cat: "编解码", catKey: "encode" },
            { slug: "jsonfmt", module: JSONFmtTool, icon: "📋", name: "JSON 格式化", desc: "JSON 美化输出与压缩为一行", cat: "格式化", catKey: "format" },
            { slug: "jwtdebug", module: JWTDebugTool, icon: "🔐", name: "JWT 调试器", desc: "解析 JWT Token 查看 Header/Payload", cat: "调试", catKey: "debug" },
            { slug: "regextest", module: RegexTestTool, icon: "🔍", name: "正则测试器", desc: "在线正则表达式匹配测试", cat: "调试", catKey: "debug" },
            { slug: "cronparser", module: CronParserTool, icon: "⏰", name: "Cron 解析", desc: "Cron 表达式解析，查看执行计划", cat: "时间", catKey: "time" },
            { slug: "hashgen", module: HashGenTool, icon: "🔒", name: "密码哈希", desc: "生成 MD5/SHA 系列哈希值", cat: "安全", catKey: "security" },
        ];
        list.forEach(t => {
            this.tools[t.slug] = t.module;
            this.tools[t.slug]._meta = { slug: t.slug, icon: t.icon, name: t.name, desc: t.desc, cat: t.cat, catKey: t.catKey };
        });
    },

    // ===== 分类侧边栏 =====
    renderSidebar() {
        const nav = document.getElementById("tool-nav");
        const cats = [
            { key: "encode", name: "编解码", dot: "encode" },
            { key: "format", name: "格式化", dot: "format" },
            { key: "debug", name: "调试", dot: "debug" },
            { key: "time", name: "时间", dot: "time" },
            { key: "security", name: "安全", dot: "security" },
        ];

        let html = "";
        cats.forEach(cat => {
            const tools = Object.values(this.tools).filter(t => t._meta.catKey === cat.key);
            if (tools.length === 0) return;
            html += `<div class="nav-category"><span class="dot ${cat.dot}"></span>${cat.name}</div>`;
            tools.forEach(t => {
                const m = t._meta;
                html += `<a class="tool-link" data-tool="${m.slug}" href="#${m.slug}"><span class="tool-icon">${m.icon}</span>${m.name}</a>`;
            });
        });

        nav.innerHTML = html;
        nav.querySelectorAll(".tool-link").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const slug = link.dataset.tool;
                location.hash = slug;
                this.loadTool(slug);
            });
        });
    },

    highlightSidebar(slug) {
        document.querySelectorAll(".tool-link").forEach(l => {
            l.classList.toggle("active", l.dataset.tool === slug);
        });
    },

    // ===== 工具卡片首页 =====
    renderWelcome() {
        document.getElementById("topbar-title").textContent = "首页";
        const container = document.getElementById("tool-container");
        const cats = [
            { key: "encode", name: "编解码", cls: "cat-encode" },
            { key: "format", name: "格式化", cls: "cat-format" },
            { key: "debug", name: "调试", cls: "cat-debug" },
            { key: "time", name: "时间", cls: "cat-time" },
            { key: "security", name: "安全", cls: "cat-security" },
        ];

        const total = Object.keys(this.tools).length;

        let html = `
            <div class="welcome-header">
                <h2>🧰 开发者工具箱</h2>
                <p>${total} 个在线开发工具，无需安装，即开即用</p>
                <div class="quick-actions">
                    <button class="btn btn-outline quick-jump" data-jump="base64">📝 Base64</button>
                    <button class="btn btn-outline quick-jump" data-jump="jsonfmt">📋 JSON</button>
                    <button class="btn btn-outline quick-jump" data-jump="jwtdebug">🔐 JWT</button>
                    <button class="btn btn-outline quick-jump" data-jump="cronparser">⏰ Cron</button>
                </div>
            </div>
        `;

        cats.forEach(cat => {
            const tools = Object.values(this.tools).filter(t => t._meta.catKey === cat.key);
            if (tools.length === 0) return;
            html += `<div class="tool-category"><div class="category-title">${cat.name}</div><div class="tool-grid">`;
            tools.forEach(t => {
                const m = t._meta;
                html += `
                    <a class="tool-card" href="#${m.slug}" data-tool="${m.slug}">
                        <span class="card-icon">${m.icon}</span>
                        <span class="card-cat ${cat.cls}">${cat.name}</span>
                        <div class="card-name">${m.name}</div>
                        <div class="card-desc">${m.desc}</div>
                    </a>
                `;
            });
            html += `</div></div>`;
        });

        container.innerHTML = html;
        container.querySelectorAll(".tool-card").forEach(card => {
            card.addEventListener("click", (e) => {
                e.preventDefault();
                const slug = card.dataset.tool;
                location.hash = slug;
                this.loadTool(slug);
            });
        });
        container.querySelectorAll(".quick-jump").forEach(btn => {
            btn.addEventListener("click", () => {
                const slug = btn.dataset.jump;
                location.hash = slug;
                this.loadTool(slug);
            });
        });

        document.querySelectorAll(".tool-link").forEach(l => l.classList.remove("active"));
    },

    // ===== 工具加载 =====
    loadTool(slug) {
        const tool = this.tools[slug];
        if (!tool) return this.renderWelcome();

        const meta = tool._meta;
        document.getElementById("topbar-title").textContent = meta.icon + " " + meta.name;

        const container = document.getElementById("tool-container");
        tool.render(container);
        this.highlightSidebar(slug);
    },

    // ===== 顶栏登录按钮 =====
    bindTopbarLogin() {
        const area = document.getElementById("topbar-user");
        const btn = area.querySelector("#btn-login-top");
        if (!btn) return;
        btn.addEventListener("click", () => {
            document.getElementById("auth-modal").classList.remove("hidden");
        });
    },

    // ===== 认证 UI =====
    bindAuth() {
        const modal = document.getElementById("auth-modal");

        modal.querySelector(".modal-close").addEventListener("click", () => modal.classList.add("hidden"));
        modal.querySelector(".modal-overlay").addEventListener("click", () => modal.classList.add("hidden"));

        modal.querySelectorAll(".auth-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                const target = tab.dataset.tab;
                modal.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                document.getElementById("login-form").classList.toggle("hidden", target !== "login");
                document.getElementById("register-form").classList.toggle("hidden", target !== "register");
                document.getElementById("auth-error").classList.add("hidden");
            });
        });

        document.getElementById("login-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            try {
                const data = await API.login(fd.get("username"), fd.get("password"));
                API.setToken(data.access_token);
                modal.classList.add("hidden");
                this.updateUserUI(data.user);
                this.toast("登录成功", "success");
            } catch (err) {
                document.getElementById("auth-error").textContent = err.message;
                document.getElementById("auth-error").classList.remove("hidden");
            }
        });

        document.getElementById("register-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            try {
                const data = await API.register(fd.get("username"), fd.get("email"), fd.get("password"));
                API.setToken(data.access_token);
                modal.classList.add("hidden");
                this.updateUserUI(data.user);
                this.toast("注册成功", "success");
            } catch (err) {
                document.getElementById("auth-error").textContent = err.message;
                document.getElementById("auth-error").classList.remove("hidden");
            }
        });
    },

    async restoreSession() {
        const token = API.getToken();
        if (!token) return;
        try {
            const user = await API.me();
            this.updateUserUI(user);
        } catch { API.setToken(null); }
    },

    updateUserUI(user) {
        const area = document.getElementById("topbar-user");
        area.innerHTML = `
            <div class="topbar-user-info">
                <div class="topbar-avatar">${user.username[0].toUpperCase()}</div>
                <span>${user.username}</span>
            </div>
            <button id="btn-logout-top" class="btn btn-outline btn-sm">退出</button>
        `;
        document.getElementById("btn-logout-top").addEventListener("click", () => this.logout());
    },

    logout() {
        API.setToken(null);
        document.getElementById("topbar-user").innerHTML = `
            <button id="btn-login-top" class="btn btn-primary">登录 / 注册</button>
        `;
        this.bindTopbarLogin();
        this.toast("已退出登录", "success");
    },

    toast(msg, type = "success") {
        const el = document.getElementById("toast");
        el.textContent = msg;
        el.className = `toast ${type}`;
        el.classList.remove("hidden");
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.add("hidden"), 2000);
    },
};

document.addEventListener("DOMContentLoaded", () => App.init());
