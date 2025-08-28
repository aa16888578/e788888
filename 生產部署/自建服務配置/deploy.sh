#!/bin/bash

echo "🚀 開始部署 CVV Bot 自建服務..."

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，正在安裝..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker 安裝完成"
fi

# 檢查 Docker Compose 是否安裝
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝，正在安裝..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安裝完成"
fi

# 創建必要的目錄
echo "📁 創建必要的目錄..."
mkdir -p ssl
mkdir -p logs
mkdir -p data

# 生成自簽名 SSL 證書（生產環境請使用 Let's Encrypt）
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    echo "🔐 生成自簽名 SSL 證書..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem -out ssl/cert.pem \
        -subj "/C=TW/ST=Taiwan/L=Taipei/O=CVVBot/CN=localhost"
fi

# 設置環境變量
echo "⚙️ 設置環境變量..."
export $(cat env.config | xargs)

# 構建和啟動服務
echo "🔨 構建和啟動服務..."
docker-compose up -d --build

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 30

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker-compose ps

# 初始化數據庫
echo "🗄️ 初始化數據庫..."
docker-compose exec postgres psql -U cvv000 -d cvvbot_db -c "
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cvv_cards (
    id SERIAL PRIMARY KEY,
    card_number VARCHAR(255) NOT NULL,
    expiry_date VARCHAR(10),
    cvv VARCHAR(10),
    card_type VARCHAR(50),
    bank_name VARCHAR(255),
    country VARCHAR(100),
    price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    card_id INTEGER REFERENCES cvv_cards(id),
    amount DECIMAL(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"

echo "✅ 部署完成！"
echo "🌐 前端: https://localhost"
echo "🔌 API: https://localhost/api"
echo "🗄️ 數據庫: localhost:5432"
echo "📊 MinIO 控制台: http://localhost:9001"
echo "📝 日誌: docker-compose logs -f"

