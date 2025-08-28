FROM nginx:alpine

# 複製靜態文件到 nginx 默認目錄
COPY . /usr/share/nginx/html/

# 複製自定義 nginx 配置（如果需要）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# nginx 會自動啟動
