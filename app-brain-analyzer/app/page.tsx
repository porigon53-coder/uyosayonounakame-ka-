"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import questionsData from "./questions.json";

export default function HomePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "YES" | "NO">>({});
  const [aiInputText, setAiInputText] = useState("");
  const [copied, setCopied] = useState(false);

  const questions = questionsData || [];

  // AI履歴まとめ用プロンプト
  const promptText = `以下の手順で、私がこれまでにあなた（AI）と検索・対話した興味・関心トピックの履歴をJSON形式でまとめて出力してください。

【出力フォーマット】
[
  { "title": "トピックや質問のタイトル", "domain": "ジャンル（例: tech, news, money, play, study など）" }
]

※出力はJSON配列のみとし、余計な解説文章は含めないでください。20〜30件程度出力してください。`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnswer = (answer: "YES" | "NO") => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    const nextAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(nextAnswers);

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      navigateToResultWithSurvey(nextAnswers);
    }
  };

  const handleSkip = () => {
    setShowModal(false);
  };

  const navigateToResultWithSurvey = (
    surveyAnswers: Record<number, "YES" | "NO">,
  ) => {
    const dummyData = questions.map((q) => ({
      title: `${q.category}: ${q.text} -> ${surveyAnswers[q.id] || "未回答"}`,
      domain:
        surveyAnswers[q.id] === "YES" ? "news-liberal" : "news-conservative",
    }));
    const encoded = encodeURIComponent(JSON.stringify(dummyData));
    router.push(`/result?data=${encoded}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let parsedData = [];

        if (file.name.endsWith(".json")) {
          parsedData = JSON.parse(text);
        } else {
          const lines = text.split("\n");
          parsedData = lines.slice(1, 31).map((line) => {
            const cols = line.split(",");
            return {
              title: cols[0] || "履歴データ",
              domain: cols[1] || "uploaded-history",
            };
          });
        }

        const encoded = encodeURIComponent(JSON.stringify(parsedData));
        router.push(`/result?data=${encoded}`);
      } catch (err) {
        alert(
          "ファイルの読み込みに失敗しました。正しいJSON/CSV形式か確認してください。",
        );
      }
    };
    reader.readAsText(file);
  };

  // AI回答テキスト直接送信
  const handleAiTextSubmit = () => {
    if (!aiInputText.trim()) return;
    try {
      let parsedData = [];
      if (aiInputText.includes("[")) {
        const jsonMatch = aiInputText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        }
      }
      if (parsedData.length === 0) {
        parsedData = aiInputText.split("\n").map((line) => ({
          title: line,
          domain: "ai-prompt-input",
        }));
      }
      const encoded = encodeURIComponent(JSON.stringify(parsedData));
      router.push(`/result?data=${encoded}`);
    } catch (e) {
      alert("AIテキストの解析に失敗しました。テキストを確認してください。");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 relative flex flex-col items-center justify-center">
      {/* 1. YES/NO モーダル */}
      {showModal && questions.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentQIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-3">
              今週の時事質問 ({currentQIndex + 1}/{questions.length})
            </span>

            <h2 className="text-lg font-bold text-slate-900 text-center mb-8 min-h-[60px] flex items-center leading-relaxed">
              {questions[currentQIndex].text}
            </h2>

            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <button
                onClick={() => handleAnswer("YES")}
                className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
              >
                YES
              </button>
              <button
                onClick={() => handleAnswer("NO")}
                className="py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-base rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
              >
                NO
              </button>
            </div>

            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition cursor-pointer"
            >
              スキップしてメイン画面へ
            </button>
          </div>
        </div>
      )}

      {/* 2. メイン画面 */}
      <div className="max-w-xl w-full space-y-8 text-center my-8">
        <header className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl">🧠</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              ウハサハ脳中メーカー
            </h1>
          </div>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Web閲覧履歴 ＆ AI会話履歴からあなたの脳内・政治思想スタンスを可視化
          </p>
        </header>

        {/* 履歴ファイルアップロード */}
        <section className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-2">
            📁 ブラウザ閲覧履歴ファイルから診断
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Chrome等の履歴データ（JSON / CSV）をアップロードして分析します。
          </p>

          <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-xs text-sm active:scale-95">
            <span>ファイルを選択して診断</span>
            <input
              type="file"
              accept=".json, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </section>

        {/* AI履歴まとめプロンプトエリア */}
        <section className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-2xl p-6 text-left shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <h3 className="font-bold text-slate-900 text-base">
              ChatGPT等のAI検索履歴から診断
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            普段お使いのAI（ChatGPT / Claude /
            Gemini等）に以下のプロンプトを送信し、返ってきた回答を下に貼り付けてください！
          </p>

          {/* プロンプトコピー枠 */}
          <div className="relative bg-white rounded-xl border border-indigo-200/80 p-3 mb-4">
            <pre className="text-[11px] text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
              {promptText}
            </pre>
            <button
              onClick={handleCopyPrompt}
              className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer shadow-xs"
            >
              {copied ? "コピー完了！" : "プロンプトをコピー"}
            </button>
          </div>

          {/* AI貼り付け用フォーム */}
          <div className="space-y-2">
            <textarea
              rows={3}
              placeholder="AIから出力されたJSONまたはテキストをここに貼り付け..."
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAiTextSubmit}
              disabled={!aiInputText.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition text-xs shadow-xs active:scale-95 cursor-pointer"
            >
              AI履歴データで診断を開始する
            </button>
          </div>
        </section>

        {!showModal && (
          <button
            onClick={() => {
              setCurrentQIndex(0);
              setShowModal(true);
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 underline transition cursor-pointer"
          >
            もう一度 5問アンケートに答える
          </button>
        )}
      </div>
    </main>
  );
}
