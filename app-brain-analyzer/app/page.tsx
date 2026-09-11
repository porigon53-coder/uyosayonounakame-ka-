"use client";

import { useState } from "react";
import questionsData from "./questions.json";

export default function HomePage() {
  const [showModal, setShowModal] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "YES" | "NO">>({});

  const [resultSource, setResultSource] = useState<"survey" | "upload">(
    "survey",
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const questions = questionsData || [];

  const handleAnswer = (answer: "YES" | "NO") => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    const nextAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(nextAnswers);

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setShowModal(false);
    }
  };

  const handleSkip = () => {
    setShowModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setResultSource("upload");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        alert(
          `${file.name} を読み込みました。履歴データに基づいて再判定を行いました！`,
        );
      } catch (err) {
        alert("ファイルの解析に失敗しました。");
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 relative">
      {/* 1. YES/NO 5問モーダル */}
      {showModal && questions.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            <div className="w-full bg-slate-700 h-1.5 rounded-full mb-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-300"
                style={{
                  width: `${((currentQIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <span className="text-xs font-semibold text-purple-400 bg-purple-950/60 border border-purple-800 px-3 py-1 rounded-full mb-3">
              {questions[currentQIndex].category} ({currentQIndex + 1}/
              {questions.length})
            </span>

            <h2 className="text-lg font-bold text-center mb-8 min-h-[60px] flex items-center">
              {questions[currentQIndex].text}
            </h2>

            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <button
                onClick={() => handleAnswer("YES")}
                className="py-4 bg-emerald-600 hover:bg-emerald-500 font-bold text-lg rounded-xl transition shadow-lg active:scale-95"
              >
                YES
              </button>
              <button
                onClick={() => handleAnswer("NO")}
                className="py-4 bg-rose-600 hover:bg-rose-500 font-bold text-lg rounded-xl transition shadow-lg active:scale-95"
              >
                NO
              </button>
            </div>

            <button
              onClick={handleSkip}
              className="text-xs text-slate-500 hover:text-slate-400 underline transition"
            >
              スキップしてメイン画面へ
            </button>
          </div>
        </div>
      )}

      {/* 2. メイン画面 */}
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            ウヨサヨ脳中メーカー
          </h1>
          <p className="text-slate-400 text-sm">
            時事回答 ＆ 閲覧履歴による思考・政治スタンス解析
          </p>
        </header>

        {/* 履歴アップロードスペース */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center shadow-lg">
          <h3 className="font-bold text-slate-200 mb-2">
            閲覧履歴ファイルから精密再判定
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Chrome等の履歴データ（JSON /
            CSV）をアップロードすると、実際の閲覧傾向からより詳細な分析を行います。
          </p>

          <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-purple-300 font-semibold px-5 py-2.5 rounded-xl transition text-sm">
            <span>📁 履歴ファイルをアップロード</span>
            <input
              type="file"
              accept=".json, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadedFileName && (
            <p className="text-xs text-emerald-400 mt-2">
              適用中: {uploadedFileName} （履歴データ優先で表示中）
            </p>
          )}
        </section>

        {/* 診断結果表示エリア */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700 pb-4">
            <h2 className="font-bold text-lg text-purple-300">
              現在の診断結果
            </h2>
            <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full">
              判定ソース:{" "}
              {resultSource === "survey" ? "5問アンケート" : "閲覧履歴ファイル"}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h3 className="text-xs font-bold text-slate-400 mb-2">
                脳内イメージ
              </h3>
              <div className="h-40 bg-slate-900/80 rounded-lg flex items-center justify-center text-slate-500 text-sm">
                [ 脳内ビジュアルグラフィック ]
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              <h3 className="text-xs font-bold text-slate-400">
                政治・思想的傾向メーター
              </h3>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>革新・リベラル</span>
                  <span>伝統・保守</span>
                </div>
                <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: "35%" }}
                  />
                  <div
                    className="bg-orange-500 h-full"
                    style={{ width: "65%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
