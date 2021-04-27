let jsonData
let attempts = 0
let success = false
const maxAttempts = 3
const dataUrl = "https://leitos-hospitalares.s3.amazonaws.com/metrics_by_region_latest.json"

document.addEventListener("DOMContentLoaded", function() {
  getDataAndInit()
})

function getDataAndInit() {
  $.getJSON(dataUrl, function(data) {
    console.log(data)
    success = true
    jsonData = data
    init(data, "Brasil")
  }).fail(function(jqxhr, textStatus, error) {
    console.log("Request Failed", textStatus, error)
    attempts += 1
    if (attempts < maxAttempts && success === false) {
      getDataAndInit()
    } else {
      $('#app').html(`<div class="mb2">Houve um problema carregando os dados. Por favor tente novamente mais tarde.</div>`)
    }
  });
}

function init(allData, region) {
  const app = $('#app')
  const data = allData.data[region]
  const latest = data[0]
  const previous = data[1]

  app.html(`
    <!-- Select regiões -->
    ${generateSelect(region)}

    <!-- Dados gerais -->
    <div class="row">
      <div class="col-xs-12">
        <!-- <h2 class="t6 bb">Dados gerais - ${latest.region}</h2> -->
        <h2 class="t6 bb">Dados gerais</h2>
      </div>
    </div>
    <div class="row mt1">
      <div class="col-sm-6 col-xs-12 mt1">
        <h5>Total de estabelecimentos hospitalares</h5>
        <h4 class="t5">${latest.total_hospitals.toLocaleString()}</h4>
      </div>
      <div class="col-sm-6 col-xs-12 mt1">
        <h5>Painel atualizado em</h5>
        <h4 class="t5">${moment(allData.ts_run).format('DD/MM/YYYY hh:mm:ss')}</h4>
      </div>
    </div>

    <!-- Atualização -->
    <div class="row mt4">
      <div class="col-xs-12">
        <h2 class="t6 bb">Atualização dos dados</h2>
      </div>
    </div>
    <div class="row mt1">
      <div class="col-sm-6 col-xs-12 mt1">
        <h5>Estabelecimentos desatualizados há 7 dias ou mais</h5>
        <!--
        <h4 class="t5">${(latest.pct_oudated_7d * 100).toLocaleString('pt-BR', {maximumFractionDigits: 0})}%</h4>
        -->
        ${gaugeChart(latest.pct_oudated_7d, valueChange(latest, previous, 'pct_oudated_7d', false))}
      </div>
      <div class="col-sm-6 col-xs-12 mt1">
        <h5>Estabelecimentos desatualizados há 90 dias ou mais</h5>
        <!--
        <h4 class="t5">${(latest.pct_oudated_90d * 100).toLocaleString('pt-BR', {maximumFractionDigits: 0})}%</h4>
        -->
        ${gaugeChart(latest.pct_oudated_90d, valueChange(latest, previous, 'pct_oudated_90d', false))}
      </div>
    </div>
    <div class="row mt3">
      <div class="col-xs-12">
        <h5>Estabelecimentos desatualizados há 7 dias ou mais - Série histórica</h5>
        <div style="height: 300px;">
          <canvas id="pctOutdatedChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Taxa de ocupação -->
    <div class="row mt4">
      <div class="col-xs-12">
        <h2 class="t6 bb">Taxa de ocupação de UTIs</h2>
      </div>
    </div>
    <div class="row mt1">
      <div class="col-sm-6 col-xs-12 mt1">
        <h5>Estabelecimentos com problemas na taxa de ocupação (acima de 120%)</h5>
        <!--
        <h4 class="t5">${(latest.pct_uti_ocup_gt120 * 100).toLocaleString('pt-BR', {maximumFractionDigits: 0})}%</h4>
        -->
          ${gaugeChart(latest.pct_uti_ocup_gt120, valueChange(latest, previous, 'pct_uti_ocup_gt120', false))}
      </div>
      <div class="col-sm-6 col-xs-12 mt1">
        <h5>Taxa de ocupação atual</h5>
        <h4 class="t5">${(latest.tx_ocup_srag_uti * 100).toLocaleString('pt-BR', {maximumFractionDigits: 0})}% ${valueChange(latest, previous, 'tx_ocup_srag_uti', false)} (Covid)</h4>
        <h4 class="t5">${(latest.tx_ocup_hosp_uti * 100).toLocaleString('pt-BR', {maximumFractionDigits: 0})}% ${valueChange(latest, previous, 'tx_ocup_hosp_uti', false)} (Não-Covid)</h4>
      </div>
    </div>
    <div class="row mt3">
      <div class="col-xs-12">
        <h5>Taxa de ocupação UTIs - Série histórica</h5>
        <div style="height: 300px;">
          <canvas id="occupationRateChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Oferta e ocupação -->
    <div class="row mt4">
      <div class="col-xs-12">
        <h2 class="t6 bb">Oferta e ocupação de leitos de UTI</h2>
      </div>
    </div>
    <div class="row mt1">
      <div class="col-sm-6 col-xs-12 mt1">
        <h5>Leitos de UTI existentes</h5>
        <h4 class="t5">${Math.round(latest.ocup_srag_uti).toLocaleString()} (Covid)</h4>
        <h4 class="t5">${Math.round(latest.ocup_hosp_uti).toLocaleString()} (Não-Covid)</h4>
      </div>
      <div class="col-sm-6 col-xs-12 mt1">
        <h5>Leitos de UTI ocupados</h5>
        <h4 class="t5">${Math.round(latest.oferta_srag_uti).toLocaleString()} (Covid)</h4>
        <h4 class="t5">${Math.round(latest.oferta_hosp_uti).toLocaleString()} (Não-Covid)</h4>
      </div>
    </div>
    <div class="row mt3">
      <div class="col-xs-12">
        <h5>Número de leitos de UTI - Série histórica</h5>
        <div style="height: 300px;">
          <canvas id="numberOfBeds"></canvas>
        </div>
      </div>
    </div>
  `)

  lineChart("pctOutdatedChart",
    data.map(a => moment(a.ts_run).format("DD/MM/YYYY")).reverse(),
    [{
      label: "% desatualizado há 7 dias ou mais",
      data: data.map(a => (Math.round(a.pct_oudated_7d * 1000) / 10)).reverse(),
      fill: false,
      borderColor: "#00cb8d",
      tension: 0.1
    }]
  )

  lineChart("occupationRateChart",
    data.map(a => moment(a.ts_run).format("DD/MM/YYYY")).reverse(),
    [
      {
        label: "% ocupação UTI Covid",
        data: data.map(a => (Math.round(a.tx_ocup_srag_uti * 1000) / 10)).reverse(),
        fill: false,
        borderColor: "#00cb8d",
        tension: 0.1
      },
      {
        label: "% ocupação UTI Não-Covid",
        data: data.map(a => (Math.round(a.tx_ocup_hosp_uti * 1000) / 10)).reverse(),
        fill: false,
        borderColor: "#d01c8b",
        tension: 0.1
      }
    ]
  )

  lineChart("numberOfBeds",
    data.map(a => moment(a.ts_run).format("DD/MM/YYYY")).reverse(),
    [
      {
        label: "Oferta - Total de Leitos UTI (Covid e Não-Covid)",
        data: data.map(a => Math.round(a.oferta_total_uti)).reverse(),
        fill: false,
        borderColor: "#00cb8d",
        tension: 0.1
      },
      {
        label: "Ocupação - Total de Leitos UTI (Covid e Não-Covid)",
        data: data.map(a => Math.round(a.ocup_total_uti)).reverse(),
        fill: false,
        borderColor: '#d01c8b',
        tension: 0.1
      }
    ]
  )

  $("#regionSelect").on("change", function() {
    init(jsonData, this.value)
  })

}

function lineChart(id, labels, datasets) {
  const chartData = {
    labels: labels,
    datasets: datasets,
  };
  const config = {
    type: "line",
    data: chartData,
    options: {
      locale: "pt-BR",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom"
        }
      }
    },
  };
  const chart = new Chart(
    document.getElementById(id),
    config
  );
}

function gaugeChart(value, arrow) {
  return (`
    <div class="sc-gauge mt1">
        <div class="sc-background">
          <div class="sc-percentage" style="--rotation: ${(value * 180)}deg; --background: red;"></div>
          <div class="sc-mask"></div>
          <span class="sc-value">${(value * 100).toLocaleString('pt-BR', {maximumFractionDigits: 0})}%${arrow}</span>
        </div>
        <span class="sc-min">0</span>
        <span class="sc-max">100</span>
    </div>
  `)
}

function valueChange(latest, previous, column, upIsGood) {
  const valLatest = (Math.round(latest[column] * 1000) / 10)
  const valPrevious = (Math.round(previous[column] * 1000) / 10)
  if (valLatest === valPrevious) {
    return "<span></span>"
  } else if (valLatest > valPrevious) {
    return `<span class="${upIsGood ? 'change-good' : 'change-bad'}">&#9650;</span>` // up
  } else if (valLatest < valPrevious) {
    return `<span class="${upIsGood ? 'change-bad' : 'change-good'}">&#9660;</span>` // down
  }
}

function generateSelect(region) {
  const regions = [
    "Brasil",
    "Centro-Oeste",
    "Nordeste",
    "Norte",
    "Sudeste",
    "Sul",
  ]
  const options = regions.map(a => `<option value="${a}" ${a === region ? "selected" : ""}>${a}</option>`)
  return (`<div class="mb2">
    <label>Filtre por região</label>
    <select id="regionSelect">
      ${options.join('\n')}
    </select>
  </div>`)
}
