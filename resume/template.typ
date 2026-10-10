// Shared typography and spacing for the single-column resume.
#let body-size = 11pt
#let detail-size = 10.5pt
#let content-inset = 11pt
#let right-inset = 5.5pt
#let section-gap = 24pt
#let entry-gap = 20pt

#let resume(body) = {
  set page(
    paper: "us-letter",
    margin: (x: 0.5in, y: 0.5in),
  )
  set text(
    font: ("Libertinus Serif", "New Computer Modern"),
    size: body-size,
    lang: "en",
    fill: black,
    kerning: true,
  )
  set par(
    justify: false,
    leading: 0.65em,
    spacing: 0pt,
    first-line-indent: 0pt,
  )
  set list(
    indent: content-inset,
    body-indent: 10pt,
    tight: false,
    spacing: 5pt,
    marker: [•],
  )
  show list: set block(above: 0pt, below: 0pt)
  show link: underline.with(offset: 1.5pt, stroke: 0.35pt)

  body
}

#let name_header(name) = {
  text(size: 24pt, weight: "bold", tracking: 0.025em, name)
}

#let header(
  name: "Jake Ryan",
  phone: "123-456-7890",
  email: "jake@su.edu",
  linkedin: "linkedin.com/in/jake",
  site: "github.com/jake",
  address: "",
) = {
  align(center, block(above: 0pt, below: 0pt)[
    #name_header(name)
    #v(7pt)
    #text(size: body-size)[
      Email: #link("mailto:" + email)[#email]
      #h(10pt)
      Tel: #phone
    ]
    #if address != "" {
      v(7pt)
      text(size: 10pt)[Address: #address]
    }
  ])
}

#let resume_heading(txt) = {
  block(above: section-gap, below: 7pt, sticky: true)[
    #text(size: 11pt, weight: "bold", tracking: 0.055em, txt)
    #v(3pt)
    #line(length: 100%, stroke: 0.55pt + black)
  ]
}

#let edu_item(
  name: "Sample University",
  degree: "B.S in Bullshit",
  location: "Foo, BA",
  date: "Aug. 1600 - May 1750",
) = {
  block(above: 0pt, below: 4pt, breakable: false)[
    #pad(left: content-inset, right: right-inset, grid(
      columns: (3fr, 1.1fr),
      column-gutter: 10pt,
      align(left)[
        #text(size: 11pt, weight: "bold", name)
        #v(6pt)
        #if type(degree) == str {
          let lines = degree.split("\n")
          emph(lines.first())
          for detail in lines.slice(1) {
            linebreak()
            detail
          }
        } else {
          emph(degree)
        }
      ],
      align(right)[
        #text(size: detail-size, date)
        #v(6pt)
        #text(size: detail-size, location)
      ],
    ))
  ]
}

#let exp_item(
  name: "Sample Workplace",
  role: "Worker",
  date: "June 1837 - May 1845",
  location: "Foo, BA",
  ..points
) = {
  block(above: entry-gap, below: 4pt)[
    #pad(left: content-inset, right: right-inset)[
      #grid(
        columns: (3fr, 1.1fr),
        column-gutter: 10pt,
        align(left)[
          #text(size: 11pt, weight: "bold", role)
          #v(6pt)
          #emph(name)
        ],
        align(right)[
          #text(size: detail-size, date)
          #v(6pt)
          #text(size: detail-size, location)
        ],
      )
      #v(4pt)
      #list(..points)
    ]
  ]
}

#let project_item(
  name: "Example Project",
  skills: "Programming Language 1, Database3",
  date: "May 1234 - June 4321",
  ..points
) = {
  block(above: entry-gap, below: 4pt)[
    #pad(left: content-inset, right: right-inset)[
      #grid(
        columns: (3fr, 1.1fr),
        column-gutter: 10pt,
        [#text(size: 11pt, weight: "bold", name) | #emph(skills)],
        align(right, text(size: detail-size, date)),
      )
      #v(4pt)
      #list(..points)
    ]
  ]
}

#let skill_item(
  category: "Skills",
  skills: "Balling, Yoga, Valorant",
) = {
  block(above: 7pt, below: 0pt)[
    #pad(left: content-inset, right: right-inset)[
      #if category != "" [#strong(category): ]
      #skills
    ]
  ]
}
