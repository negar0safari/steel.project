// مشخصات پروفیل ها
const profileProperties = {
  // IPB ستون ها
  IPB240: { I: 0.0000389, E: 2.1e8 },
  IPB220: { I: 0.0000306, E: 2.1e8 },
  IPB300: { I: 0.000083, E: 2.1e8 },
  IPB400: { I: 0.000231, E: 2.1e8 },
  IPB450: { I: 0.000337, E: 2.1e8 },

  // IPE تیرها
  IPE140: { I: 0.00000541, E: 2.1e8 },
  IPE180: { I: 0.00001317, E: 2.1e8 },
  IPE240: { I: 0.00003892, E: 2.1e8 },
  IPE300: { I: 0.00008356, E: 2.1e8 },
  IPE330: { I: 0.0001177, E: 2.1e8 },
  IPE450: { I: 0.0003374, E: 2.1e8 },
};

// داده های ساختمان
const buildingFloors = [
  {
    name: 'طبقه 4',
    columns: [
      { profile: 'IPB240', L: 3.0 },
      { profile: 'IPB240', L: 3.0 },
      { profile: 'IPB240', L: 3.0 },
    ],
    beams: [
      { profile: 'IPE180', L: 4.0 },
      { profile: 'IPE180', L: 5.0 },
      { profile: 'IPE240', L: 1.5 },
    ],
  },
  {
    name: 'طبقه 3',
    columns: [
      { profile: 'IPB240', L: 3.0 },
      { profile: 'IPB400', L: 3.0 },
      { profile: 'IPB400', L: 3.0 },
    ],
    beams: [
      { profile: 'IPE330', L: 4.0 },
      { profile: 'IPE330', L: 5.0 },
      { profile: 'IPE330', L: 1.5 },
    ],
  },
  {
    name: 'طبقه 2',
    columns: [
      { profile: 'IPB300', L: 3.0 },
      { profile: 'IPB400', L: 3.0 },
      { profile: 'IPB400', L: 3.0 },
    ],
    beams: [
      { profile: 'IPE300', L: 4.0 },
      { profile: 'IPE300', L: 4.0 },
      { profile: 'IPE450', L: 1.5 },
    ],
  },
  {
    name: 'طبقه 1',
    columns: [
      { profile: 'IPB400', L: 5.0 },
      { profile: 'IPB450', L: 5.0 },
      { profile: 'IPB450', L: 5.0 },
    ],
    beams: [
      { profile: 'IPE140', L: 4.0 },
      { profile: 'IPE180', L: 5.0 },
      { profile: 'IPE180', L: 1.5 },
    ],
  },
];

// تابع محاسبه ضریب K بر اساس فرمول داده شده
function calculateKFactor(GT) {
  const GB = 1; // طبق فرض مسئله

  const numerator = 3 * GB * GT + 1.4 * (GT + GB) + 1.64;
  const denominator = 3 * GT * GB + 2 * (GT + GB) + 1.28;

  return numerator / denominator;
}

// تابع محاسبه ضرایب سختی
function calculateStiffnessFactors(floors) {
  const results = [];

  floors.forEach((floor) => {
    // محاسبه Σ(Ic/Lc) برای ستون‌ها
    let sumColumnStiffness = 0;
    floor.columns.forEach((col) => {
      const prop = profileProperties[col.profile];
      const stiffness = (prop.I * prop.E) / col.L;
      sumColumnStiffness += stiffness;
    });

    // محاسبه Σ(Ib/Lb) برای تیرها
    let sumBeamStiffness = 0;
    floor.beams.forEach((beam) => {
      const prop = profileProperties[beam.profile];
      const stiffness = (prop.I * prop.E) / beam.L;
      sumBeamStiffness += stiffness;
    });

    // محاسبه ضریب سختی G
    const G =
      sumBeamStiffness > 0 ? sumColumnStiffness / sumBeamStiffness : Infinity;

    // محاسبه ضریب K
    const K = calculateKFactor(G);

    results.push({
      floor: floor.name,
      sumColumnStiffness: sumColumnStiffness,
      sumBeamStiffness: sumBeamStiffness,
      G: G,
      K: K,
    });
  });

  return results;
}

// تابع نمایش نتایج در جدول
function displayResults() {
  const stiffnessResults = calculateStiffnessFactors(buildingFloors); //محاسبات رو انجام بده و نتایج رو ذخیره کن
  const resultsBody = document.getElementById('results-body');
  const detailsContainer = document.getElementById('details-container');

  // پاک کردن محتوای قبلی
  resultsBody.innerHTML = '';
  detailsContainer.innerHTML = '';

  // متغیرهای برای محاسبه آمار
  let totalG = 0;
  let totalK = 0;
  let maxG = 0;
  let minG = Infinity;

  // نمایش نتایج کلی
  stiffnessResults.forEach((result) => {
    const row = document.createElement('tr'); //'tr' → مخفف Table Row (سطر جدول)

    row.innerHTML = `
            <td class="floor-name">${result.floor}</td>
            <td>${result.sumColumnStiffness.toFixed(2)}</td>
            <td>${result.sumBeamStiffness.toFixed(2)}</td>
            <td class="g-value">${result.G.toFixed(4)}</td>
            <td class="k-value">${result.K.toFixed(4)}</td>
        `;

    resultsBody.appendChild(row); //سطر جدید رو به جدول اضافه کن

    // محاسبه آمار
    totalG += result.G;
    totalK += result.K;
    if (result.G > maxG) maxG = result.G;
    if (result.G < minG) minG = result.G;
  });

  // نمایش آمار
  document.getElementById('avg-g').textContent = (
    totalG / stiffnessResults.length
  ) //مجموع Gها تقسیم بر تعداد طبقات
    .toFixed(4);
  document.getElementById('avg-k').textContent = (
    totalK / stiffnessResults.length
  ).toFixed(4);
  document.getElementById('max-g').textContent = maxG.toFixed(4);
  document.getElementById('min-g').textContent = minG.toFixed(4);

  // نمایش جزئیات هر طبقه
  buildingFloors.forEach((floor, index) => {
    const floorDetail = document.createElement('div');
    floorDetail.className = 'floor-details';

    let columnsHTML = ''; //معنی: دو متغیر خالی برای ذخیره HTML ستون‌ها و تیرها ایجاد کن
    let beamsHTML = '';

    // جزئیات ستون‌ها
    floor.columns.forEach((col, colIndex) => {
      const prop = profileProperties[col.profile]; //"مشخصات فنی پروفیل این ستون را از دفترچه مشخصات پیدا کن"

      const colStiffness = (prop.I * prop.E) / col.L;
      columnsHTML += `
                <tr>
                    <td>ستون ${colIndex + 1}</td>
                    <td>${col.profile}</td>
                    <td>${col.L} متر</td>
                    <td>${colStiffness.toFixed(2)}</td>
                </tr>
            `;
    });

    // جزئیات تیرها
    floor.beams.forEach((beam, beamIndex) => {
      const prop = profileProperties[beam.profile];
      const beamStiffness = (prop.I * prop.E) / beam.L;
      beamsHTML += `
                <tr>
                    <td>تیر ${beamIndex + 1}</td>
                    <td>${beam.profile}</td>
                    <td>${beam.L} متر</td>
                    <td>${beamStiffness.toFixed(2)}</td>
                </tr>
            `;
    });

    floorDetail.innerHTML = `
            <h3>${floor.name}</h3>
            <h4>ستون‌ها:</h4>
            <table class="details-table">
                <thead>
                    <tr>
                        <th>عنصر</th>
                        <th>پروفیل</th>
                        <th>طول (متر)</th>
                        <th>مقدار سختی</th>
                    </tr>
                </thead>
                <tbody>
                    ${columnsHTML}
                </tbody>
            </table>
            
            <h4>تیرها:</h4>
            <table class="details-table">
                <thead>
                    <tr>
                        <th>عنصر</th>
                        <th>پروفیل</th>
                        <th>طول (متر)</th>
                        <th>مقدار سختی</th>
                    </tr>
                </thead>
                <tbody>
                    ${beamsHTML}
                </tbody>
            </table>
        `;

    detailsContainer.appendChild(floorDetail);
  });
}

// اجرای تابع هنگام بارگذاری صفحه
document.addEventListener('DOMContentLoaded', displayResults);
