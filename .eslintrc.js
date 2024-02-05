module.exports = {
	parser: '@typescript-eslint/parser', // TypeScript 用のパーサーを指定
	plugins: ['@typescript-eslint'], // TypeScript 用のプラグインを使用
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended' // TypeScript 用の推奨ルールを適用
	],
	env: {
		browser: true, // ブラウザ環境の場合
		node: true // Node.js 環境の場合
	},
	rules: {
		// ここにカスタムルールを追加
	}
}
