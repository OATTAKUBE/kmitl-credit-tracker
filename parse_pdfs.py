import pdfplumber, re, json

# ===== PARSE TRANSCRIPT =====
transcript_courses = []
with pdfplumber.open(r'c:\Users\oatxx\kmitl\Tracnscript\transcript.pdf') as pdf:
    full_text = ''
    for page in pdf.pages:
        t = page.extract_text()
        if t: full_text += t + '\n'

lines = full_text.split('\n')
current_sem = ''
for line in lines:
    sem_match = re.search(r'(\d+(?:st|nd|rd|th) Semester.*?\d{4}-\d{4})', line)
    if sem_match:
        current_sem = sem_match.group(1)
    course_match = re.match(r'^(\d{8})\s+(.+?)\s+(\d)\s+([A-Z][+-]?|S|F)\s*$', line.strip())
    if course_match:
        transcript_courses.append({
            'code': course_match.group(1),
            'title': course_match.group(2).strip(),
            'credits': int(course_match.group(3)),
            'grade': course_match.group(4),
            'semester': current_sem
        })

print("=== TRANSCRIPT COURSES ===")
for c in transcript_courses:
    print(f"  {c['code']}  {c['title']}  {c['credits']} น.  {c['grade']}  [{c['semester']}]")
print(f"Total courses parsed: {len(transcript_courses)}")
total_credits = sum(c['credits'] for c in transcript_courses)
print(f"Total credits: {total_credits}")

# ===== PARSE JOB.PDF =====
print("\n\n=== JOB.PDF COURSES ===")
courses_by_year = {}
current_year_sem = 'ไม่ระบุ'

with pdfplumber.open(r'c:\Users\oatxx\kmitl\Tracnscript\Job.pdf') as pdf:
    full_text2 = ''
    for page in pdf.pages[8:17]:  # page 9-17
        t = page.extract_text()
        if t: full_text2 += t + '\n'

lines2 = full_text2.split('\n')
all_curriculum = []
for line in lines2:
    line = line.strip()
    if 'ชั้นปี' in line:
        current_year_sem = line
    m = re.match(r'^(\d{8})\s+(.+?)\s+(\d+)\s+หน่วยกิต', line)
    if m:
        entry = {
            'code': m.group(1),
            'title': m.group(2).strip(),
            'credits': int(m.group(3)),
            'year_sem': current_year_sem
        }
        all_curriculum.append(entry)
        if current_year_sem not in courses_by_year:
            courses_by_year[current_year_sem] = []
        courses_by_year[current_year_sem].append(entry)

for year_sem, courses in courses_by_year.items():
    print(f"\n[{year_sem}]")
    for c in courses:
        print(f"  {c['code']}  {c['title']}  {c['credits']} น.")

total_required = sum(c['credits'] for c in all_curriculum)
print(f"\nTotal required credits parsed from Job.pdf: {total_required}")
print(f"Total courses in curriculum: {len(all_curriculum)}")

# Save JSON for later use
with open(r'c:\Users\oatxx\kmitl\Tracnscript\transcript_data.json', 'w', encoding='utf-8') as f:
    json.dump(transcript_courses, f, ensure_ascii=False, indent=2)
with open(r'c:\Users\oatxx\kmitl\Tracnscript\curriculum_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_curriculum, f, ensure_ascii=False, indent=2)
print("\nSaved JSON files!")
