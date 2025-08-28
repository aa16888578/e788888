#!/usr/bin/env node

/**
 * 🚀 ShopBot 多平台電商系統 - 依賴更新腳本
 * 自動更新所有子項目的依賴到相容版本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}`)
};

// 項目配置
const projects = [
  { name: 'Admin 後台', path: 'admin', type: 'nextjs' },
  { name: 'MiniWeb', path: 'web', type: 'vue' },
  { name: 'Functions', path: 'functions', type: 'nodejs' }
];

// 依賴更新規則
const updateRules = {
  nextjs: {
    dependencies: {
      'next': '^15.5.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      '@types/node': '^18.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      'typescript': '^5.3.0',
      'tailwindcss': '^3.4.0',
      'autoprefixer': '^10.4.16',
      'postcss': '^8.4.32'
    }
  },
  vue: {
    dependencies: {
      'vue': '^3.4.0',
      'vue-router': '^4.2.5',
      'pinia': '^2.1.7',
      '@vueuse/core': '^10.5.0'
    },
    devDependencies: {
      'vite': '^5.4.0',
      '@vitejs/plugin-vue': '^4.5.0',
      'tailwindcss': '^3.4.0',
      'autoprefixer': '^10.4.16',
      'postcss': '^8.4.32'
    }
  },
  nodejs: {
    dependencies: {
      'firebase-admin': '^13.5.0',
      'firebase-functions': '^6.5.0',
      'express': '^5.1.0',
      'cors': '^2.8.5',
      'helmet': '^8.1.0'
    },
    devDependencies: {
      '@types/node': '^18.0.0',
      'typescript': '^5.3.0',
      'eslint': '^9.15.0'
    }
  }
};

// 檢查項目是否存在
function checkProjectExists(projectPath) {
  const fullPath = path.resolve(projectPath);
  return fs.existsSync(fullPath) && fs.existsSync(path.join(fullPath, 'package.json'));
}

// 備份 package.json
function backupPackageJson(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const backupPath = path.join(projectPath, 'package.json.backup');
  
  if (fs.existsSync(packageJsonPath)) {
    fs.copyFileSync(packageJsonPath, backupPath);
    log.success(`${projectPath} package.json 已備份`);
    return true;
  }
  return false;
}

// 更新依賴版本
function updateDependencies(projectPath, projectType) {
  log.header(`更新 ${projectPath} 依賴版本`);
  
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log.warning(`${projectPath} 沒有 package.json 文件`);
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const rules = updateRules[projectType];
    
    if (!rules) {
      log.warning(`沒有找到 ${projectType} 類型的更新規則`);
      return false;
    }
    
    let updated = false;
    
    // 更新 dependencies
    if (rules.dependencies) {
      Object.entries(rules.dependencies).forEach(([dep, version]) => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          const currentVersion = packageJson.dependencies[dep];
          if (currentVersion !== version) {
            packageJson.dependencies[dep] = version;
            log.info(`更新 ${dep}: ${currentVersion} → ${version}`);
            updated = true;
          }
        }
      });
    }
    
    // 更新 devDependencies
    if (rules.devDependencies) {
      Object.entries(rules.devDependencies).forEach(([dep, version]) => {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          const currentVersion = packageJson.devDependencies[dep];
          if (currentVersion !== version) {
            packageJson.devDependencies[dep] = version;
            log.info(`更新 ${dep}: ${currentVersion} → ${version}`);
            updated = true;
          }
        }
      });
    }
    
    // 更新 engines
    if (projectType === 'nodejs') {
      if (!packageJson.engines) {
        packageJson.engines = {};
      }
      if (packageJson.engines.node !== '18') {
        packageJson.engines.node = '18';
        log.info(`更新 Node.js 引擎要求: ${packageJson.engines.node} → 18`);
        updated = true;
      }
    }
    
    if (updated) {
      // 寫回文件
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      log.success(`${projectPath} 依賴版本已更新`);
      return true;
    } else {
      log.info(`${projectPath} 所有依賴版本已是最新`);
      return false;
    }
    
  } catch (error) {
    log.error(`更新 ${projectPath} 依賴失敗: ${error.message}`);
    return false;
  }
}

// 安裝依賴
function installDependencies(projectPath) {
  log.header(`安裝 ${projectPath} 依賴`);
  
  try {
    const fullPath = path.resolve(projectPath);
    
    // 檢查是否有 package-lock.json
    const hasLockFile = fs.existsSync(path.join(fullPath, 'package-lock.json'));
    
    if (hasLockFile) {
      log.info(`刪除舊的 package-lock.json`);
      fs.unlinkSync(path.join(fullPath, 'package-lock.json'));
    }
    
    // 檢查是否有 node_modules
    const nodeModulesPath = path.join(fullPath, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      log.info(`刪除舊的 node_modules`);
      execSync('rm -rf node_modules', { cwd: fullPath, stdio: 'inherit' });
    }
    
    // 安裝依賴
    log.info(`安裝依賴...`);
    execSync('npm install', { cwd: fullPath, stdio: 'inherit' });
    
    log.success(`${projectPath} 依賴安裝完成`);
    return true;
    
  } catch (error) {
    log.error(`安裝 ${projectPath} 依賴失敗: ${error.message}`);
    return false;
  }
}

// 檢查依賴相容性
function checkDependencyCompatibility(projectPath) {
  log.header(`檢查 ${projectPath} 依賴相容性`);
  
  try {
    const fullPath = path.resolve(projectPath);
    
    // 運行 npm audit
    log.info(`運行 npm audit 檢查安全問題...`);
    execSync('npm audit', { cwd: fullPath, stdio: 'inherit' });
    
    // 運行 npm outdated 檢查過時依賴
    log.info(`檢查過時依賴...`);
    execSync('npm outdated', { cwd: fullPath, stdio: 'inherit' });
    
    log.success(`${projectPath} 依賴相容性檢查完成`);
    return true;
    
  } catch (error) {
    // npm audit 和 npm outdated 可能會因為發現問題而退出
    log.warning(`${projectPath} 依賴相容性檢查完成（發現一些問題）`);
    return true;
  }
}

// 主函數
function main() {
  log.header('🚀 ShopBot 多平台電商系統 - 依賴更新工具');
  
  try {
    let totalUpdated = 0;
    let totalProjects = 0;
    
    // 處理每個項目
    projects.forEach(project => {
      if (checkProjectExists(project.path)) {
        totalProjects++;
        
        log.info(`處理項目: ${project.name} (${project.path})`);
        
        // 備份 package.json
        backupPackageJson(project.path);
        
        // 更新依賴版本
        const updated = updateDependencies(project.path, project.type);
        if (updated) {
          totalUpdated++;
        }
        
        // 安裝依賴
        installDependencies(project.path);
        
        // 檢查相容性
        checkDependencyCompatibility(project.path);
        
        log.success(`${project.name} 處理完成\n`);
        
      } else {
        log.warning(`項目 ${project.path} 不存在或沒有 package.json`);
      }
    });
    
    // 總結
    log.header('🎉 依賴更新完成！');
    log.success(`總共處理了 ${totalProjects} 個項目`);
    log.success(`更新了 ${totalUpdated} 個項目的依賴版本`);
    
    if (totalUpdated > 0) {
      log.info('建議執行以下命令來測試更新後的項目:');
      log.info('npm run test:admin    # 測試 Admin 後台');
      log.info('npm run test:web      # 測試 MiniWeb');
      log.info('npm run test:functions # 測試 Functions');
    }
    
  } catch (error) {
    log.error(`依賴更新失敗: ${error.message}`);
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = {
  updateDependencies,
  installDependencies,
  checkDependencyCompatibility,
  backupPackageJson
};
