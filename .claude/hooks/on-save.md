# Hook: On Save

文件保存时的自动化操作。

## Trigger
- TypeScript 文件保存
- React 组件文件保存

## Actions
1. **ESLint 检查**
   ```bash
   npx eslint --fix {file}
   ```

2. **TypeScript 类型检查**
   ```bash
   npx tsc --noEmit
   ```

3. **自动格式化**
   ```bash
   npx prettier --write {file}
   ```

4. **测试文件关联**
   - 如果修改了 `src/utils/calculate.ts`
   - 自动运行 `src/utils/calculate.test.ts`

## Configuration
```json
{
  "onSave": {
    "lint": true,
    "typecheck": true,
    "format": true,
    "test": "related"
  }
}
```
