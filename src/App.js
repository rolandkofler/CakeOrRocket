import React, { useState, useRef, useEffect } from "react";
import * as yaml from "js-yaml";

// Constants
const SCALE = [
  { label: "🍰", value: 1, color: "#e63946" },    // Rot
  { label: "2", value: 2, color: "#f77f00" },     // Orange
  { label: "3", value: 3, color: "#fcbf49" },     // Gelb
  { label: "⚖️", value: 4, color: "#a8dadc" },    // Hellblau
  { label: "5", value: 5, color: "#2a9d8f" },     // Blau
  { label: "6", value: 6, color: "#378d96" },     // Blaugrün
  { label: "🚀", value: 7, color: "#457b9d" }     // Türkis
];

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

function ScaleSelector({ value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        flexWrap: "nowrap",
        overflowX: "auto",
        paddingBottom: "8px"
      }}
    >
      {SCALE.map((s, idx) => (
        <label
          key={idx}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer"
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: s.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              boxShadow: value === idx ? "0 0 0 3px #222 inset" : "none",
              transition: "box-shadow 0.15s"
            }}
          >
            <span
              style={{
                fontSize: "24px",
                color: "#fff",
                fontWeight: "700"
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

// Simple Chart Component with Mean Line
function SimpleChart({ sums, mean }) {
  const maxValue = Math.max(...sums);

  // Berechne die Position der Mean-Linie
  // Skaliere den Mean-Wert von 1-7 zu einer Position innerhalb des Charts (in Prozent)
  const meanLinePosition = ((mean - 1) / 6) * 100; // 1 ist der Mindestwert (Cake), 7 ist der Höchstwert (Rocket)

  return (
    <div style={{
      background: "#fafafa",
      borderRadius: "16px",
      padding: "16px",
      marginBottom: "24px",
      boxShadow: "0 2px 8px rgba(34,34,34,0.07)",
      height: "320px",
      position: "relative" // Wichtig für absolute Positionierung der Mean-Linie
    }}>
      <div style={{ textAlign: "center", marginBottom: "48px", fontWeight: "bold" }}>
        Total Importance by Scale
      </div>

      <div style={{
        display: "flex",
        height: "200px",
        alignItems: "flex-end",
        justifyContent: "space-around",
        position: "relative" // Für die Mean-Linie
      }}>
        {/* Mean Line */}
        <div style={{
          position: "absolute",
          left: `${meanLinePosition}%`,
          bottom: "20px",
          top: "0",
          width: "2px",
          backgroundColor: "#e63946",
          zIndex: "10"
        }}></div>

        {/* Mean Line Label */}
        <div style={{
          position: "absolute",
          left: `${meanLinePosition}%`,
          top: "100px",
          transform: "translateX(-50%)",
          backgroundColor: "#e63946",
          color: "white",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "bold",
          whiteSpace: "nowrap"
        }}>
          Mean: {mean.toFixed(2)}
        </div>

        {sums.map((value, index) => (
          <div key={index} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: `${100/sums.length}%`
          }}>
            <div style={{
              marginBottom: "4px",
              fontSize: "12px",
              color: "#666"
            }}>
              {value}
            </div>
            <div style={{
              width: "30px",
              backgroundColor: SCALE[index].color,
              height: maxValue ? `${(value / maxValue) * 180}px` : "0px",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px"
            }}></div>
            <div style={{
              marginTop: "8px",
              fontSize: "14px",
              textAlign: "center"
            }}>
              {SCALE[index].label}
            </div>
          </div>
        ))}
      </div>

      {/* Mean Value Display */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <div style={{
          fontSize: "10px",
          fontWeight: "bold"
        }}>
          Weighted Mean: <span style={{ color: "#e63946" }}>{mean.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ row, index, handleChange, removeRow, isMobile }) {
  if (isMobile) {
    return (
      <div style={{
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginBottom: "16px",
        position: "relative",
        background: "#fafafa"
      }}>
        <input
          style={{
            width: "100%",
            fontSize: "18px",
            color: "#222",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginBottom: "12px",
            boxSizing: "border-box"
          }}
          value={row.activity}
          onChange={(e) => handleChange(index, "activity", e.target.value)}
          placeholder="Activity"
        />
        <ScaleSelector
          value={row.scale}
          onChange={(idx) => handleChange(index, "scale", idx)}
        />
        <div style={{
          marginTop: "12px",
          display: "flex",
          alignItems: "center"
        }}>
          <label style={{
            marginRight: "8px",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Importance:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={row.importance}
            onChange={(e) => handleChange(index, "importance", Number(e.target.value))}
            style={{
              width: "60px",
              textAlign: "right",
              fontSize: "18px",
              fontWeight: "700",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc"
            }}
          />
          <button
            onClick={() => removeRow(index)}
            style={{
              marginLeft: "auto",
              color: "#e63946",
              background: "none",
              fontWeight: "700",
              fontSize: "20px",
              border: "none",
              cursor: "pointer"
            }}
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <tr style={{ textAlign: "center" }}>
      <td style={{ padding: "8px" }}>
        <input
          value={row.activity}
          onChange={(e) => handleChange(index, "activity", e.target.value)}
          style={{
            width: "160px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }}
          placeholder="Activity"
        />
      </td>
      <td style={{ padding: "8px" }}>
        <ScaleSelector
          value={row.scale}
          onChange={(idx) => handleChange(index, "scale", idx)}
        />
      </td>
      <td style={{ padding: "8px" }}>
        <input
          type="number"
          min="1"
          max="100"
          value={row.importance}
          onChange={(e) => handleChange(index, "importance", Number(e.target.value))}
          style={{
            width: "50px",
            textAlign: "right",
            fontSize: "18px",
            fontWeight: "700",
            padding: "4px"
          }}
        />
      </td>
      <td style={{ padding: "8px" }}>
        <button
          onClick={() => removeRow(index)}
          style={{
            color: "#e63946",
            background: "none",
            fontWeight: "700",
            fontSize: "20px",
            border: "none",
            cursor: "pointer"
          }}
          title="Delete"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

export default function ImprovedApp() {
  const [rows, setRows] = useState(initialRows);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef();

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const handleChange = (i, field, value) => {
    const newRows = [...rows];
    newRows[i][field] = field === "scale" ? Number(value) : value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { activity: "", scale: null, importance: 50 }]);
  };

  const removeRow = (i) => {
    const newRows = [...rows];
    newRows.splice(i, 1);
    setRows(newRows);
  };

  // Calculate sums for each scale
  const sums = Array(7).fill(0);
  rows.forEach((row) => {
    if (row.scale !== null && row.importance) {
      sums[row.scale] += Number(row.importance);
    }
  });

  const mean = weightedMean(rows);

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

  return (
    <div style={{
      maxWidth: "950px",
      margin: "0 auto",
      fontFamily: "Montserrat, Arial, sans-serif",
      padding: "0 16px"
    }}>
      <header style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "32px 0 18px 0"
      }}>
        <h2 style={{
          margin: 0,
          fontWeight: 700,
          fontSize: "2em",
          letterSpacing: "1px"
        }}>
          🍰🚀 Cake or Rocket?
        </h2>
        <sub style={{
          fontSize: "0.8em",
          color: "#aaa"
        }}>
          v0.2
        </sub>
      </header>

      <p style={{
        fontSize: "1.2em",
        fontWeight: 700,
        color: "#222"
      }}>
        <span style={{color: "#e63946"}}>🍰</span> = Consumption,
        <span style={{color: "#457b9d"}}>🚀</span> = Investment
      </p>

      <p style={{
        fontSize: "1.2em",
        fontWeight: 700,
        color: "#222",
        marginBottom: "16px"
      }}>
        Rate your activities on a scale from
        <span style={{color: "#e63946"}}> 🍰 </span>
        to
        <span style={{color: "#457b9d"}}> 🚀 </span>
        and their importance.
      </p>

      <div style={{
        height: "6px",
        width: "100%",
        background: "linear-gradient(90deg, #e63946, #f77f00, #fcbf49, #a8dadc, #457b9d, #378d96, #2a9d8f)",
        borderRadius: "3px",
        marginBottom: "18px"
      }} />

      {isMobile ? (
        <div>
          {rows.map((row, i) => (
            <ActivityRow
              key={i}
              row={row}
              index={i}
              handleChange={handleChange}
              removeRow={removeRow}
              isMobile={true}
            />
          ))}
        </div>
      ) : (
        <div style={{
          width: "100%",
          overflowX: "auto",
          background: "#fafafa",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(34,34,34,0.05)",
          padding: "8px 0",
          marginBottom: "24px"
        }}>
          <table style={{
            width: "100%",
            minWidth: "650px",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "1.05em",
            background: "transparent"
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: "10px 6px",
                  textAlign: "center",
                  background: "#f1c40f",
                  color: "#222",
                  fontWeight: 700,
                  borderBottom: "3px solid #e63946"
                }}>
                  Activity
                </th>
                <th style={{
                  padding: "10px 6px",
                  textAlign: "center",
                  background: "#f1c40f",
                  color: "#222",
                  fontWeight: 700,
                  borderBottom: "3px solid #e63946",
                  minWidth: "280px"
                }}>
                  Scale
                </th>
                <th style={{
                  padding: "10px 6px",
                  textAlign: "center",
                  background: "#f1c40f",
                  color: "#222",
                  fontWeight: 700,
                  borderBottom: "3px solid #e63946"
                }}>
                  Importance<br />(1–100)
                </th>
                <th style={{
                  padding: "10px 6px",
                  textAlign: "center",
                  background: "#f1c40f",
                  color: "#222",
                  fontWeight: 700,
                  borderBottom: "3px solid #e63946"
                }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <ActivityRow
                  key={i}
                  row={row}
                  index={i}
                  handleChange={handleChange}
                  removeRow={removeRow}
                  isMobile={false}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={addRow}
        style={{
          marginBottom: "24px",
          background: "#457b9d",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "4px",
          border: "none",
          fontSize: "1.2em",
          fontWeight: "700",
          cursor: "pointer"
        }}
      >
        + Add Activity
      </button>

      <div style={{
        margin: "24px 0",
        display: "flex",
        gap: "16px"
      }}>
        <button
          onClick={downloadYAML}
          style={{
            background: "#e63946",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "1em",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          ⬇️ Download your Data
        </button>
        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            background: "#e63946",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "1em",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          ⬆️ Upload your Data
        </button>
        <input
          type="file"
          accept=".yaml,.yml,text/yaml"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={uploadYAML}
        />
      </div>

      <SimpleChart sums={sums} mean={mean} />

      <footer style={{
        background: "#fafafa",
        color: "#222",
        borderTop: "2px solid #e63946",
        marginTop: "40px",
        padding: "24px 16px",
        fontSize: "1em",
        lineHeight: 1.6
      }}>
        <strong>Why "Cake or Rocket?"</strong><br />
        This app helps you become more mindful about balancing instant pleasures ("cake") with actions that invest in your future (building the "rocket" that brings you to a better distant future).<br /><br />
        <strong>Expected Benefits:</strong><br />
        Visualize your balance between instant gratification and long-term investment, gain self-awareness, and make more intentional choices. All data stays on your device for maximum privacy.<br /><br />
        <span style={{
          color: "#aaa",
          fontSize: "0.95em"
        }}>
          &copy; {new Date().getFullYear()} Cake or Rocket?
        </span>
      </footer>
    </div>
  );
}