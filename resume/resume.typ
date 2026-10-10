#import "template.typ": resume, header, resume_heading, edu_item, research_item, skill_item, entry-gap, content-inset
#import "@preview/metalogo:1.2.0": LaTeX

#show: resume

#header(
  name: "ZHANGYUE LEI",
  phone: "(86) 159 1853 0509",
  email: "raymond.zy.lei@outlook.com",
)

#resume_heading[EDUCATION]
#edu_item(
  name: "University of Science and Technology of China (USTC)",
  degree: [B.Eng. in Computer Science, School of the Gifted Young College
    #linebreak()
    Huaxia Talented Program in Computer Science (founded and led by Prof. Hong An; 60 students selected from 2116 students of the whole grade)],
  location: "Hefei, Anhui, China",
  date: "September 2025 to present",
)
#skill_item(
  skills: "Overall GPA: 3.74/4.30, 88.04/100; Major Ranking: 27/147",
)
#skill_item(
  skills: [Core Courses: Fundamentals of Systems Programming (95, Top 10), Linear Algebra (#emph[B1]) (90, Top 15)],
)
#v(entry-gap, weak: true)

#edu_item(
  name: "National University of Singapore (NUS), School of Computing",
  degree: "Summer Workshop in Structure and Interpretation of Computer Programs",
  location: "Singapore",
  date: "May 2026 to July 2026",
)
#skill_item(
  skills: "Completed the workshop covering programming paradigms, computational thinking, functional programming, recursive problem-solving, and the mathematical foundations of computer science through the SICP curriculum.",
)

#resume_heading[RESEARCH EXPERIENCE]

#research_item(
  number: 1,
  title: "ViT Compression for Medical Image Classification",
  subtitle: "RetinaMNIST Classification via Distillation-Guided Quantization",
  date: "April 2026",
  [Built a ViT-Small classifier for diabetic retinopathy grading on RetinaMNIST using knowledge distillation and GPTQ/AWQ low-bit quantization.],
  [Distilled a full-precision teacher into a quantized student, recovering accuracy under #box[4-bit] compression with F1 above the baseline.],
  [Ranked among the leading teams in the 2nd China Algorithm Capability Competition National Final AI Track Model Lightweight Challenge.],
)

#research_item(
  number: 2,
  title: "NexOS Agent-OS",
  subtitle: "Agent-Native Kernel Extensions for a RISC-V Teaching OS",
  date: "March 2026 to August 2026",
  [Designed kernel Agents with capability identity, per-process Context, Tool Calls, and an event Loop for heartbeat, IPC, file events, and priority + aging.],
  [Won Second Prize in the National College Computer System Development Capability Competition.],
)

#research_item(
  number: 3,
  title: "CS229 Deep Learning Assignments",
  subtitle: "Dual-Framework Implementation in PyTorch (Python) and Burn (Rust)",
  date: "March 2026 to July 2026",
  [Implemented deep learning models in PyTorch (Python) and Burn (Rust), developing practical proficiency in both languages and frameworks.],
  [gained hands-on experience and explore the underlying principles of neural networks.],
)

#resume_heading[AWARDS AND HONORS]
#pad(left: content-inset)[
  - Second Prize, National College Computer System Development Capability Competition (Operating System Design, Functional Challenge Track), National Level, China, Summer 2026
  - Second Prize, China Algorithm Capability Competition (Final Contest), 2nd Session, First-Year Undergraduate Division, National Level, China, Spring 2026
  - Second Prize, China Algorithm Capability Competition (Regional Contest), 2nd Session, First-Year Undergraduate Division, National Level, China, Fall 2025
  - First Prize, 41st Chinese Physics Olympiad, Provincial Level, China, Senior 2, 2024
  - Third Prize, Chinese Mathematical Olympiad (Preliminary Round), China, Senior 2, 2024
]

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
#skill_item(
  category: "Courses",
  skills: [CS229, Deep Learning; CS231n, Convolutional Neural Networks for Visual Recognition],
)
