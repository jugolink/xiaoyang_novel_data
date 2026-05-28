# AI 自动化发布工作流指南 (GitHub + Vercel)

本指南介绍如何让你的 AI 创作脚本与网站无缝集成。因为本网站采用 Next.js 的 SSG（静态生成）架构，**Vercel 免费托管**结合 **GitHub Webhook** 是最简单、最高效的零成本方案。

## 架构原理

1. 你的小说源文件（`.md` 格式）统一放置在本地的 `novels_data/` 目录下。
2. 当 AI 生成了新章节，它只需把 `.md` 文件保存到 `novels_data/小说目录/`。
3. 随后触发一段 `git push` 命令推送到 GitHub。
4. Vercel 监听到你的 GitHub 有代码或数据更新，会自动在云端执行 `npm run build`，不到一分钟，全球的读者就能看到最新内容，而且极度丝滑流畅。

---

## 第一步：配置 Vercel 免费托管

1. 确保当前项目已经在本地初始化为 Git 仓库并推送到你的个人 GitHub 私有或公开仓库。
2. 登录 [Vercel](https://vercel.com)，点击 **Add New Project**。
3. 授权你的 GitHub 账号，并选择你刚才推送的 `novel-site` 仓库。
4. 在构建设置中，保持默认（Framework Preset 会自动识别为 Next.js），点击 **Deploy**。
5. 等待 1~2 分钟，部署完成！你会获得一个免费的 Vercel 二级域名，这就是你的正式网站了。

---

## 第二步：在你的 AI 脚本中加入自动化推送

当你的 AI 帮你把小说章节生成完毕并保存到 `novels_data/谁是守护者/` 目录后，你只需要在你的 AI 脚本的最后一行执行以下自动化推送逻辑即可。

这里提供一个 Python 版本的推送脚本示例：

```python
import os
import subprocess
from datetime import datetime

# 假设这个函数在你的 AI 生成完毕后调用
def publish_to_website():
    # 进入你的网站根目录
    repo_path = "D:/Work/Github/novel-site"
    os.chdir(repo_path)
    
    # 自动获取当前时间作为提交信息
    commit_msg = f"Auto Publish: New Chapter at {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    
    try:
        print("📥 正在添加新章节到 Git...")
        subprocess.run(["git", "add", "novels_data/"], check=True)
        
        print("💾 正在提交...")
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        
        print("🚀 正在推送到 GitHub，触发 Vercel 构建...")
        subprocess.run(["git", "push", "origin", "main"], check=True)
        
        print("✅ 发布成功！网站将在约 1 分钟后更新完毕。")
    except subprocess.CalledProcessError as e:
        print(f"❌ 发布失败，请检查 Git 状态: {e}")

# 测试调用
# publish_to_website()
```

### Node.js 版本的推送示例

如果你使用的是 Node.js：

```javascript
const { execSync } = require('child_process');

function publishToWebsite() {
  const repoPath = 'D:/Work/Github/novel-site';
  const msg = `Auto Publish: New Chapter at ${new Date().toLocaleString()}`;

  try {
    console.log("🚀 开始推送新章节...");
    execSync(`git add novels_data/`, { cwd: repoPath });
    execSync(`git commit -m "${msg}"`, { cwd: repoPath });
    execSync(`git push origin main`, { cwd: repoPath });
    console.log("✅ 发布触发成功！Vercel 正在后台构建...");
  } catch (err) {
    console.error("❌ 发布遇到错误，可能是没有新变更或网络问题。");
  }
}
```

---

## 维护建议

1. **不需要服务器**：你不需要购买任何云主机，也不需要操心流量和带宽，Vercel 提供的免费额度对静态小说站来说几乎是无限的。
2. **极速访问**：因为所有的小说内容都被预渲染成了 HTML，并且经过 Vercel 的全球 CDN 分发，世界各地的读者打开你的网站都只需几十毫秒。
