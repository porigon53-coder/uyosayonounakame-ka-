"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Image from "next/image";

// AdSense用の型宣言
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

  // Google AdSense 読み込み初期化
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  // 全9種類の文字マスタ
  const wordMaster: { [key: string]: { text: string; color: string } } = {
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

  // 履歴キーワード解析
  const scores: { [key: string]: number } = {
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
    ) {
      scores.IT += 2;
    }
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
    ) {
      scores.POLITICS += 4;
    }
    if (
      text.includes("youtube") ||
      text.includes("twitter") ||
      text.includes("x.com") ||
      text.includes("instagram") ||
      text.includes("game")
    ) {
      scores.PLAY += 2;
    }
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
    ) {
      scores.FOOD += 3;
    }
    if (
      text.includes("hotel") ||
      text.includes("bed") ||
      text.includes("眠") ||
      text.includes("休")
    ) {
      scores.SLEEP += 3;
    }
    if (text.length % 7 === 0) {
      scores.SECRET += 1;
    }
  });

  const sortedKeys = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const selectedKeys = sortedKeys.slice(0, 4);
  const activeWords = selectedKeys.map((key) => wordMaster[key]);

  // --- MBTI対立軸に基づく前半の判定（8パターン） ---
  const isExtrovert = scores.PLAY + scores.POLITICS > scores.IT + scores.STUDY; // 外向 vs 内向
  const isSensing = scores.FOOD + scores.SLEEP > scores.TECH + scores.KNOWLEDGE; // 感覚 vs 直観
  const isThinking = scores.IT + scores.POLITICS > scores.PLAY + scores.SECRET; // 思考 vs 感情
  const isJudging = scores.STUDY + scores.KNOWLEDGE > scores.PLAY + scores.FOOD; // 判断 vs 知覚

  let titlePrefix = "🧠 『内向的・直観型の";
  if (isExtrovert && isThinking) titlePrefix = "🗣️ 『外向的・思考型の";
  else if (isExtrovert && !isThinking) titlePrefix = "🎉 『外向的・感情型の";
  else if (!isExtrovert && isThinking) titlePrefix = "💻 『内向的・思考型の";
  else if (!isExtrovert && !isThinking) titlePrefix = "🎨 『内向的・感情型の";
  else if (isSensing && isJudging) titlePrefix = "📐 『感覚的・判断型の";
  else if (isSensing && !isJudging) titlePrefix = "🍃 『感覚的・知覚型の";
  else if (!isSensing && isJudging) titlePrefix = "📚 『直観的・判断型の";

  // --- 後半の16パターン判定 ＆ 約100文字の解説文生成 ---
  let titleSuffix = "オールラウンダー脳』";
  let descriptionText =
    "特定のジャンルに偏らず、幅広い領域の情報に触れているバランス重視の頭脳です。多角的な視点から物事を捉え、柔軟に思考を切り替えることができるのが強みです。";

  const top1 = selectedKeys[0];
  const top2 = selectedKeys[1];

  if (
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
  } else if (
    (top1 === "PLAY" && top2 === "SECRET") ||
    (top1 === "SECRET" && top2 === "PLAY")
  ) {
    titleSuffix = "エンタメ散策家』";
    descriptionText =
      "動画やSNS、娯楽関連のサイトを積極的に閲覧しており、感性やトレンドを素早く察知する頭脳です。直感的な面白さや楽しいコンテンツを探索するモチベーションに溢れています。";
  } else if (
    (top1 === "STUDY" && top2 === "KNOWLEDGE") ||
    (top1 === "KNOWLEDGE" && top2 === "STUDY")
  ) {
    titleSuffix = "知識収集コレクター』";
    descriptionText =
      "ドキュメントや解説サイトの参照が多く、新しい教養や知見を絶えず蓄積する探求脳です。深い洞察力で背景を学習し、自身のナレッジを広げることに喜びを感じます。";
  } else if (
    (top1 === "FOOD" && top2 === "SLEEP") ||
    (top1 === "SLEEP" && top2 === "FOOD")
  ) {
    titleSuffix = "マイペース探求者』";
    descriptionText =
      "グルメや生活・休息に関連する検索履歴が多く、自身のQOLや快適さを重視するマイペース頭脳です。心身の充足や自然体のバランスを何よりも大切にしています。";
  } else if (top1 === "POLITICS" || top2 === "STUDY") {
    titleSuffix = "社会派アナリスト』";
    descriptionText =
      "社会問題や学術情報の閲覧が組み合わさっており、制度や構造の深い理解を目指す知的な頭脳です。現実の課題に対して客観的な根拠を持って分析を行う傾向があります。";
  } else if (top1 === "TECH" || top2 === "PLAY") {
    titleSuffix = "デジタルクリエイター』";
    descriptionText =
      "最新技術とエンタメ表現を組み合わせて情報収集するアイデア脳です。創造的なアウトプットや新しい表現技法に対し、常に高い関心とアンテナを張り巡らせています。";
  } else if (top1 === "PLAY" || top2 === "KNOWLEDGE") {
    titleSuffix = "トレンドキャッチャー』";
    descriptionText =
      "雑学やエンタメの情報を幅広く拾い上げ、世の中の流行をすばやくキャッチする頭脳です。旺盛な好奇心で興味の幅を広げ、周囲とのコミュニケーションに活かします。";
  } else if (top1 === "IT" || top2 === "STUDY") {
    titleSuffix = "論理派アーキテクト』";
    descriptionText =
      "プログラミングや学術論文など、厳密な構造を持つ情報を好む理論派頭脳です。体系的な思考を得意とし、物事の本質やルールを筋道立てて構築・解釈していきます。";
  } else if (top1 === "FOOD" || top2 === "KNOWLEDGE") {
    titleSuffix = "生活美学スペシャリスト』";
    descriptionText =
      "食の追求や実用知識の閲覧が多く、日常生活を豊かに彩る智恵に長けた頭脳です。実益とこだわりを兼ね備え、ライフスタイルの質を高めることに思考を傾けます。";
  } else if (top1 === "SECRET" || top2 === "KNOWLEDGE") {
    titleSuffix = "ディープダイバー』";
    descriptionText =
      "ディープな検索履歴や深掘り調査が特徴的で、表面化しないマニアックな知を求める頭脳です。独自の着眼点で誰も気づかない真相や裏情報を探ることに長けています。";
  } else if (top1 === "PLAY" || top2 === "POLITICS") {
    titleSuffix = "アクティブインフルエンサー』";
    descriptionText =
      "SNSでの話題性や政治・社会問題を同時にチェックする発言力溢れる頭脳です。世論の空気感を敏感に捉え、自身の意見やスタンスを外にアピールする力を持っています。";
  } else if (top1 === "SLEEP" || top2 === "IT") {
    titleSuffix = "リラックスストラテジスト』";
    descriptionText =
      "効率的なワークスタイルと十分な休息の双方を追求するスマート思考の頭脳です。無駄なコストを削ぎ落とし、最短距離で成果と安心感を獲得しようと試みます。";
  } else if (top1 === "SECRET" || top2 === "FOOD") {
    titleSuffix = "ナイトライフプロデューサー』";
    descriptionText =
      "本能的な欲求やプライベートの楽しみに素直な人間味溢れる頭脳です。自分の好きな空間や時間を全力で楽しむためのリサーチ力と情熱に長けています。";
  } else if (top1 === "TECH" || top2 === "FOOD") {
    titleSuffix = "マルチジャンルナビゲーター』";
    descriptionText =
      "実用的な技術から趣味・ライフスタイルまで縦横無尽にアクセスするフレキシブル頭脳です。偏りのない視野で日常の利便性を追求する器用さを持っています。";
  }

  const diagnosisTitle = `${titlePrefix}${titleSuffix}`;

  const newsCount = scores.KNOWLEDGE + scores.POLITICS;
  const techCount = scores.IT + scores.TECH;

  const liberalRatio = Math.min(
    85,
    Math.max(15, Math.round(50 + (newsCount - techCount) * 5)),
  );
  const conservativeRatio = 100 - liberalRatio;
  const xPos = Math.min(40, Math.max(-40, (newsCount - techCount) * 8));
  const yPos = Math.min(40, Math.max(-40, (techCount - newsCount) * 8));

  // 80%指定の均一配置レイアウト
  const unifiedLayout = [
    { top: "27%", left: "38%", word: activeWords[0] },
    { top: "33%", left: "33%", word: activeWords[0] },
    { top: "39%", left: "32%", word: activeWords[0] },
    { top: "45%", left: "35%", word: activeWords[0] },
    { top: "51%", left: "38%", word: activeWords[0] },

    { top: "21%", left: "48%", word: activeWords[1] },
    { top: "22%", left: "58%", word: activeWords[1] },
    { top: "27%", left: "48%", word: activeWords[1] },
    { top: "28%", left: "58%", word: activeWords[1] },
    { top: "33%", left: "50%", word: activeWords[1] },

    { top: "26%", left: "68%", word: activeWords[2] },
    { top: "32%", left: "74%", word: activeWords[2] },
    { top: "38%", left: "76%", word: activeWords[2] },
    { top: "44%", left: "73%", word: activeWords[2] },
    { top: "50%", left: "68%", word: activeWords[2] },

    { top: "39%", left: "43%", word: activeWords[3] },
    { top: "40%", left: "60%", word: activeWords[3] },
    { top: "46%", left: "51%", word: activeWords[3] },
    { top: "52%", left: "48%", word: activeWords[3] },
    { top: "53%", left: "58%", word: activeWords[3] },
  ];

  // おすすめ本2冊のデータ
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

  // 𝕏 (Twitter) シェア実行関数
  const handleShare = () => {
    const shareText = `【ウヨサヨ脳中メーカー】\n私のWeb閲覧履歴の分析結果は ${diagnosisTitle} でした！\n革新・リベラル: ${liberalRatio}% / 伝統・保守: ${conservativeRatio}%\n\n#ウヨサヨ脳中メーカー #脳内メーカー\n`;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 flex flex-col items-center">
      {/* 0. 中央配置されたメインタイトルヘッダー */}
      <header className="max-w-5xl w-full text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">🧠</span>
          <h1 className="font-extrabold text-slate-900 text-2xl md:text-3xl tracking-tight">
            ウヨサヨ脳中メーカー
          </h1>
        </div>
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          Web閲覧履歴からあなたの脳内・政治思想スタンスを可視化
        </p>
      </header>

      {/* タイトルのすぐ下：Google 広告表示エリア */}
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

      {/* 4つの主要図（2列グリッド） */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 左カラム：1. 診断結果カード（解説文付き） ＆ 2. 脳内イメージ（顔画像） */}
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
            <div className="relative w-64 h-64 flex items-center justify-center">
              <Image
                src="/head.png"
                alt="頭部シルエット"
                fill
                className="object-contain pointer-events-none"
              />
              <div className="absolute inset-0 select-none font-black">
                {unifiedLayout.map((pos, idx) => (
                  <span
                    key={idx}
                    className={`absolute ${pos.word.color} text-base leading-none transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150`}
                    style={{ top: pos.top, left: pos.left }}
                  >
                    {pos.word.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム：3. メーター ＆ 4. 十字軸マップ */}
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
              🧭 政治・思考スタンスマップ（十字軸）
            </h3>

            <div className="relative w-60 h-60 border-2 border-slate-200 bg-slate-50 rounded-xl mt-2 flex items-center justify-center">
              <div className="absolute w-full h-0.5 bg-slate-300"></div>
              <div className="absolute h-full w-0.5 bg-slate-300"></div>

              <span className="absolute top-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-1">
                テック・理論派
              </span>
              <span className="absolute bottom-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-1">
                ニュース・社会派
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

      {/* 4つの図の下：画像付きおすすめ本アフィリエイト枠 */}
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

      {/* 本の直下：𝕏 (Twitter) シェアボタン */}
      <div className="max-w-5xl w-full text-center mb-6">
        <button
          onClick={handleShare}
          className="w-full sm:w-auto bg-black hover:bg-slate-800 text-white font-bold px-10 py-3.5 rounded-full transition shadow-md text-sm active:scale-95"
        >
          𝕏 (Twitter) で診断結果をシェアする
        </button>
      </div>

      {/* 閲覧履歴一覧エリア */}
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
