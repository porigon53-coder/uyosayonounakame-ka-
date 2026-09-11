"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import questionsData from "./questions.json";

export default function HomePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "YES" | "NO">>({});

  const questions = questionsData || [];

  // YES / NO 回答処理
  const handleAnswer = (answer: "YES" | "NO") => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    const nextAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(nextAnswers);

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      // 5問回答完了 -> 結果ページへ自動遷移
      navigateToResultWithSurvey(nextAnswers);
    }
  };

  // スキップ処理
  const handleSkip = () => {
    setShowModal(false);
  };

  // アンケート結果を診断用データに変換して結果ページへ
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

  // 履歴ファイルアップロード処理
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
          // CSVの場合の解析
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 relative flex flex-col items-center justify-center">
      {/* 1. YES/NO 5問モーダル（ライトトーン配色統一版） */}
      {showModal && questions.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            {/* プログレスバー */}
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

            {/* YES / NO ボタン */}
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

            {/* スキップボタン */}
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition cursor-pointer"
            >
              スキップしてメイン画面へ
            </button>
          </div>
        </div>
      )}

      {/* 2. メイン画面（結果ページ連動カラー） */}
      <div className="max-w-xl w-full space-y-8 text-center">
        <header className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl">🧠</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              ウハサハ脳中メーカー
            </h1>
          </div>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Web閲覧履歴からあなたの脳内・政治思想スタンスを可視化
          </p>
        </header>

        {/* 履歴アップロードスペース */}
        <section className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-2">
            📁 閲覧履歴ファイルから精密判定
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Chrome等の履歴データ（JSON /
            CSV）をアップロードすると、実際の閲覧傾向からあなたの脳内・政治スタンスを分析します。
          </p>

          <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-xs text-sm active:scale-95">
            <span>ファイルを選択して診断する</span>
            <input
              type="file"
              accept=".json, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <p className="text-[11px] text-slate-400 mt-4">
            ※ファイル内のデータはブラウザ内でのみ解析され、外部サーバーに送信されることはありません。
          </p>
        </section>

        {/* 質問モーダルを再表示するボタン */}
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
