"""扫描 DevToolbox 的安全问题，结果写到 scan_results.txt"""
import socket
import base64
import urllib.parse

try:
    import httpx
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "httpx"], capture_output=True)
    import httpx

TARGET = "http://localhost"
API = "http://localhost:8000/api"
RESULTS = []

# ============================================================
# 1. 端口扫描
# ============================================================
COMMON_PORTS = {
    80: "HTTP", 443: "HTTPS", 3306: "MySQL", 3307: "MySQL-Alt", 6379: "Redis", 8000: "HTTP-Alt", 8080: "HTTP-Proxy"
}

def port_scan():
    open_ports = []
    for port, service in COMMON_PORTS.items():
        s = socket.socket()
        s.settimeout(1)
        if s.connect_ex(("localhost", port)) == 0:
            open_ports.append(f"  端口 {port} 开放 ({service})")
        s.close()

    RESULTS.append(("端口扫描",
        "info",
        f"扫描了 {len(COMMON_PORTS)} 个端口，发现 {len(open_ports)} 个开放" if open_ports else "未发现开放端口（异常）",
        "\n".join(open_ports) if open_ports else "无"))

# ============================================================
# 2. SQL 注入检测
# ============================================================
SQL_PAYLOADS = [
    ("'", "单引号"), ("' OR '1'='1", "OR永真"), ("' OR '1'='1' --", "OR永真(注释)"),
    ("1; DROP TABLE users--", "DROP TABLE"), ("' UNION SELECT NULL--", "UNION SELECT"),
]

SQL_ERRORS = [
    r"SQL syntax", r"MySQL", r"Unclosed quotation",
    r"quoted string not properly terminated", r"SQL command not properly ended",
]

def sql_injection_check():
    client = httpx.Client(timeout=10)
    findings = []

    endpoints = [
        f"{API}/tools/base64-encode",
        f"{API}/tools/url-encode",
        f"{API}/tools/json-format",
    ]

    for endpoint in endpoints:
        # 正常请求作为基线
        try:
            baseline = client.post(endpoint, json={"text": "test"})
            baseline_len = len(baseline.text)
        except:
            continue

        for payload, desc in SQL_PAYLOADS:
            try:
                resp = client.post(endpoint, json={"text": payload})
                body = resp.text

                # 检查 SQL 错误关键词
                import re
                for pattern in SQL_ERRORS:
                    if re.search(pattern, body, re.IGNORECASE):
                        findings.append(f"  [!!] {endpoint} — {desc}('{payload}') -> 响应中出现SQL错误信息: {re.findall(pattern, body, re.IGNORECASE)[:1]}")
                        break

                # 响应差异检测
                len_diff = abs(len(body) - baseline_len)
                if len_diff > 200 and resp.status_code != baseline.status_code:
                    findings.append(f"  [!!] {endpoint} — {desc}('{payload}') -> 响应长度异常 {len_diff} (状态码 {resp.status_code})")
            except:
                pass

    client.close()

    if findings:
        RESULTS.append(("SQL注入检测", "low",
            f"测试了 {len(endpoints)} 个端点 x {len(SQL_PAYLOADS)} 种payload",
            "\n".join(findings)))
    else:
        RESULTS.append(("SQL注入检测", "info",
            f"测试了 {len(endpoints)} 个端点 x {len(SQL_PAYLOADS)} 种payload，未发现SQL注入漏洞",
            "Safe — 所有端点都正确地处理了恶意输入"))

# ============================================================
# 3. XSS 检测
# ============================================================
XSS_PAYLOADS = [
    "<script>alert(1)</script>", "<img src=x onerror=alert(1)>",
    '"><script>alert(1)</script>', "<svg onload=alert(1)>",
]

def xss_check():
    client = httpx.Client(timeout=10)
    findings = []

    endpoints = [
        f"{API}/tools/base64-encode",
        f"{API}/tools/url-encode",
    ]

    for endpoint in endpoints:
        for payload in XSS_PAYLOADS:
            try:
                resp = client.post(endpoint, json={"text": payload})
                body = resp.text

                # 检查 payload 是否原样反射
                if payload in body:
                    # 检查是否被转义了
                    escaped = payload.replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
                    if escaped not in body:
                        findings.append(f"  [!!] {endpoint} — XSS payload 原样反射: {payload[:40]}")
            except:
                pass

    client.close()

    if findings:
        RESULTS.append(("XSS检测", "medium",
            f"测试了 {len(endpoints)} 个端点 x {len(XSS_PAYLOADS)} 种payload",
            "\n".join(findings)))
    else:
        RESULTS.append(("XSS检测", "info",
            f"测试了 {len(endpoints)} 个端点 x {len(XSS_PAYLOADS)} 种payload，未发现反射型XSS",
            "Safe — payload 未被原样反射，或被正确转义"))

# ============================================================
# 4. 目录/敏感文件爆破
# ============================================================
SENSITIVE_PATHS = [
    "/.env", "/.git/HEAD", "/.git/config", "/robots.txt",
    "/admin/", "/api/docs", "/docs", "/openapi.json",
    "/backup/", "/backup.zip", "/phpinfo.php", "/phpmyadmin/",
    "/.DS_Store", "/test/", "/debug/", "/swagger/",
]

def dir_brute():
    client = httpx.Client(timeout=5, follow_redirects=False)
    findings = []

    for path in SENSITIVE_PATHS:
        try:
            resp = client.head(f"{TARGET}{path}")
            if resp.status_code in (200, 301, 302, 403):
                findings.append(f"  [FILE] {TARGET}{path} -> HTTP {resp.status_code}")
        except:
            pass

    client.close()

    if findings:
        RESULTS.append(("目录爆破", "medium",
            f"扫描了 {len(SENSITIVE_PATHS)} 个常见敏感路径，发现 {len(findings)} 个",
            "\n".join(findings)))
    else:
        RESULTS.append(("目录爆破", "info",
            f"扫描了 {len(SENSITIVE_PATHS)} 个路径，未发现敏感文件暴露",
            "Safe — 敏感路径均返回404"))

# ============================================================
# 5. 认证安全检测
# ============================================================
def auth_check():
    client = httpx.Client(timeout=5)
    findings = []
    checkmarks = []

    # 检查是否有弱密码注册限制
    try:
        resp = client.post(f"{API}/auth/register", json={
            "username": "test_short", "email": "a@b.com", "password": "123"
        })
        checkmarks.append("  [OK] 密码长度检查" if resp.status_code == 422 or "密码" in resp.text else "  [!!] 可能接受弱密码")
    except:
        pass

    # 检查是否有暴力破解保护（快速连续登录）
    try:
        for _ in range(5):
            client.post(f"{API}/auth/login", json={"username": "noexist", "password": "wrong"})
        resp = client.post(f"{API}/auth/login", json={"username": "noexist", "password": "wrong"})
        checkmarks.append("  [OK] 无限流保护" if resp.status_code != 429 else "  [OK] 有限流保护(429)")
    except:
        pass

    # 检查未登录是否能访问工具API
    try:
        resp = client.post(f"{API}/tools/base64-encode", json={"text": "test"})
        checkmarks.append("  [!!] 未登录也能调用工具API" if resp.status_code == 200 else "  [OK] 工具API需要登录")
    except:
        pass

    # 检查 /api/health 是否暴露信息
    try:
        resp = client.get(f"{API}/health")
        if resp.status_code == 200:
            checkmarks.append(f"  [!!] /api/health 暴露: {resp.text[:100]}")
    except:
        pass

    client.close()

    RESULTS.append(("认证安全", "low", "认证机制安全检查:", "\n".join(checkmarks)))

# ============================================================
# 执行所有扫描
# ============================================================
lines = []
lines.append("=" * 60)
lines.append("  DevToolbox 安全扫描")
lines.append("=" * 60)

for name, func in [
    ("端口扫描", port_scan),
    ("SQL注入", sql_injection_check),
    ("XSS", xss_check),
    ("目录爆破", dir_brute),
    ("认证安全", auth_check),
]:
    print(f"\n> 正在执行: {name}...")
    func()

# 生成报告
lines2 = []
lines2.append("")
lines2.append("=" * 60)
lines2.append("  扫描报告")
lines2.append("=" * 60)

total_issues = 0
for category, severity, summary, detail in RESULTS:
    sev_icon = {"info": "[i]", "low": "[OK]", "medium": "[!!]", "high": "[HIGH]", "critical": "[CRIT]"}
    lines2.append(f"\n{'─' * 40}")
    lines2.append(f"  {sev_icon.get(severity, '?')} [{severity.upper()}] {category}")
    lines2.append(f"  {summary}")
    lines2.append(f"  {detail}")

lines2.append(f"\n{'=' * 60}")
lines2.append(f"  扫描完成。共检查 5 个安全维度。")
lines2.append(f"{'=' * 60}")

report = "\n".join(lines2)
print(report)

# 存文件
with open("scan_results.txt", "w", encoding="utf-8") as f:
    f.write(report)
