# Hook: On Test

测试执行时的自动化操作。

## Trigger
- 运行测试命令
- 文件变更触发测试

## Actions
1. **覆盖率检查**
   - 核心模块覆盖率 > 80%
   - 工具函数覆盖率 > 90%

2. **性能基准**
   ```typescript
   // XIRR 计算应该在 100ms 内完成
   test('XIRR calculates within 100ms', () => {
     const start = performance.now();
     calculateXIRR(largeDataSet);
     expect(performance.now() - start).toBeLessThan(100);
   });
   ```

3. **快照更新确认**
   - UI 组件快照变更需人工确认

## Coverage Requirements
| 模块 | 覆盖率 |
|------|--------|
| utils/calculate.ts | 90% |
| utils/fetch.ts | 80% |
| components/charts | 70% |
| hooks/useFundData | 80% |
