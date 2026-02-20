# OpenCode 开发模式 - Lumira

## 启动配置

当前使用 Claude Code 模拟 OpenCode Agentic 开发模式。

## Agents 可用

```
@fund-analyst      - 基金数据分析和计算
@ui-architect      - UI组件和页面开发
@backend-engineer  - API和后端开发
```

## Commands

```
/add-holding <code> <shares> <cost> [options]
/analyze-portfolio [--range 1m|3m|6m|1y|all]
/dev-mode          - 进入开发模式
/commit            - 提交代码
```

## 开发流程

1. **启动**: 我已就绪，等待指令
2. **任务**: 你说任务，我执行
3. **中断**: 随时输入新指令
4. **提交**: 完成后自动提交

## 状态

- [x] 项目初始化
- [x] 类型定义
- [x] 核心计算 (XIRR)
- [x] 数据层 (IndexedDB)
- [x] 首页UI
- [ ] API集成
- [ ] 图表
- [ ] 表单

---

**开发模式已启动！输入任务继续...**
