#import "@preview/modern-cv:0.9.0": *

#show: resume.with(
  author: (
    firstname: "Lei",
    lastname: "Zhangyue",
    email: "raymond.lei@mail.ustc.edu.cn",
    //homepage: "https://example.com",
    phone: "(+86) 15918530509",
    github: "RaymondzyLei",
    //twitter: "typstapp",
    //scholar: "",
    //orcid: "0000-0000-0000-000X",
    birth: "May 9, 2008",
    //linkedin: "Example",
    //address: "111 Example St. Example City, EX 11111",
    positions: (
      "Student",
      //"Solo developer",
      //"Developer",
    ),
    /*
    custom: (
      (
        text: "Youtube Channel",
        icon: "youtube",
        link: "https://example.com",
      ),
    ),
    */
  ),
  keywords: ("Student", "Developer"),
  description: "",
  profile-picture: image("profile.png"),
  date: datetime.today().display(),
  language: "en",
  colored-headers: true,
  show-footer: false,
  show-address-icon: true,
  paper-size: "us-letter",
)

// = Objective
// #resume-item[
//   As a first-year undergraduate student at the School of the Gifted Young College of the University of Science and Technology of China, I am eager to apply for the 2026 Summer School Program at The Hong Kong Polytechnic University. HK PolyU is renowned for its innovative technology and practical education. I aim to deepen my theoretical knowledge in computer science, enhance my practical problem-solving abilities through project participation, and broaden my international academic horizons in Hong Kong's diverse environment, laying a solid foundation for future academic research and professional development.
// ]

= Education
#resume-entry(
  title: "University of Science and Technology of China (USTC)",
  location: "Hefei, Anhui, China",
  date: "2025 - Present", // 入学年份至当前
  description: "B.Eng. in Computer Science and Technology, School of the Gifted Young College",
)
#resume-item[
  - Currently a first-year undergraduate student with a solid academic foundation in computer science-related basic courses
  - Active in academic competitions and independent learning of cutting-edge computer science knowledge
]

#resume-entry(
  title: "Guangzhou No.6 Middle School",
  location: "Guangzhou, Guangdong, China",
  date: "2023 - 2025", // 高中就读时间，可根据实际调整
  description: "Senior High School Education",
)
#resume-item[
  - Completed high school curriculum with outstanding academic performance in Physics and Mathematics
  - Ranked among the top students in science-related subjects
]

= Awards & Achievements

#resume-entry(
  title: "Second Prize, China Algorithm Capability Competition(Final Contest)",
  location: "National Level, China",
  date: "Spring 2026",
  description: "The 2nd Session, First-Year Undergraduate Period",
)

#resume-entry(
  title: "Second Prize, China Algorithm Capability Competition(Regional Contest)",
  location: "National Level, China",
  date: "Fall 2025",
  description: "The 2nd Session, First-Year Undergraduate Period",
)

#resume-entry(
  title: "First Prize, Chinese Physics Olympiad",
  location: "Provincial Level, China",
  date: "Senior 2, 2024",
  description: "The 41st Session, Senior High School Period",
)

#resume-entry(
  title: "Third Prize, Chinese Mathematical Olympiad",
  location: "Preliminary Round, China",
  date: "Senior 2, 2024",
  description: "The 2024 Session, Senior High School Period",
) 

= Academic Profile

- Overall GPA 3.72/4.30, Major Ranking 27/147


= Skills

#resume-skill-item(
  "Programming Languages",
  (
    strong("C++"),
    //strong("Rust"),
    strong("Python"),
    "Rust",
    //"Java",
    //"C#",
    //"JavaScript",
    "TypeScript",
  ),
)
#resume-skill-item("Languages", ("TOEFL: 97",))
// #resume-skill-item(
//   "Programs",
//   (
//     strong("Excel"),
//     "Word",
//     "Powerpoint",
//     "Visual Studio",
//   ),
// )

// = Self-evaluation
// #resume-item[
//   As a first-year undergraduate at the School of the Gifted Young College of USTC, I have built a solid academic foundation and developed strong self-directed learning capabilities. I hold a profound curiosity for cutting-edge science and technology, and excel in exploring new knowledge through efficient quick learning. I am highly motivated to engage in practical academic activities, willing to collaborate with peers from diverse backgrounds, and eager to apply theoretical knowledge to solve real-world problems.
// ]