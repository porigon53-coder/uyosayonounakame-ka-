// 1. 直近1,000件の履歴を取得
chrome.history.search({ text: "", maxResults: 1000 }, (results) => {
  if (!results || results.length === 0) {
    alert("閲覧履歴が見つかりませんでした。");
    return;
  }

  // 2. 配列をランダムにシャッフル (フィッシャー–イェーツのシャッフル)
  const shuffled = [...results];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 3. シャッフルされた中から上位30件を抽出
  const selectedItems = shuffled.slice(0, 30).map((item) => {
    let domain = "";
    try {
      domain = new URL(item.url).hostname;
    } catch (e) {
      domain = "";
    }
    return {
      title: item.title || "",
      domain: domain,
    };
  });

  // 4. データ化して結果ページへ遷移
  const jsonString = JSON.stringify(selectedItems);
  const encodedData = encodeURIComponent(jsonString);
  const targetUrl = `http://localhost:3000/result?data=${encodedData}`;

  chrome.tabs.create({ url: targetUrl });
});
