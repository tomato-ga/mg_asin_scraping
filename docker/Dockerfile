# 指定されたPlaywrightのベースイメージ
FROM mcr.microsoft.com/playwright:v1.41.1-jammy

# 作業ディレクトリの設定
WORKDIR /usr/src/app

# パッケージファイルのコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# TypeScriptのコンパイルが必要な場合はここで実行
# RUN npx tsc

# Lambdaがコンテナを起動するときに実行するコマンド
CMD ["node", "gotoAmazonURL.js"]
