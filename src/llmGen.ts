import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
require('dotenv').config()

// - 条件2: 「おすすめする理由は」から続けて文章を書いてください

const prompt1 = PromptTemplate.fromTemplate(`
あなたはプロのライターです。次の商品をおすすめする理由を具体例を用いて説明文以降にライティングしてください。
- 条件1: 約300文字の日本語で文章を作ってください
- 条件2: 気合い入れて、深呼吸して、一歩ずつ課題に取り組んでください。
- 条件3: あなたの回答にバイアスがかかっていないか、固定観念によるものではないかを確認してください。
- 条件4: ステップバイステップで考えてください
- 条件5: 必ず専門家として答えてください
- 条件6: 適度に改行を入れて人間が読みやすい文章にしてください。
- 条件7: 自然な日本語の文章で作成してください。
- 条件8: 商品紹介文を元に、網羅的に文章を作成してください
- 条件9: アスタリスク(*)は含めないでください


商品: {product}
説明文: 

1. 商品の概要を説明してください。

2. 商品の機能と消費者のメリットを説明してください。

3. どんな人におすすめなのか説明してください。

`)

const prompt2 = PromptTemplate.fromTemplate(`
input内容を、記事タイトルのようにキャッチーに仕上げてください
- 条件1: 日本語の文字数で50文字まで
- 条件2: タイトルは必ず一つだけ作成してください
- 条件3: アスタリスク(*)は含めないでください

### タイトル作成 ###
{input}
### タイトル作成終了 ###
`)

const model = new ChatGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_API_KEY,
	modelName: 'gemini-pro',
	maxOutputTokens: 2048,
	temperature: 0.9,
	safetySettings: [
		{
			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
			threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
		}
	]
})

const temp1Chain = prompt1.pipe(model).pipe(new StringOutputParser())
const temp2Chain = prompt2.pipe(model).pipe(new StringOutputParser())

export async function LLMgeminiRun(product: string) {
	const temp1Result = await temp1Chain.invoke({ product })
	console.log('temp1Result:', temp1Result)

	const temp2Result = await temp2Chain.invoke({ input: temp1Result })
	console.log('temp2Result:', temp2Result)

	return { temp1Result, temp2Result }
}
