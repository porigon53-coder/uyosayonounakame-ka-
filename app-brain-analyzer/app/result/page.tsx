"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import questionsData from "./questions.json";

export default function HomePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "YES" | "NO">>({});

  // 入力モード切替 ('ai' | 'file')
  const [activeTab, setActiveTab] = useState<"ai" | "file">("ai");
  const [aiInputText, setAiInputText] = useState("");
  const [copied, setCopied] = useState(false);

  const questions = questionsData || [];

  // コピペ用AIプロンプト
  const promptText = `私がこれまでにあなたと対話・検索した興味・関心トピックの履歴を以下のJSON形式のみで20〜30件出力してください。余計な説明文は一切不要です。

[
  { "title": "トピックや質問内容", "domain": "ジャンル（tech, news, money, play, food, study など）" }
]`;

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

  // ファイルアップロード処理
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
          "ファイルの読み込みに失敗しました。正しいJSONまたはCSV形式か確認してください。",
        );
      }
    };
    reader.readAsText(file);
  };

  // AI回答テキスト直接判定処理
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
      alert(
        "テキスト解析に失敗しました。正しい形式で入力されているか確認してください。",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 relative flex flex-col items-center justify-center">
      {/* 5問アンケートモーダル */}
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
              時事・価値観アンケート ({currentQIndex + 1}/{questions.length})
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
              スキップして履歴アップロード画面へ
            </button>
          </div>
        </div>
      )}

      {/* メイン診断コンテナ */}
      <div className="max-w-xl w-full space-y-6 text-center my-8">
        <header className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl">🧠</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              ウハサハ脳中メーカー
            </h1>
          </div>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Web閲覧履歴 ＆ AI検索履歴からあなたの脳内・政治スタンスを分析
          </p>
        </header>

        {/* タブ切り替え（離脱防止ガイド付き） */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-left">
          <div className="flex border-b border-slate-100 mb-4 gap-2">
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-2.5 text-xs md:text-sm font-bold border-b-2 transition ${
                activeTab === "ai"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              🤖 AIの検索履歴で判定（かんたん）
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2.5 text-xs md:text-sm font-bold border-b-2 transition ${
                activeTab === "file"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              📁 Web閲覧履歴ファイル
            </button>
          </div>

          {/* TAB 1: AI検索履歴入力 */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 leading-relaxed">
                <p className="font-bold mb-1">💡 コピペ3秒で判定できます！</p>
                普段お使いのAI（ChatGPT / Claude /
                Gemini等）に下のプロンプトを送信し、返ってきたテキストをそのまま下に貼り付けてください。
              </div>

              {/* プロンプト表示＋ワンクリックコピー */}
              <div className="relative bg-slate-900 rounded-xl p-3 text-slate-100">
                <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed opacity-90">
                  {promptText}
                </pre>
                <button
                  onClick={handleCopyPrompt}
                  className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition active:scale-95 shadow-sm cursor-pointer"
                >
                  {copied ? "コピー完了！" : "プロンプトをコピー"}
                </button>
              </div>

              {/* テキスト貼り付けエリア */}
              <div className="space-y-2">
                <textarea
                  rows={4}
                  placeholder="ここにAIの回答テキストを貼り付け..."
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAiTextSubmit}
                  disabled={!aiInputText.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-sm active:scale-95 cursor-pointer"
                >
                  AI履歴データで診断を開始する
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Web閲覧履歴ファイル */}
          {activeTab === "file" && (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-slate-600 leading-relaxed text-left">
                ブラウザ（Chrome, Edge,
                Safari等）の拡張機能などで出力した閲覧履歴データ（JSON /
                CSV）を直接読み込んで解析します。
              </p>

              <label className="cursor-pointer inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm text-sm active:scale-95">
                <span>ファイルを選択して判定</span>
                <input
                  type="file"
                  accept=".json, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <p className="text-[11px] text-slate-400">
                ※アップロードしたデータはブラウザ内のみで解析され、サーバーへ送信されることはありません。
              </p>
            </div>
          )}
        </div>

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
