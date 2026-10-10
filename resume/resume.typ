#import "template.typ": resume, header, resume_heading, edu_item, skill_item, entry-gap
#import "@preview/metalogo:1.2.0": LaTeX

#show: resume

#header(
  name: "ZHANGYUE LEI",
  phone: "(86) 159 1853 0509",
  email: "raymond.zy.lei@outlook.com",
  linkedin: "",
  // site: "github.com/RaymondzyLei",
)

#resume_heading[EDUCATION]
#edu_item(
  name: "University of Science and Technology of China (USTC)",
  degree: "B.Eng. in Computer Science, School of the Gifted Young College\nHuaxia Talented Program in Computer Science (founded and led by Prof. Hong An; 60 students selected from 2116 students of the whole grade at enrollment)",
  location: "Hefei, Anhui, China",
  date: "September 2025 to present",
)
#skill_item(
  category: "",
  skills: "Overall GPA: 3.74/4.30, 88.04/100; Major Ranking: 27/147",
)
#skill_item(
  category: "",
  skills: [Core Courses: Fundamentals of Systems Programming (95, Top 10), Linear Algebra(#emph[B1]) (90, Top 15)],
)
#v(entry-gap, weak: true)

#edu_item(
  name: "National University of Singapore (NUS), School of Computing",
  degree: "Summer Workshop in Structure and Interpretation of Computer Programs",
  location: "Singapore",
  date: "May 2026 to July 2026",
)
#skill_item(
  category: "",
  skills: "Completed the workshop covering programming paradigms, computational thinking, functional programming, recursive problem-solving, and the mathematical foundations of computer science through the SICP curriculum.",
)
#v(entry-gap, weak: true)

#edu_item(
  name: "Guangzhou No. 6 Middle School",
  degree: "Senior High School Education",
  location: "Canton, China",
  date: "September 2023 to July 2025",
)
#skill_item(
  category: "",
  skills: "Strong performance in physics and mathematics; ranked among the top students in science-related subjects.",
)

#resume_heading[AWARDS AND HONORS]
- Second Prize, National College Computer System Development Capability Competition (Operating System Design, Functional Challenge Track), National Level, China, Summer 2026
- Second Prize, China Algorithm Capability Competition (Final Contest), 2nd Session, First-Year Undergraduate Division, National Level, China, Spring 2026
- Second Prize, China Algorithm Capability Competition (Regional Contest), 2nd Session, First-Year Undergraduate Division, National Level, China, Fall 2025
- First Prize, 41st Chinese Physics Olympiad, Provincial Level, China, Senior 2, 2024
- Third Prize, Chinese Mathematical Olympiad (Preliminary Round), China, Senior 2, 2024

#resume_heading[TECHNICAL STRENGTHS]
#skill_item(
  category: "English Fluency",
  skills: "TOEFL iBT 97 (Reading 25, Listening 29, Speaking 23, Writing 20)",
)
#skill_item(
  category: "Other Languages",
  skills: "Mandarin (native), Cantonese (fluent)",
)
#skill_item(
  category: "Computer Skills",
  skills: [C/C++, Python, Rust, TypeScript, #LaTeX],
)
