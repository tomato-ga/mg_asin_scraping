"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMgeminiRun = void 0;
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const google_genai_1 = require("@langchain/google-genai");
const generative_ai_1 = require("@google/generative-ai");
require('dotenv').config();
const prompt1 = prompts_1.PromptTemplate.fromTemplate(`
あなたはプロのライターです。次の商品をおすすめする1の理由を具体例を用いて説明してください。
- 条件1: 約300文字の日本語で文章を作ってください
- 条件2: 「おすすめする理由は」から続けて文章を書いてください
- 条件3: 気合い入れて、深呼吸して、一歩ずつ課題に取り組んでください。
- 条件4: あなたの回答にバイアスがかかっていないか、固定観念によるものではないかを確認してください。
- 条件5: ステップバイステップで考えてください
- 条件6: 必ず専門家として答えてください
- 条件7: 適度に改行を入れて人間が読みやすい文章にしてください。
- 条件8: 自然な日本語の文章で作成してください。
- 条件9: 商品紹介文を元に、網羅的に文章を作成してください
- 条件10: アスタリスク(*)は含めないでください


商品: {product}
説明文: おすすめする理由は...
`);
const prompt2 = prompts_1.PromptTemplate.fromTemplate(`
input内容を、記事タイトルのようにキャッチーに仕上げてください
- 条件1: 日本語の文字数で50文字まで
- 条件2: タイトルは必ず一つだけ作成してください

### タイトル作成 ###
{input}
### タイトル作成終了 ###
`);
const model = new google_genai_1.ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: 'gemini-pro',
    maxOutputTokens: 2048,
    temperature: 0.9,
    safetySettings: [
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        }
    ]
});
const temp1Chain = prompt1.pipe(model).pipe(new output_parsers_1.StringOutputParser());
const temp2Chain = prompt2.pipe(model).pipe(new output_parsers_1.StringOutputParser());
async function LLMgeminiRun(product) {
    const temp1Result = await temp1Chain.invoke({ product });
    console.log('temp1Result:', temp1Result);
    const temp2Result = await temp2Chain.invoke({ input: temp1Result });
    console.log('temp2Result:', temp2Result);
    return { temp1Result, temp2Result };
}
exports.LLMgeminiRun = LLMgeminiRun;
//# sourceMappingURL=llmGen.js.map