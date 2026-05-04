---
layout: post
title: "Economics of a Megawatt of AI Data Center: What the Numbers Really Reveal"
date: 2026-05-03
categories: [AI Data Centers, Data Center Economics, Power Infrastructure, CapEx OpEx Analysis, Workload Modeling]
excerpt: One MW of AI capacity costs roughly $59M upfront and can generate $15M–$30M+ in annual revenue with remarkably low opex. But what do the technical details — from rack density to power architecture — actually mean for real-world profitability?
---
**Posted by Ampere Development Team**

What if we paused the hype cycles and simply asked: **How much does it really cost — and earn — to stand up one megawatt of AI data center capacity?**

Recent granular breakdowns from operators like Crusoe (shared by CEO Lochmiller in April 2025) give us a rare, precise look at the unit economics. The numbers are striking — and they raise as many fascinating questions as they answer.

### CapEx Breakdown: Where the Money Actually Goes

Building one MW of developed AI capacity costs approximately **$59 million** in total upfront capital.

- **IT Load (≈50%)**: ~$30 million  
  This covers the GPUs, CPUs, networking fabric, storage arrays, and associated compute hardware. In today’s AI clusters, a single high-density rack can draw 50–100+ kW (versus 5–10 kW in traditional enterprise racks). That means one MW might support only 10–20 racks of bleeding-edge inference or training hardware.

- **Infrastructure & Power Delivery (≈50%)**: ~$29 million  
  This includes the building/shell, on-site generation or grid tie-ins, cooling systems (liquid or hybrid), substations, transformers, switchgear, cabling, and backup systems. Power delivery infrastructure is especially capital-intensive because AI workloads demand extremely high reliability and density. Transformers alone can represent a multi-million-dollar line item, with lead times stretching 3–5 years for large units.

One curiosity that stands out: the split is nearly 50/50 between compute hardware and everything else. In other words, **the physical plant is just as expensive as the GPUs themselves**.

### Revenue Potential: Infrastructure vs. Full Stack

Revenue models vary widely depending on whether the operator is leasing raw capacity or offering managed/cloud services.

- **Pure Infrastructure Lease / IaaS Layer**: ~$15 million per MW annually.  
  This is the base “rent the MW” model — hyperscalers or colo providers paying for power and space.

- **Higher-Value Managed Services / Cloud Layer**: Can add another **$15 million+ per MW** (sometimes significantly more), depending on utilization, SLAs, managed operations, and value-added services.

In well-optimized facilities running at high utilization, total revenue per MW can therefore exceed **$30 million per year**.

### OpEx Reality: Surprisingly Lean

Annual operating expenses are remarkably contained at **$1–1.1 million per MW**.

- The dominant component is power (electricity + cooling).
- Maintenance, staffing, and other overheads make up the balance.

This low opex is what makes the model so attractive: **net revenue per MW can exceed $1 million annually on the pure infrastructure layer alone**, with strong margins when higher-value services are layered on top.

### Payback and ROI: The Compelling Math

At these numbers, the payback on infrastructure alone is roughly **4 years** — attractive even in today’s capital environment. Adding managed services revenue can shorten that timeline dramatically.

But here’s where curiosity kicks in: these figures assume high utilization, stable power pricing, and successful commissioning. What happens when utilization dips to 70%? Or when transformer delays push back go-live by 12–18 months? The economics remain strong, but they are sensitive to execution.

### Technical Levers That Move the Numbers

Several technical realities directly influence these per-MW economics:

- **Power Architecture Choices**: Native 800 V DC delivery (as pursued by some fuel-cell and SST providers) can cut conversion losses dramatically compared with traditional AC-to-DC chains. Every percentage point of efficiency gained at the rack level compounds across thousands of racks.
- **Cooling Efficiency**: Liquid cooling versus air can reduce both power and water consumption, directly lowering opex. In high-density AI racks, thermal management can consume 30–40% of total power.
- **Load Bank Validation**: Rigorous commissioning with medium-voltage load banks (5–34.5 kV, multi-MW) is essential to confirm that the designed economics hold under real loads. Step-loading tests and full-system validation help catch issues before live IT equipment is at risk.
- **Microgrid Integration**: On-site generation (gas engines + BESS) can reduce grid dependency and enable peak shaving, improving both cost and resilience metrics.

### Why This Matters in 2026

AI compute demand continues to scale rapidly, and the per-MW model shows why well-capitalized players remain bullish. Strong margins, reasonable payback periods, and clear paths to higher-value revenue make these projects compelling.

At the same time, the numbers highlight the importance of execution: securing long-lead electrical components, optimizing commissioning with load banks, and accurately forecasting workload via physical metrics (rack density, tap-box counts in red zones) are what separate high-return projects from those that struggle.

The AI data center boom isn’t just about GPUs — it’s about mastering the physics and economics of delivering reliable, high-density power at scale. The operators who get the granular details right will capture the biggest share of the upside.

What stands out most to you in these numbers — the low opex, the power delivery challenges, or the revenue potential?

*— Reported based on operator disclosures, industry benchmarks, and commissioning data, May 2026*