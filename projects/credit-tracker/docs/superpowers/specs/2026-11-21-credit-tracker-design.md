# Design Doc — Credit Tracker (CS KMITL)
วันที่: 2026-11-21

## Intent & Why
นักศึกษา CS KMITL (ปัจจุบันปี 3) ต้องการเช็คว่าเรียนไปกี่หน่วยกิตแล้ว ยังขาดวิชาไหน และจะจบตามหลักสูตรได้หรือเปล่า — โดยไม่ต้องนับมือเอง

## Goals
- Upload PDF Transcript ของ KMITL แล้วแสดง dashboard ทันที
- แสดงความคืบหน้าแต่ละหมวดวิชา (progress bar)
- แสดงวิชาที่ยังขาด + สรุปว่าจะจบได้ไหม
- จำผล parse ล่าสุดด้วย localStorage

## Non-Goals
- ไม่รองรับหลักสูตรอื่น (เฉพาะ CS KMITL 2564)
- ไม่มี backend หรือ server ใดๆ
- ไม่ส่งข้อมูลออกอินเทอร์เน็ต

## Anti-Goals
- ถ้า parse PDF ผิดพลาดบางวิชา ห้าม silent fail — ต้องแจ้งให้ผู้ใช้รู้

## Approaches Considered
| แนวทาง | สรุป | ตัดสินใจ |
|--------|------|----------|
| A: Browser-only pdf.js | parse ใน browser 100% แต่ต้อง upload ทุกครั้ง | ไม่เลือก |
| B: Static JSON | ง่ายแต่อัปเดตยาก | ไม่เลือก |
| **C: Hybrid (เลือก)** | pdf.js parse + localStorage cache | **เลือก** |

## Technical Design

### โครงสร้างข้อมูลสำคัญ

**Transcript Course Object:**
```json
{ "code": "05506003", "title": "PROGRAMMING FUNDAMENTALS", "credits": 3, "grade": "C+", "semester": "1st Semester, Year, 2024-2025" }
```

**Curriculum Course Object (ฝังใน app.js):**
```json
{ "code": "05506003", "titleTH": "การเขียนโปรแกรมขั้นพื้นฐาน", "credits": 3, "year_sem": "ชั้นปี 1 ภาคเรียนที่ 1", "category": "วิชาบังคับ CS" }
```

### Curriculum Structure (CS KMITL 2564) — ทั้งหมด 135 หน่วยกิต
| หมวด | หน่วยกิต |
|------|---------|
| หมวดวิชาศึกษาทั่วไป | 30 |
| วิชาบังคับ คณิตศาสตร์/สถิติ | 18 |
| วิชาบังคับ CS | 57 |
| วิชาเลือก | 18 |
| การศึกษาทางเลือก (ปัญหาพิเศษ/สหกิจ) | 6 |
| วิชาเลือกเสรี | 6 |

> **Builder note:** วิชาเลือก 18 น. และวิชาศึกษาทั่วไป 30 น. ส่วนหนึ่งต้อง infer จาก code prefix (90xxxxxx = ทั่วไป) ส่วนที่เหลือ (วิชาเลือก CS groups) ใช้ code 05506xxx ที่ไม่อยู่ใน mandatory list

### PDF Parsing (pdf.js CDN)
- ใช้ `pdfjsLib.getDocument()` อ่านไฟล์ที่ upload
- Extract text ทุก page → join เป็น string
- Regex pattern สำหรับ KMITL transcript:
  - Course line: `^(\d{8})\s+(.+?)\s+(\d)\s+([A-Z][+-]?|S|F)\s*$`
  - Semester header: `\d+(?:st|nd|rd|th) Semester.*?\d{4}-\d{4}`
- วิชาที่ **ยังไม่มีเกรด** (เทอมปัจจุบัน): match code แต่ไม่มี grade → แสดงเป็น "กำลังเรียน"

### localStorage Schema
```json
{
  "creditTracker_v1": {
    "parsedAt": "2026-11-21T...",
    "courses": [...],
    "totalCreditsEarned": 85
  }
}
```

### Logic การ match
1. วิชาบังคับ: match by **course code** กับ curriculum list
2. วิชาศึกษาทั่วไป: code ขึ้นต้น `906` = ทั่วไป
3. วิชาเลือก CS: code ขึ้นต้น `055` แต่ไม่ใช่ mandatory → เลือก
4. Grade `S` หรือ `F` ให้นับเป็น pass/fail (ไม่คำนวณ GPA)
5. วิชาที่ไม่มีเกรด = "กำลังเรียน" ไม่นับหน่วยกิต

### หน้าจอ / Layout
```
┌─────────────────────────────────────────┐
│  [Header] Credit Tracker — CS KMITL     │
│  [Upload zone / "ใช้ข้อมูลเดิม" button]  │
├─────────────────────────────────────────┤
│  [Hero stats] 85/135 น.  GPA: 3.03     │
│  [Big circular progress ring]           │
├─────────────────────────────────────────┤
│  [Category progress bars]               │
│  วิชาบังคับ CS  ████████░░  57/57       │
│  คณิตศาสตร์    ██████████  18/18       │
│  ทั่วไป        ████░░░░░░  18/30       │
│  วิชาเลือก     ░░░░░░░░░░   0/18       │
├─────────────────────────────────────────┤
│  [Missing courses list]                 │
│  [Graduation status banner]             │
└─────────────────────────────────────────┘
```

## Visual Design (AI call — สามารถ override ได้)
- **สไตล์:** Clean academic / dark theme — เข้ม จริงจัง เหมือน dashboard มืออาชีพ
- **โทนสี:**
  - Background: `#0f1117`
  - Surface card: `#1a1d27`
  - Primary accent: `#6366f1` (indigo)
  - Success: `#22c55e`
  - Warning: `#f59e0b`
  - Text: `#e2e8f0`
- **Typography:** Noto Sans Thai (Google Fonts) — ภาษาไทยอ่านสบาย
- **Icons:** Bootstrap Icons (bi-mortarboard, bi-book, bi-check-circle, bi-upload, bi-graph-up)
- **Animation:** progress bar fill animation เมื่อโหลดข้อมูล (300ms ease-out)

## Files to Create
```
projects/credit-tracker/
├── index.html
├── assets/css/style.css
├── assets/js/app.js          ← logic หลัก + curriculum data ฝังอยู่
├── docs/requirements.md      ✅ มีแล้ว
├── docs/design.md            (นี่คือ design doc)
├── docs/decision-log.md
└── README.md
```

## Builder-Check Resolutions (2026-11-21)

| # | ประเด็น | การตัดสินใจ |
|---|---------|------------|
| 1 | Math vs CS split | 6 รายวิชาบังคับคณิตฯ: 05506001/002/231/232/233/250 (18 น.) — 05506236 (Algorithms) = บังคับ CS |
| 3 | ไม่มี category ใน JSON | ฝัง category lookup table ใน app.js |
| 4 | 90641002 vs 90641007 | เพิ่ม code alias map (Digital Citizen / ความฉลาดทางดิจิทัล) |
| 5 | General Ed display | นับทุก 906xxx เข้าหมวดทั่วไป (เป้า 30 น.), แสดงเฉพาะรายวิชาที่มีชื่อใน curriculum |
| 6 | GPA formula | สเกล 4 แต้มมาตรฐาน (A=4, B+=3.5, B=3, C+=2.5, C=2, D+=1.5, D=1, F=0, S=ไม่คำนวณ) |

## การศึกษาทางเลือก — Path Logic
- ถ้า transcript มี 05506117 (สหกิจ) → Path B, เป้า 6 น.
- ถ้า transcript มี 05506098/099 (ปัญหาพิเศษ) → Path A, เป้า 6 น.
- ถ้ายังไม่มีทั้งคู่ → แสดง UI ให้ผู้ใช้เลือก path เอง (dropdown/toggle)

## What's Left to the Builder
- เลือก pdfjs CDN version (แนะนำ 4.x)
- เลือก regex fallback ถ้า transcript format แตกต่าง
- วิชาเลือก 18 น. — infer จาก code ที่ไม่ใช่ mandatory list
- General Ed ที่เหลือ (12 น. จาก image ใน Job.pdf) — ใช้ code prefix 906xxx logic
