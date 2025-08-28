#!/usr/bin/env node

/**
 * 🚀 ShopBot 多平台電商系統 - 版本相容性檢查腳本
 * 檢查所有子項目的依賴版本相容性
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

// 檢查項目
const projects = [
  { name: '根目錄', path: '.', hasPackageJson: true },
  { name: 'Admin 後台', path: 'admin', hasPackageJson: true },
  { name: 'MiniWeb', path: 'web', hasPackageJson: true },
  { name: 'Functions', path: 'functions', hasPackageJson: true }
];

// 版本相容性規則
const compatibilityRules = {
  node: {
    min: '18.0.0',
    max: '18.99.99',
    recommended: '18.19.0'
  },
  npm: {
    min: '8.0.0',
    recommended: '9.0.0'
  },
  firebase: {
    min: '10.0.0',
    recommended: '10.7.0'
  },
  next: {
    min: '15.0.0',
    recommended: '15.5.0'
  },
  vue: {
    min: '3.3.0',
    recommended: '3.4.0'
  }
};

// 檢查 Node.js 版本
function checkNodeVersion() {
  log.header('檢查 Node.js 版本相容性');
  
  try {
    const nodeVersion = process.version;
    const majorVersion = process.version.match(/v(\d+)\./)[1];
    
    log.info(`當前 Node.js 版本: ${nodeVersion}`);
    
    if (majorVersion === '18') {
      log.success('Node.js 版本符合要求 (18.x)');
    } else if (majorVersion > '18') {
      log.warning(`Node.js 版本 ${nodeVersion} 可能與某些依賴不相容`);
    } else {
      log.error(`Node.js 版本 ${nodeVersion} 過舊，需要升級到 18.x`);
    }
  } catch (error) {
    log.error(`檢查 Node.js 版本失敗: ${error.message}`);
  }
}

// 檢查 NPM 版本
function checkNpmVersion() {
  log.header('檢查 NPM 版本相容性');
  
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log.info(`當前 NPM 版本: ${npmVersion}`);
    
    const majorVersion = parseInt(npmVersion.split('.')[0]);
    if (majorVersion >= 8) {
      log.success('NPM 版本符合要求 (>=8.0.0)');
    } else {
      log.error(`NPM 版本 ${npmVersion} 過舊，需要升級到 8.0.0 或更高`);
    }
  } catch (error) {
    log.error(`檢查 NPM 版本失敗: ${error.message}`);
  }
}

// 檢查項目依賴
function checkProjectDependencies(projectPath, projectName) {
  log.header(`檢查 ${projectName} 依賴相容性`);
  
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log.warning(`${projectName} 沒有 package.json 文件`);
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // 檢查 Node.js 引擎要求
    if (packageJson.engines && packageJson.engines.node) {
      const nodeRequirement = packageJson.engines.node;
      log.info(`Node.js 要求: ${nodeRequirement}`);
      
      if (nodeRequirement.includes('18')) {
        log.success('Node.js 要求符合標準');
      } else {
        log.warning(`Node.js 要求 ${nodeRequirement} 可能與其他項目不相容`);
      }
    }
    
    // 檢查關鍵依賴版本
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // 檢查 Firebase 相關依賴
    ['firebase', 'firebase-admin', 'firebase-functions'].forEach(dep => {
      if (dependencies[dep]) {
        const version = dependencies[dep];
        log.info(`${dep}: ${version}`);
        
        if (version.includes('^10.') || version.includes('^13.')) {
          log.success(`${dep} 版本符合要求`);
        } else {
          log.warning(`${dep} 版本 ${version} 可能需要更新`);
        }
      }
    });
    
    // 檢查前端框架版本
    if (dependencies.next) {
      const version = dependencies.next;
      log.info(`Next.js: ${version}`);
      
      if (version.includes('^15.')) {
        log.success('Next.js 版本符合要求 (15.x)');
      } else {
        log.warning(`Next.js 版本 ${version} 可能需要更新到 15.x`);
      }
    }
    
    if (dependencies.vue) {
      const version = dependencies.vue;
      log.info(`Vue: ${version}`);
      
      if (version.includes('^3.')) {
        log.success('Vue 版本符合要求 (3.x)');
      } else {
        log.warning(`Vue 版本 ${version} 可能需要更新到 3.x`);
      }
    }
    
    // 檢查 TypeScript 版本
    if (dependencies.typescript) {
      const version = dependencies.typescript;
      log.info(`TypeScript: ${version}`);
      
      if (version.includes('^5.')) {
        log.success('TypeScript 版本符合要求 (5.x)');
      } else {
        log.warning(`TypeScript 版本 ${version} 可能需要更新到 5.x`);
      }
    }
    
  } catch (error) {
    log.error(`檢查 ${projectName} 依賴失敗: ${error.message}`);
  }
}

// 檢查 Firebase 配置
function checkFirebaseConfig() {
  log.header('檢查 Firebase 配置相容性');
  
  const firebaseJsonPath = path.join('.', 'firebase.json');
  
  if (!fs.existsSync(firebaseJsonPath)) {
    log.warning('沒有找到 firebase.json 配置文件');
    return;
  }
  
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    
    if (firebaseConfig.functions && firebaseConfig.functions.runtime) {
      const runtime = firebaseConfig.functions.runtime;
      log.info(`Firebase Functions 運行時: ${runtime}`);
      
      if (runtime === 'nodejs18') {
        log.success('Firebase Functions 運行時配置正確 (nodejs18)');
      } else {
        log.warning(`Firebase Functions 運行時 ${runtime} 可能與 Node.js 18 不相容`);
      }
    }
    
    if (firebaseConfig.hosting && firebaseConfig.hosting.public) {
      const publicDir = firebaseConfig.hosting.public;
      log.info(`Firebase Hosting 公共目錄: ${publicDir}`);
      
      if (publicDir === 'web/dist') {
        log.success('Firebase Hosting 配置正確，指向 web/dist');
      } else {
        log.warning(`Firebase Hosting 公共目錄 ${publicDir} 可能不正確`);
      }
    }
    
  } catch (error) {
    log.error(`檢查 Firebase 配置失敗: ${error.message}`);
  }
}

// 檢查環境配置
function checkEnvironmentConfig() {
  log.header('檢查環境配置相容性');
  
  const envExamplePath = path.join('.', 'env.example');
  
  if (fs.existsSync(envExamplePath)) {
    log.success('找到統一的環境配置文件 env.example');
    
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // 檢查關鍵配置項
    const requiredConfigs = [
      'FIREBASE_PROJECT_ID',
      'TELEGRAM_BOT_TOKEN',
      'NODE_ENV'
    ];
    
    requiredConfigs.forEach(config => {
      if (envContent.includes(config)) {
        log.success(`環境配置包含 ${config}`);
      } else {
        log.warning(`環境配置缺少 ${config}`);
      }
    });
    
  } else {
    log.warning('沒有找到統一的環境配置文件');
  }
}

// 生成相容性報告
function generateCompatibilityReport() {
  log.header('生成相容性檢查報告');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim(),
    projects: projects.map(p => p.name),
    issues: [],
    recommendations: []
  };
  
  // 這裡可以添加更詳細的報告生成邏輯
  
  const reportPath = path.join('.', 'compatibility-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log.success(`相容性報告已生成: ${reportPath}`);
}

// 主函數
function main() {
  log.header('🚀 ShopBot 多平台電商系統 - 版本相容性檢查');
  
  try {
    // 檢查系統環境
    checkNodeVersion();
    checkNpmVersion();
    
    // 檢查各項目依賴
    projects.forEach(project => {
      if (project.hasPackageJson) {
        checkProjectDependencies(project.path, project.name);
      }
    });
    
    // 檢查配置文件
    checkFirebaseConfig();
    checkEnvironmentConfig();
    
    // 生成報告
    generateCompatibilityReport();
    
    log.header('🎉 相容性檢查完成！');
    
  } catch (error) {
    log.error(`相容性檢查失敗: ${error.message}`);
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = {
  checkNodeVersion,
  checkNpmVersion,
  checkProjectDependencies,
  checkFirebaseConfig,
  checkEnvironmentConfig,
  generateCompatibilityReport
};
