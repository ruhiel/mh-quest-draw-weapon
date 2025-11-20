// 画面表示時に4行追加
window.onload = function () {
  for (let i = 0; i < 4; i++) {
    addRow();
  }
};

function addRow() {
  const table = document.getElementById('hunterTable');
  const row = document.createElement('tr');

  let html = `
    <td class="hunter_name">
      <button class="delBtn" onclick="deleteRow(this)">×</button>
      <input type="text" placeholder="ハンター名" style="width:200px;">
    </td>
  `;

  for (let i = 0; i < 14; i++) {
    html += '<td><input type="checkbox"></td>';
  }

  row.innerHTML = html;
  table.appendChild(row);
}

function deleteRow(button) {
  const row = button.closest('tr');
  row.remove();
}
// ---- PT編成（武器は空欄） ----
function createParty() {
  const rows = Array.from(document.querySelectorAll('#hunterTable tr')).slice(1);
  const members = rows.map(row => ({ name: row.children[0].querySelector('input').value.trim() }));

  const resultBox = document.getElementById('partyResult');
  resultBox.innerHTML = "";

  if (members.length === 0) {
    resultBox.textContent = "ハンターがいません";
    return;
  }

  // ランダムシャッフル
  for (let i = members.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [members[i], members[j]] = [members[j], members[i]];
  }

  const parties = [];
  let remaining = members.slice();

  while (remaining.length > 0) {
    let groupSize;

    if (remaining.length > 8) groupSize = 4; // 多いときは4人
    else if (remaining.length === 7) groupSize = 4; // 7人 → 4+3
    else if (remaining.length === 6) groupSize = 3; // 6人 → 3+3
    else if (remaining.length === 5) groupSize = 3; // 5人 → 3+2
    else groupSize = remaining.length;          // 残り4人以下はその人数

    parties.push(remaining.slice(0, groupSize));
    remaining = remaining.slice(groupSize);
  }

  // 表形式で描画（武器は空欄）
  let html = "";
  parties.forEach((pt, idx) => {
    html += `<h3>PT${idx + 1}</h3>`;
    html += `<table border="1" style="border-collapse: collapse; margin-bottom:20px;">
               <tr><th class="hunter_name">名前</th><th>武器</th></tr>`;
    pt.forEach(member => {
      html += `<tr><td>${member.name}</td><td class="weapon-cell"></td></tr>`;
    });
    html += `</table>`;
  });

  resultBox.innerHTML = html;
}
// ---- 抽選：モンスター1体 + メンバーにチェック済み武器からランダム付与 ----
function randomDraw() {
  const monsterText = document.querySelector("textarea").value.trim();
  const monsterList = monsterText.split("\n").map(m => m.trim()).filter(m => m);

  if (monsterList.length === 0) {
    alert("モンスターが未入力です");
    return;
  }

  // モンスターをランダム選択
  const monster = monsterList[Math.floor(Math.random() * monsterList.length)];
  document.getElementById("monsterDisplay").textContent = "【討伐対象】 " + monster;

  // 武器アイコン対応配列
  const weaponIcons = [
    "img/great-sword_ic.png",
    "img/long-sword_ic.png",
    "img/sword-and-shield_ic.png",
    "img/dual-blades_ic.png",
    "img/hammer_ic.png",
    "img/hunting-horn_ic.png",
    "img/lance_ic.png",
    "img/gunlance_ic.png",
    "img/switch-axe_ic.png",
    "img/charge-blade_ic.png",
    "img/insect-glaive_ic.png",
    "img/light-bowgun_ic.png",
    "img/heavy-bowgun_ic.png",
    "img/bow_ic.png"
  ];

  const resultTables = document.querySelectorAll("#partyResult table");
  resultTables.forEach(table => {
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, idx) => {
      if (idx === 0) return; // ヘッダー
      const name = row.children[0].textContent.trim();
      const weaponCell = row.children[1];
      weaponCell.innerHTML = "";

      // hunterTableからその人のチェック済み武器を取得
      const hunterRows = document.querySelectorAll("#hunterTable tr");
      let weaponList = [];
      hunterRows.forEach(hRow => {
        const hName = hRow.children[0].querySelector('input')?.value.trim();
        if (hName === name) {
          const checks = hRow.querySelectorAll('td:nth-child(n+2) input');
          checks.forEach((chk, i) => {
            if (chk.checked) weaponList.push(i); // 列番号を保存
          });
        }
      });

      if (weaponList.length === 0) {
        weaponCell.textContent = "なし";
        return;
      }

      // ランダムで1つ選択してアイコン表示
      const pick = weaponList[Math.floor(Math.random() * weaponList.length)];
      const img = document.createElement("img");
      img.src = weaponIcons[pick];
      img.alt = "武器";
      img.width = 30;
      weaponCell.appendChild(img);
    });
  });
}
// エクスポート
function exportData() {
  const rows = document.querySelectorAll("#hunterTable tr");
  const data = [];

  rows.forEach((row, idx) => {
    if (idx === 0) return; // ヘッダー除外
    const name = row.querySelector("td.hunter_name input")?.value || "";

    const checks = Array.from(row.querySelectorAll("td input[type=checkbox]"))
      .map(chk => chk.checked);

    data.push({
      name: name,
      weapons: checks
    });
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "hunter_data.json";
  a.click();
  URL.revokeObjectURL(url);
}


// インポート
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const json = JSON.parse(e.target.result);

    const table = document.getElementById("hunterTable");
    table.querySelectorAll("tr:not(:first-child)").forEach(tr => tr.remove());

    json.forEach(item => {
      addRow();
      const lastRow = table.lastElementChild;

      lastRow.querySelector("td.hunter_name input").value = item.name;

      const checks = lastRow.querySelectorAll("td input[type=checkbox]");
      item.weapons.forEach((val, i) => {
        if (checks[i]) checks[i].checked = val;
      });
    });

    alert("インポート完了！");
  };

  reader.readAsText(file);
}