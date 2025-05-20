import React, { useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import * as yaml from "js-yaml";

Chart.register(annotationPlugin);

const SCALE = [
  { label: "🍰", value: 1, color: "#e63946" },    // Rot
  { label: "2", value: 2, color: "#f77f00" },     // Orange
  { label: "3", value: 3, color: "#fcbf49" },     // Gelb
  { label: "⚖️", value: 4, color: "#a8dadc" },    // Hellblau
  { label: "5", value: 5, color: "#2a9d8f" },     // Blau
  { label: "6", value: 6, color: "#378d96" },     // Blaugrün (perfekter Übergang)
  { label: "🚀", value: 7, color: "#457b9d" }     // Türkis
]


const initialRows = [
  { activity: "Running", scale: 3, importance: 70 },
  { activity: "Eating a 🥐😋", scale: 0, importance: 40 },
  { activity: "🪥🦷 Brushing my teeth", scale: 6, importance: 90 },
  { activity: "Filing taxes", scale: 6, importance: 80 },
  { activity: "Reading a novel", scale: 2, importance: 60 },
  { activity: "Watching Netflix", scale: 0, importance: 30 },
  { activity: "Cooking a healthy meal", scale: 4, importance: 50 },
  { activity: "Meditating", scale: 3, importance: 40 },
  { activity: "Calling a friend", scale: 2, importance: 50 },
  { activity: "Learning a new skill", scale: 5, importance: 100 },
];

function weightedMean(data) {
  let total = 0, weighted = 0;
  data.forEach((row) => {
    if (row.scale !== null && row.importance) {
      total += Number(row.importance);
      weighted += Number(row.importance) * SCALE[row.scale].value;
    }
  });
  return total ? weighted / total : 0;
}

function ScaleSelector({ value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        flexWrap: "nowrap", // Kein Umbruch!
        //overflowX: "auto",  // Horizontal scrollen, wenn nötig
        WebkitOverflowScrolling: "touch", // Für sanftes Scrollen auf iOS
        paddingBottom: 8, // Platz für Scrollbar auf mobilen Geräten
        scrollbarWidth: "thin" // Dünnere Scrollbar in Firefox
      }}
    >
      {SCALE.map((s, idx) => (
        <label
          key={idx}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
           // minWidth: 40,
           // flex: "1" // Verhindert, dass die Buttons schrumpfen
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: s.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              boxShadow: value === idx ? "0 0 0 3px #222 inset" : "none",
              transition: "box-shadow 0.15s"
            }}
          >
            <span
              style={{
                fontSize: 24,
                color: "#fff",
                fontWeight: 700,
                fontFamily: "Montserrat, Arial, sans-serif"
              }}
            >
              {isNaN(Number(s.label)) ? (
                <span style={{ fontFamily: "monospace" }}>{s.label}</span>
              ) : (
                s.label
              )}
            </span>
          </div>
          <input
            type="radio"
            name="scale"
            checked={value === idx}
            onChange={() => onChange(idx)}
            style={{ display: "none" }}
          />
        </label>
      ))}
    </div>
  );
}


export default function App() {
  const [rows, setRows] = useState(initialRows);
  const fileInputRef = useRef();

  const downloadYAML = () => {
    const yamlStr = yaml.dump(rows, { sortKeys: false, lineWidth: 80 });
    const blob = new Blob([yamlStr], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activities.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadYAML = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const loaded = yaml.load(evt.target.result);
        if (Array.isArray(loaded)) setRows(loaded);
        else alert("Invalid YAML format!");
      } catch (err) {
        alert("Could not parse YAML: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (i, field, value) => {
    const newRows = [...rows];
    newRows[i][field] = field === "scale" ? Number(value) : value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { activity: "", scale: null, importance: 1 }]);
  };

  const removeRow = (i) => {
    const newRows = [...rows];
    newRows.splice(i, 1);
    setRows(newRows);
  };

  const sums = Array(7).fill(0);
  rows.forEach((row) => {
    if (row.scale !== null && row.importance) {
      sums[row.scale] += Number(row.importance);
    }
  });

  const mean = weightedMean(rows);

  const chartData = {
    labels: SCALE.map((s) => `${s.label} (${s.value})`),
    datasets: [
      {
        label: "Total Importance",
        data: sums,
        backgroundColor: SCALE.map(s => s.color),
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      annotation: {
        annotations: {
          meanLine: {
            type: "line",
            xMin: mean - 1,
            xMax: mean - 1,
            borderColor: "#e63946",
            borderWidth: 3,
            label: {
              content: `Weighted Mean: ${mean.toFixed(2)}`,
              enabled: true,
              position: "start",
              backgroundColor: "#fff",
              color: "#e63946",
              font: { weight: "bold", size: 14 },
            },
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Scale (Consumption to Investment)" },
        grid: { color: "#eee" },
        ticks: { color: "#222", font: { family: "Montserrat" } }
      },
      y: {
        title: { display: true, text: "Total Importance" },
        beginAtZero: true,
        grid: { color: "#eee" },
        ticks: { color: "#222", font: { family: "Montserrat" } }
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ maxWidth: 950, margin: "0 auto", fontFamily: "Montserrat, Arial, sans-serif" }}>
      <header style={{display: "flex", alignItems: "center", gap: 12, margin: "32px 0 18px 0"}}>
        <h2 style={{margin: 0, fontWeight: 700, fontSize: "2em", letterSpacing: "1px"}}>🍰🚀 Cake or Rocket?</h2>
        <sub style={{fontSize: "0.8em", color: "#aaa"}}>v0.1</sub>
      </header>
        <p style={{fontSize: "1.2em", fontWeight: 700, color: "#222"}}><span style={{color: "#e63946"}}>🍰</span> = Consumption, <span style={{color: "#457b9d"}}>🚀</span> = Investment</p>
        <p style={{fontSize: "1.2em", fontWeight: 700, color: "#222"}}>Rate your activities on a scale from <span style={{color: "#e63946"}}>🍰</span> to <span style={{color: "#457b9d"}}>🚀</span> and their importance from 1 to 100.</p>
      <div style={{
  height: 6,
  width: "100%",
  background: "linear-gradient(90deg, #e63946, #f77f00, #fcbf49, #a8dadc, #457b9d, #378d96, #2a9d8f)",
  borderRadius: 3,
  marginBottom: 18
}} />
      <div className="responsive-table-container">
        <table>
          <thead>
            <tr>
              <th>Activity</th>
              <th style={{minWidth: 280}}>Scale</th>
              <th>Importance<br />(1–100)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
  {rows.map((row, i) => {
    // Mobile: Card-Layout
    if (window.innerWidth <= 700 || false) {
      return (
        <tr key={i}>
          <td colSpan={4} style={{ padding: 0, border: "none" }}>

            <div className="activity-card" style={{ padding: 16, border: "1px solid #ccc", borderRadius: 8, marginBottom: 16 }}>
              <input
                className="activity-card activity-input" style={{ width: "100%", fontSize: "1.2em", color: "#222", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                value={row.activity}
                onChange={(e) => handleChange(i, "activity", e.target.value)}
                placeholder="Activity"
              />
              <ScaleSelector style={{ padding: 10 }}
                value={row.scale}
                onChange={(idx) => handleChange(i, "scale", idx)}
              />
              <input style={{ width: "10%", fontSize: "1.2em", color: "#222", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                className="importance-input"
                type="number"
                min="1"
                max="100"
                value={row.importance}
                onChange={(e) => handleChange(i, "importance", Number(e.target.value))}
                placeholder="Importance (1–100)"
              />
              <button style={{ color: "#e63946", background: "none", fontWeight: 700, fontSize: "1.2em" }}
                className="delete-btn"
                onClick={() => removeRow(i)}
                title="Delete"
              >
                ✕
              </button>
            </div>
          </td>
        </tr>
      );
    }
    // Desktop: Tabellenzeile
    return (
      <tr key={i} style={{ textAlign: "center" }}>
        <td>
          <input
            value={row.activity}
            onChange={(e) => handleChange(i, "activity", e.target.value)}
            style={{
              width: 160,
              fontSize: "1em",
              color: "#222",
              padding: 10,
              borderRadius: 4,
              border: "1px solid #ccc"
            }}
            placeholder="Activity"
          />
        </td>
        <td>
          <ScaleSelector
            value={row.scale}
            onChange={(idx) => handleChange(i, "scale", idx)}
          />
        </td>
        <td>
          <input
            type="number"
            min="1"
            max="100"
            value={row.importance}
            onChange={(e) => handleChange(i, "importance", Number(e.target.value))}
            style={{
              width: 50,
              textAlign: "right",
              fontSize: "1.2em",
              fontWeight: 700,
              color: "#222"
            }}
          />
        </td>
        <td>
          <button
            onClick={() => removeRow(i)}
            style={{
              color: "#e63946",
              background: "none",
              fontWeight: 700,
              fontSize: "1.2em"
            }}
            title="Delete"
          >
            ✕
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>
      <button onClick={addRow} style={{ marginBottom: 24, background: "#457b9d", color: "#fff", padding: "8px 16px", borderRadius: 4, border: "none", fontSize: "1.2em", fontWeight: 700, cursor: "pointer" }}>
        + Add Activity
      </button>
      <div style={{ margin: "24px 0", display: "flex", gap: 16 }}>
        <button onClick={downloadYAML}>⬇️ Download your Data</button>
        <button onClick={() => fileInputRef.current.click()}>⬆️ Upload your Data</button>
        <input
          type="file"
          accept=".yaml,.yml,text/yaml"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={uploadYAML}
        />
      </div>
      <div className="chart-container" style={{ height: 320 }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
      <p style={{fontSize: "1.2em", fontWeight: 700, color: "#222"}}>
        Weighted Mean: <span style={{color: "#e63946"}}>{mean.toFixed(2)}</span>
      </p>

      <footer style={{
  background: "#fafafa",
  color: "#222",
  borderTop: "2px solid #e63946",
  marginTop: 40,
  padding: "24px 16px",
  fontSize: "1em",
  lineHeight: 1.6,
  fontFamily: "Montserrat, Arial, sans-serif"
}}>
  <strong>Why “Cake or Rocket?”</strong><br />
  The app “Cake or Rocket?” was created to help people become more mindful about how they spend their time and energy-balancing instant pleasures (“cake”) with actions that invest in their future (building the “rocket” that brings you to a better distant future).<br /><br />
  <strong>What benefit to expect:</strong><br />
  Visualize your balance between instant gratification and long-term investment, gain self-awareness, and make more intentional choices. All data stays on your device for maximum privacy.<br /><br />
  <span style={{color:"#aaa", fontSize:"0.95em"}}>
    &copy; {new Date().getFullYear()} Cake or Rocket?
  </span>
</footer>

    </div>
  );
}

