import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  try {
    // モデル名を stable な 'gemini-2.5-flash' に変更
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
今週の日本の主要ニュースやAbema等の討論番組で話題の政治・経済・社会トピックを参考に、
YES/NOで答えられる時事質問を5つ作成してください。

【出力フォーマット】
必ず以下のJSON配列形式のみで出力してください（マークダウンのコードブロックや余計な文章は一切含めないでください）。

[
  { "id": 1, "category": "政治・経済", "text": "質問文1" },
  { "id": 2, "category": "外交・安全保障", "text": "質問文2" },
  { "id": 3, "category": "社会・労働", "text": "質問文3" },
  { "id": 4, "category": "テクノロジー", "text": "質問文4" },
  { "id": 5, "category": "エネルギー・環境", "text": "質問文5" }
]
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // コードブロック装飾がついている場合の除去
    text = text
      .replace(/^```json/g, "")
      .replace(/^```/g, "")
      .replace(/```$/g, "")
      .trim();

    // JSONとして解析できるかチェック
    JSON.parse(text);

    // app/questions.json に保存
    fs.writeFileSync("./app/questions.json", text, "utf-8");
    console.log("今週の質問データを正常に更新しました！");
  } catch (error) {
    console.error("質問更新エラー:", error);
    process.exit(1);
  }
}

main();
