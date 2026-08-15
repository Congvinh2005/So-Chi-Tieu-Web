/**
 * Dynamic Interactive Charts Generator (SVG Donut Chart & Canvas Bar Graph)
 */

/**
 * Renders an SVG Donut chart inside a specified container element with animated legend
 */
function renderDonutChart(containerEl, legendEl, categoryDataTotal, totalExpenseAmount) {
  // Clear containers safely
  containerEl.replaceChildren();
  legendEl.replaceChildren();

  const categories = Object.keys(categoryDataTotal);
  if (categories.length === 0 || totalExpenseAmount <= 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'text-muted text-center padding-lg';
    emptyMsg.textContent = 'Chưa có dữ liệu chi tiêu trong khoảng thời gian này.';
    containerEl.appendChild(emptyMsg);
    return;
  }

  // Calculate slices
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  // Outer group
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("transform", "rotate(-90 100 100)");

  categories.forEach((catName) => {
    const amount = categoryDataTotal[catName];
    const percent = amount / totalExpenseAmount;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;

    const catInfo = getCategoryInfo(catName, 'expense');

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "100");
    circle.setAttribute("cy", "100");
    circle.setAttribute("r", radius.toString());
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", catInfo.color);
    circle.setAttribute("stroke-width", strokeWidth.toString());
    circle.setAttribute("stroke-dasharray", strokeDasharray);
    circle.setAttribute("stroke-dashoffset", strokeDashoffset.toString());
    circle.setAttribute("style", "transition: stroke-width 0.2s ease, opacity 0.2s ease; cursor: pointer;");

    // Tooltip hover effect
    circle.addEventListener('mouseenter', () => {
      circle.setAttribute("stroke-width", (strokeWidth + 4).toString());
    });
    circle.addEventListener('mouseleave', () => {
      circle.setAttribute("stroke-width", strokeWidth.toString());
    });

    g.appendChild(circle);
    accumulatedPercent += percent;

    // Render Legend Item
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';

    const legendLeft = document.createElement('div');
    legendLeft.className = 'legend-left';

    const dot = document.createElement('span');
    dot.className = 'legend-color-dot';
    dot.style.backgroundColor = catInfo.color;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'legend-name';
    nameSpan.textContent = catName;

    legendLeft.appendChild(dot);
    legendLeft.appendChild(nameSpan);

    const legendRight = document.createElement('div');
    legendRight.className = 'legend-right';

    const amountSpan = document.createElement('span');
    amountSpan.className = 'legend-amount';
    amountSpan.textContent = formatVND(amount);

    const pctSpan = document.createElement('span');
    pctSpan.className = 'legend-percent';
    pctSpan.textContent = Math.round(percent * 100) + '%';

    legendRight.appendChild(amountSpan);
    legendRight.appendChild(pctSpan);

    legendItem.appendChild(legendLeft);
    legendItem.appendChild(legendRight);
    legendEl.appendChild(legendItem);
  });

  svg.appendChild(g);

  // Center Text Container
  const centerTextWrapper = document.createElement('div');
  centerTextWrapper.className = 'donut-center-text';

  const labelText = document.createElement('span');
  labelText.className = 'donut-center-label';
  labelText.textContent = 'TỔNG CHI';

  const valueText = document.createElement('span');
  valueText.className = 'donut-center-value';
  valueText.textContent = formatVND(totalExpenseAmount);

  centerTextWrapper.appendChild(labelText);
  centerTextWrapper.appendChild(valueText);

  containerEl.appendChild(svg);
  containerEl.appendChild(centerTextWrapper);
}

/**
 * Renders HTML5 Canvas Bar Chart for daily / monthly trends
 */
function renderBarChart(canvasEl, labels, incomeSeries, expenseSeries) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  
  // Set high DPI canvas resolution
  const rect = canvasEl.parentElement.getBoundingClientRect();
  const width = rect.width || 750;
  const height = 300;

  canvasEl.width = width * 2;
  canvasEl.height = height * 2;
  canvasEl.style.width = width + 'px';
  canvasEl.style.height = height + 'px';

  ctx.scale(2, 2);
  ctx.clearRect(0, 0, width, height);

  if (!labels || labels.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Chưa có dữ liệu biến động thu chi', width / 2, height / 2);
    return;
  }

  // Compute max value for scaling
  const maxVal = Math.max(...incomeSeries, ...expenseSeries, 100000);
  const paddingLeft = 60;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Grid Lines
  const gridCount = 4;
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'right';

  for (let i = 0; i <= gridCount; i++) {
    const yVal = (maxVal / gridCount) * i;
    const yPos = height - paddingBottom - (chartHeight / gridCount) * i;

    ctx.beginPath();
    ctx.moveTo(paddingLeft, yPos);
    ctx.lineTo(width - paddingRight, yPos);
    ctx.stroke();

    // Short format label
    let shortVal = yVal >= 1000000 ? (yVal / 1000000).toFixed(1) + 'M' : (yVal / 1000).toFixed(0) + 'k';
    if (yVal === 0) shortVal = '0';
    ctx.fillText(shortVal, paddingLeft - 8, yPos + 4);
  }

  // Draw Bars
  const barGroupWidth = chartWidth / labels.length;
  const barWidth = Math.max(4, Math.min(16, barGroupWidth * 0.35));

  labels.forEach((label, idx) => {
    const groupX = paddingLeft + idx * barGroupWidth + barGroupWidth / 2;

    const incHeight = (incomeSeries[idx] / maxVal) * chartHeight;
    const expHeight = (expenseSeries[idx] / maxVal) * chartHeight;

    // Income Bar (Green)
    if (incHeight > 0) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(groupX - barWidth - 2, height - paddingBottom - incHeight, barWidth, incHeight, 3);
      ctx.fill();
    }

    // Expense Bar (Red)
    if (expHeight > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(groupX + 2, height - paddingBottom - expHeight, barWidth, expHeight, 3);
      ctx.fill();
    }

    // X-Axis Labels (show subset if too many labels)
    const step = Math.ceil(labels.length / 15);
    if (idx % step === 0 || idx === labels.length - 1) {
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.fillText(label, groupX, height - paddingBottom + 18);
    }
  });
}
