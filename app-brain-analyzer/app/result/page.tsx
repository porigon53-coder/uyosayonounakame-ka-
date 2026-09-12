"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

function ResultContent() {
  const searchParams = useSearchParams();
  const rawData = searchParams.get("data");

  let historyList: { title: string; domain: string }[] = [];
  if (rawData) {
    try {
      const decoded = decodeURIComponent(rawData);
      historyList = JSON.parse(decoded);
    } catch (e) {
      try {
        historyList = JSON.parse(rawData);
      } catch (err) {
        console.error("Failed to parse history data:", err);
      }
    }
  }

  const historyCount = historyList.length;

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  const wordMaster: { [key: string]: { text: string; color: string } } = {
    MONEY: { text: "金", color: "text-amber-500" },
    IT: { text: "IT", color: "text-indigo-900" },
    KNOWLEDGE: { text: "知", color: "text-blue-600" },
    PLAY: { text: "遊", color: "text-pink-500" },
    TECH: { text: "技", color: "text-cyan-600" },
    POLITICS: { text: "政治", color: "text-rose-600" },
    STUDY: { text: "学", color: "text-emerald-600" },
    SECRET: { text: "H", color: "text-fuchsia-600" },
    FOOD: { text: "食", color: "text-lime-600" },
    SLEEP: { text: "眠", color: "text-teal-600" },
  };

  const scores: { [key: string]: number } = {
    MONEY: 0,
    IT: 0,
    KNOWLEDGE: 0,
    PLAY: 0,
    TECH: 0,
    POLITICS: 0,
    STUDY: 0,
    SECRET: 0,
    FOOD: 0,
    SLEEP: 0,
  };

  historyList.forEach((item) => {
    const text = (item.title + " " + item.domain).toLowerCase();

    if (
      text.includes("money") ||
      text.includes("bank") ||
      text.includes("pay") ||
      text.includes("amazon") ||
      text.includes("株") ||
      text.includes("投資") ||
      text.includes("金")
    )
      scores.MONEY += 3;
    if (
      text.includes("github") ||
      text.includes("qiita") ||
      text.includes("zenn") ||
      text.includes("dev")
    ) {
      scores.IT += 3;
      scores.TECH += 2;
    }
    if (
      text.includes("google") ||
      text.includes("stack") ||
      text.includes("tech") ||
      text.includes("code")
    )
      scores.IT += 2;
    if (
      text.includes("news") ||
      text.includes("yahoo") ||
      text.includes("nhk") ||
      text.includes("朝日") ||
      text.includes("読売")
    ) {
      scores.KNOWLEDGE += 2;
      scores.POLITICS += 1;
    }
    if (
      text.includes("政治") ||
      text.includes("選挙") ||
      text.includes("国会") ||
      text.includes("党")
    )
      scores.POLITICS += 4;
    if (
      text.includes("youtube") ||
      text.includes("twitter") ||
      text.includes("x.com") ||
      text.includes("instagram") ||
      text.includes("game")
    )
      scores.PLAY += 2;
    if (
      text.includes("wiki") ||
      text.includes("note") ||
      text.includes("paper") ||
      text.includes("doc") ||
      text.includes("学")
    ) {
      scores.STUDY += 2;
      scores.KNOWLEDGE += 1;
    }
    if (
      text.includes("tabelog") ||
      text.includes("gnavi") ||
      text.includes("cookpad") ||
      text.includes("食") ||
      text.includes("店")
    )
      scores.FOOD += 3;
    if (
      text.includes("hotel") ||
      text.includes("bed") ||
      text.includes("眠") ||
      text.includes("休")
    )
      scores.SLEEP += 3;
    if (text.length % 7 === 0) scores.SECRET += 1;
  });

  const sortedKeys = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const top4Keys = sortedKeys.slice(0, 4);

  const isExtrovert = scores.PLAY + scores.POLITICS > scores.IT + scores.STUDY;
  const isSensing =
    scores.FOOD + scores.SLEEP + scores.MONEY > scores.TECH + scores.KNOWLEDGE;
  const isThinking =
    scores.IT + scores.POLITICS + scores.MONEY > scores.PLAY + scores.SECRET;
  const isJudging = scores.STUDY + scores.KNOWLEDGE > scores.PLAY + scores.FOOD;

  let titlePrefix = "🧠 『内向的・直観型の";
  if (isExtrovert && isThinking) titlePrefix = "🗣️ 『外向的・思考型の";
  else if (isExtrovert && !isThinking) titlePrefix = "🎉 『外向的・感情型の";
  else if (!isExtrovert && isThinking) titlePrefix = "💻 『内向的・思考型の";
  else if (!isExtrovert && !isThinking) titlePrefix = "🎨 『内向的・感情型の";
  else if (isSensing && isJudging) titlePrefix = "📐 『感覚的・判断型の";
  else if (isSensing && !isJudging) titlePrefix = "🍃 『感覚的・知覚型の";
  else if (!isSensing && isJudging) titlePrefix = "📚 『直観的・判断型の";

  let titleSuffix = "オールラウンダー脳』";
  let descriptionText =
    "特定のジャンルに偏らず、幅広い領域の情報に触れているバランス重視の頭脳です。多角的な視点から物事を捉え、柔軟に思考を切り替えることができるのが強みです。";

  const top1 = sortedKeys[0];
  const top2 = sortedKeys[1];

  if (top1 === "MONEY" || top2 === "MONEY") {
    titleSuffix = "マネー・資産形成重視脳』";
    descriptionText =
      "経済、投資、ショッピングや金融に関連する関心が非常に高い頭脳です。実益や将来の安定、コストパフォーマンスを意識した現実的な思考展開を得意としています。";
  } else if (
    (top1 === "IT" && top2 === "TECH") ||
    (top1 === "TECH" && top2 === "IT")
  ) {
    titleSuffix = "テクノロジー特化脳』";
    descriptionText =
      "ITや技術情報系の閲覧履歴が突出しており、構造や仕組みの分析に強みを持つ頭脳です。開発トレンドや最新技術を論理的に整理・習得することに強い関心が表れています。";
  } else if (
    (top1 === "POLITICS" && top2 === "KNOWLEDGE") ||
    (top1 === "KNOWLEDGE" && top2 === "POLITICS")
  ) {
    titleSuffix = "政治思想論客』";
    descriptionText =
      "政治や社会ニュースの閲覧頻度が高く、世の中の動向を議論・検証したがる論客の頭脳です。物事を多角的に捉え、客観的データや事実に基づいて思考を展開します。";
  }

  const diagnosisTitle = `${titlePrefix}${titleSuffix}`;

  const newsCount = scores.KNOWLEDGE + scores.POLITICS;
  const techCount = scores.IT + scores.TECH;

  const liberalRatio = Math.min(
    85,
    Math.max(15, Math.round(50 + (newsCount - techCount) * 5)),
  );
  const conservativeRatio = 100 - liberalRatio;

  const xPos = Math.round(((conservativeRatio - 50) / 50) * 85);
  const yDiff = techCount - newsCount;
  const yPos = Math.min(85, Math.max(-85, yDiff * 18));

  // --- レイアウト ＆ 解答連動確率計算 ---
  const [layoutStyle, setLayoutStyle] = useState<number>(0);
  const [isBigH, setIsBigH] = useState<boolean>(false);
  const [showTestMode, setShowTestMode] = useState<boolean>(false);

  const [activeWords, setActiveWords] = useState<{
    wordA: typeof wordMaster.MONEY;
    wordB: typeof wordMaster.KNOWLEDGE;
  }>({
    wordA: wordMaster.MONEY,
    wordB: wordMaster.KNOWLEDGE,
  });

  useEffect(() => {
    // 1. 巨大「H」モード（5%確率 OR SECRET高スコア）
    const rollBigH = Math.random() < 0.05 || scores.SECRET > 3;
    setIsBigH(rollBigH);

    // 2. 解答スコアに応じた基本重み（70%分）＋ 30%ランダム性の算出
    const baseP1 = 5 + (scores.MONEY + scores.SECRET) * 2;
    const baseP2 = 20 + (scores.FOOD + scores.SLEEP) * 3;
    const baseP3 = 25 + (scores.IT + scores.TECH + scores.STUDY) * 3;
    const baseP4 = 25 + (scores.POLITICS + scores.KNOWLEDGE) * 3;
    const baseP5 = 25 + scores.PLAY * 3;

    // 30%のランダム揺らぎ（0〜15の乱数を各パターンに加算）
    const weights = [
      { id: 0, weight: baseP1 * 0.7 + Math.random() * 15 },
      { id: 1, weight: baseP2 * 0.7 + Math.random() * 15 },
      { id: 2, weight: baseP3 * 0.7 + Math.random() * 15 },
      { id: 3, weight: baseP4 * 0.7 + Math.random() * 15 },
      { id: 4, weight: baseP5 * 0.7 + Math.random() * 15 },
    ];

    // 重みの合計から確率に基づいて1つのパターンを選定
    const totalWeight = weights.reduce((acc, cur) => acc + cur.weight, 0);
    let randomVal = Math.random() * totalWeight;
    let selectedId = 0;

    for (const item of weights) {
      if (randomVal < item.weight) {
        selectedId = item.id;
        break;
      }
      randomVal -= item.weight;
    }

    setLayoutStyle(selectedId);

    // 上位4文字からランダムペア抽選
    const shuffledKeys = [...top4Keys].sort(() => Math.random() - 0.5);
    const keyA = shuffledKeys[0] || "MONEY";
    const keyB = shuffledKeys[1] || "KNOWLEDGE";

    setActiveWords({
      wordA: wordMaster[keyA] || wordMaster.MONEY,
      wordB: wordMaster[keyB] || wordMaster.KNOWLEDGE,
    });
  }, []);

  // 基準円環ポジション
  const circlePositions = [
    { top: "18%", left: "50%" },
    { top: "20%", left: "62%" },
    { top: "25%", left: "72%" },
    { top: "33%", left: "78%" },
    { top: "43%", left: "78%" },
    { top: "52%", left: "74%" },
    { top: "58%", left: "65%" },
    { top: "60%", left: "53%" },
    { top: "58%", left: "42%" },
    { top: "52%", left: "33%" },
    { top: "43%", left: "28%" },
    { top: "33%", left: "28%" },
    { top: "25%", left: "33%" },
    { top: "20%", left: "40%" },
    { top: "18%", left: "45%" },
  ];

  // パターン描画
  const renderPatternByStyle = (
    styleId: number,
    forceBigH = false,
    customWordA = activeWords.wordA,
    customWordB = activeWords.wordB,
  ) => {
    if (forceBigH) {
      return (
        <span className="text-fuchsia-600 font-black text-9xl leading-none transform translate-x-2 -translate-y-2 opacity-95 drop-shadow-2xl animate-pulse">
          H
        </span>
      );
    }

    // パターン1: 円形で並ぶ ＋ 真ん中に1文字
    if (styleId === 0) {
      return (
        <>
          {circlePositions.map((pos, idx) => (
            <span
              key={idx}
              className={`absolute ${customWordA.color} text-sm font-bold`}
              style={{ top: pos.top, left: pos.left }}
            >
              {customWordA.text}
            </span>
          ))}
          <span
            className={`absolute ${customWordB.color} text-3xl font-black transform -translate-x-1/2 -translate-y-1/2`}
            style={{ top: "40%", left: "51%" }}
          >
            {customWordB.text}
          </span>
        </>
      );
    }

    // パターン2: 円形で交互配置
    if (styleId === 1) {
      return circlePositions.map((pos, idx) => (
        <span
          key={idx}
          className={`absolute ${idx % 2 === 0 ? customWordA.color : customWordB.color} text-sm font-bold`}
          style={{ top: pos.top, left: pos.left }}
        >
          {idx % 2 === 0 ? customWordA.text : customWordB.text}
        </span>
      ));
    }

    // パターン3: 上半分円弧 ＋ 中央文字
    if (styleId === 2) {
      const topArc = [
        { top: "18%", left: "38%" },
        { top: "17%", left: "46%" },
        { top: "17%", left: "54%" },
        { top: "18%", left: "62%" },
        { top: "22%", left: "32%" },
        { top: "22%", left: "68%" },
        { top: "27%", left: "27%" },
        { top: "27%", left: "73%" },
      ];
      return (
        <>
          {topArc.map((pos, idx) => (
            <span
              key={idx}
              className={`absolute ${customWordA.color} text-sm font-bold`}
              style={{ top: pos.top, left: pos.left }}
            >
              {customWordA.text}
            </span>
          ))}
          <span
            className={`absolute ${customWordB.color} text-4xl font-black`}
            style={{ top: "45%", left: "48%" }}
          >
            {customWordB.text}
          </span>
        </>
      );
    }

    // パターン4: 左右均等分割・等間隔配置
    if (styleId === 3) {
      const evenLeftPositions = [
        { top: "20%", left: "35%" },
        { top: "28%", left: "32%" },
        { top: "36%", left: "30%" },
        { top: "44%", left: "32%" },
        { top: "52%", left: "36%" },
        { top: "25%", left: "43%" },
        { top: "40%", left: "43%" },
      ];
      const evenRightPositions = [
        { top: "20%", left: "65%" },
        { top: "28%", left: "68%" },
        { top: "36%", left: "70%" },
        { top: "44%", left: "68%" },
        { top: "52%", left: "64%" },
        { top: "25%", left: "57%" },
        { top: "40%", left: "57%" },
      ];
      return (
        <>
          {evenLeftPositions.map((pos, idx) => (
            <span
              key={`l-${idx}`}
              className={`absolute ${customWordA.color} text-sm font-bold`}
              style={{ top: pos.top, left: pos.left }}
            >
              {customWordA.text}
            </span>
          ))}
          {evenRightPositions.map((pos, idx) => (
            <span
              key={`r-${idx}`}
              className={`absolute ${customWordB.color} text-sm font-bold`}
              style={{ top: pos.top, left: pos.left }}
            >
              {customWordB.text}
            </span>
          ))}
        </>
      );
    }

    // パターン5: 全満たし均等配置
    if (styleId === 4) {
      const fullGrid = [
        { top: "20%", left: "42%" },
        { top: "20%", left: "58%" },
        { top: "28%", left: "35%" },
        { top: "28%", left: "50%" },
        { top: "28%", left: "65%" },
        { top: "36%", left: "30%" },
        { top: "36%", left: "42%" },
        { top: "36%", left: "58%" },
        { top: "36%", left: "70%" },
        { top: "44%", left: "35%" },
        { top: "44%", left: "50%" },
        { top: "44%", left: "65%" },
        { top: "52%", left: "42%" },
        { top: "52%", left: "58%" },
      ];
      return fullGrid.map((pos, idx) => (
        <span
          key={idx}
          className={`absolute ${idx % 2 === 0 ? customWordA.color : customWordB.color} text-sm font-bold`}
          style={{ top: pos.top, left: pos.left }}
        >
          {idx % 2 === 0 ? customWordA.text : customWordB.text}
        </span>
      ));
    }

    return null;
  };

  const recommendedBooks = [
    {
      id: 1,
      title: "右派と左派の謎を解く―政治思想の心理学",
      description:
        "なぜ人は政治で対立するのか？人間の道徳心理から左右の対立構造を解き明かす名著。",
      imageUrl: "https://placehold.co/120x160/e2e8f0/475569?text=Book+1",
      amazonUrl: "https://www.amazon.co.jp/dp/YOUR_AMAZON_ID_1",
      rakutenUrl: "https://hb.afl.rakuten.co.jp/YOUR_RAKUTEN_ID_1",
      badge: "思想・政治診断におすすめ",
    },
    {
      id: 2,
      title: "教養としての「政治と思想」入門",
      description:
        "リベラル・保守・イデオロギーの基礎知識をスッキリ理解。現代社会を読み解く必須の一冊。",
      imageUrl: "https://placehold.co/120x160/e2e8f0/475569?text=Book+2",
      amazonUrl: "https://www.amazon.co.jp/dp/YOUR_AMAZON_ID_2",
      rakutenUrl: "https://hb.afl.rakuten.co.jp/YOUR_RAKUTEN_ID_2",
      badge: "基礎教養を深める",
    },
  ];

  const handleShare = () => {
    const shareText = `【ウハサハ脳中メーカー】\n私のWeb閲覧履歴の分析結果は ${diagnosisTitle} でした！\n革新・リベラル: ${liberalRatio}% / 伝統・保守: ${conservativeRatio}%\n\n#ウハサハ脳中メーカー #脳内メーカー\n`;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const styleNames = [
    "パターン1: 円形輪郭 ＋ 中央1文字",
    "パターン2: 円形交互配置",
    "パターン3: 上半分円弧 ＋ 中央文字",
    "パターン4: 左右均等分割配置",
    "パターン5: 全満たし均等配置",
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 flex flex-col items-center">
      <header className="max-w-5xl w-full text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">🧠</span>
          <h1 className="font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight">
            ウハサハ脳中メーカー
          </h1>
        </div>
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          Web閲覧履歴からあなたの脳内・政治思想スタンスを可視化
        </p>
      </header>

      <div className="max-w-5xl w-full mb-6">
        <div className="bg-slate-100 rounded-xl border border-slate-200/80 p-2 text-center min-h-[90px] flex flex-col items-center justify-center overflow-hidden">
          <span className="text-[10px] text-slate-400 font-medium mb-1 block">
            スポンサーリンク
          </span>
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", minHeight: "90px" }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
              脳内＆政治スタンス診断結果
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-3 mb-2">
              {diagnosisTitle}
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
              {descriptionText}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col items-center flex-1 justify-center">
            <h3 className="text-base font-bold text-slate-900 mb-4 w-full border-b pb-2 text-center">
              🧩 あなたの脳内イメージ
            </h3>
            <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden">
              <Image
                src="/head.png"
                alt="頭部シルエット"
                fill
                className="object-contain pointer-events-none"
              />
              <div className="absolute inset-0 select-none font-black flex items-center justify-center">
                {renderPatternByStyle(layoutStyle, isBigH)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3 border-b pb-2">
              📊 政治的・思想的傾向メーター
            </h3>
            <div className="mb-1">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-cyan-600">
                  革新・リベラル ({liberalRatio}%)
                </span>
                <span className="text-amber-600">
                  伝統・保守 ({conservativeRatio}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 flex overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-500"
                  style={{ width: `${liberalRatio}%` }}
                ></div>
                <div
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{ width: `${conservativeRatio}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col items-center flex-1 justify-center">
            <h3 className="text-base font-bold text-slate-900 mb-2 w-full border-b pb-2 text-center">
              🧭 政治・思考スタンスマップ
            </h3>

            <div className="relative w-60 h-60 border-2 border-slate-200 bg-slate-50 rounded-xl mt-2 flex items-center justify-center">
              <div className="absolute w-full h-0.5 bg-slate-300"></div>
              <div className="absolute h-full w-0.5 bg-slate-300"></div>

              <span className="absolute top-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-1">
                理論派
              </span>
              <span className="absolute bottom-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-1">
                社会派
              </span>
              <span className="absolute left-1.5 text-[10px] font-bold text-cyan-600 bg-slate-50 px-1">
                革新・リベラル
              </span>
              <span className="absolute right-1.5 text-[10px] font-bold text-amber-600 bg-slate-50 px-1">
                伝統・保守
              </span>

              <div
                className="absolute w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-500"
                style={{
                  transform: `translate(${xPos}px, ${-yPos}px)`,
                }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* テスト確認モード切替エリア */}
      <div className="max-w-5xl w-full mb-6 text-center">
        <button
          onClick={() => setShowTestMode(!showTestMode)}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2 rounded-xl border border-indigo-200 transition cursor-pointer"
        >
          {showTestMode
            ? "▲ プレビュー一覧を閉じる"
            : "⚙️ 【テスト機能】全5パターン ＋ 巨大Hモードを表示する"}
        </button>

        {showTestMode && (
          <div className="mt-4 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-4">
              🧪 洗練された全脳内パターン一覧
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {/* 超特大「H」 */}
              <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-indigo-600 mb-2">
                  🔥 巨大「H」(5%)
                </span>
                <div className="relative w-36 h-36 flex items-center justify-center border rounded-lg bg-white overflow-hidden">
                  <Image
                    src="/head.png"
                    alt="頭"
                    fill
                    className="object-contain pointer-events-none"
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-black">
                    {renderPatternByStyle(0, true)}
                  </div>
                </div>
              </div>

              {/* 5つの厳選パターン */}
              {styleNames.map((name, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
                >
                  <span className="text-[11px] font-bold text-slate-700 mb-2">
                    {name}
                  </span>
                  <div className="relative w-36 h-36 flex items-center justify-center border rounded-lg bg-white overflow-hidden">
                    <Image
                      src="/head.png"
                      alt="頭"
                      fill
                      className="object-contain pointer-events-none"
                    />
                    <div className="absolute inset-0 flex items-center justify-center font-black">
                      {renderPatternByStyle(idx, false)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* おすすめ本 */}
      <div className="max-w-5xl w-full mb-6">
        <div className="bg-gradient-to-r from-amber-50/60 via-orange-50/60 to-amber-50/60 rounded-2xl p-6 border border-amber-200/60 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-amber-200/80 pb-2">
            <span className="text-xl">📚</span>
            <h3 className="text-base font-bold text-slate-900">
              あなたの思考・スタンスをさらに深める「おすすめの書籍」
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl p-4 border border-slate-100 flex gap-4 shadow-xs"
              >
                <div className="relative w-20 h-28 flex-shrink-0 rounded bg-slate-100 overflow-hidden border border-slate-200 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded mb-1">
                      {book.badge}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs md:text-sm mb-1 line-clamp-1">
                      {book.title}
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-snug line-clamp-2 mb-2">
                      {book.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={book.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] py-1.5 px-2 rounded-md text-center transition flex items-center justify-center shadow-2xs"
                    >
                      Amazon
                    </a>
                    <a
                      href={book.rakutenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] py-1.5 px-2 rounded-md text-center transition flex items-center justify-center shadow-2xs"
                    >
                      楽天
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl w-full text-center mb-6">
        <button
          onClick={handleShare}
          className="w-full sm:w-auto bg-black hover:bg-slate-800 text-white font-bold px-10 py-3.5 rounded-full transition shadow-md text-sm active:scale-95 cursor-pointer"
        >
          𝕏 (Twitter) で診断結果をシェアする
        </button>
      </div>

      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-3 border-b pb-2">
            📋 診断に使用した閲覧履歴 ({historyCount} 件)
          </h3>
          {historyList.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {historyList.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100"
                >
                  <span className="font-medium text-slate-800 truncate max-w-[200px]">
                    {item.title || "(タイトルなし)"}
                  </span>
                  <span className="text-[10px] text-indigo-500 font-mono bg-indigo-50 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                    {item.domain || "domain不明"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-xs">履歴データがありません。</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ResultContent />
    </Suspense>
  );
}
