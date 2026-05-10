const API = {
    base: "/api",

    _token: localStorage.getItem("token") || null,

    setToken(token) {
        this._token = token;
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
    },

    getToken() {
        return this._token;
    },

    async request(method, path, body = null) {
        const headers = { "Content-Type": "application/json" };
        if (this._token) {
            headers["Authorization"] = `Bearer ${this._token}`;
        }
        const opts = { method, headers };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(`${this.base}${path}`, opts);
        const data = await res.json();

        if (!res.ok && data.detail) {
            throw new Error(data.detail);
        }
        return data;
    },

    // 认证
    login(username, password) {
        return this.request("POST", "/auth/login", { username, password });
    },
    register(username, email, password) {
        return this.request("POST", "/auth/register", { username, email, password });
    },
    me() {
        return this.request("GET", "/auth/me");
    },

    // 工具
    getTools() {
        return this.request("GET", "/tools/");
    },
    runTool(slug, text, extra = {}) {
        return this.request("POST", `/tools/${slug}`, { text, ...extra });
    },
};
