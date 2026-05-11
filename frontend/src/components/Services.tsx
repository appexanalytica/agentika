import { useEffect, useRef } from "react";

type ServiceItem = {
  number: string;
  title: string;
  description: string;
};

const services: ServiceItem[] = [
  {
    number: "01",
    title: "PRODUCTOS DIGITALES",
    description:
      "Construimos software a medida que resuelve problemas reales — aplicaciones, plataformas y sistemas diseñados para durar y crecer con tu negocio.",
  },
  {
    number: "02",
    title: "AGENTES DE INTELIGENCIA ARTIFICIAL",
    description:
      "Diseñamos agentes autónomos que trabajan junto a tu equipo: aprenden, deciden y actúan — para que las personas se enfoquen en lo que solo ellas pueden hacer.",
  },
  {
    number: "03",
    title: "INTEGRACIÓN & AUTOMATIZACIÓN",
    description:
      "Conectamos tus sistemas existentes con inteligencia artificial aplicada, transformando flujos de trabajo manuales en procesos que se mueven solos.",
  },
  {
    number: "04",
    title: "CONSULTORÍA ESTRATÉGICA",
    description:
      "Acompañamos a organizaciones que quieren incorporar IA con claridad: sin promesas vacías, con un camino concreto y criterio humano en cada paso.",
  },
];

const rr = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const Services = () => {
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rafIds: number[] = [];

    const setupCanvas = (canvas: HTMLCanvasElement) => {
      canvas.width = Math.floor(800 * dpr);
      canvas.height = Math.floor(500 * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return ctx;
    };

    const initAnim1 = (canvas: HTMLCanvasElement) => {
      const ctx = setupCanvas(canvas);
      if (!ctx) return () => {};
      const W = 800;
      const H = 500;
      let t = 0;
      const codeLines = [
        { text: "const app = createApp({", color: "#7F77DD" },
        { text: "  components: [Header, Dashboard],", color: "#AFA9EC" },
        { text: "  database: PostgreSQL,", color: "#97C459" },
        { text: "  auth: JWT.verify(token),", color: "#EF9F27" },
        { text: "  api: REST.connect(endpoint),", color: "#AFA9EC" },
        { text: "  scale: cloud.auto(),", color: "#5DCAA5" },
        { text: "  deploy: pipeline.run()", color: "#7F77DD" },
        { text: "});", color: "#AFA9EC" },
        { text: "", color: "#444" },
        { text: "app.listen(3000)", color: "#97C459" },
      ];
      const uiComponents = [
        { x: 450, y: 55, w: 320, h: 52, label: "Header", color: "#534AB7" },
        { x: 450, y: 120, w: 145, h: 175, label: "Sidebar", color: "#3C3489" },
        { x: 606, y: 120, w: 164, h: 75, label: "Dashboard", color: "#26215C" },
        { x: 606, y: 207, w: 78, h: 85, label: "Stats", color: "#26215C" },
        { x: 694, y: 207, w: 76, h: 85, label: "Chart", color: "#26215C" },
        { x: 450, y: 308, w: 320, h: 48, label: "Footer", color: "#1a1840" },
      ];

      const draw = () => {
        t += 0.018;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#0d0c20";
        ctx.fillRect(0, 0, W, H);
        for (let y = 0; y < H; y += 4) {
          ctx.fillStyle = "rgba(0,0,0,0.06)";
          ctx.fillRect(0, y, W, 1);
        }
        ctx.fillStyle = "rgba(127,119,221,0.1)";
        ctx.font = "bold 88px system-ui";
        ctx.fillText("01", 630, H - 20);

        rr(ctx, 18, 35, 400, 365, 12);
        ctx.fillStyle = "#12111f";
        ctx.fill();
        ctx.strokeStyle = "rgba(83,74,183,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        rr(ctx, 18, 35, 400, 28, 12);
        ctx.fillStyle = "#1a1840";
        ctx.fill();
        rr(ctx, 18, 55, 400, 8, 0);
        ctx.fillStyle = "#1a1840";
        ctx.fill();

        ["#F09595", "#EF9F27", "#97C459"].forEach((color, i) => {
          ctx.beginPath();
          ctx.arc(36 + i * 18, 49, 5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });

        ctx.fillStyle = "rgba(127,119,221,0.5)";
        ctx.font = "11px monospace";
        ctx.fillText("app.js", 180, 53);

        const totalChars = codeLines.reduce((acc, line) => acc + line.text.length, 0);
        let typedChars = Math.min(totalChars, Math.floor(t * 3));
        let drawn = 0;

        codeLines.forEach((line, i) => {
          const y = 82 + i * 26;
          ctx.fillStyle = "rgba(127,119,221,0.3)";
          ctx.font = "11px monospace";
          ctx.fillText(String(i + 1).padStart(2, " "), 26, y);
          const visible = line.text.slice(0, Math.max(0, typedChars - drawn));
          ctx.fillStyle = line.color;
          ctx.font = "12px monospace";
          ctx.fillText(visible, 50, y);
          drawn += line.text.length;
        });

        rr(ctx, 18, 412, 400, 58, 10);
        ctx.fillStyle = "#0a0a14";
        ctx.fill();
        ctx.strokeStyle = "rgba(83,74,183,0.2)";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.fillStyle = "#97C459";
        ctx.font = "11px monospace";
        ctx.fillText("▶ Building...", 30, 435);

        const progress = Math.floor(t * 8) % 120;
        ctx.fillStyle = "rgba(83,74,183,0.2)";
        rr(ctx, 30, 442, 280, 9, 4);
        ctx.fill();
        ctx.fillStyle = "#7F77DD";
        const bar = Math.floor((progress / 100) * 280);
        rr(ctx, 30, 442, Math.max(0, bar), 9, 4);
        ctx.fill();
        ctx.fillStyle = "#5DCAA5";
        ctx.fillText(`${progress}%`, 318, 451);

        if (progress > 80) {
          ctx.fillStyle = "#5DCAA5";
          ctx.fillText("✓ Ready in 1.2s", 30, 465);
        }

        uiComponents.forEach((comp, i) => {
          const delay = i * 0.3;
          const appear = Math.min(1, Math.max(0, t * 0.5 - delay));
          const cx = comp.x + comp.w / 2;
          const cy = comp.y + comp.h / 2;
          ctx.save();
          ctx.globalAlpha = appear;
          ctx.translate(cx, cy);
          ctx.scale(0.85 + 0.15 * appear, 0.85 + 0.15 * appear);
          ctx.translate(-cx, -cy);

          rr(ctx, comp.x, comp.y, comp.w, comp.h, 8);
          ctx.fillStyle = comp.color;
          ctx.fill();
          ctx.strokeStyle = `rgba(127,119,221,${0.4 + 0.2 * Math.sin(t + i)})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          if (comp.label === "Dashboard") {
            [0, 1, 2, 3].forEach((j) => {
              const barHeight = 18 + j * 8;
              ctx.fillStyle = `rgba(127,119,221,${0.5 + 0.2 * Math.sin(t * 2 + j)})`;
              rr(ctx, comp.x + 8 + j * 32, comp.y + comp.h - barHeight - 6, 24, barHeight, 3);
              ctx.fill();
            });
          } else if (comp.label === "Stats") {
            ctx.fillStyle = "rgba(93,202,165,0.9)";
            ctx.font = "bold 16px system-ui";
            ctx.textAlign = "center";
            ctx.fillText("98%", cx, cy + 5);
            ctx.textAlign = "left";
          } else if (comp.label === "Chart") {
            ctx.beginPath();
            ctx.moveTo(comp.x + 6, comp.y + comp.h - 14);
            [0, 1, 2, 3, 4].forEach((j) => {
              ctx.lineTo(
                comp.x + 6 + (j * (comp.w - 12)) / 4,
                comp.y + comp.h - 14 - Math.sin(t + j) * 18 - 12,
              );
            });
            ctx.strokeStyle = "rgba(239,159,39,0.9)";
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (comp.label === "Sidebar") {
            [0, 1, 2, 3, 4].forEach((j) => {
              ctx.fillStyle = j === 1 ? "rgba(127,119,221,0.8)" : "rgba(83,74,183,0.4)";
              rr(ctx, comp.x + 8, comp.y + 18 + j * 28, comp.w - 16, 18, 4);
              ctx.fill();
            });
          } else {
            ctx.fillStyle = "rgba(127,119,221,0.6)";
            ctx.font = "500 10px system-ui";
            ctx.textAlign = "center";
            ctx.fillText(comp.label, cx, cy + 4);
            ctx.textAlign = "left";
          }

          ctx.restore();
        });

        if (t > 2) {
          ctx.globalAlpha = Math.min(1, (t - 2) * 0.5) * 0.6;
          ctx.strokeStyle = "#534AB7";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(420, 115);
          ctx.lineTo(450, 115);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(420, 195);
          ctx.lineTo(450, 195);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }

        rafIds[0] = requestAnimationFrame(draw);
      };

      draw();
      return () => cancelAnimationFrame(rafIds[0]);
    };

    const initAnim2 = (canvas: HTMLCanvasElement) => {
      const ctx = setupCanvas(canvas);
      if (!ctx) return () => {};
      const W = 800;
      const H = 500;
      let t = 0;
      const messages = [
        { from: "user", text: "Analiza ventas Q3 y sugiere acciones", delay: 0.5 },
        { from: "agent", text: "Analizando 2.4M registros...", delay: 2, thinking: true },
        { from: "agent", text: "↓ 12% en LATAM. Ajustar precio en MX.", delay: 4 },
        { from: "user", text: "Ejecuta la campaña de retención", delay: 6 },
        { from: "agent", text: "Campaña activa. 8.400 usuarios notificados.", delay: 7.5 },
        { from: "agent", text: "✓ Tasa apertura: 34% — sobre promedio", delay: 9.5 },
      ];
      const tasks = [
        "Procesando datos...",
        "Evaluando opciones...",
        "Ejecutando acción...",
        "Monitoreando resultado...",
        "Aprendiendo patrón...",
      ];
      const cx2 = 590;
      const cy2 = 245;
      const getMetric = (base: number, amp: number, freq: number, off: number) =>
        Math.round(base + amp * Math.sin(t * freq + off));

      const draw = () => {
        t += 0.016;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#020c16";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(24,95,165,0.05)";
        ctx.font = "bold 110px system-ui";
        ctx.fillText("02", 530, H + 10);

        ctx.strokeStyle = "rgba(55,138,221,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(400, 30);
        ctx.lineTo(400, 470);
        ctx.stroke();

        rr(ctx, 18, 28, 365, 438, 14);
        ctx.fillStyle = "#07111d";
        ctx.fill();
        ctx.strokeStyle = "rgba(55,138,221,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        rr(ctx, 18, 28, 365, 42, 14);
        ctx.fillStyle = "#0c1e30";
        ctx.fill();

        rr(ctx, 18, 56, 365, 14, 0);
        ctx.fillStyle = "#0c1e30";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(46, 50, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#185FA5";
        ctx.fill();

        ctx.fillStyle = "#B5D4F4";
        ctx.font = "bold 9px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("AI", 46, 54);
        ctx.textAlign = "left";

        ctx.fillStyle = "#85B7EB";
        ctx.font = "500 12px system-ui";
        ctx.fillText("Agente de Ventas", 64, 47);

        ctx.fillStyle = "rgba(93,202,165,0.9)";
        ctx.font = "10px system-ui";
        ctx.fillText("● activo", 64, 60);

        let msgY = 82;
        messages.forEach((msg) => {
          if (t < msg.delay) return;
          const appear = Math.min(1, (t - msg.delay) * 3);
          ctx.globalAlpha = appear;
          const isUser = msg.from === "user";
          const maxW = 250;
          const pad = 10;
          ctx.font = "11px system-ui";

          const words = msg.text.split(" ");
          const lines: string[] = [];
          let current = "";
          words.forEach((word) => {
            const next = current ? `${current} ${word}` : word;
            if (ctx.measureText(next).width > maxW - pad * 2) {
              lines.push(current);
              current = word;
            } else {
              current = next;
            }
          });
          lines.push(current);

          const height = lines.length * 17 + pad * 2;
          const x = isUser ? 370 - maxW - 8 : 28;

          rr(ctx, x, msgY, maxW, height, 10);
          ctx.fillStyle = isUser ? "#0C447C" : "#0c1e30";
          ctx.fill();
          ctx.strokeStyle = isUser ? "rgba(55,138,221,0.4)" : "rgba(55,138,221,0.2)";
          ctx.lineWidth = 0.8;
          ctx.stroke();

          lines.forEach((line, li) => {
            ctx.fillStyle = isUser ? "#85B7EB" : "#cce4f7";
            if (msg.thinking) ctx.fillStyle = "rgba(133,183,235,0.7)";
            ctx.font = "11px system-ui";
            ctx.fillText(line, x + pad, msgY + pad + 13 + li * 17);
          });

          msgY += height + 8;
          ctx.globalAlpha = 1;
        });

        const glow = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 180);
        glow.addColorStop(0, "rgba(24,95,165,0.08)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.translate(cx2, cy2);
        ctx.rotate(t * 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, 140, 0, Math.PI * 1.6);
        ctx.strokeStyle = "rgba(24,95,165,0.4)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(cx2, cy2);
        ctx.rotate(-t * 0.2);
        ctx.beginPath();
        ctx.arc(0, 0, 115, 0, Math.PI * 1.2);
        ctx.strokeStyle = "rgba(55,138,221,0.3)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();

        tasks.forEach((task, i) => {
          const angle = (i / tasks.length) * Math.PI * 2 + t * 0.25;
          const nx = cx2 + Math.cos(angle) * 140;
          const ny = cy2 + Math.sin(angle) * 140;
          const isActive = i === Math.floor(t * 0.8) % tasks.length;

          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(cx2, cy2);
          ctx.strokeStyle = isActive ? "rgba(55,138,221,0.5)" : "rgba(24,95,165,0.15)";
          ctx.lineWidth = isActive ? 1.5 : 0.5;
          ctx.stroke();

          rr(ctx, nx - 55, ny - 14, 110, 28, 8);
          ctx.fillStyle = isActive ? "#0C447C" : "#06111f";
          ctx.fill();
          ctx.strokeStyle = isActive ? "#378ADD" : "rgba(24,95,165,0.3)";
          ctx.lineWidth = isActive ? 1.5 : 0.8;
          ctx.stroke();

          ctx.fillStyle = isActive ? "#B5D4F4" : "rgba(133,183,235,0.5)";
          ctx.font = `${isActive ? "500" : "400"} 9px system-ui`;
          ctx.textAlign = "center";
          ctx.fillText(task, nx, ny + 4);
          ctx.textAlign = "left";
        });

        ctx.beginPath();
        ctx.arc(cx2, cy2, 52, 0, Math.PI * 2);
        ctx.fillStyle = "#020c16";
        ctx.fill();
        ctx.strokeStyle = "#185FA5";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx2, cy2, 38, 0, Math.PI * 2);
        ctx.fillStyle = "#042C53";
        ctx.fill();

        ctx.strokeStyle = "rgba(55,138,221,0.6)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx2 - 8, cy2 - 5, 14, Math.PI * 0.2, Math.PI * 1.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx2 + 8, cy2 - 5, 14, 0, Math.PI * 0.9);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx2, cy2 - 5);
        ctx.lineTo(cx2, cy2 + 14);
        ctx.stroke();

        [[-12, 8], [0, 16], [12, 8]].forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.arc(cx2 + dx, cy2 + dy, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(55,138,221,0.7)";
          ctx.fill();
        });

        const metrics = [
          { label: "Decisiones/min", val: getMetric(847, 40, 0.8, 0) },
          { label: "Precisión", val: `${getMetric(96, 2, 0.5, 1)}%` },
          { label: "Tareas activas", val: getMetric(12, 3, 1.2, 2) },
        ];

        metrics.forEach((m, i) => {
          const mx = 430 + i * 125;
          const my = 400;
          rr(ctx, mx, my, 115, 58, 10);
          ctx.fillStyle = "#06111f";
          ctx.fill();
          ctx.strokeStyle = "rgba(24,95,165,0.3)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.fillStyle = "rgba(133,183,235,0.5)";
          ctx.font = "9px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(m.label, mx + 57, my + 18);
          ctx.fillStyle = "#85B7EB";
          ctx.font = "bold 18px system-ui";
          ctx.fillText(m.val, mx + 57, my + 42);
          ctx.textAlign = "left";
        });

        rafIds[1] = requestAnimationFrame(draw);
      };
      draw();
      return () => cancelAnimationFrame(rafIds[1]);
    };

    const initAnim3 = (canvas: HTMLCanvasElement) => {
      const ctx = setupCanvas(canvas);
      if (!ctx) return () => {};
      const W = 800;
      const H = 500;
      let t = 0;
      const leftSys = [
        { y: 75, name: "Salesforce", icon: "SF", color: "#1D9E75", sub: "CRM" },
        { y: 200, name: "SAP ERP", icon: "SA", color: "#0F6E56", sub: "ERP" },
        { y: 320, name: "PostgreSQL", icon: "DB", color: "#085041", sub: "Base de datos" },
      ];
      const rightSys = [
        { y: 75, name: "Slack", icon: "SL", color: "#1D9E75", sub: "Notificaciones" },
        { y: 200, name: "Power BI", icon: "BI", color: "#0F6E56", sub: "Reportes" },
        { y: 320, name: "HubSpot", icon: "HS", color: "#085041", sub: "Marketing" },
      ];
      const lanes = Array.from({ length: 6 }, (_, i) => {
        const fromLeft = i < 3;
        const sysIdx = i % 3;
        const particles = Array.from({ length: 4 }, () => ({
          prog: Math.random(),
          speed: 0.003 + Math.random() * 0.002,
          size: 2.5 + Math.random() * 2,
        }));
        return { fromLeft, sysIdx, particles };
      });

      const bez = (t2: number, p0: number, p1: number, p2: number, p3: number) => {
        const mt = 1 - t2;
        return mt * mt * mt * p0 + 3 * mt * mt * t2 * p1 + 3 * mt * t2 * t2 * p2 + t2 * t2 * t2 * p3;
      };

      const drawSys = (sys: { y: number; name: string; icon: string; color: string; sub: string }, x: number) => {
        const bw = 128;
        const bh = 76;
        rr(ctx, x, sys.y, bw, bh, 12);
        ctx.fillStyle = "#04201a";
        ctx.fill();
        ctx.strokeStyle = sys.color;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + 22, sys.y + bh / 2, 15, 0, Math.PI * 2);
        ctx.fillStyle = `${sys.color}33`;
        ctx.fill();
        ctx.strokeStyle = sys.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = sys.color;
        ctx.font = "bold 8px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(sys.icon, x + 22, sys.y + bh / 2 + 3);
        ctx.textAlign = "left";

        ctx.fillStyle = "#9FE1CB";
        ctx.font = "500 11px system-ui";
        ctx.fillText(sys.name, x + 43, sys.y + bh / 2 - 4);

        ctx.fillStyle = "rgba(29,158,117,0.6)";
        ctx.font = "9px system-ui";
        ctx.fillText(sys.sub, x + 43, sys.y + bh / 2 + 11);

        const pulse = 0.6 + 0.4 * Math.sin(t * 2 + sys.y);
        ctx.beginPath();
        ctx.arc(x + bw - 12, sys.y + 12, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(93,202,165,${pulse})`;
        ctx.fill();
      };

      const draw = () => {
        t += 0.016;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#030e09";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(15,110,86,0.04)";
        ctx.font = "bold 110px system-ui";
        ctx.fillText("03", 600, H);

        const hx = 400;
        const hy = 248;
        const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 100);
        glow.addColorStop(0, "rgba(29,158,117,0.1)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        [90, 70, 50].forEach((radius) => {
          ctx.beginPath();
          ctx.arc(hx, hy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(15,110,86,0.2)";
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(t * 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, 82, 0, Math.PI * 1.5);
        ctx.strokeStyle = "rgba(29,158,117,0.5)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();

        lanes.forEach((lane, i) => {
          const sys = lane.fromLeft ? leftSys[lane.sysIdx] : rightSys[lane.sysIdx];
          const sx = lane.fromLeft ? 148 : 652;
          const sy = sys.y + 38;
          const cp1x = lane.fromLeft ? 255 : 545;
          const cp2x = lane.fromLeft ? 325 : 475;

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.bezierCurveTo(cp1x, sy, cp2x, hy, hx, hy);
          ctx.strokeStyle = "rgba(15,110,86,0.22)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          lane.particles.forEach((p) => {
            p.prog += p.speed;
            if (p.prog > 1) p.prog = 0;
            const prog = lane.fromLeft ? p.prog : 1 - p.prog;
            const px = bez(prog, sx, cp1x, cp2x, hx);
            const py = bez(prog, sy, sy, hy, hy);
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(93,202,165,${0.6 + 0.4 * Math.sin(t * 3 + i)})`;
            ctx.fill();

            const tp = Math.max(0, prog - 0.04);
            const tpx = bez(tp, sx, cp1x, cp2x, hx);
            const tpy = bez(tp, sy, sy, hy, hy);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(tpx, tpy);
            ctx.strokeStyle = "rgba(93,202,165,0.3)";
            ctx.lineWidth = p.size;
            ctx.stroke();
          });
        });

        leftSys.forEach((s) => drawSys(s, 20));
        rightSys.forEach((s) => drawSys(s, 652));

        ctx.beginPath();
        ctx.arc(hx, hy, 50, 0, Math.PI * 2);
        ctx.fillStyle = "#04201a";
        ctx.fill();
        ctx.strokeStyle = "#1D9E75";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(hx, hy, 34, 0, Math.PI * 2);
        ctx.fillStyle = "#0F6E56";
        ctx.fill();

        ctx.strokeStyle = "#04201a";
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i += 1) {
          const angle = (i / 8) * Math.PI * 2 + t * 0.6;
          ctx.beginPath();
          ctx.moveTo(hx + Math.cos(angle) * 5, hy + Math.sin(angle) * 5);
          ctx.lineTo(hx + Math.cos(angle) * 12, hy + Math.sin(angle) * 12);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#5DCAA5";
        ctx.fill();

        ctx.fillStyle = "#9FE1CB";
        ctx.font = "500 10px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Integration Hub", hx, hy + 70);

        const events = Math.floor(t * 12) % 1000 + 4000;
        ctx.fillStyle = "rgba(29,158,117,0.6)";
        ctx.font = "9px monospace";
        ctx.fillText(`${events.toLocaleString()} eventos/h`, hx, hy + 85);
        ctx.textAlign = "left";

        rr(ctx, 18, 415, 765, 68, 10);
        ctx.fillStyle = "#020d07";
        ctx.fill();
        ctx.strokeStyle = "rgba(15,110,86,0.3)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        const logs = [
          { time: "12:04:01", msg: "Salesforce → Hub: 142 leads sincronizados" },
          { time: "12:04:03", msg: "Hub → HubSpot: campaña activada (8.2k)" },
          { time: "12:04:05", msg: "SAP → Hub: stock actualizado auto" },
        ];
        const visible = Math.floor(t * 0.8) % logs.length;
        logs.forEach((log, i) => {
          if (i > visible && t < 3) return;
          const x = 28 + i * 252;
          ctx.fillStyle = "rgba(29,158,117,0.5)";
          ctx.font = "8px monospace";
          ctx.fillText(log.time, x, 432);
          ctx.fillStyle = "#5DCAA5";
          ctx.font = "8px system-ui";
          ctx.fillText(`✓ ${log.msg}`, x, 448);
        });

        rafIds[2] = requestAnimationFrame(draw);
      };
      draw();
      return () => cancelAnimationFrame(rafIds[2]);
    };

    const initAnim4 = (canvas: HTMLCanvasElement) => {
      const ctx = setupCanvas(canvas);
      if (!ctx) return () => {};
      const W = 800;
      const H = 500;
      let t = 0;
      const steps = [
        {
          x: 60,
          label: "Diagnóstico",
          num: "01",
          color: "#BA7517",
          tasks: [
            "Auditoría de procesos",
            "Mapeo de sistemas",
            "Entrevistas equipo",
            "Análisis de gaps",
          ],
        },
        {
          x: 240,
          label: "Estrategia",
          num: "02",
          color: "#EF9F27",
          tasks: [
            "Prioridades IA",
            "Roadmap 90 días",
            "KPIs definidos",
            "Quick wins",
          ],
        },
        {
          x: 420,
          label: "Ejecución",
          num: "03",
          color: "#FAC775",
          tasks: [
            "Sprint 1 lanzado",
            "Agente piloto",
            "Métricas live",
            "Ajustes rápidos",
          ],
        },
        {
          x: 600,
          label: "Escala",
          num: "04",
          color: "#EF9F27",
          tasks: [
            "Expansión equipos",
            "Automatización +",
            "ROI demostrado",
            "Nuevos casos",
          ],
        },
      ];
      const kpiData: number[] = [];
      for (let i = 0; i < 20; i++) {
        kpiData.push(0.3 + 0.4 * Math.sin(i * 0.5) + 0.15 * (i % 3 / 3));
      }
      const floats = Array.from({ length: 30 }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.001,
        vy: -0.0005 - Math.random() * 0.001,
        size: 1 + Math.random() * 2,
        life: Math.random(),
      }));

      const draw = () => {
        t += 0.016;
        if (t > 14) t = 0;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#0d0800";
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = "rgba(99,56,6,0.07)";
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        for (let y = 0; y < H; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(99,56,6,0.04)";
        ctx.font = "bold 110px system-ui";
        ctx.fillText("04", 620, H + 10);

        floats.forEach((d) => {
          d.x += d.vx;
          d.y += d.vy;
          d.life -= 0.003;
          if (d.life <= 0 || d.y < 0) {
            d.x = Math.random();
            d.y = 1;
            d.life = 0.5 + Math.random() * 0.5;
          }
          ctx.beginPath();
          ctx.arc(d.x * W, d.y * H, d.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186,117,23,${d.life * 0.35})`;
          ctx.fill();
        });

        const lineY = 200;
        const startX = 60;
        const endX = 740;
        ctx.strokeStyle = "rgba(99,56,6,0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, lineY);
        ctx.lineTo(endX, lineY);
        ctx.stroke();

        const prog = Math.min(1, t * 0.08);
        const progX = startX + (endX - startX) * prog;
        ctx.strokeStyle = "#BA7517";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, lineY);
        ctx.lineTo(progX, lineY);
        ctx.stroke();

        steps.forEach((step) => {
          const sx = step.x + 90;
          const isActive = progX >= sx;
          const isCurrent = Math.abs(progX - sx) < 60;

          ctx.strokeStyle = isActive ? step.color : "rgba(99,56,6,0.3)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(sx, lineY - 16);
          ctx.lineTo(sx, lineY - 60);
          ctx.stroke();
          ctx.setLineDash([]);

          const radius = isCurrent ? 22 + 3 * Math.sin(t * 3) : 20;
          if (isCurrent) {
            ctx.beginPath();
            ctx.arc(sx, lineY, radius + 8, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(186,117,23,0.1)";
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(sx, lineY, radius, 0, Math.PI * 2);
          ctx.fillStyle = isActive ? "#1f1200" : "#100900";
          ctx.fill();
          ctx.strokeStyle = isActive ? step.color : "rgba(99,56,6,0.4)";
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.stroke();

          ctx.fillStyle = isActive ? step.color : "rgba(99,56,6,0.5)";
          ctx.font = "bold 12px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(step.num, sx, lineY + 4);

          ctx.fillStyle = isActive ? "#FAC775" : "rgba(99,56,6,0.6)";
          ctx.font = `${isActive ? "500" : "400"} 10px system-ui`;
          ctx.fillText(step.label, sx, lineY + 38);

          const cardW = 148;
          const cardH = 105;
          const cx2 = sx - cardW / 2;
          const cy2 = lineY - 60 - cardH;
          rr(ctx, cx2, cy2, cardW, cardH, 10);
          ctx.fillStyle = isActive ? "#150e00" : "#0d0800";
          ctx.fill();
          ctx.strokeStyle = isActive ? `${step.color}66` : "rgba(99,56,6,0.2)";
          ctx.lineWidth = isActive ? 1 : 0.5;
          ctx.stroke();

          ctx.fillStyle = isActive ? step.color : "rgba(99,56,6,0.4)";
          ctx.font = "10px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(step.label, sx, cy2 + 16);

          step.tasks.forEach((task, idx) => {
            const appear = isActive
              ? Math.min(1, Math.max(0, (t * 0.08 - (step.x / 180) * 0.25 - idx * 0.06) / 0.06))
              : 0;
            ctx.globalAlpha = appear;
            const ty = cy2 + 28 + idx * 16;
            ctx.strokeStyle = appear > 0.8 ? "#BA7517" : "rgba(99,56,6,0.4)";
            ctx.lineWidth = 0.8;
            rr(ctx, cx2 + 10, ty - 8, 9, 9, 2);
            ctx.stroke();
            if (appear > 0.8) {
              ctx.strokeStyle = "#EF9F27";
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(cx2 + 12, ty - 3);
              ctx.lineTo(cx2 + 15, ty);
              ctx.lineTo(cx2 + 19, ty - 7);
              ctx.stroke();
            }
            ctx.fillStyle = appear > 0.8 ? "rgba(250,199,117,0.8)" : "rgba(99,56,6,0.5)";
            ctx.font = "9px system-ui";
            ctx.textAlign = "left";
            ctx.fillText(task, cx2 + 25, ty);
            ctx.globalAlpha = 1;
          });
        });

        rr(ctx, 625, 262, 150, 105, 12);
        ctx.fillStyle = "#100900";
        ctx.fill();
        ctx.strokeStyle = "rgba(186,117,23,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "rgba(186,117,23,0.6)";
        ctx.font = "500 9px system-ui";
        ctx.fillText("ROI proyectado", 636, 279);

        const pts = kpiData.slice(0, Math.min(20, Math.floor(t * 2)));
        if (pts.length > 1) {
          ctx.beginPath();
          pts.forEach((value, i) => {
            const px = 636 + i * (112 / 19);
            const py = 330 - value * 44;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          });
          ctx.strokeStyle = "#EF9F27";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.lineTo(636 + (pts.length - 1) * (112 / 19), 342);
          ctx.lineTo(636, 342);
          ctx.fillStyle = "rgba(186,117,23,0.1)";
          ctx.fill();
        }

        const roiValue = Math.min(340, Math.floor(t * 20));
        ctx.fillStyle = "#FAC775";
        ctx.font = "bold 20px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(`${roiValue}%`, 700, 300);
        ctx.fillStyle = "rgba(186,117,23,0.6)";
        ctx.font = "9px system-ui";
        ctx.fillText("vs baseline", 700, 313);
        ctx.textAlign = "left";

        rr(ctx, 18, 428, 765, 55, 10);
        ctx.fillStyle = "#100900";
        ctx.fill();
        ctx.strokeStyle = "rgba(99,56,6,0.3)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        const items = [
          "📋 Assessment completo",
          "🗺 Roadmap personalizado",
          "🤝 Sin promesas vacías",
          "🎯 Criterio humano",
          "📊 Métricas claras",
        ];
        items.forEach((item, i) => {
          const appear = Math.min(1, Math.max(0, t - i * 0.4));
          ctx.globalAlpha = appear;
          ctx.fillStyle = "rgba(186,117,23,0.7)";
          ctx.font = "10px system-ui";
          ctx.fillText(item, 28 + i * 146, 462);
          ctx.globalAlpha = 1;
        });

        rafIds[3] = requestAnimationFrame(draw);
      };
      draw();
      return () => cancelAnimationFrame(rafIds[3]);
    };

    const runAnimations = () => {
      canvasRefs.current.forEach((canvas, index) => {
        if (!canvas) return;
        if (index === 0) rafIds[0] = initAnim1(canvas) as unknown as number;
        if (index === 1) rafIds[1] = initAnim2(canvas) as unknown as number;
        if (index === 2) rafIds[2] = initAnim3(canvas) as unknown as number;
        if (index === 3) rafIds[3] = initAnim4(canvas) as unknown as number;
      });
    };

    runAnimations();

    return () => {
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  return (
    <section id="services" className="py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="text-xs uppercase tracking-[0.18em] text-[#b4a0ff]/80">SERVICIOS</span>
            <h3 className="text-5xl md:text-6xl font-semibold leading-tight text-foreground mt-4">
              Lo Que Hacemos
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
            {services.map((service, index) => (
              <div key={service.number} className="rounded-[2rem] border border-border bg-background/40 shadow-2xl overflow-hidden">
                <div className="w-full" style={{ aspectRatio: "16 / 10" }}>
                  <canvas
                    ref={(el) => {
                      if (el) canvasRefs.current[index] = el;
                    }}
                    width={800}
                    height={500}
                    className="block w-full h-auto"
                    aria-hidden="true"
                  />
                </div>
                <div className="p-8">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#b4a0ff]/65 mb-3 block">
                    {service.number}
                  </span>
                  <h4 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
                    {service.title}
                  </h4>
                  <p className="text-base leading-8 text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
