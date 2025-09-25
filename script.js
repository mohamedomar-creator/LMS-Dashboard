/*-------------------------------------------------------
  script.js
  - English labels
  - Chart.js v3 compatible
  - Filters, multi-selects, table render, charts
--------------------------------------------------------*/

// sample pharmacists data (English version). Replace or fetch from API/JSON later.
const pharmacistsData = [
  { name: "Ahmed Al-Otaibi", city: "Riyadh", district: "King Fahd", supervisor: "Dr. Sarah Abdullah", completion: 95, status: "Completed", dateCompleted: "2024-09-15" },
  { name: "Fatima Al-Qahtani", city: "Jeddah", district: "Al-Balad", supervisor: "Dr. Mohammed Hassan", completion: 78, status: "In Progress", dateCompleted: "2024-09-20" },
  { name: "Mohammed Al-Shammari", city: "Dammam", district: "Al-Khobar", supervisor: "Dr. Nadia Mohammed", completion: 45, status: "Pending", dateCompleted: "2024-09-18" },
  { name: "Nour Al-Ghamdi", city: "Riyadh", district: "Olaya", supervisor: "Dr. Sarah Abdullah", completion: 100, status: "Completed", dateCompleted: "2024-09-12" },
  { name: "Laila Al-Maliki", city: "Mecca", district: "Aziziyah", supervisor: "Dr. Ahmed Salem", completion: 62, status: "In Progress", dateCompleted: "2024-09-22" },
  { name: "Amr Al-Harbi", city: "Taif", district: "Shahar", supervisor: "Dr. Nadia Mohammed", completion: 30, status: "Pending", dateCompleted: "2024-09-19" },
  { name: "Khalid Al-Saud", city: "Jeddah", district: "Al-Rawdah", supervisor: "Dr. Mohammed Hassan", completion: 88, status: "Completed", dateCompleted: "2024-09-14" },
  { name: "Abeer Al-Dosari", city: "Al-Kharj", district: "Center", supervisor: "Dr. Sarah Abdullah", completion: 72, status: "In Progress", dateCompleted: "2024-09-21" },
  { name: "Yousef Al-Naeimi", city: "Abha", district: "Al-Munsik", supervisor: "Dr. Khalid Omar", completion: 91, status: "Completed", dateCompleted: "2024-09-16" },
  { name: "Rana Al-Enezi", city: "Tabuk", district: "Al-Rawdah", supervisor: "Dr. Fahd Rashed", completion: 55, status: "In Progress", dateCompleted: "2024-09-23" }
];

// runtime state
let filteredData = [...pharmacistsData];
let selectedCities = [];
let selectedSupervisors = [];
let selectedDistricts = [];

// Chart instances
let performanceChart, citiesChart, supervisorsChart, districtsChart, pharmacistsChart, statusPieChart;

/* Utilities */
function toDateOnlyString(d) {
  // return YYYY-MM-DD for safe comparison
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/*---------------------------
  1) Animate counters
----------------------------*/
function animateCounter(elementId, targetValue) {
  const el = document.getElementById(elementId);
  const startValue = parseInt(el.textContent) || 0;
  const step = targetValue > startValue ? 1 : -1;
  let cur = startValue;
  const timer = setInterval(() => {
    cur += step;
    el.textContent = cur;
    if (cur === targetValue) clearInterval(timer);
  }, 20);
}

/*---------------------------
  2) Render table rows
----------------------------*/
function displayData(data) {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';
  data.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>${escapeHtml(p.city)}</td>
      <td>${escapeHtml(p.district)}</td>
      <td>${escapeHtml(p.supervisor)}</td>
      <td>
        <div class="progress-bar"><div class="progress-fill" style="width:${p.completion}%"></div></div>
        <small><strong>${p.completion}%</strong></small>
      </td>
      <td>
        <span class="status-badge ${p.status === 'Completed' ? 'status-completed' : p.status === 'In Progress' ? 'status-inprogress' : 'status-pending'}">
          ${escapeHtml(p.status)}
        </span>
      </td>
      <td>${toDateOnlyString(p.dateCompleted)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function escapeHtml(text) {
  return (text + '').replace(/[&<>"'`]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[s]));
}

/*---------------------------
  3) Multi-select setup
----------------------------*/
function setupMultiSelect(containerId, dropdownId, selectedId, options, selectedArray) {
  const container = document.getElementById(containerId);
  const dropdown = document.getElementById(dropdownId);
  const selectedContainer = document.getElementById(selectedId);
  const trigger = container.querySelector('.search-input') || container.querySelector('#' + containerId + 'Trigger') || container.querySelector('div');

  // populate
  dropdown.innerHTML = '';
  options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'multi-select-option';
    div.innerHTML = `<input type="checkbox" id="${containerId}_${opt}" value="${opt}" /><label for="${containerId}_${opt}">${opt}</label>`;
    dropdown.appendChild(div);
  });

  // toggle
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  // change
  dropdown.addEventListener('change', (e) => {
    if (e.target && e.target.type === 'checkbox') {
      const val = e.target.value;
      if (e.target.checked) {
        if (!selectedArray.includes(val)) selectedArray.push(val);
      } else {
        const idx = selectedArray.indexOf(val);
        if (idx > -1) selectedArray.splice(idx, 1);
      }
      updateSelectedItems(selectedContainer, selectedArray);
      applyFilters();
    }
  });

  // click outside closes dropdown
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) dropdown.style.display = 'none';
  });
}

/* update selected items UI */
function updateSelectedItems(container, selectedArray) {
  container.innerHTML = '';
  selectedArray.forEach(item => {
    const span = document.createElement('span');
    span.className = 'selected-item';
    span.innerHTML = `${item} <span class="remove-item" data-value="${item}">×</span>`;
    container.appendChild(span);
  });

  // remove click handling
  container.querySelectorAll('.remove-item').forEach(el => {
    el.addEventListener('click', (ev) => {
      const val = ev.target.getAttribute('data-value');
      const idx = selectedArray.indexOf(val);
      if (idx > -1) selectedArray.splice(idx, 1);
      // uncheck checkbox if exists
      const checkbox = document.getElementById(container.closest('.multi-select')?.id + '_' + val);
      if (checkbox) checkbox.checked = false;
      updateSelectedItems(container, selectedArray);
      applyFilters();
    });
  });
}

/*---------------------------
  4) Filters logic
----------------------------*/
function applyFilters() {
  const searchTerm = (document.getElementById('pharmacistSearch').value || '').toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;

  filteredData = pharmacistsData.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm);
    const matchesStatus = !statusFilter || p.status === statusFilter;
    const matchesCity = selectedCities.length === 0 || selectedCities.includes(p.city);
    const matchesSupervisor = selectedSupervisors.length === 0 || selectedSupervisors.includes(p.supervisor);
    const matchesDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(p.district);

    let matchesDate = true;
    if (dateFrom || dateTo) {
      const pd = toDateOnlyString(p.dateCompleted);
      if (dateFrom && pd < dateFrom) matchesDate = false;
      if (dateTo && pd > dateTo) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesCity && matchesSupervisor && matchesDistrict && matchesDate;
  });

  displayData(filteredData);
  updateStats();
  updateAllCharts();
}

/*---------------------------
  5) Stats
----------------------------*/
function updateStats() {
  const completed = filteredData.filter(p => p.status === 'Completed').length;
  const inprogress = filteredData.filter(p => p.status === 'In Progress').length;
  const pending = filteredData.filter(p => p.status === 'Pending').length;
  const avg = filteredData.length > 0 ? Math.round(filteredData.reduce((s,p) => s + p.completion, 0) / filteredData.length) : 0;

  animateCounter('completedCount', completed);
  animateCounter('inProgressCount', inprogress);
  animateCounter('pendingCount', pending);
  document.getElementById('averageRate').textContent = avg + '%';
}

/*---------------------------
  6) Charts: helpers + creation
----------------------------*/
function createCitiesChart() {
  const ctx = document.getElementById('citiesChart').getContext('2d');
  const cityStats = {};
  const citiesToShow = selectedCities.length > 0 ? selectedCities : Array.from(new Set(filteredData.map(p => p.city)));

  citiesToShow.forEach(city => {
    const cData = filteredData.filter(p => p.city === city);
    if (cData.length) {
      cityStats[city] = {
        avg: Math.round(cData.reduce((s,p) => s + p.completion, 0) / cData.length),
        count: cData.length,
        completed: cData.filter(p => p.status === 'Completed').length
      };
    }
  });

  const labels = Object.keys(cityStats);
  const avgs = labels.map(l => cityStats[l].avg);
  const counts = labels.map(l => cityStats[l].count);

  if (citiesChart) citiesChart.destroy();

  citiesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Average Completion (%)',
          data: avgs,
          backgroundColor: 'rgba(0,102,204,0.85)',
          borderColor: 'rgba(0,102,204,1)',
          yAxisID: 'y'
        },
        {
          label: 'Number of Pharmacists',
          data: counts,
          backgroundColor: 'rgba(40,167,69,0.85)',
          borderColor: 'rgba(40,167,69,1)',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive:true,
      plugins:{ legend:{ labels:{ font:{ family:'Segoe UI' } } }, tooltip:{
        callbacks:{
          afterLabel:function(ctx){
            if (ctx.datasetIndex === 0) {
              return `Completed count: ${cityStats[ctx.label].completed}`;
            }
          }
        }
      }},
      scales: {
        y: { type:'linear', display:true, position:'left', beginAtZero:true, max:100, title:{ display:true, text:'Completion (%)' } },
        y1: { type:'linear', display:true, position:'right', beginAtZero:true, title:{ display:true, text:'Count' }, grid:{ drawOnChartArea:false } }
      }
    }
  });
}

function createSupervisorsChart() {
  const ctx = document.getElementById('supervisorsChart').getContext('2d');
  const supervisorStats = {};
  const supervisorsToShow = selectedSupervisors.length > 0 ? selectedSupervisors : Array.from(new Set(filteredData.map(p => p.supervisor)));

  supervisorsToShow.forEach(sup => {
    const sData = filteredData.filter(p => p.supervisor === sup);
    if (sData.length) {
      supervisorStats[sup] = {
        avg: Math.round(sData.reduce((s,p) => s + p.completion, 0) / sData.length),
        count: sData.length
      };
    }
  });

  const labels = Object.keys(supervisorStats).map(l => l.replace(/^Dr\.?\s*/i,''));
  const avgs = Object.keys(supervisorStats).map(s => supervisorStats[s].avg);

  if (supervisorsChart) supervisorsChart.destroy();

  supervisorsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Average Completion (%)',
        data: avgs,
        backgroundColor: [
          'rgba(255,99,132,0.85)','rgba(54,162,235,0.85)','rgba(255,205,86,0.85)',
          'rgba(75,192,192,0.85)','rgba(153,102,255,0.85)','rgba(255,159,64,0.85)'
        ],
        borderWidth:2
      }]
    },
    options: {
      responsive:true,
      indexAxis:'y',
      plugins:{ legend:{ labels:{ font:{ family:'Segoe UI' } } }, tooltip:{
        callbacks:{
          afterLabel:function(ctx){
            const supName = Object.keys(supervisorStats)[ctx.dataIndex];
            return `Pharmacists: ${supervisorStats[supName].count}`;
          }
        }
      }},
      scales:{ x:{ beginAtZero:true, max:100, title:{ display:true, text:'Completion (%)' } } }
    }
  });
}

function createDistrictsChart() {
  const ctx = document.getElementById('districtsChart').getContext('2d');
  const districtStats = {};
  const districtsToShow = selectedDistricts.length > 0 ? selectedDistricts : Array.from(new Set(filteredData.map(p => p.district)));

  districtsToShow.forEach(d => {
    const dData = filteredData.filter(p => p.district === d);
    if (dData.length) {
      districtStats[d] = { avg: Math.round(dData.reduce((s,p) => s + p.completion, 0) / dData.length) };
    }
  });

  const labels = Object.keys(districtStats);
  const avgs = labels.map(l => districtStats[l].avg);

  if (districtsChart) districtsChart.destroy();

  districtsChart = new Chart(ctx, {
    type: 'radar',
    data: { labels, datasets: [{ label:'Average Completion (%)', data: avgs, backgroundColor:'rgba(0,102,204,0.18)', borderColor:'rgba(0,102,204,1)', pointBackgroundColor:'rgba(0,102,204,1)', borderWidth:2 }] },
    options: {
      responsive:true,
      scales: {
        r: { beginAtZero:true, max:100, ticks:{ callback: v => v + '%' } }
      },
      plugins:{ legend:{ labels:{ font:{ family:'Segoe UI' } } } }
    }
  });
}

function createPharmacistsChart() {
  const ctx = document.getElementById('pharmacistsChart').getContext('2d');
  const sorted = filteredData.slice().sort((a,b) => b.completion - a.completion).slice(0,10);
  const labels = sorted.map(p => p.name.split(' ').slice(0,2).join(' '));
  const data = sorted.map(p => p.completion);

  const colors = sorted.map((p,i) => {
    const ratio = (sorted.length - i) / sorted.length;
    const r = Math.round(255 * (1 - ratio));
    const g = Math.round(255 * ratio);
    return `rgba(${r},${g},0,0.85)`;
  });

  if (pharmacistsChart) pharmacistsChart.destroy();

  pharmacistsChart = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{ label:'Completion (%)', data, backgroundColor:colors, borderColor:colors.map(c => c.replace('0.85','1')), borderWidth:1 }] },
    options:{
      responsive:true,
      plugins:{
        legend:{ display:false },
        tooltip:{ callbacks:{
          title: ctx => sorted[ctx[0].dataIndex].name,
          afterLabel: ctx => {
            const p = sorted[ctx.dataIndex];
            return [`City: ${p.city}`, `Supervisor: ${p.supervisor}`, `Status: ${p.status}`];
          }
        }}
      },
      scales:{ x:{ ticks:{ maxRotation:45, minRotation:45 } }, y:{ beginAtZero:true, max:100, title:{ display:true, text:'Completion (%)' } } }
    }
  });
}

function createStatusPieChart() {
  const ctx = document.getElementById('statusPieChart').getContext('2d');
  const completed = filteredData.filter(p => p.status === 'Completed').length;
  const inprogress = filteredData.filter(p => p.status === 'In Progress').length;
  const pending = filteredData.filter(p => p.status === 'Pending').length;

  if (statusPieChart) statusPieChart.destroy();

  statusPieChart = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:['Completed','In Progress','Pending'],
      datasets:[{
        data:[completed, inprogress, pending],
        backgroundColor:['rgba(40,167,69,0.85)','rgba(255,193,7,0.85)','rgba(220,53,69,0.85)'],
        borderColor:['rgba(40,167,69,1)','rgba(255,193,7,1)','rgba(220,53,69,1)'],
        borderWidth:2
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{ position:'bottom', labels:{ font:{ family:'Segoe UI', size:13 }, padding:12 } },
        tooltip:{ callbacks:{ label: ctx => {
          const total = ctx.dataset.data.reduce((s,v) => s + v, 0);
          const percentage = total ? Math.round((ctx.parsed / total) * 100) : 0;
          return `${ctx.label}: ${ctx.parsed} (${percentage}%)`;
        }}}
      }
    }
  });
}

/* Performance line chart (30 days) */
function createPerformanceChart() {
  const ctx = document.getElementById('performanceChart').getContext('2d');

  // build last-30-days labels
  const labels = [];
  const values = [];
  for (let i=30;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateOnlyString(d);
    labels.push(key);
    const dayData = filteredData.filter(p => toDateOnlyString(p.dateCompleted) === key);
    const avg = dayData.length ? Math.round(dayData.reduce((s,p) => s + p.completion, 0) / dayData.length) : Math.round(Math.random() * 25 + 60);
    values.push(avg);
  }

  if (performanceChart) performanceChart.destroy();

  performanceChart = new Chart(ctx, {
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Daily Completion Rate (%)',
        data: values,
        borderColor:'#0066cc',
        backgroundColor:'rgba(0,102,204,0.12)',
        tension:0.35,
        fill:true
      }]
    },
    options:{
      responsive:true,
      plugins:{ legend:{ labels:{ font:{ family:'Segoe UI' } } } },
      scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback: v => v + '%' } } }
    }
  });
}

/* update all charts helper */
function createComparisonCharts() {
  createCitiesChart(); createSupervisorsChart(); createDistrictsChart(); createPharmacistsChart(); createStatusPieChart();
}
function updateAllCharts() {
  // update only performance if exists else create
  if (performanceChart) {
    // compute new values and update
    const labels = [];
    const values = [];
    for (let i=30;i>=0;i--){
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateOnlyString(d);
      labels.push(key);
      const dayData = filteredData.filter(p => toDateOnlyString(p.dateCompleted) === key);
      const avg = dayData.length ? Math.round(dayData.reduce((s,p) => s + p.completion, 0) / dayData.length) : Math.round(Math.random() * 25 + 60);
      values.push(avg);
    }
    performanceChart.data.labels = labels;
    performanceChart.data.datasets[0].data = values;
    performanceChart.update();
  } else {
    createPerformanceChart();
  }

  // always recreate comparisons (safe)
  createComparisonCharts();
}

/*---------------------------
  7) Clear filters
----------------------------*/
function clearAllFilters() {
  document.getElementById('pharmacistSearch').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('dateFrom').value = '';
  document.getElementById('dateTo').value = '';

  selectedCities.length = 0;
  selectedSupervisors.length = 0;
  selectedDistricts.length = 0;

  updateSelectedItems(document.getElementById('selectedCities'), selectedCities);
  updateSelectedItems(document.getElementById('selectedSupervisors'), selectedSupervisors);
  updateSelectedItems(document.getElementById('selectedDistricts'), selectedDistricts);

  // uncheck checkboxes if any
  document.querySelectorAll('.multi-select-dropdown input[type="checkbox"]').forEach(cb => cb.checked = false);

  applyFilters();
}

/*---------------------------
  8) Initialize filters & UI
----------------------------*/
function initializeFilters() {
  const cities = Array.from(new Set(pharmacistsData.map(p => p.city)));
  const supervisors = Array.from(new Set(pharmacistsData.map(p => p.supervisor)));
  const districts = Array.from(new Set(pharmacistsData.map(p => p.district)));

  setupMultiSelect('cityMultiSelect','cityDropdown','selectedCities', cities, selectedCities);
  setupMultiSelect('supervisorMultiSelect','supervisorDropdown','selectedSupervisors', supervisors, selectedSupervisors);
  setupMultiSelect('districtMultiSelect','districtDropdown','selectedDistricts', districts, selectedDistricts);
}

/*---------------------------
  9) Load data (simulate)
----------------------------*/
function loadData() {
  setTimeout(() => {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('dataTable').style.display = 'table';

    // initial render
    displayData(pharmacistsData);
    updateStats();
    initializeFilters();
    createPerformanceChart();
    createComparisonCharts();

    // wire events
    document.getElementById('pharmacistSearch').addEventListener('input', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('dateFrom').addEventListener('change', applyFilters);
    document.getElementById('dateTo').addEventListener('change', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);

  }, 900); // simulate loading
}

/* start app */
loadData();

/*---------------------------
  Note: To use real external data:
    - Replace pharmacistsData with fetch('data.json').then(r=>r.json()).then(data=> { pharmacistsData = data; filteredData = [...data]; loadData(); })
    - When fetching from Google Sheets export CSV, use PapaParse or convert CSV to JSON first.
----------------------------*/
